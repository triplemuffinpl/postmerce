import { env } from "../config/env.js";
import type { Platform, PlatformConfig } from "../domain.js";

const labels: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  linkedin: "LinkedIn",
  instagram: "Instagram Reels",
  facebook: "Facebook Page/Reels",
  tiktok: "TikTok"
};

export function getPlatformConfigs(): PlatformConfig[] {
  return Object.entries(env.enabledPlatforms).map(([platform, enabled]) => ({
    platform: platform as Platform,
    label: labels[platform as Platform],
    enabled,
    directPublishing: platform !== "instagram",
    scheduling: true
  }));
}
