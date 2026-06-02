import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { nanoid } from "nanoid";
import type { MultipartFile } from "@fastify/multipart";
import { env } from "../config/env.js";

const safeExtensionPattern = /^\.[a-z0-9]{1,8}$/;

export interface StoredUpload {
  originalFilename: string;
  storageDisk: "local";
  storageKey: string;
  storagePath: string;
  absolutePath: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
}

export interface ThumbnailPath {
  storageKey: string;
  storagePath: string;
  absolutePath: string;
}

function monthKey(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

function safeExtension(filename: string, fallback: string): string {
  const extension = path.extname(filename).toLowerCase();
  return safeExtensionPattern.test(extension) ? extension : fallback;
}

export async function ensureStorageDirectories(): Promise<void> {
  await Promise.all([
    mkdir(path.join(env.storageRoot, "uploads"), { recursive: true }),
    mkdir(path.join(env.storageRoot, "thumbnails"), { recursive: true }),
    mkdir(path.join(env.storageRoot, "temp"), { recursive: true }),
    mkdir(path.join(env.storageRoot, "logs"), { recursive: true }),
    mkdir(path.join(env.storageRoot, "backups"), { recursive: true })
  ]);
}

export async function storeUploadedVideo(file: MultipartFile): Promise<StoredUpload> {
  if (!file.mimetype.startsWith("video/")) {
    throw new Error(`Unsupported media type: ${file.mimetype}`);
  }

  await ensureStorageDirectories();

  const now = new Date();
  const folderKey = monthKey(now);
  const extension = safeExtension(file.filename, ".mp4");
  const storageKey = `${folderKey}/${nanoid(18)}${extension}`;
  const storagePath = `uploads/${storageKey}`;
  const absolutePath = path.join(env.storageRoot, storagePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  const hash = createHash("sha256");
  const hashTransform = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      hash.update(chunk);
      callback(null, chunk);
    }
  });

  await pipeline(file.file, hashTransform, createWriteStream(absolutePath, { flags: "wx" }));

  const fileStats = await stat(absolutePath);

  return {
    originalFilename: file.filename,
    storageDisk: "local",
    storageKey,
    storagePath,
    absolutePath,
    mimeType: file.mimetype,
    sizeBytes: fileStats.size,
    checksum: hash.digest("hex")
  };
}

export async function createThumbnailPath(sourceStorageKey: string): Promise<ThumbnailPath> {
  const parsed = path.parse(sourceStorageKey);
  const storageKey = `${parsed.dir}/${parsed.name}.jpg`;
  const storagePath = `thumbnails/${storageKey}`;
  const absolutePath = path.join(env.storageRoot, storagePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  return {
    storageKey,
    storagePath,
    absolutePath
  };
}

export function storagePathToPublicUrl(storagePath: string | null): string | null {
  if (!storagePath) {
    return null;
  }

  const normalized = storagePath.replaceAll("\\", "/");

  if (normalized.startsWith("uploads/")) {
    return `/uploads/${normalized.slice("uploads/".length)}`;
  }

  if (normalized.startsWith("thumbnails/")) {
    return `/thumbnails/${normalized.slice("thumbnails/".length)}`;
  }

  return null;
}
