import type { DashboardData } from "../../services/dashboard-service.js";
import { formatAppDateTime } from "../../date-time.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";
import { platformBadge } from "../components/platform-meta.js";
import { targetStatusBadge } from "../components/status-meta.js";

function targetTime(target: DashboardData["targets"][number], timezone: string): string {
  const date = target.scheduledAt ?? target.postScheduledAt ?? target.latestJobRunAfter ?? target.updatedAt;
  return formatAppDateTime(date, timezone);
}

function metricCard(label: string, value: string | number, href: string, tone: "normal" | "danger" | "success" = "normal"): string {
  const toneClass = tone === "danger" ? "dashboard-metric danger" : tone === "success" ? "dashboard-metric success" : "dashboard-metric";

  return `
    <a class="${toneClass}" href="${href}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </a>
  `;
}

function targetList(title: string, empty: string, targets: DashboardData["targets"], timezone: string): string {
  if (targets.length === 0) {
    return `
      <section class="dashboard-list">
        <div class="dashboard-list-head">
          <h2>${escapeHtml(title)}</h2>
        </div>
        <p class="dashboard-empty">${escapeHtml(empty)}</p>
      </section>
    `;
  }

  return `
    <section class="dashboard-list">
      <div class="dashboard-list-head">
        <h2>${escapeHtml(title)}</h2>
        <a class="text-link" href="/control">Zobacz targety</a>
      </div>
      <div class="dashboard-target-stack">
        ${targets
          .map((target) => `
            <a class="dashboard-target-row" href="/posts/${target.postId}">
              <span>${platformBadge(target.platform, true)}</span>
              <strong>${escapeHtml(target.postTitle)}</strong>
              <small>${escapeHtml(targetTime(target, timezone))}</small>
              ${targetStatusBadge(target.status)}
            </a>
          `)
          .join("")}
      </div>
    </section>
  `;
}

function setupChecklist(data: DashboardData): string {
  const items = [
    {
      done: data.readyMedia.length > 0,
      label: "Gotowe media",
      href: "/media"
    },
    {
      done: data.accounts.length > 0,
      label: "Połączone konta",
      href: "/accounts"
    },
    {
      done: data.targets.length > 0,
      label: "Pierwsze targety",
      href: "/posts/new"
    }
  ];

  return `
    <section class="dashboard-checklist">
      <h2>Setup</h2>
      ${items
        .map((item) => `
          <a href="${item.href}" class="${item.done ? "is-done" : ""}">
            <span>${item.done ? "OK" : "Do zrobienia"}</span>
            <strong>${escapeHtml(item.label)}</strong>
          </a>
        `)
        .join("")}
    </section>
  `;
}

export function dashboardPage(data: DashboardData): string {
  const queued = data.targets.filter((target) => target.status === "queued" || target.status === "scheduled").length;
  const completed = data.targets.filter((target) => target.status === "published" || target.status === "simulated").length;
  const modeLabel = data.settings.dryRun ? "Tryb testowy" : "Live";

  return layout({
    title: "Dashboard",
    active: "dashboard",
    body: `
      <section class="dashboard-hero">
        <div>
          <p class="eyebrow">Postmerce</p>
          <h1>Panel publikacji</h1>
          <p class="lead">Najkrótsza droga: media → wpis → targety → kolejka → status.</p>
        </div>
        <div class="dashboard-mode-card ${data.settings.dryRun ? "is-dry" : "is-live"}">
          <span>Tryb</span>
          <strong>${modeLabel}</strong>
          <a href="/settings">${data.settings.dryRun ? "Włącz live" : "Ustawienia"}</a>
        </div>
      </section>

      <section class="dashboard-actions" aria-label="Najważniejsze akcje">
        <a class="button-link" href="/posts/new">Nowy wpis</a>
        <a class="button-link secondary" href="/media">Wgraj media</a>
        <a class="button-link secondary" href="/control">Kontrola targetów</a>
        <a class="button-link secondary" href="/settings">Ustawienia</a>
      </section>

      <section class="dashboard-metrics" aria-label="Stan operacyjny">
        ${metricCard("Media gotowe", data.readyMedia.length, "/media", "success")}
        ${metricCard("W kolejce", queued, "/control?view=upcoming")}
        ${metricCard("Problemy", data.problems.length, "/control?view=problems", data.problems.length > 0 ? "danger" : "normal")}
        ${metricCard("Zakończone", completed, "/control?view=completed")}
      </section>

      <section class="dashboard-grid">
        ${targetList("Najbliższe publikacje", "Brak aktywnych publikacji.", data.upcoming, data.settings.timezone)}
        ${targetList("Wymaga reakcji", "Brak błędów i ręcznych akcji.", data.problems, data.settings.timezone)}
        ${setupChecklist(data)}
      </section>
    `
  });
}
