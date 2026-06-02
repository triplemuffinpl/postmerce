import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import type { Platform } from "../domain.js";

interface OAuthStatePayload {
  platform: Platform;
  nonce: string;
  expiresAt: number;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function sign(value: string): string {
  return createHmac("sha256", env.appSecret).update(value).digest("base64url");
}

function isOAuthStatePayload(value: unknown): value is OAuthStatePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.platform === "youtube" &&
    typeof candidate.nonce === "string" &&
    typeof candidate.expiresAt === "number"
  );
}

export function createOAuthState(platform: Platform, ttlMs = 10 * 60 * 1000): string {
  const payload: OAuthStatePayload = {
    platform,
    nonce: randomBytes(16).toString("base64url"),
    expiresAt: Date.now() + ttlMs
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyOAuthState(value: string, expectedPlatform: Platform): boolean {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const parsed: unknown = JSON.parse(base64UrlDecode(encodedPayload));

    if (!isOAuthStatePayload(parsed)) {
      return false;
    }

    return parsed.platform === expectedPlatform && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}
