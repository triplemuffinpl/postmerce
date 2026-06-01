import { layout } from "../layout.js";

export function jobsPage(): string {
  return layout({
    title: "Jobs",
    active: "jobs",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Technical queue</p>
        <h1>Jobs</h1>
        <p class="lead">Workers will pick due jobs with PostgreSQL locks and keep retries visible here.</p>
      </section>
      <section class="empty-state">
        <h2>No jobs yet</h2>
        <p>The queue contract is in place; job creation starts with post target scheduling.</p>
      </section>
    `
  });
}
