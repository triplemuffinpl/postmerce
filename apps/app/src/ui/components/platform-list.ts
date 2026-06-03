import type { PlatformConfig, SocialAccountRecord } from "../../domain.js";
import { escapeHtml } from "../html.js";
import { platformIcon, platformLabel } from "./platform-meta.js";

interface PlatformListOptions {
  platforms: PlatformConfig[];
  accounts: SocialAccountRecord[];
  youtubeOAuthConfigured: boolean;
  showConnectionDetails?: boolean;
}

function accountSummary(accounts: SocialAccountRecord[]): string {
  if (accounts.length === 0) {
    return "Brak połączonego konta";
  }

  return accounts
    .map((account) => account.displayName ?? account.username ?? account.platformUserId ?? `Konto #${account.id}`)
    .map(escapeHtml)
    .join(", ");
}

function platformAction(
  platform: PlatformConfig,
  accounts: SocialAccountRecord[],
  youtubeOAuthConfigured: boolean,
  showConnectionDetails: boolean
): string {
  if (!showConnectionDetails) {
    return "";
  }

  if (!platform.enabled) {
    return `<span class="status-badge status-gray">Wyłączona</span>`;
  }

  if (platform.platform !== "youtube") {
    return `<span class="status-badge status-gray">W kolejce</span>`;
  }

  if (!youtubeOAuthConfigured) {
    return `<span class="status-badge status-red">Brak OAuth</span>`;
  }

  if (accounts.length > 0) {
    return `<a class="inline-action" href="/accounts/youtube/connect">Odśwież dostęp</a>`;
  }

  return `<a class="inline-action" href="/accounts/youtube/connect">Połącz YouTube</a>`;
}

export function platformList(options: PlatformListOptions): string {
  const showConnectionDetails = options.showConnectionDetails ?? true;

  return `
    <div class="platform-list">
      ${options.platforms
        .map((platform) => {
          const accounts = options.accounts.filter((account) => account.platform === platform.platform);
          const connectedAccounts = accounts.filter((account) => account.status === "connected");
          const status = connectedAccounts.length > 0 ? "Połączona" : platform.enabled ? "Aktywna" : "Wyłączona";
          const statusClass = connectedAccounts.length > 0 ? "status-green" : platform.enabled ? "status-blue" : "status-gray";
          const icon = platformIcon(platform.platform, 24, 24) || "";
          return `
            <article class="platform-row">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div class="platform-icon-wrap" style="background: var(--bg); padding: 8px; border-radius: var(--radius-sm); display: grid; place-items: center;">
                  ${icon}
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700;">${escapeHtml(platformLabel(platform.platform))}</h3>
                  <p style="margin: 0; font-size: 0.85rem; color: var(--muted); font-weight: 500;">
                    ${platform.directPublishing ? "Bezpośrednie publikowanie API" : "Planowany przepływ kontenera / odpytywania"}
                  </p>
                  ${
                    showConnectionDetails
                      ? `<p style="margin-top: 4px; font-size: 0.78rem; color: var(--muted); font-weight: 600;">${accountSummary(connectedAccounts)}</p>`
                      : ""
                  }
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                <span class="status-badge ${statusClass}">${status}</span>
                ${platformAction(platform, connectedAccounts, options.youtubeOAuthConfigured, showConnectionDetails)}
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}
