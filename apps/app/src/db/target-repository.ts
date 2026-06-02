import { pool } from "./client.js";
import type {
  MediaStatus,
  Platform,
  PostStatus,
  PostTargetRecord,
  PostTargetStatus,
  PublishJobStatus,
  SocialAccountStatus
} from "../domain.js";

interface TargetControlRow {
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
  post_title: string;
  post_status: PostStatus;
  post_scheduled_at: Date | null;
  media_original_filename: string | null;
  media_thumbnail_path: string | null;
  media_status: MediaStatus | null;
  account_display_name: string | null;
  account_username: string | null;
  account_status: SocialAccountStatus | null;
  latest_job_id: string | null;
  latest_job_status: PublishJobStatus | null;
  latest_job_run_after: Date | null;
  latest_job_last_error: string | null;
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

export interface TargetControlItem extends PostTargetRecord {
  postTitle: string;
  postStatus: PostStatus;
  postScheduledAt: Date | null;
  mediaOriginalFilename: string | null;
  mediaThumbnailPath: string | null;
  mediaStatus: MediaStatus | null;
  accountDisplayName: string | null;
  accountUsername: string | null;
  accountStatus: SocialAccountStatus | null;
  latestJobId: number | null;
  latestJobStatus: PublishJobStatus | null;
  latestJobRunAfter: Date | null;
  latestJobLastError: string | null;
}

export interface UpdatePostTargetInput {
  socialAccountId: number | null;
  platformTitle: string | null;
  platformCaption: string;
  platformHashtags: string | null;
  platformOptions: Record<string, unknown>;
  scheduledAt: Date | null;
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

function toTargetControlItem(row: TargetControlRow): TargetControlItem {
  return {
    ...toPostTarget(row),
    postTitle: row.post_title,
    postStatus: row.post_status,
    postScheduledAt: row.post_scheduled_at,
    mediaOriginalFilename: row.media_original_filename,
    mediaThumbnailPath: row.media_thumbnail_path,
    mediaStatus: row.media_status,
    accountDisplayName: row.account_display_name,
    accountUsername: row.account_username,
    accountStatus: row.account_status,
    latestJobId: row.latest_job_id === null ? null : Number(row.latest_job_id),
    latestJobStatus: row.latest_job_status,
    latestJobRunAfter: row.latest_job_run_after,
    latestJobLastError: row.latest_job_last_error
  };
}

function targetControlSelect(whereClause: string): string {
  return `
    select
      t.*,
      p.title as post_title,
      p.status as post_status,
      p.scheduled_at as post_scheduled_at,
      m.original_filename as media_original_filename,
      m.thumbnail_path as media_thumbnail_path,
      m.status as media_status,
      sa.display_name as account_display_name,
      sa.username as account_username,
      sa.status as account_status,
      j.id as latest_job_id,
      j.status as latest_job_status,
      j.run_after as latest_job_run_after,
      j.last_error as latest_job_last_error
    from post_targets t
    join posts p on p.id = t.post_id
    left join media_assets m on m.id = p.media_asset_id
    left join social_accounts sa on sa.id = t.social_account_id
    left join lateral (
      select id, status, run_after, last_error
      from publish_jobs
      where post_target_id = t.id
      order by created_at desc, id desc
      limit 1
    ) j on true
    ${whereClause}
  `;
}

function nextPostStatus(statuses: PostTargetStatus[]): PostStatus {
  if (statuses.length === 0) {
    return "draft";
  }

  if (statuses.some((status) => status === "publishing")) {
    return "publishing";
  }

  if (statuses.some((status) => status === "queued" || status === "scheduled")) {
    return "queued";
  }

  if (statuses.every((status) => status === "draft")) {
    return "draft";
  }

  const successCount = statuses.filter((status) => status === "published" || status === "simulated").length;
  const failedCount = statuses.filter(
    (status) => status === "failed" || status === "requires_user_action" || status === "cancelled" || status === "skipped"
  ).length;

  if (successCount === statuses.length) {
    return "published";
  }

  if (successCount > 0 && failedCount > 0) {
    return "partially_published";
  }

  if (failedCount === statuses.length) {
    return statuses.every((status) => status === "cancelled" || status === "skipped") ? "cancelled" : "failed";
  }

  return "queued";
}

async function refreshPostStatus(postId: number): Promise<void> {
  const result = await pool.query<{ status: PostTargetStatus }>(
    "select status from post_targets where post_id = $1 order by id asc",
    [postId]
  );
  const status = nextPostStatus(result.rows.map((row) => row.status));

  await pool.query("update posts set status = $1, updated_at = now() where id = $2", [status, postId]);
}

export async function listTargetControlItems(limit = 200): Promise<TargetControlItem[]> {
  const result = await pool.query<TargetControlRow>(
    `
      ${targetControlSelect("")}
      order by coalesce(t.scheduled_at, p.scheduled_at, t.updated_at) desc, t.id desc
      limit $1
    `,
    [limit]
  );

  return result.rows.map(toTargetControlItem);
}

export async function listCalendarTargetItems(from: Date, to: Date): Promise<TargetControlItem[]> {
  const result = await pool.query<TargetControlRow>(
    `
      ${targetControlSelect("where coalesce(t.scheduled_at, p.scheduled_at, t.created_at) >= $1 and coalesce(t.scheduled_at, p.scheduled_at, t.created_at) < $2")}
      order by coalesce(t.scheduled_at, p.scheduled_at, t.created_at) asc, t.id asc
    `,
    [from, to]
  );

  return result.rows.map(toTargetControlItem);
}

export async function getPostTargetById(id: number): Promise<PostTargetRecord | null> {
  const result = await pool.query<PostTargetRow>("select * from post_targets where id = $1 limit 1", [id]);

  return result.rows[0] ? toPostTarget(result.rows[0]) : null;
}

export async function updatePostTarget(id: number, input: UpdatePostTargetInput): Promise<PostTargetRecord | null> {
  const result = await pool.query<PostTargetRow>(
    `
      update post_targets
      set
        social_account_id = $2,
        platform_title = $3,
        platform_caption = $4,
        platform_hashtags = $5,
        platform_options_json = $6,
        scheduled_at = $7,
        updated_at = now()
      where id = $1
        and status <> 'publishing'
      returning *
    `,
    [
      id,
      input.socialAccountId,
      input.platformTitle,
      input.platformCaption,
      input.platformHashtags,
      JSON.stringify(input.platformOptions),
      input.scheduledAt
    ]
  );
  const row = result.rows[0];

  if (row) {
    await refreshPostStatus(Number(row.post_id));
  }

  return row ? toPostTarget(row) : null;
}

export async function queuePostTarget(id: number, runAfter: Date): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const targetResult = await client.query<PostTargetRow>("select * from post_targets where id = $1 for update", [id]);
    const target = targetResult.rows[0];

    if (!target || target.status === "publishing") {
      await client.query("commit");
      return false;
    }

    const activeJob = await client.query<{ id: string }>(
      `
        select id
        from publish_jobs
        where post_target_id = $1
          and status in ('pending', 'running')
        limit 1
      `,
      [id]
    );

    if (activeJob.rows[0]) {
      await client.query("commit");
      return false;
    }

    await client.query(
      `
        insert into publish_jobs (
          post_target_id,
          job_type,
          status,
          run_after,
          idempotency_key,
          payload_json
        )
        values ($1, 'publish', 'pending', $2, $3, $4)
      `,
      [
        id,
        runAfter,
        `publish:${id}:${Date.now()}`,
        JSON.stringify({
          postId: Number(target.post_id),
          platform: target.platform,
          source: "manual_control"
        })
      ]
    );

    await client.query(
      `
        update post_targets
        set
          status = 'queued',
          scheduled_at = $2,
          error_code = null,
          error_message = null,
          updated_at = now()
        where id = $1
      `,
      [id, runAfter]
    );

    await client.query("commit");
    await refreshPostStatus(Number(target.post_id));
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelPostTarget(id: number): Promise<boolean> {
  const target = await getPostTargetById(id);

  if (!target || target.status === "publishing" || target.status === "published" || target.status === "simulated") {
    return false;
  }

  await pool.query(
    `
      update publish_jobs
      set
        status = 'cancelled',
        locked_at = null,
        locked_until = null,
        locked_by = null,
        finished_at = now(),
        updated_at = now()
      where post_target_id = $1
        and status in ('pending', 'failed', 'cancelled')
    `,
    [id]
  );
  await pool.query(
    `
      update post_targets
      set
        status = 'cancelled',
        updated_at = now()
      where id = $1
    `,
    [id]
  );
  await refreshPostStatus(target.postId);
  return true;
}

export async function duplicatePostTarget(id: number): Promise<PostTargetRecord | null> {
  const result = await pool.query<PostTargetRow>(
    `
      insert into post_targets (
        post_id,
        social_account_id,
        platform,
        platform_title,
        platform_caption,
        platform_hashtags,
        platform_options_json,
        status,
        scheduled_at
      )
      select
        post_id,
        social_account_id,
        platform,
        platform_title,
        platform_caption,
        platform_hashtags,
        platform_options_json,
        'draft',
        null
      from post_targets
      where id = $1
      returning *
    `,
    [id]
  );
  const row = result.rows[0];

  if (row) {
    await refreshPostStatus(Number(row.post_id));
  }

  return row ? toPostTarget(row) : null;
}
