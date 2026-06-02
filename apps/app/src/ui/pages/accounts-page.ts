import type { PlatformConfig, SocialAccountRecord } from "../../domain.js";
import { platformList } from "../components/platform-list.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface AccountsPageOptions {
  platforms: PlatformConfig[];
  accounts: SocialAccountRecord[];
  youtubeOAuthConfigured: boolean;
  notice?: string;
  error?: string;
}

function message(type: "notice" | "error", value: string | undefined): string {
  if (!value) {
    return "";
  }

  return `<div class="message ${type}">${escapeHtml(value)}</div>`;
}

export function accountsPage(options: AccountsPageOptions): string {
  return layout({
    title: "Konta i Integracje",
    active: "accounts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Autoryzacja integracji</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Konta spolecznosciowe</h1>
        <p class="lead">Tu kontrolujesz konta, ktore worker moze wykorzystac do realnej publikacji. YouTube ma juz przygotowany przeplyw OAuth.</p>
      </section>
      ${message("notice", options.notice)}
      ${message("error", options.error)}
      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Zarzadzaj polaczeniami</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Status uwierzytelniania w zewnetrznych serwisach.</p>
          </div>
        </div>
        ${platformList({
          platforms: options.platforms,
          accounts: options.accounts,
          youtubeOAuthConfigured: options.youtubeOAuthConfigured
        })}
      </section>
    `
  });
}
