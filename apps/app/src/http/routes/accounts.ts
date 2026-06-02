import type { FastifyInstance } from "fastify";
import { listSocialAccounts } from "../../db/account-repository.js";
import { getPlatformConfigs } from "../../services/platform-registry.js";
import {
  completeYouTubeOAuthCallback,
  getYouTubeAuthorizationUrl,
  isYouTubeOAuthConfigured
} from "../../services/youtube-oauth-service.js";
import { accountsPage } from "../../ui/pages/accounts-page.js";

function queryValue(query: unknown, key: string): string {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return "";
  }

  const value = (query as Record<string, unknown>)[key];

  if (Array.isArray(value)) {
    const firstValue = value[0];
    return typeof firstValue === "string" ? firstValue : "";
  }

  return typeof value === "string" ? value : "";
}

export async function registerAccountRoutes(server: FastifyInstance): Promise<void> {
  server.get("/accounts", async (request, reply) => {
    return reply.type("text/html").send(
      accountsPage({
        platforms: getPlatformConfigs(),
        accounts: await listSocialAccounts(),
        youtubeOAuthConfigured: isYouTubeOAuthConfigured(),
        notice: queryValue(request.query, "notice"),
        error: queryValue(request.query, "error")
      })
    );
  });

  server.get("/accounts/youtube/connect", async (_request, reply) => {
    if (!isYouTubeOAuthConfigured()) {
      return reply.redirect(
        `/accounts?error=${encodeURIComponent("YouTube OAuth is not configured on this environment.")}`
      );
    }

    return reply.redirect(getYouTubeAuthorizationUrl());
  });

  server.get("/oauth/youtube/callback", async (request, reply) => {
    const providerError = queryValue(request.query, "error");

    if (providerError) {
      return reply.redirect(`/accounts?error=${encodeURIComponent(`YouTube OAuth error: ${providerError}`)}`);
    }

    const code = queryValue(request.query, "code");
    const state = queryValue(request.query, "state");

    if (!code || !state) {
      return reply.redirect(`/accounts?error=${encodeURIComponent("YouTube OAuth callback is missing code or state.")}`);
    }

    const result = await completeYouTubeOAuthCallback(code, state);

    if (!result.ok) {
      return reply.redirect(`/accounts?error=${encodeURIComponent(result.errorMessage ?? "YouTube OAuth failed.")}`);
    }

    return reply.redirect(`/accounts?notice=${encodeURIComponent("YouTube account connected.")}`);
  });
}
