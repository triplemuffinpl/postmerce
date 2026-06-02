import { platforms, type Platform, type PostDetails, type PostListItem, type PostRecord } from "../domain.js";
import {
  createPostWithTargets,
  getPostDetails as getPostDetailsFromDb,
  listPosts as listPostsFromDb,
  type CreatePostInput,
  type CreatePostTargetInput
} from "../db/post-repository.js";
import { listConnectedSocialAccounts } from "../db/account-repository.js";
import { getRecentMedia } from "./media-service.js";
import { getPlatformConfigs } from "./platform-registry.js";
import type { FormRecord } from "../http/form.js";
import { formValue, formValues, optionalDateTimeLocal } from "../http/form.js";
import type { MediaAssetRecord, SocialAccountRecord } from "../domain.js";

export interface NewPostFormData {
  media: MediaAssetRecord[];
  platforms: ReturnType<typeof getPlatformConfigs>;
  accounts: SocialAccountRecord[];
}

export interface CreatePostResult {
  ok: boolean;
  post: PostRecord | null;
  enqueuedJobCount: number;
  errors: string[];
}

function isPlatform(value: string): value is Platform {
  return platforms.includes(value as Platform);
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalPositiveInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function targetAccountId(
  form: FormRecord,
  platform: Platform,
  accountsById: Map<number, SocialAccountRecord>,
  errors: string[]
): number | null {
  const accountId = optionalPositiveInteger(formValue(form, `${platform}_account_id`));

  if (accountId === null) {
    return null;
  }

  const account = accountsById.get(accountId);

  if (!account) {
    errors.push(`Selected ${platform} account does not exist.`);
    return null;
  }

  if (account.platform !== platform || account.status !== "connected") {
    errors.push(`Selected account is not a connected ${platform} account.`);
    return null;
  }

  return account.id;
}

function buildTargets(
  form: FormRecord,
  scheduledAt: Date | null,
  targetStatus: CreatePostTargetInput["status"],
  baseTitle: string,
  baseHashtags: string | null,
  accountsById: Map<number, SocialAccountRecord>,
  errors: string[]
): CreatePostTargetInput[] {
  const enabledPlatforms = new Set(formValues(form, "platforms"));

  return getPlatformConfigs()
    .filter((config) => config.enabled)
    .filter((config) => enabledPlatforms.has(config.platform))
    .map((config) => {
      const platform = config.platform;
      const caption = formValue(form, `${platform}_caption`).trim() || formValue(form, "base_caption").trim();

      return {
        socialAccountId: targetAccountId(form, platform, accountsById, errors),
        platform,
        platformTitle: emptyToNull(formValue(form, `${platform}_title`)) ?? baseTitle,
        platformCaption: caption,
        platformHashtags: emptyToNull(formValue(form, `${platform}_hashtags`)) ?? baseHashtags,
        platformOptions: {
          privacy: formValue(form, `${platform}_privacy`) || "default"
        },
        status: targetStatus,
        scheduledAt
      };
    })
    .filter((target) => isPlatform(target.platform));
}

export async function getNewPostFormData(): Promise<NewPostFormData> {
  const [media, accounts] = await Promise.all([
    getRecentMedia(),
    listConnectedSocialAccounts()
  ]);

  return {
    media: media.filter((item) => item.status === "ready"),
    platforms: getPlatformConfigs(),
    accounts
  };
}

export async function createPostFromForm(form: FormRecord): Promise<CreatePostResult> {
  const errors: string[] = [];
  const mediaAssetId = Number(formValue(form, "media_asset_id"));
  const title = formValue(form, "title").trim();
  const baseCaption = formValue(form, "base_caption").trim();
  const baseHashtags = emptyToNull(formValue(form, "base_hashtags"));
  const action = formValue(form, "action");
  const shouldQueue = action === "schedule";
  const scheduledAt = optionalDateTimeLocal(formValue(form, "scheduled_at"));
  const postStatus: CreatePostInput["status"] = shouldQueue ? "queued" : "draft";
  const targetStatus: CreatePostTargetInput["status"] = shouldQueue ? "queued" : "draft";
  const accounts = await listConnectedSocialAccounts();
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const targets = buildTargets(form, scheduledAt, targetStatus, title, baseHashtags, accountsById, errors);

  if (!Number.isInteger(mediaAssetId) || mediaAssetId <= 0) {
    errors.push("Choose a ready media asset.");
  }

  if (!title) {
    errors.push("Title is required.");
  }

  if (targets.length === 0) {
    errors.push("Choose at least one enabled platform target.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      post: null,
      enqueuedJobCount: 0,
      errors
    };
  }

  const result = await createPostWithTargets({
    mediaAssetId,
    title,
    baseCaption,
    baseHashtags,
    status: postStatus,
    scheduledAt,
    targets,
    enqueueJobs: shouldQueue
  });

  return {
    ok: true,
    post: result.post,
    enqueuedJobCount: result.enqueuedJobCount,
    errors: []
  };
}

export async function getPostList(): Promise<PostListItem[]> {
  return listPostsFromDb(100);
}

export async function getPostDetails(id: number): Promise<PostDetails | null> {
  return getPostDetailsFromDb(id);
}
