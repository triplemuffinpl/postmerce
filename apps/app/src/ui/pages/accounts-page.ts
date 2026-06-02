import type { PlatformConfig } from "../../domain.js";
import { platformList } from "../components/platform-list.js";
import { layout } from "../layout.js";

interface AccountsPageOptions {
  platforms: PlatformConfig[];
}

export function accountsPage(options: AccountsPageOptions): string {
  return layout({
    title: "Konta i Integracje",
    active: "accounts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Autoryzacja integracji</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Konta Społecznościowe</h1>
        <p class="lead">Poniżej znajduje się status integracji z Twoimi kanałami. Rzeczywiste przepływy OAuth zostaną podłączone po zbadaniu specyfikacji technicznych poszczególnych API.</p>
      </section>
      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Zarządzaj Połączeniami</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Status uwierzytelniania w zewnętrznych serwisach.</p>
          </div>
        </div>
        ${platformList(options.platforms)}
      </section>
    `
  });
}
