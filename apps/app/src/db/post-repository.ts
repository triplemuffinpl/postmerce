import { pool } from "./client.js";
import { createPublishJob } from "./queue-repository.js";
import type {
  MediaAssetRecord,
  Platform,
  PostDetails,
  PostListItem,
  PostRecord,
  PostStatus,
  PostTargetRecord,
  PostTargetStatus
} from "../domain.js";
import type { CreateMediaAssetInput } from "./media-repository.js";

interface PostRow {
  id: string;
  media_asset_id: string | null;
  title: string;
  base_caption: string;
  base_hashtags: string | null;
  status: PostStatus;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface PostListRow extends PostRow {
  media_original_filename: string | null;
  media_thumbnail_path: string | null;
  target_count: string;
}

interface PostTargetRow {
  id: string;
  post_id: string;
  social_account_id: string | null;
  platform: Platform;
  platform_title: string | null;
  platform_caption: string;
  platform_hashtags: string | null;
  platform_options_json: Record<string, unknown>;
  status: PostTargetStatus;
  external_post_id: string | null;
  external_url: string | null;
  error_code: string | null;
  error_message: string | null;
  scheduled_at: Date | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface MediaAssetRow {
  id: string;
  original_filename: string;
  storage_disk: string;
  storage_key: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string;
  size_bytes: string;
  duration_sec: string | null;
  width: number | null;
  height: number | null;
  fps: string | null;
  video_codec: string | null;
  audio_codec: string | null;
  checksum: string;
  status: MediaAssetRecord["status"];
  created_at: Date;
  updated_at: Date;
}

export interface CreatePostInput {
  mediaAssetId: number;
  title: string;
  baseCaption: string;
  baseHashtags: string | null;
  status: PostStatus;
  scheduledAt: Date | null;
  targets: CreatePostTargetInput[];
  enqueueJobs?: boolean;
}

export interface CreatePostTargetInput {
  platform: Platform;
  platformTitle: string | null;
  platformCaption: string;
  platformHashtags: string | null;
  platformOptions: Record<string, string>;
  status: PostTargetStatus;
  scheduledAt: Date | null;
}

export interface CreatePostOutput {
  post: PostRecord;
  targets: PostTargetRecord[];
  enqueuedJobCount: number;
}

function toPost(row: PostRow): PostRecord {
  return {
    id: Number(row.id),
    mediaAssetId: row.media_asset_id === null ? null : Number(row.media_asset_id),
    title: row.title,
    baseCaption: row.base_caption,
    baseHashtags: row.base_hashtags,
    status: row.status,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toPostTarget(row: PostTargetRow): PostTargetRecord {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    socialAccountId: row.social_account_id === null ? null : Number(row.social_account_id),
    platform: row.platform,
    platformTitle: row.platform_title,
    platformCaption: row.platform_caption,
    platformHashtags: row.platform_hashtags,
    platformOptions: row.platform_options_json,
    status: row.status,
    externalPostId: row.external_post_id,
    externalUrl: row.external_url,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toMediaAsset(row: MediaAssetRow): MediaAssetRecord {
  const input: CreateMediaAssetInput = {
    originalFilename: row.original_filename,
    storageDisk: row.storage_disk,
    storageKey: row.storage_key,
    storagePath: row.storage_path,
    thumbnailPath: row.thumbnail_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    durationSec: row.duration_sec === null ? null : Number(row.duration_sec),
    width: row.width,
    height: row.height,
    fps: row.fps === null ? null : Number(row.fps),
    videoCodec: row.video_codec,
    audioCodec: row.audio_codec,
    checksum: row.checksum,
    status: row.status
  };

  return {
    id: Number(row.id),
    ...input,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createPostWithTargets(input: CreatePostInput): Promise<CreatePostOutput> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const postResult = await client.query<PostRow>(
      `
        insert into posts (
          media_asset_id,
          title,
          base_caption,
          base_hashtags,
          status,
          scheduled_at
        )
        values ($1, $2, $3, $4, $5, $6)
        returning *
      `,
      [
        input.mediaAssetId,
        input.title,
        input.baseCaption,
        input.baseHashtags,
        input.status,
        input.scheduledAt
      ]
    );

    const post = postResult.rows[0];
    if (!post) {
      throw new Error("Failed to create post.");
    }

    const targets: PostTargetRecord[] = [];
    let enqueuedJobCount = 0;

    for (const target of input.targets) {
      const targetResult = await client.query<PostTargetRow>(
        `
          insert into post_targets (
            post_id,
            platform,
            platform_title,
            platform_caption,
            platform_hashtags,
            platform_options_json,
            status,
            scheduled_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
          returning *
        `,
        [
          post.id,
          target.platform,
          target.platformTitle,
          target.platformCaption,
          target.platformHashtags,
          JSON.stringify(target.platformOptions),
          target.status,
          target.scheduledAt
        ]
      );
      const targetRow = targetResult.rows[0];

      if (!targetRow) {
        throw new Error("Failed to create post target.");
      }

      const createdTarget = toPostTarget(targetRow);
      targets.push(createdTarget);

      if (input.enqueueJobs) {
        await createPublishJob(client, {
          postTargetId: createdTarget.id,
          runAfter: target.scheduledAt ?? new Date(),
          idempotencyKey: `publish:${createdTarget.id}`,
          payload: {
            postId: Number(post.id),
            platform: createdTarget.platform,
            source: "post_form"
          }
        });
        enqueuedJobCount += 1;
      }
    }

    await client.query("commit");
    return {
      post: toPost(post),
      targets,
      enqueuedJobCount
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function listPosts(limit = 50): Promise<PostListItem[]> {
  const result = await pool.query<PostListRow>(
    `
      select
        p.*,
        m.original_filename as media_original_filename,
        m.thumbnail_path as media_thumbnail_path,
        count(t.id) as target_count
      from posts p
      left join media_assets m on m.id = p.media_asset_id
      left join post_targets t on t.post_id = p.id
      group by p.id, m.original_filename, m.thumbnail_path
      order by p.created_at desc
      limit $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    ...toPost(row),
    mediaOriginalFilename: row.media_original_filename,
    mediaThumbnailPath: row.media_thumbnail_path,
    targetCount: Number(row.target_count)
  }));
}

export async function getPostDetails(id: number): Promise<PostDetails | null> {
  const postResult = await pool.query<PostRow>("select * from posts where id = $1 limit 1", [id]);
  const postRow = postResult.rows[0];

  if (!postRow) {
    return null;
  }

  const mediaResult = await pool.query<MediaAssetRow>(
    `
      select m.*
      from media_assets m
      where m.id = $1
      limit 1
    `,
    [postRow.media_asset_id]
  );
  const targetResult = await pool.query<PostTargetRow>(
    `
      select *
      from post_targets
      where post_id = $1
      order by id asc
    `,
    [id]
  );

  const mediaRow = mediaResult.rows[0];

  return {
    post: toPost(postRow),
    media: mediaRow ? toMediaAsset(mediaRow) : null,
    targets: targetResult.rows.map(toPostTarget)
  };
}
