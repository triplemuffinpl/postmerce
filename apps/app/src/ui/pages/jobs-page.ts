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
    title: "Jobs",
    active: "jobs",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Technical queue</p>
        <h1>Jobs</h1>
        <p class="lead">Workers pick due jobs with PostgreSQL locks. Stage 4 runs in dry-run mode until real adapters are ready.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="panel">
        <div class="section-heading">
          <h2>Publish queue</h2>
          <span class="muted-label">${options.jobs.length} jobs</span>
        </div>
        ${jobsTable(options.jobs)}
      </section>

      <section class="panel worker-panel">
        <div class="section-heading">
          <h2>Worker heartbeat</h2>
          <span class="muted-label">${options.heartbeats.length} workers</span>
        </div>
        ${heartbeatPanel(options.heartbeats)}
      </section>
    `
  });
}
