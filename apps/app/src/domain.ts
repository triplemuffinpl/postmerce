export const platforms = ["youtube", "linkedin", "instagram", "facebook", "tiktok"] as const;
export type Platform = (typeof platforms)[number];

export type SocialAccountStatus =
  | "connected"
  | "disconnected"
  | "requires_reauth"
  | "missing_permissions"
  | "disabled"
  | "error";

export type MediaStatus = "uploaded" | "probing" | "ready" | "invalid" | "deleted";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "partially_published"
  | "published"
  | "failed"
  | "cancelled";

export type PostTargetStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "processing_on_platform"
  | "published"
  | "simulated"
  | "failed"
  | "requires_user_action"
  | "cancelled"
  | "skipped";

export type PublishJobStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled";

export type ErrorClass = "temporary" | "auth" | "validation" | "unknown";

export interface PlatformConfig {
  platform: Platform;
  label: string;
  enabled: boolean;
  directPublishing: boolean;
  scheduling: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface PublishResult {
  ok: boolean;
  status: PostTargetStatus;
  externalPostId: string | null;
  externalUrl: string | null;
  requiresPolling: boolean;
  redactedRawResponse: Record<string, unknown>;
  errorCode: string | null;
  errorMessage: string | null;
  retryable: boolean;
}

export interface TokenRefreshResult {
  ok: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  error: string | null;
}

export interface AccountInfoResult {
  ok: boolean;
  platformUserId: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  accountType: string | null;
  redactedRawResponse: Record<string, unknown>;
}

export interface PostTargetDraft {
  id: number;
  platform: Platform;
  platformTitle: string | null;
  platformCaption: string;
  platformHashtags: string | null;
  status: PostTargetStatus;
}

export interface MediaAssetRecord {
  id: number;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  status: MediaStatus;
}

export interface SocialAccountRecord {
  id: number;
  platform: Platform;
  displayName: string | null;
  username: string | null;
  status: SocialAccountStatus;
}
