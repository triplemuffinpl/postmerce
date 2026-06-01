import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const envFiles = [
  process.env.POSTMERCE_ENV_FILE,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env")
].filter((filePath): filePath is string => Boolean(filePath));

for (const filePath of envFiles) {
  if (existsSync(filePath)) {
    config({ path: filePath, override: false });
  }
}

const booleanFromEnv = z
  .string()
  .optional()
  .transform((value) => value === "true");

const envSchema = z.object({
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  APP_HOST: z.string().default("127.0.0.1"),
  APP_PORT: z.coerce.number().int().positive().default(4310),
  APP_URL: z.string().url().default("http://127.0.0.1:4310"),
  APP_TIMEZONE: z.string().default("Europe/Warsaw"),
  APP_SECRET: z.string().min(16).default("local-development-secret"),
  ENCRYPTION_KEY: z.string().min(16).default("local-development-encryption-key"),
  DATABASE_URL: z
    .string()
    .url()
    .default("postgres://postmerce:postmerce@127.0.0.1:5432/postmerce"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(500),
  MAX_DURATION_SECONDS: z.coerce.number().int().positive().default(600),
  CLEANUP_AFTER_DAYS: z.coerce.number().int().positive().default(30),
  DRY_RUN: booleanFromEnv.default("true"),
  ENABLE_YOUTUBE: booleanFromEnv.default("true"),
  ENABLE_LINKEDIN: booleanFromEnv.default("true"),
  ENABLE_INSTAGRAM: booleanFromEnv.default("false"),
  ENABLE_FACEBOOK: booleanFromEnv.default("false"),
  ENABLE_TIKTOK: booleanFromEnv.default("false")
});

const parsed = envSchema.parse(process.env);

export const env = {
  appEnv: parsed.APP_ENV,
  host: parsed.APP_HOST,
  port: parsed.APP_PORT,
  appUrl: parsed.APP_URL,
  timezone: parsed.APP_TIMEZONE,
  appSecret: parsed.APP_SECRET,
  encryptionKey: parsed.ENCRYPTION_KEY,
  databaseUrl: parsed.DATABASE_URL,
  maxUploadMb: parsed.MAX_UPLOAD_MB,
  maxDurationSeconds: parsed.MAX_DURATION_SECONDS,
  cleanupAfterDays: parsed.CLEANUP_AFTER_DAYS,
  dryRun: parsed.DRY_RUN,
  enabledPlatforms: {
    youtube: parsed.ENABLE_YOUTUBE,
    linkedin: parsed.ENABLE_LINKEDIN,
    instagram: parsed.ENABLE_INSTAGRAM,
    facebook: parsed.ENABLE_FACEBOOK,
    tiktok: parsed.ENABLE_TIKTOK
  }
} as const;
