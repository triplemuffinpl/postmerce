import type { PublishJobListItem, PublishJobStatus, WorkerHeartbeatRecord } from "../../domain.js";
import { classNames, escapeHtml } from "../html.js";
import { platformLabel, targetStatusBadge } from "./post-components.js";

const jobStatusLabels: Record<PublishJobStatus, string> = {
  pending: "Pending",
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled"
};

function formatDate(date: Date | null): string {
  return date ? escapeHtml(date.toLocaleString("pl-PL")) : "none";
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
        <form action="/jobs/${job.id}/retry" method="post">
          <button class="inline-action" type="submit">Retry</button>
        </form>
      `
      : "";
  const cancelButton =
    job.status === "pending" || job.status === "failed"
      ? `
        <form action="/jobs/${job.id}/cancel" method="post">
          <button class="inline-action danger" type="submit">Cancel</button>
        </form>
      `
      : "";

  if (!retryButton && !cancelButton) {
    return `<span class="muted-label">No action</span>`;
  }

  return `<div class="inline-actions">${retryButton}${cancelButton}</div>`;
}

export function jobsTable(jobs: PublishJobListItem[]): string {
  if (jobs.length === 0) {
    return `
      <section class="empty-state">
        <h2>No jobs yet</h2>
        <p>Queue a post from a ready media asset. Workers will pick due jobs from PostgreSQL.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table jobs-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Post</th>
            <th>Status</th>
            <th>Run</th>
            <th>Error</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${jobs
            .map((job) => `
              <tr>
                <td>
                  <strong>#${job.id}</strong>
                  <span class="row-meta">${escapeHtml(job.jobType)} · attempts ${job.attempts}/${job.maxAttempts}</span>
                </td>
                <td>
                  ${
                    job.postId && job.postTitle
                      ? `<a class="row-title" href="/posts/${job.postId}">${escapeHtml(job.postTitle)}</a>`
                      : `<span class="row-title">Missing post</span>`
                  }
                  <span class="row-meta">
                    ${job.platform ? escapeHtml(platformLabel(job.platform)) : "No platform"}
                    ${job.targetStatus ? ` · ${targetStatusBadge(job.targetStatus)}` : ""}
                  </span>
                  <span class="row-meta">${escapeHtml(job.mediaOriginalFilename ?? "No media")}</span>
                </td>
                <td>${jobStatusBadge(job.status)}</td>
                <td>
                  <span class="row-meta">Run after</span>
                  <strong>${formatDate(job.runAfter)}</strong>
                  ${
                    job.lockedBy
                      ? `<span class="row-meta">Locked by ${escapeHtml(job.lockedBy)}</span>`
                      : ""
                  }
                </td>
                <td>
                  <span class="row-meta">${escapeHtml(job.errorClass ?? "none")}</span>
                  <strong>${escapeHtml(job.lastError ?? "No error")}</strong>
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
        <h2>No worker heartbeat yet</h2>
        <p>Start the worker or wait for the Docker service to tick.</p>
      </section>
    `;
  }

  return `
    <div class="heartbeat-list">
      ${heartbeats
        .map((heartbeat) => `
          <article>
            <strong>${escapeHtml(heartbeat.workerId)}</strong>
            <span>${formatDate(heartbeat.lastSeenAt)}</span>
            <code>${escapeHtml(JSON.stringify(heartbeat.metadata))}</code>
          </article>
        `)
        .join("")}
    </div>
  `;
}
