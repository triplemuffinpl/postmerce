import type { PublishJobListItem, WorkerHeartbeatRecord } from "../../domain.js";
import type { JobsView } from "../../services/queue-service.js";
import { heartbeatPanel, jobsTable } from "../components/job-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface JobsPageOptions {
  jobs: PublishJobListItem[];
  heartbeats: WorkerHeartbeatRecord[];
  settings: {
    dryRun: boolean;
    timezone: string;
  };
  view: JobsView;
  counts: Record<JobsView, number>;
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  if (!message) {
    return "";
  }

  return `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

function tabLink(view: JobsView, label: string, count: number, current: JobsView): string {
  const currentAttr = view === current ? ` aria-current="page"` : "";
  return `<a class="filter-tab" href="/jobs?view=${view}"${currentAttr}>${escapeHtml(label)} <span>${count}</span></a>`;
}

export function jobsPage(options: JobsPageOptions): string {
  return layout({
    title: "Kolejka Zleceń",
    active: "jobs",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Wykonania workera</p>
        <h1 style="font-weight: 800;">Zlecenia</h1>
        <p class="lead">Techniczna kolejka wykonań: tu anulujesz aktywne joby, ponawiasz błędy i usuwasz lokalną historię zleceń.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <!-- Jobs Table Panel -->
      <section class="panel" style="margin-bottom: 32px;">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Kolejka wykonawcza</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Domyślnie pokazujemy tylko aktywne joby, więc anulowane i zakończone nie udają kolejki.</p>
          </div>
          <span class="status-badge ${options.settings.dryRun ? "status-lime" : "status-red"}" style="font-weight: 700;">${options.settings.dryRun ? "Tryb testowy" : "Live"}</span>
        </div>
        <nav class="filter-tabs" aria-label="Widoki zleceń">
          ${tabLink("active", "Aktywne", options.counts.active, options.view)}
          ${tabLink("problems", "Błędy", options.counts.problems, options.view)}
          ${tabLink("history", "Historia", options.counts.history, options.view)}
          ${tabLink("all", "Wszystkie", options.counts.all, options.view)}
        </nav>
        ${jobsTable(options.jobs, options.settings.timezone)}
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
        ${heartbeatPanel(options.heartbeats, options.settings.timezone)}
      </section>
    `
  });
}
