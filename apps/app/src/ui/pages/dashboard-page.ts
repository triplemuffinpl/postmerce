import type { PlatformConfig } from "../../domain.js";
import { platformList } from "../components/platform-list.js";
import { layout } from "../layout.js";

interface DashboardPageOptions {
  platforms: PlatformConfig[];
}

export function dashboardPage(options: DashboardPageOptions): string {
  return layout({
    title: "Dashboard",
    active: "dashboard",
    body: `
      <section class="page-header">
        <p class="eyebrow">Private publishing panel</p>
        <h1>One asset, many targets, clear status.</h1>
        <p class="lead">
          This foundation is ready for media upload, target drafts, queue workers and dry-run publishing.
        </p>
      </section>

      <section class="metric-grid" aria-label="Postmerce status">
        <article>
          <span>Mode</span>
          <strong>Dry run first</strong>
        </article>
        <article>
          <span>Queue</span>
          <strong>PostgreSQL jobs</strong>
        </article>
        <article>
          <span>UI</span>
          <strong>Replaceable shell</strong>
        </article>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>Platform plan</h2>
          <a class="text-link" href="/accounts">Manage accounts</a>
        </div>
        ${platformList(options.platforms)}
      </section>
    `
  });
}
