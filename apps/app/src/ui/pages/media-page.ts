import { layout } from "../layout.js";

export function mediaPage(): string {
  return layout({
    title: "Media",
    active: "media",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Video intake</p>
        <h1>Media assets</h1>
        <p class="lead">Upload, FFprobe inspection and thumbnail generation belong to Stage 2.</p>
      </section>
      <section class="empty-state">
        <h2>No media yet</h2>
        <p>The first upload flow will store files locally and keep storage fields ready for future S3-compatible disks.</p>
      </section>
    `
  });
}
