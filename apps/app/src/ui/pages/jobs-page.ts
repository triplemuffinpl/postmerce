import type { PublishJobListItem, WorkerHeartbeatRecord } from "../../domain.js";
import { heartbeatPanel, jobsTable } from "../components/job-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface JobsPageOptions {
  jobs: PublishJobListItem[];
  heartbeats: WorkerHeartbeatRecord[];
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  if (!message) {
    return "";
  }

  return `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

export function jobsPage(options: JobsPageOptions): string {
  return layout({
    title: "Kolejka Zleceń",
    active: "jobs",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Silnik tła PostgreSQL</p>
        <h1 style="font-weight: 800;">Kolejka Zleceń</h1>
        <p class="lead">Procesy w tle pobierają zlecenia za pomocą bezpiecznych blokad PostgreSQL. Obecnie kolejka przetwarza zadania próbne (Dry-run).</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <!-- Jobs Table Panel -->
      <section class="panel" style="margin-bottom: 32px;">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Zlecenia Publikacji</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Status wykonania zadań dystrybucyjnych.</p>
          </div>
          <span class="status-badge status-gray" style="font-weight: 700;">Suma: ${options.jobs.length} zleceń</span>
        </div>
        ${jobsTable(options.jobs)}
      </section>

      <!-- Worker Heartbeat Panel -->
      <section class="panel worker-panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Aktywne Procesy Workera</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Monitorowanie stanu zdrowia (liveness) i aktywności procesów w tle.</p>
          </div>
          <span class="status-badge status-green" style="font-weight: 700;">Aktywne: ${options.heartbeats.length} procesy</span>
        </div>
        ${heartbeatPanel(options.heartbeats)}
      </section>
    `
  });
}
