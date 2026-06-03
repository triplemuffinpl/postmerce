import type { ControlView, PublishingControlData } from "../../services/target-service.js";
import { targetControlTable } from "../components/target-control-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface PublishingControlPageOptions extends PublishingControlData {
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  return message ? `<div class="message ${type}">${escapeHtml(message)}</div>` : "";
}

function metricCard(label: string, value: number, tone: "ok" | "danger" | "muted" = "muted"): string {
  const toneStyle =
    tone === "ok"
      ? "color: var(--success); background: var(--success-soft);"
      : tone === "danger"
        ? "color: var(--danger); background: var(--danger-soft);"
        : "color: var(--primary); background: var(--primary-soft);";

  return `
    <article>
      <div class="metric-icon" style="${toneStyle}">
        <strong>${value}</strong>
      </div>
      <div class="metric-content">
        <span>${escapeHtml(label)}</span>
        <strong>${value}</strong>
      </div>
    </article>
  `;
}

function tabLink(view: ControlView, label: string, count: number, current: ControlView): string {
  const currentAttr = view === current ? ` aria-current="page"` : "";
  return `<a class="filter-tab" href="/control?view=${view}"${currentAttr}>${escapeHtml(label)} <span>${count}</span></a>`;
}

export function publishingControlPage(options: PublishingControlPageOptions): string {
  const returnTo = `/control?view=${options.view}`;

  return layout({
    title: "Kontrola Publikacji",
    active: "control",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Publish control center</p>
        <h1 style="font-weight: 800;">Kontrola publikacji</h1>
        <p class="lead">Centrum decyzji dla targetów: konto, treść, termin, status i lokalne akcje na publikacji.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="metric-grid" aria-label="Metryki targetów publikacji">
        ${metricCard("Wszystkie targety", options.metrics.total)}
        ${metricCard("W kolejce", options.metrics.queued, "ok")}
        ${metricCard("Problemy", options.metrics.failed + options.metrics.requiresAction, "danger")}
      </section>

      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Targety operacyjne</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Problemy, aktywne publikacje i szkice są sortowane jako pierwsze; historia jest osobnym widokiem.</p>
          </div>
          <div class="inline-actions">
            <span class="status-badge ${options.settings.dryRun ? "status-lime" : "status-red"}">${options.settings.dryRun ? "Tryb testowy" : "Live"}</span>
            <a class="button-link secondary" href="/calendar">Kalendarz</a>
          </div>
        </div>
        <nav class="filter-tabs" aria-label="Widoki targetów">
          ${tabLink("operational", "Operacyjne", options.counts.operational, options.view)}
          ${tabLink("problems", "Problemy", options.counts.problems, options.view)}
          ${tabLink("upcoming", "Kolejka", options.counts.upcoming, options.view)}
          ${tabLink("drafts", "Szkice", options.counts.drafts, options.view)}
          ${tabLink("completed", "Historia", options.counts.completed, options.view)}
          ${tabLink("all", "Wszystkie", options.counts.all, options.view)}
        </nav>
        ${targetControlTable(options.targets, options.accounts, returnTo, options.settings.timezone)}
      </section>
    `
  });
}
