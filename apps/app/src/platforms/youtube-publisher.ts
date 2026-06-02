import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { z } from "zod";
import { env } from "../config/env.js";
import type {
  AccountInfoResult,
  MediaAssetRecord,
  PostTargetDraft,
  PublishResult,
  SocialAccountRecord,
  TokenRefreshResult,
  ValidationResult
} from "../domain.js";
import {
  fetchYouTubeAccountInfoFromToken,
  getValidYouTubeAccessToken,
  refreshYouTubeToken
} from "../services/youtube-oauth-service.js";
import type { PlatformLimits, PlatformPublisher } from "./platform-publisher.js";

const videoInsertResponseSchema = z.object({
  id: z.string(),
  status: z
    .object({
      uploadStatus: z.string().optional(),
      privacyStatus: z.string().optional()
    })
    .optional()
});

type YouTubePrivacy = "private" | "unlisted" | "public";

interface FetchRequestInitWithDuplex extends RequestInit {
  duplex?: "half";
}

function isYouTubePrivacy(value: unknown): value is YouTubePrivacy {
  return value === "private" || value === "unlisted" || value === "public";
}

function targetPrivacy(target: PostTargetDraft): YouTubePrivacy {
  const value = target.platformOptions.privacy;
  return isYouTubePrivacy(value) ? value : "private";
}

function targetTitle(target: PostTargetDraft): string {
  return target.platformTitle?.trim() || `Postmerce video ${target.id}`;
}

function targetDescription(target: PostTargetDraft): string {
  return [target.platformCaption.trim(), target.platformHashtags?.trim() ?? ""]
    .filter((value) => value.length > 0)
    .join("\n\n");
}

function targetTags(target: PostTargetDraft): string[] {
  if (!target.platformHashtags) {
    return [];
  }

  return target.platformHashtags
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter((tag) => tag.length > 0)
    .slice(0, 30);
}

function absoluteMediaPath(media: MediaAssetRecord): string {
  return path.join(env.storageRoot, media.storagePath);
}

function failedResult(
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  raw: Record<string, unknown> = {}
): PublishResult {
  return {
    ok: false,
    status: "failed",
    externalPostId: null,
    externalUrl: null,
    requiresPolling: false,
    redactedRawResponse: raw,
    errorCode,
    errorMessage,
    retryable
  };
}

function uploadFailureCode(status: number): string {
  if (status === 401 || status === 403) {
    return "auth_youtube_upload_failed";
  }

  if (status === 400) {
    return "validation_youtube_upload_failed";
  }

  return "temporary_youtube_upload_failed";
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function readRedactedBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();

  return {
    status: response.status,
    bodyPreview: text.slice(0, 500)
  };
}

export class YouTubePublisher implements PlatformPublisher {
  public async validate(target: PostTargetDraft, media: MediaAssetRecord): Promise<ValidationResult> {
    const errors: string[] = [];
    const limits = this.getPlatformLimits();

    if (!env.youtubeOAuth.configured) {
      errors.push("YouTube OAuth is not configured.");
    }

    if (target.platform !== "youtube") {
      errors.push("YouTube publisher received a non-YouTube target.");
    }

    if (!targetTitle(target)) {
      errors.push("YouTube title is required.");
    }

    if (targetDescription(target).length > limits.maxCaptionLength) {
      errors.push("YouTube description is too long.");
    }

    if (media.sizeBytes <= 0) {
      errors.push("Media file size is invalid.");
    }

    if (media.sizeBytes > limits.maxFileSizeMb * 1024 * 1024) {
      errors.push(`Media file is larger than configured YouTube upload limit (${limits.maxFileSizeMb} MB).`);
    }

    if (media.durationSec !== null && media.durationSec > limits.maxDurationSeconds) {
      errors.push(`Video is longer than configured YouTube duration limit (${limits.maxDurationSeconds}s).`);
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings: ["YouTube upload uses the configured account and will create a real video in live mode."]
    };
  }

  public async publish(
    target: PostTargetDraft,
    media: MediaAssetRecord,
    account: SocialAccountRecord
  ): Promise<PublishResult> {
    const accessTokenResult = await getValidYouTubeAccessToken(account);

    if (!accessTokenResult.ok || !accessTokenResult.accessToken) {
      return failedResult(
        accessTokenResult.errorCode ?? "auth_youtube_token_missing",
        accessTokenResult.errorMessage ?? "YouTube access token is missing.",
        accessTokenResult.retryable
      );
    }

    const filePath = absoluteMediaPath(media);
    const fileStats = await stat(filePath);
    const metadata = {
      snippet: {
        title: targetTitle(target),
        description: targetDescription(target),
        tags: targetTags(target),
        categoryId: env.youtubeOAuth.uploadCategoryId
      },
      status: {
        privacyStatus: targetPrivacy(target),
        selfDeclaredMadeForKids: false
      }
    };

    const initiateUrl = new URL("https://www.googleapis.com/upload/youtube/v3/videos");
    initiateUrl.searchParams.set("part", "snippet,status");
    initiateUrl.searchParams.set("uploadType", "resumable");

    const initiateResponse = await fetch(initiateUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessTokenResult.accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Length": String(fileStats.size),
        "X-Upload-Content-Type": media.mimeType
      },
      body: JSON.stringify(metadata)
    });

    if (!initiateResponse.ok) {
      return failedResult(
        uploadFailureCode(initiateResponse.status),
        `YouTube upload session failed with HTTP ${initiateResponse.status}.`,
        isRetryableStatus(initiateResponse.status),
        await readRedactedBody(initiateResponse)
      );
    }

    const uploadLocation = initiateResponse.headers.get("Location");

    if (!uploadLocation) {
      return failedResult(
        "temporary_youtube_upload_session_missing",
        "YouTube upload session did not return a Location header.",
        true
      );
    }

    const uploadBody = Readable.toWeb(createReadStream(filePath));
    const uploadRequest: FetchRequestInitWithDuplex = {
      method: "PUT",
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(fileStats.size)
      },
      body: uploadBody,
      duplex: "half"
    };
    const uploadResponse = await fetch(uploadLocation, uploadRequest);
    const uploadPayload = await uploadResponse.text();

    if (!uploadResponse.ok) {
      return failedResult(
        uploadFailureCode(uploadResponse.status),
        `YouTube upload failed with HTTP ${uploadResponse.status}.`,
        isRetryableStatus(uploadResponse.status),
        {
          status: uploadResponse.status,
          bodyPreview: uploadPayload.slice(0, 500)
        }
      );
    }

    const parsed: unknown = JSON.parse(uploadPayload);
    const response = videoInsertResponseSchema.parse(parsed);

    return {
      ok: true,
      status: "published",
      externalPostId: response.id,
      externalUrl: `https://www.youtube.com/watch?v=${response.id}`,
      requiresPolling: false,
      redactedRawResponse: {
        videoId: response.id,
        uploadStatus: response.status?.uploadStatus ?? null,
        privacyStatus: response.status?.privacyStatus ?? null
      },
      errorCode: null,
      errorMessage: null,
      retryable: false
    };
  }

  public async refreshToken(account: SocialAccountRecord): Promise<TokenRefreshResult> {
    return refreshYouTubeToken(account);
  }

  public async fetchAccountInfo(tokenId: number): Promise<AccountInfoResult> {
    return fetchYouTubeAccountInfoFromToken(tokenId);
  }

  public supportsScheduling(): boolean {
    return true;
  }

  public supportsDirectPublishing(): boolean {
    return true;
  }

  public getPlatformLimits(): PlatformLimits {
    return {
      maxDurationSeconds: env.maxDurationSeconds,
      maxFileSizeMb: env.maxUploadMb,
      maxCaptionLength: 5000
    };
  }
}
