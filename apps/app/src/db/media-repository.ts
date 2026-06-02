import { pool } from "./client.js";
import type { MediaAssetRecord, MediaStatus } from "../domain.js";

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

export interface CreateMediaAssetInput {
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

export async function createMediaAsset(input: CreateMediaAssetInput): Promise<MediaAssetRecord> {
  const result = await pool.query<MediaAssetRow>(
    `
      insert into media_assets (
        original_filename,
        storage_disk,
        storage_key,
        storage_path,
        thumbnail_path,
        mime_type,
        size_bytes,
        duration_sec,
        width,
        height,
        fps,
        video_codec,
        audio_codec,
        checksum,
        status
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15
      )
      returning *
    `,
    [
      input.originalFilename,
      input.storageDisk,
      input.storageKey,
      input.storagePath,
      input.thumbnailPath,
      input.mimeType,
      input.sizeBytes,
      input.durationSec,
      input.width,
      input.height,
      input.fps,
      input.videoCodec,
      input.audioCodec,
      input.checksum,
      input.status
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create media asset.");
  }

  return toMediaAsset(row);
}

export async function listMediaAssets(limit = 50): Promise<MediaAssetRecord[]> {
  const result = await pool.query<MediaAssetRow>(
    `
      select *
      from media_assets
      where status <> 'deleted'
      order by created_at desc
      limit $1
    `,
    [limit]
  );

  return result.rows.map(toMediaAsset);
}

export async function getMediaAsset(id: number): Promise<MediaAssetRecord | null> {
  const result = await pool.query<MediaAssetRow>(
    `
      select *
      from media_assets
      where id = $1
      limit 1
    `,
    [id]
  );

  const row = result.rows[0];
  return row ? toMediaAsset(row) : null;
}
