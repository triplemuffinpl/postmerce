import type {
  AccountInfoResult,
  MediaAssetRecord,
  PublishResult,
  SocialAccountRecord,
  TokenRefreshResult,
  ValidationResult,
  PostTargetDraft
} from "../domain.js";

export interface PlatformLimits {
  maxDurationSeconds: number;
  maxFileSizeMb: number;
  maxCaptionLength: number;
}

export interface PlatformPublisher {
  validate(target: PostTargetDraft, media: MediaAssetRecord): Promise<ValidationResult>;
  publish(
    target: PostTargetDraft,
    media: MediaAssetRecord,
    account: SocialAccountRecord
  ): Promise<PublishResult>;
  refreshToken(account: SocialAccountRecord): Promise<TokenRefreshResult>;
  fetchAccountInfo(tokenId: number): Promise<AccountInfoResult>;
  supportsScheduling(): boolean;
  supportsDirectPublishing(): boolean;
  getPlatformLimits(): PlatformLimits;
}
