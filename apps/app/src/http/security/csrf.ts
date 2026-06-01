import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";

export function createCsrfToken(sessionId: string): string {
  return createHmac("sha256", env.appSecret).update(sessionId).digest("hex");
}

export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const expected = createCsrfToken(sessionId);
  const expectedBuffer = Buffer.from(expected, "hex");
  const tokenBuffer = Buffer.from(token, "hex");

  if (expectedBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, tokenBuffer);
}
