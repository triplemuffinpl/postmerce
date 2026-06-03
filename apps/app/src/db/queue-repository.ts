import type { PoolClient } from "pg";
import { pool } from "./client.js";
import type {
  ErrorClass,
  MediaAssetRecord,
  MediaStatus,
  Platform,
  PostRecord,
  PostStatus,
  PostTargetRecord,
  PostTargetStatus,
  PublishJobContext,
  PublishJobListItem,
  PublishJobRecord,
  PublishJobStatus,
  PublishResult,
  WorkerHeartbeatRecord
} from "../domain.js";

type Queryable = Pick<PoolClient, "query">;

interface PublishJobRow {
  id: string;
  post_target_id: string | null;
  job_type: "publish";
  status: PublishJobStatus;
  attempts: number;
  max_attempts: number;
  run_after: Date;
  locked_at: Date | null;
  locked_until: Date | null;
  locked_by: string | null;
  finished_at: Date | null;
  failed_at: Date | null;
  error_class: ErrorClass | null;
  last_error: string | null;
  idempotency_key: string;
  payload_json: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface PublishJobListRow extends PublishJobRow {
  post_id: string | null;
  post_title: string | null;
  platform: Platform | null;
  target_status: PostTargetStatus | null;
  media_original_filename: string | null;
}

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
  status: MediaStatus;
  created_at: Date;
  updated_at: Date;
}

interface WorkerHeartbeatRow {
  worker_id: string;
  last_seen_at: Date;
  metadata_json: Record<string, unknown>;
}

export interface CreatePublishJobInput {
  postTargetId: number;
  runAfter: Date;
  idempotencyKey: string;
  payload: Record<string, unknown>;
}

export interface PublishJobFailureInput {
  job: PublishJobRecord;
  context: PublishJobContext;
  errorClass: ErrorClass;
  errorCode: string | null;
  errorMessage: string;
  retryAt: Date | null;
  finalTargetStatus: PostTargetStatus;
}

function toPublishJob(row: PublishJobRow): PublishJobRecord {
  return {
    id: Number(row.id),
    postTargetId: row.post_target_id === null ? null : Number(row.post_target_id),
    jobType: row.job_type,
    status: row.status,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    runAfter: row.run_after,
    lockedAt: row.locked_at,
    lockedUntil: row.locked_until,
    lockedBy: row.locked_by,
    finishedAt: row.finished_at,
    failedAt: row.failed_at,
    errorClass: row.error_class,
    lastError: row.last_error,
    idempotencyKey: row.idempotency_key,
    payload: row.payload_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
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
  return {
    id: Number(row.id),
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
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toWorkerHeartbeat(row: WorkerHeartbeatRow): WorkerHeartbeatRecord {
  return {
    workerId: row.worker_id,
    lastSeenAt: row.last_seen_at,
    metadata: row.metadata_json
  };
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
    (status) => status === "failed" || status === "requires_user_action" || status === "cancelled"
  ).length;

  if (successCount === statuses.length) {
    return "published";
  }

  if (successCount > 0 && failedCount > 0) {
    return "partially_published";
  }

  if (failedCount === statuses.length) {
    return statuses.every((status) => status === "cancelled") ? "cancelled" : "failed";
  }

  return "queued";
}

async function refreshPostStatus(postId: number, client: Queryable): Promise<void> {
  const result = await client.query<{ status: PostTargetStatus }>(
    "select status from post_targets where post_id = $1 order by id asc",
    [postId]
  );
  const status = nextPostStatus(result.rows.map((row) => row.status));

  await client.query("update posts set status = $1, updated_at = now() where id = $2", [status, postId]);
}

async function refreshPostStatusByTargetId(targetId: number, client: Queryable): Promise<void> {
  const result = await client.query<{ post_id: string }>(
    "select post_id from post_targets where id = $1 limit 1",
    [targetId]
  );
  const postId = result.rows[0]?.post_id;

  if (postId) {
    await refreshPostStatus(Number(postId), client);
  }
}

export async function createPublishJob(client: Queryable, input: CreatePublishJobInput): Promise<void> {
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
      on conflict (idempotency_key) do nothing
    `,
    [
      input.postTargetId,
      input.runAfter,
      input.idempotencyKey,
      JSON.stringify(input.payload)
    ]
  );
}

export async function claimNextPublishJob(workerId: string, lockSeconds: number): Promise<PublishJobRecord | null> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const claimResult = await client.query<PublishJobRow>(
      `
        select *
        from publish_jobs
        where (
          status = 'pending'
          and run_after <= now()
        )
        or (
          status = 'running'
          and locked_until is not null
          and locked_until < now()
        )
        order by run_after asc, id asc
        for update skip locked
        limit 1
      `
    );
    const claim = claimResult.rows[0];

    if (!claim) {
      await client.query("commit");
      return null;
    }

    const updateResult = await client.query<PublishJobRow>(
      `
        update publish_jobs
        set
          status = 'running',
          attempts = attempts + 1,
          locked_at = now(),
          locked_until = now() + ($2 * interval '1 second'),
          locked_by = $3,
          updated_at = now()
        where id = $1
        returning *
      `,
      [claim.id, lockSeconds, workerId]
    );

    await client.query("commit");
    return updateResult.rows[0] ? toPublishJob(updateResult.rows[0]) : null;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPublishJobContext(jobId: number): Promise<PublishJobContext | null> {
  const jobResult = await pool.query<PublishJobRow>("select * from publish_jobs where id = $1 limit 1", [jobId]);
  const jobRow = jobResult.rows[0];

  if (!jobRow || jobRow.post_target_id === null) {
    return null;
  }

  const targetResult = await pool.query<PostTargetRow>("select * from post_targets where id = $1 limit 1", [
    jobRow.post_target_id
  ]);
  const targetRow = targetResult.rows[0];

  if (!targetRow) {
    return null;
  }

  const postResult = await pool.query<PostRow>("select * from posts where id = $1 limit 1", [targetRow.post_id]);
  const postRow = postResult.rows[0];

  if (!postRow || postRow.media_asset_id === null) {
    return null;
  }

  const mediaResult = await pool.query<MediaAssetRow>("select * from media_assets where id = $1 limit 1", [
    postRow.media_asset_id
  ]);
  const mediaRow = mediaResult.rows[0];

  if (!mediaRow) {
    return null;
  }

  return {
    job: toPublishJob(jobRow),
    post: toPost(postRow),
    target: toPostTarget(targetRow),
    media: toMediaAsset(mediaRow)
  };
}

export async function markTargetPublishing(context: PublishJobContext): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `
        update post_targets
        set
          status = 'publishing',
          error_code = null,
          error_message = null,
          updated_at = now()
        where id = $1
      `,
      [context.target.id]
    );
    await refreshPostStatus(context.post.id, client);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function markPublishJobSucceeded(context: PublishJobContext, result: PublishResult): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `
        update post_targets
        set
          status = $2,
          external_post_id = $3,
          external_url = $4,
          error_code = null,
          error_message = null,
          published_at = now(),
          updated_at = now()
        where id = $1
      `,
      [
        context.target.id,
        result.status,
        result.externalPostId,
        result.externalUrl
      ]
    );
    await client.query(
      `
        update publish_jobs
        set
          status = 'succeeded',
          locked_at = null,
          locked_until = null,
          locked_by = null,
          finished_at = now(),
          failed_at = null,
          error_class = null,
          last_error = null,
          updated_at = now()
        where id = $1
      `,
      [context.job.id]
    );
    await client.query(
      `
        insert into platform_events (post_target_id, platform, event_type, payload_json)
        values ($1, $2, 'publish_succeeded', $3)
      `,
      [
        context.target.id,
        context.target.platform,
        JSON.stringify(result.redactedRawResponse)
      ]
    );
    await refreshPostStatus(context.post.id, client);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function markPublishJobFailed(input: PublishJobFailureInput): Promise<void> {
  const client = await pool.connect();
  const shouldRetry = input.retryAt !== null;

  try {
    await client.query("begin");
    await client.query(
      `
        update post_targets
        set
          status = $2,
          error_code = $3,
          error_message = $4,
          updated_at = now()
        where id = $1
      `,
      [
        input.context.target.id,
        shouldRetry ? "queued" : input.finalTargetStatus,
        input.errorCode,
        input.errorMessage
      ]
    );
    await client.query(
      `
        update publish_jobs
        set
          status = $2,
          run_after = coalesce($3, run_after),
          locked_at = null,
          locked_until = null,
          locked_by = null,
          finished_at = null,
          failed_at = case when $3::timestamptz is null then now() else null end,
          error_class = $4,
          last_error = $5,
          updated_at = now()
        where id = $1
      `,
      [
        input.job.id,
        shouldRetry ? "pending" : "failed",
        input.retryAt,
        input.errorClass,
        input.errorMessage
      ]
    );
    await client.query(
      `
        insert into platform_events (post_target_id, platform, event_type, payload_json)
        values ($1, $2, $3, $4)
      `,
      [
        input.context.target.id,
        input.context.target.platform,
        shouldRetry ? "publish_retry_scheduled" : "publish_failed",
        JSON.stringify({
          errorCode: input.errorCode,
          errorClass: input.errorClass,
          message: input.errorMessage,
          retryAt: input.retryAt?.toISOString() ?? null
        })
      ]
    );
    await refreshPostStatus(input.context.post.id, client);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function markPublishJobMissingContext(job: PublishJobRecord, message: string): Promise<void> {
  await pool.query(
    `
      update publish_jobs
      set
        status = 'failed',
        locked_at = null,
        locked_until = null,
        locked_by = null,
        failed_at = now(),
        error_class = 'validation',
        last_error = $2,
        updated_at = now()
      where id = $1
    `,
    [job.id, message]
  );
}

export async function listPublishJobs(limit = 100): Promise<PublishJobListItem[]> {
  const result = await pool.query<PublishJobListRow>(
    `
      select
        j.*,
        p.id as post_id,
        p.title as post_title,
        t.platform,
        t.status as target_status,
        m.original_filename as media_original_filename
      from publish_jobs j
      left join post_targets t on t.id = j.post_target_id
      left join posts p on p.id = t.post_id
      left join media_assets m on m.id = p.media_asset_id
      order by j.created_at desc, j.id desc
      limit $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    ...toPublishJob(row),
    postId: row.post_id === null ? null : Number(row.post_id),
    postTitle: row.post_title,
    platform: row.platform,
    targetStatus: row.target_status,
    mediaOriginalFilename: row.media_original_filename
  }));
}

export async function retryPublishJob(jobId: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query<PublishJobRow>(
      "select * from publish_jobs where id = $1 for update",
      [jobId]
    );
    const job = result.rows[0];

    if (!job || job.status === "pending" || job.status === "running" || job.status === "succeeded") {
      await client.query("commit");
      return false;
    }

    await client.query(
      `
        update publish_jobs
        set
          status = 'pending',
          run_after = now(),
          locked_at = null,
          locked_until = null,
          locked_by = null,
          finished_at = null,
          failed_at = null,
          error_class = null,
          last_error = null,
          updated_at = now()
        where id = $1
      `,
      [jobId]
    );

    if (job.post_target_id) {
      await client.query(
        `
          update post_targets
          set
            status = 'queued',
            error_code = null,
            error_message = null,
            updated_at = now()
          where id = $1
        `,
        [job.post_target_id]
      );
      await refreshPostStatusByTargetId(Number(job.post_target_id), client);
    }

    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelPublishJob(jobId: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query<PublishJobRow>(
      "select * from publish_jobs where id = $1 for update",
      [jobId]
    );
    const job = result.rows[0];

    if (!job || job.status !== "pending") {
      await client.query("commit");
      return false;
    }

    await client.query(
      `
        update publish_jobs
        set
          status = 'cancelled',
          locked_at = null,
          locked_until = null,
          locked_by = null,
          finished_at = now(),
          updated_at = now()
        where id = $1
      `,
      [jobId]
    );

    if (job.post_target_id) {
      await client.query(
        `
          update post_targets
          set
            status = 'cancelled',
            updated_at = now()
          where id = $1
            and status not in ('published', 'simulated')
        `,
        [job.post_target_id]
      );
      await refreshPostStatusByTargetId(Number(job.post_target_id), client);
    }

    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePublishJob(jobId: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await client.query<PublishJobRow>(
      "select * from publish_jobs where id = $1 for update",
      [jobId]
    );
    const job = result.rows[0];

    if (!job || job.status === "running") {
      await client.query("commit");
      return false;
    }

    await client.query("delete from publish_jobs where id = $1", [jobId]);

    if (job.post_target_id) {
      await client.query(
        `
          update post_targets
          set
            status = case when scheduled_at is not null and scheduled_at > now() then 'scheduled' else 'draft' end,
            error_code = null,
            error_message = null,
            updated_at = now()
          where id = $1
            and status not in ('published', 'simulated', 'publishing')
            and not exists (
              select 1
              from publish_jobs
              where post_target_id = $1
                and status in ('pending', 'running')
            )
        `,
        [job.post_target_id]
      );
      await refreshPostStatusByTargetId(Number(job.post_target_id), client);
    }

    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateWorkerHeartbeat(workerId: string, metadata: Record<string, unknown>): Promise<void> {
  await pool.query(
    `
      insert into worker_heartbeats (worker_id, last_seen_at, metadata_json)
      values ($1, now(), $2)
      on conflict (worker_id)
      do update set
        last_seen_at = excluded.last_seen_at,
        metadata_json = excluded.metadata_json
    `,
    [workerId, JSON.stringify(metadata)]
  );
}

export async function listWorkerHeartbeats(limit = 10): Promise<WorkerHeartbeatRecord[]> {
  const result = await pool.query<WorkerHeartbeatRow>(
    `
      select *
      from worker_heartbeats
      order by last_seen_at desc
      limit $1
    `,
    [limit]
  );

  return result.rows.map(toWorkerHeartbeat);
}
