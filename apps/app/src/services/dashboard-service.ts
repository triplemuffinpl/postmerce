import { listConnectedSocialAccounts } from "../db/account-repository.js";
import type { TargetControlItem } from "../db/target-repository.js";
import { listTargetControlItems } from "../db/target-repository.js";
import type { MediaAssetRecord, SocialAccountRecord } from "../domain.js";
import { getRecentMedia } from "./media-service.js";
import { getAppSettings } from "./settings-service.js";

export interface DashboardData {
  settings: Awaited<ReturnType<typeof getAppSettings>>;
  readyMedia: MediaAssetRecord[];
  accounts: SocialAccountRecord[];
  targets: TargetControlItem[];
  problems: TargetControlItem[];
  upcoming: TargetControlItem[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [targets, media, accounts, settings] = await Promise.all([
    listTargetControlItems(80),
    getRecentMedia(),
    listConnectedSocialAccounts(),
    getAppSettings()
  ]);

  return {
    settings,
    readyMedia: media.filter((item) => item.status === "ready"),
    accounts,
    targets,
    problems: targets
      .filter((target) => target.status === "failed" || target.status === "requires_user_action")
      .slice(0, 6),
    upcoming: targets
      .filter((target) => ["queued", "scheduled", "publishing", "processing_on_platform"].includes(target.status))
      .slice(0, 6)
  };
}
