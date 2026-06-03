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

export interface AppSettings {
  dryRun: boolean;
  timezone: string;
}

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
  socialAccountId: number | null;
  platform: Platform;
  platformTitle: string | null;
  platformCaption: string;
  platformHashtags: string | null;
  platformOptions: Record<string, unknown>;
  status: PostTargetStatus;
}

export interface MediaAssetRecord {
  id: number;
  originalFilename: string;
  storageDisk: string;
  storageKey: string;
  storagePath: string;
  thumbnailPath: string | null;
  mimeType: string;
  sizeBytes: number;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  checksum: string;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccountRecord {
  id: number;
  platform: Platform;
  platformUserId: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  accountType: string | null;
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthTokenRecord {
  id: number;
  socialAccountId: number;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  expiresAt: Date | null;
  scopes: string[];
  tokenType: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostRecord {
  id: number;
  mediaAssetId: number | null;
  title: string;
  baseCaption: string;
  baseHashtags: string | null;
  status: PostStatus;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostTargetRecord {
  id: number;
  postId: number;
  socialAccountId: number | null;
  platform: Platform;
  platformTitle: string | null;
  platformCaption: string;
  platformHashtags: string | null;
  platformOptions: Record<string, unknown>;
  status: PostTargetStatus;
  externalPostId: string | null;
  externalUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostListItem extends PostRecord {
  mediaOriginalFilename: string | null;
  mediaThumbnailPath: string | null;
  targetCount: number;
}

export interface PostDetails {
  post: PostRecord;
  media: MediaAssetRecord | null;
  targets: PostTargetRecord[];
}

export interface PublishJobRecord {
  id: number;
  postTargetId: number | null;
  jobType: "publish";
  status: PublishJobStatus;
  attempts: number;
  maxAttempts: number;
  runAfter: Date;
  lockedAt: Date | null;
  lockedUntil: Date | null;
  lockedBy: string | null;
  finishedAt: Date | null;
  failedAt: Date | null;
  errorClass: ErrorClass | null;
  lastError: string | null;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublishJobListItem extends PublishJobRecord {
  postId: number | null;
  postTitle: string | null;
  platform: Platform | null;
  targetStatus: PostTargetStatus | null;
  mediaOriginalFilename: string | null;
}

export interface PublishJobContext {
  job: PublishJobRecord;
  post: PostRecord;
  target: PostTargetRecord;
  media: MediaAssetRecord;
}

export interface WorkerHeartbeatRecord {
  workerId: string;
  lastSeenAt: Date;
  metadata: Record<string, unknown>;
}
