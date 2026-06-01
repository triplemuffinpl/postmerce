import type { PlatformConfig } from "../../domain.js";
import { platformList } from "../components/platform-list.js";
import { layout } from "../layout.js";

interface AccountsPageOptions {
  platforms: PlatformConfig[];
}

export function accountsPage(options: AccountsPageOptions): string {
  return layout({
    title: "Accounts",
    active: "accounts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">OAuth connections</p>
        <h1>Social accounts</h1>
        <p class="lead">Real OAuth flows will be added after per-platform API feasibility checks.</p>
      </section>
      <section class="panel">
        ${platformList(options.platforms)}
      </section>
    `
  });
}
