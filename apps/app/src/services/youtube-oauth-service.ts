import { z } from "zod";
import { env } from "../config/env.js";
import {
  getLatestOAuthToken,
  updateOAuthToken,
  upsertSocialAccountWithToken,
  type OAuthTokenInput
} from "../db/account-repository.js";
import type { AccountInfoResult, SocialAccountRecord, TokenRefreshResult } from "../domain.js";
import { createOAuthState, verifyOAuthState } from "./oauth-state.js";
import { logger } from "./logger.js";
import { decryptSecret, encryptSecret } from "./secret-crypto.js";

const youtubeScopes = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly"
] as const;

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional()
});

const thumbnailSchema = z.object({
  url: z.string().optional()
});

const channelResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      snippet: z.object({
        title: z.string().optional(),
        customUrl: z.string().optional(),
        thumbnails: z
          .object({
            default: thumbnailSchema.optional(),
            medium: thumbnailSchema.optional(),
            high: thumbnailSchema.optional()
          })
          .optional()
      })
    })
  )
});

const googleApiErrorSchema = z.object({
  error: z
    .object({
      code: z.number().optional(),
      message: z.string().optional(),
      status: z.string().optional(),
      errors: z
        .array(
          z.object({
            reason: z.string().optional()
          })
        )
        .optional()
    })
    .optional()
});

export interface AccessTokenResult {
  ok: boolean;
  accessToken: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryable: boolean;
}

export interface YouTubeOAuthCallbackResult {
  ok: boolean;
  account: SocialAccountRecord | null;
  errorCode: string | null;
  errorMessage: string | null;
}

function configured(): boolean {
  return env.youtubeOAuth.configured;
}

function expiresAtFromSeconds(seconds: number | undefined): Date | null {
  return typeof seconds === "number" ? new Date(Date.now() + seconds * 1000) : null;
}

function scopesFromResponse(scope: string | undefined): string[] {
  return scope ? scope.split(" ").filter((item) => item.trim().length > 0) : [...youtubeScopes];
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text) as unknown;
}

function tokenInputFromResponse(parsed: z.infer<typeof tokenResponseSchema>, existingRefreshToken: string | null): OAuthTokenInput {
  return {
    accessTokenEncrypted: encryptSecret(parsed.access_token),
    refreshTokenEncrypted: parsed.refresh_token ? encryptSecret(parsed.refresh_token) : existingRefreshToken,
    expiresAt: expiresAtFromSeconds(parsed.expires_in),
    scopes: scopesFromResponse(parsed.scope),
    tokenType: parsed.token_type ?? null,
    metadata: {
      provider: "google",
      scopes: scopesFromResponse(parsed.scope)
    }
  };
}

async function exchangeCodeForToken(code: string): Promise<z.infer<typeof tokenResponseSchema>> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: env.youtubeOAuth.clientId,
      client_secret: env.youtubeOAuth.clientSecret,
      redirect_uri: env.youtubeOAuth.redirectUri,
      grant_type: "authorization_code"
    })
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(`YouTube OAuth token exchange failed with HTTP ${response.status}.`);
  }

  return tokenResponseSchema.parse(payload);
}

async function refreshTokenRequest(refreshToken: string): Promise<z.infer<typeof tokenResponseSchema>> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.youtubeOAuth.clientId,
      client_secret: env.youtubeOAuth.clientSecret,
      grant_type: "refresh_token"
    })
  });

  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(`YouTube OAuth refresh failed with HTTP ${response.status}.`);
  }

  return tokenResponseSchema.parse(payload);
}

async function fetchYouTubeChannel(accessToken: string): Promise<AccountInfoResult> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("mine", "true");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const parsedError = googleApiErrorSchema.safeParse(payload);
    const providerError = parsedError.success ? parsedError.data.error : undefined;

    return {
      ok: false,
      platformUserId: null,
      displayName: null,
      username: null,
      avatarUrl: null,
      accountType: null,
      redactedRawResponse: {
        reason: "channel_fetch_failed",
        httpStatus: response.status,
        providerCode: providerError?.code ?? null,
        providerStatus: providerError?.status ?? null,
        providerReason: providerError?.errors?.[0]?.reason ?? null,
        providerMessage: providerError?.message ?? null
      }
    };
  }

  const parsed = channelResponseSchema.parse(payload);
  const channel = parsed.items[0];

  if (!channel) {
    return {
      ok: false,
      platformUserId: null,
      displayName: null,
      username: null,
      avatarUrl: null,
      accountType: null,
      redactedRawResponse: {
        reason: "channel_missing"
      }
    };
  }

  return {
    ok: true,
    platformUserId: channel.id,
    displayName: channel.snippet.title ?? null,
    username: channel.snippet.customUrl ?? null,
    avatarUrl: channel.snippet.thumbnails?.default?.url ?? null,
    accountType: "channel",
    redactedRawResponse: {
      channelId: channel.id,
      title: channel.snippet.title ?? null,
      customUrl: channel.snippet.customUrl ?? null
    }
  };
}

function channelLookupFailure(accountInfo: AccountInfoResult): Pick<YouTubeOAuthCallbackResult, "errorCode" | "errorMessage"> {
  const reason = accountInfo.redactedRawResponse.reason;
  const providerReason = accountInfo.redactedRawResponse.providerReason;
  const providerStatus = accountInfo.redactedRawResponse.providerStatus;
  const providerMessage =
    typeof accountInfo.redactedRawResponse.providerMessage === "string"
      ? accountInfo.redactedRawResponse.providerMessage.toLowerCase()
      : "";

  if (
    providerReason === "accessNotConfigured" ||
    providerStatus === "SERVICE_DISABLED" ||
    providerMessage.includes("has not been used") ||
    providerMessage.includes("is disabled")
  ) {
    return {
      errorCode: "oauth_youtube_api_unavailable",
      errorMessage: "YouTube Data API v3 is not enabled or available for this Google Cloud project."
    };
  }

  if (providerReason === "insufficientPermissions") {
    return {
      errorCode: "oauth_youtube_permissions_missing",
      errorMessage: "Google did not grant the permissions required to read the YouTube channel."
    };
  }

  if (reason === "channel_missing") {
    return {
      errorCode: "oauth_youtube_channel_missing",
      errorMessage: "No YouTube channel is available for this Google account yet. If it was just created, wait a few minutes and retry."
    };
  }

  return {
    errorCode: "oauth_youtube_channel_lookup_failed",
    errorMessage: "YouTube channel lookup failed. Check the Google Cloud API configuration and retry."
  };
}

export function isYouTubeOAuthConfigured(): boolean {
  return configured();
}

export function getYouTubeAuthorizationUrl(): string {
  if (!configured()) {
    throw new Error("YouTube OAuth is not configured.");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.youtubeOAuth.clientId);
  url.searchParams.set("redirect_uri", env.youtubeOAuth.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", youtubeScopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", createOAuthState("youtube"));

  return url.toString();
}

export async function completeYouTubeOAuthCallback(
  code: string,
  state: string
): Promise<YouTubeOAuthCallbackResult> {
  if (!configured()) {
    return {
      ok: false,
      account: null,
      errorCode: "oauth_youtube_not_configured",
      errorMessage: "YouTube OAuth is not configured."
    };
  }

  if (!verifyOAuthState(state, "youtube")) {
    return {
      ok: false,
      account: null,
      errorCode: "oauth_youtube_state_invalid",
      errorMessage: "YouTube OAuth state is invalid or expired."
    };
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);
    const accountInfo = await fetchYouTubeChannel(tokenResponse.access_token);

    if (!accountInfo.ok || !accountInfo.platformUserId) {
      logger.warn("oauth", "YouTube channel lookup failed", accountInfo.redactedRawResponse);
      const failure = channelLookupFailure(accountInfo);

      return {
        ok: false,
        account: null,
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage
      };
    }

    const result = await upsertSocialAccountWithToken({
      platform: "youtube",
      platformUserId: accountInfo.platformUserId,
      displayName: accountInfo.displayName,
      username: accountInfo.username,
      avatarUrl: accountInfo.avatarUrl,
      accountType: accountInfo.accountType,
      status: "connected",
      metadata: accountInfo.redactedRawResponse,
      token: tokenInputFromResponse(tokenResponse, null)
    });

    return {
      ok: true,
      account: result.account,
      errorCode: null,
      errorMessage: null
    };
  } catch (error) {
    return {
      ok: false,
      account: null,
      errorCode: "oauth_youtube_callback_failed",
      errorMessage: error instanceof Error ? error.message : "YouTube OAuth callback failed."
    };
  }
}

export async function refreshYouTubeToken(account: SocialAccountRecord): Promise<TokenRefreshResult> {
  const currentToken = await getLatestOAuthToken(account.id);
  const encryptedRefreshToken = currentToken?.refreshTokenEncrypted ?? null;

  if (!encryptedRefreshToken) {
    return {
      ok: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: "YouTube refresh token is missing."
    };
  }

  try {
    const refreshToken = decryptSecret(encryptedRefreshToken);
    const tokenResponse = await refreshTokenRequest(refreshToken);
    const tokenInput = tokenInputFromResponse(tokenResponse, encryptedRefreshToken);
    await updateOAuthToken(account.id, tokenInput);

    return {
      ok: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? null,
      expiresAt: tokenInput.expiresAt,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: error instanceof Error ? error.message : "YouTube refresh failed."
    };
  }
}

export async function getValidYouTubeAccessToken(account: SocialAccountRecord): Promise<AccessTokenResult> {
  const currentToken = await getLatestOAuthToken(account.id);

  if (!currentToken) {
    return {
      ok: false,
      accessToken: null,
      errorCode: "auth_youtube_token_missing",
      errorMessage: "YouTube OAuth token is missing.",
      retryable: false
    };
  }

  const isFresh = !currentToken.expiresAt || currentToken.expiresAt.getTime() > Date.now() + 60_000;

  if (isFresh) {
    return {
      ok: true,
      accessToken: decryptSecret(currentToken.accessTokenEncrypted),
      errorCode: null,
      errorMessage: null,
      retryable: false
    };
  }

  const refreshed = await refreshYouTubeToken(account);

  if (!refreshed.ok || !refreshed.accessToken) {
    return {
      ok: false,
      accessToken: null,
      errorCode: "auth_youtube_token_refresh_failed",
      errorMessage: refreshed.error ?? "YouTube OAuth token refresh failed.",
      retryable: false
    };
  }

  return {
    ok: true,
    accessToken: refreshed.accessToken,
    errorCode: null,
    errorMessage: null,
    retryable: false
  };
}

export async function fetchYouTubeAccountInfoFromToken(tokenId: number): Promise<AccountInfoResult> {
  return {
    ok: false,
    platformUserId: null,
    displayName: null,
    username: null,
    avatarUrl: null,
    accountType: null,
    redactedRawResponse: {
      tokenId,
      reason: "token_id_lookup_not_implemented"
    }
  };
}
