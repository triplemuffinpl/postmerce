import type { MediaAssetRecord, PublishResult, SocialAccountRecord, ValidationResult, PostTargetDraft } from "../domain.js";
import type { AccountInfoResult, TokenRefreshResult } from "../domain.js";
import type { PlatformLimits, PlatformPublisher } from "./platform-publisher.js";

export class DryRunPublisher implements PlatformPublisher {
  public async validate(target: PostTargetDraft, media: MediaAssetRecord): Promise<ValidationResult> {
    const errors: string[] = [];

    if (target.platformCaption.length > this.getPlatformLimits().maxCaptionLength) {
      errors.push("Caption is too long for dry-run platform limits.");
    }

    if (media.sizeBytes <= 0) {
      errors.push("Media file size is invalid.");
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings: ["Dry-run validation does not check real platform eligibility."]
    };
  }

  public async publish(
    target: PostTargetDraft,
    media: MediaAssetRecord,
    account: SocialAccountRecord
  ): Promise<PublishResult> {
    return {
      ok: true,
      status: "simulated",
      externalPostId: `dry_${target.platform}_${target.id}`,
      externalUrl: null,
      requiresPolling: false,
      redactedRawResponse: {
        mode: "dry_run",
        targetId: target.id,
        mediaId: media.id,
        accountId: account.id
      },
      errorCode: null,
      errorMessage: null,
      retryable: false
    };
  }

  public async refreshToken(_account: SocialAccountRecord): Promise<TokenRefreshResult> {
    return {
      ok: true,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null
    };
  }

  public async fetchAccountInfo(tokenId: number): Promise<AccountInfoResult> {
    return {
      ok: true,
      platformUserId: `dry-token-${tokenId}`,
      displayName: "Dry Run Account",
      username: "dry_run",
      avatarUrl: null,
      accountType: "test",
      redactedRawResponse: { mode: "dry_run" }
    };
  }

  public supportsScheduling(): boolean {
    return true;
  }

  public supportsDirectPublishing(): boolean {
    return true;
  }

  public getPlatformLimits(): PlatformLimits {
    return {
      maxDurationSeconds: 43200,
      maxFileSizeMb: 500,
      maxCaptionLength: 2200
    };
  }
}
