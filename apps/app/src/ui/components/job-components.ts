import type { PublishJobListItem, PublishJobStatus, WorkerHeartbeatRecord } from "../../domain.js";
import { classNames, escapeHtml } from "../html.js";
import { platformLabel, targetStatusBadge } from "./post-components.js";

const jobStatusLabels: Record<PublishJobStatus, string> = {
  pending: "Oczekujące",
  running: "W toku",
  succeeded: "Ukończone",
  failed: "Błąd",
  cancelled: "Anulowane"
};

function formatDate(date: Date | null): string {
  return date ? escapeHtml(date.toLocaleString("pl-PL")) : "brak";
}

function jobStatusBadge(status: PublishJobStatus): string {
  const className = classNames([
    "status-badge",
    status === "succeeded" && "status-ok",
    (status === "failed" || status === "cancelled") && "status-danger",
    status !== "succeeded" && status !== "failed" && status !== "cancelled" && "status-muted"
  ]);

  return `<span class="${className}">${jobStatusLabels[status]}</span>`;
}

function jobActions(job: PublishJobListItem): string {
  const retryButton =
    job.status === "failed" || job.status === "cancelled"
      ? `
        <form action="/jobs/${job.id}/retry" method="post" style="display:inline;">
          <button class="inline-action" type="submit" title="Ponów próbę publikacji">
            <svg style="width: 14px; height: 14px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Ponów
          </button>
        </form>
      `
      : "";
  const cancelButton =
    job.status === "pending" || job.status === "failed"
      ? `
        <form action="/jobs/${job.id}/cancel" method="post" style="display:inline;">
          <button class="inline-action danger" type="submit" title="Anuluj zlecenie">
            <svg style="width: 14px; height: 14px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Anuluj
          </button>
        </form>
      `
      : "";

  if (!retryButton && !cancelButton) {
    return `<span class="muted-label" style="font-size:0.8rem; font-weight:600;">Brak akcji</span>`;
  }

  return `<div class="inline-actions">${retryButton}${cancelButton}</div>`;
}

export function jobsTable(jobs: PublishJobListItem[]): string {
  if (jobs.length === 0) {
    return `
      <section class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2>Brak zleceń w kolejce</h2>
        <p>Zaplanuj lub opublikuj post z gotowego pliku wideo. Worker automatycznie pobierze zadania z bazy danych.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table jobs-table">
        <thead>
          <tr>
            <th>Zadanie</th>
            <th>Wpis</th>
            <th>Status</th>
            <th>Harmonogram</th>
            <th>Błędy</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          ${jobs
            .map((job) => `
              <tr>
                <td>
                  <strong style="color: var(--primary); font-size: 1.05rem;">#${job.id}</strong>
                  <span class="row-meta" style="font-weight:600;">${escapeHtml(job.jobType)} · próby ${job.attempts}/${job.maxAttempts}</span>
                </td>
                <td>
                  ${
                    job.postId && job.postTitle
                      ? `<a class="row-title" style="font-weight: 700;" href="/posts/${job.postId}">${escapeHtml(job.postTitle)}</a>`
                      : `<span class="row-title" style="color: var(--muted);">Brak wpisu</span>`
                  }
                  <span class="row-meta" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    ${job.platform ? `<span style="font-weight:600;">${escapeHtml(platformLabel(job.platform))}</span>` : "Brak platformy"}
                    ${job.targetStatus ? ` · ${targetStatusBadge(job.targetStatus)}` : ""}
                  </span>
                  <span class="row-meta" style="font-size: 0.8rem; margin-top: 4px;">Plik: ${escapeHtml(job.mediaOriginalFilename ?? "Brak")}</span>
                </td>
                <td>${jobStatusBadge(job.status)}</td>
                <td>
                  <span class="row-meta" style="font-weight: 600;">Uruchom po:</span>
                  <strong style="font-size: 0.9rem;">${formatDate(job.runAfter)}</strong>
                  ${
                    job.lockedBy
                      ? `<span class="row-meta" style="background: var(--warning-soft); color: var(--warning); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; font-weight: 600;">Zablokowane przez: ${escapeHtml(job.lockedBy)}</span>`
                      : ""
                  }
                </td>
                <td>
                  ${
                    job.lastError 
                      ? `<span class="row-meta" style="color: var(--danger); font-weight: 700; text-transform: uppercase; font-size: 0.75rem;">${escapeHtml(job.errorClass ?? "Nieznany")}</span>
                         <strong style="color: var(--danger); font-size: 0.85rem; font-weight: 500; display: block; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(job.lastError)}">${escapeHtml(job.lastError)}</strong>`
                      : `<span style="color: var(--muted); font-size: 0.85rem; font-weight: 500;">Brak błędów</span>`
                  }
                </td>
                <td>${jobActions(job)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function heartbeatPanel(heartbeats: WorkerHeartbeatRecord[]): string {
  if (heartbeats.length === 0) {
    return `
      <section class="empty-state compact-empty">
        <svg style="width: 32px; height: 32px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2>Brak zarejestrowanych procesów</h2>
        <p>Uruchom proces workera lub zaczekaj na następny tick usługi systemowej.</p>
      </section>
    `;
  }

  return `
    <div class="heartbeat-list">
      ${heartbeats
        .map((heartbeat) => `
          <article>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="pulse-indicator" style="background: var(--success); width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: pulse 2s infinite;"></span>
              <strong style="font-size: 0.95rem;">${escapeHtml(heartbeat.workerId)}</strong>
            </div>
            <span style="font-size: 0.85rem; font-weight: 600;">Ostatnia aktywność: ${formatDate(heartbeat.lastSeenAt)}</span>
            <code style="word-break: break-all;">${escapeHtml(JSON.stringify(heartbeat.metadata))}</code>
          </article>
        `)
        .join("")}
    </div>
    
    <style>
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
    </style>
  `;
}
