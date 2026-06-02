import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

const algorithm = "aes-256-gcm";
const version = "v1";

function base64UrlEncode(value: Buffer): string {
  return value.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function encryptionKey(): Buffer {
  if (env.encryptionKey.startsWith("base64:")) {
    const decoded = Buffer.from(env.encryptionKey.slice("base64:".length), "base64");

    if (decoded.length === 32) {
      return decoded;
    }
  }

  return createHash("sha256").update(env.encryptionKey).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [version, base64UrlEncode(iv), base64UrlEncode(tag), base64UrlEncode(encrypted)].join(".");
}

export function decryptSecret(value: string): string {
  const parts = value.split(".");

  if (parts.length !== 4 || parts[0] !== version) {
    throw new Error("Unsupported encrypted secret format.");
  }

  const iv = base64UrlDecode(parts[1] ?? "");
  const tag = base64UrlDecode(parts[2] ?? "");
  const encrypted = base64UrlDecode(parts[3] ?? "");
  const decipher = createDecipheriv(algorithm, encryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
