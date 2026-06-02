import type { MultipartFile } from "@fastify/multipart";
import { env } from "../config/env.js";
import type { MediaAssetRecord } from "../domain.js";
import { createMediaAsset, getMediaAsset, listMediaAssets } from "../db/media-repository.js";
import { createThumbnailPath, storeUploadedVideo } from "./storage-service.js";
import { generateThumbnail, probeVideo } from "./video-probe-service.js";

export interface MediaUploadResult {
  media: MediaAssetRecord;
  warnings: string[];
}

function collectValidationErrors(probe: Awaited<ReturnType<typeof probeVideo>>, sizeBytes: number): string[] {
  const errors: string[] = [];
  const maxBytes = env.maxUploadMb * 1024 * 1024;

  if (sizeBytes > maxBytes) {
    errors.push(`Video is larger than ${env.maxUploadMb} MB.`);
  }

  if (probe.durationSec !== null && probe.durationSec > env.maxDurationSeconds) {
    errors.push(`Video is longer than ${env.maxDurationSeconds} seconds.`);
  }

  if (probe.width !== null && probe.width > env.maxVideoWidth) {
    errors.push(`Video width is larger than ${env.maxVideoWidth}px.`);
  }

  if (probe.height !== null && probe.height > env.maxVideoHeight) {
    errors.push(`Video height is larger than ${env.maxVideoHeight}px.`);
  }

  if (probe.videoCodec === null) {
    errors.push("No video stream detected.");
  }

  return errors;
}

export async function uploadMedia(file: MultipartFile): Promise<MediaUploadResult> {
  const stored = await storeUploadedVideo(file);
  const warnings: string[] = [];
  const probe = await probeVideo(stored.absolutePath).catch((error: unknown) => {
    warnings.push(
      error instanceof Error
        ? `FFprobe failed: ${error.message}`
        : "FFprobe failed."
    );

    return {
      durationSec: null,
      width: null,
      height: null,
      fps: null,
      videoCodec: null,
      audioCodec: null
    };
  });
  const validationErrors = collectValidationErrors(probe, stored.sizeBytes);

  let thumbnailPath: string | null = null;

  if (validationErrors.length === 0) {
    const thumbnail = await createThumbnailPath(stored.storageKey);

    try {
      await generateThumbnail(stored.absolutePath, thumbnail.absolutePath);
      thumbnailPath = thumbnail.storagePath;
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Thumbnail generation failed: ${error.message}`
          : "Thumbnail generation failed."
      );
    }
  }

  const media = await createMediaAsset({
    originalFilename: stored.originalFilename,
    storageDisk: stored.storageDisk,
    storageKey: stored.storageKey,
    storagePath: stored.storagePath,
    thumbnailPath,
    mimeType: stored.mimeType,
    sizeBytes: stored.sizeBytes,
    durationSec: probe.durationSec,
    width: probe.width,
    height: probe.height,
    fps: probe.fps,
    videoCodec: probe.videoCodec,
    audioCodec: probe.audioCodec,
    checksum: stored.checksum,
    status: validationErrors.length === 0 ? "ready" : "invalid"
  });

  return {
    media,
    warnings: [...validationErrors, ...warnings]
  };
}

export async function getRecentMedia(): Promise<MediaAssetRecord[]> {
  return listMediaAssets(100);
}

export async function getMediaDetails(id: number): Promise<MediaAssetRecord | null> {
  return getMediaAsset(id);
}
