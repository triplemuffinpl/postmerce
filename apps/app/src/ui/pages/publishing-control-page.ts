import type { PublishingControlData } from "../../services/target-service.js";
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

export function publishingControlPage(options: PublishingControlPageOptions): string {
  return layout({
    title: "Kontrola Publikacji",
    active: "control",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Publish control center</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Kontrola publikacji</h1>
        <p class="lead">Jedno miejsce do sprawdzania targetow, kont, statusow, bledow i szybkich akcji na kolejce.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="metric-grid" aria-label="Metryki targetow publikacji">
        ${metricCard("Wszystkie targety", options.metrics.total)}
        ${metricCard("W kolejce", options.metrics.queued, "ok")}
        ${metricCard("Problemy", options.metrics.failed + options.metrics.requiresAction, "danger")}
      </section>

      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Targety operacyjne</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Edytuj, kolejkuj, anuluj i duplikuj targety bez przechodzenia po pojedynczych wpisach.</p>
          </div>
          <a class="button-link secondary" href="/calendar">Kalendarz</a>
        </div>
        ${targetControlTable(options.targets, options.accounts, "/control")}
      </section>
    `
  });
}
