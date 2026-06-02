import type { MediaAssetRecord } from "../../domain.js";
import { mediaTable } from "../components/media-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface MediaPageOptions {
  media: MediaAssetRecord[];
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  if (!message) {
    return "";
  }

  return `<div class="message ${type}">${escapeHtml(message)}</div>`;
}

export function mediaPage(options: MediaPageOptions): string {
  return layout({
    title: "Media",
    active: "media",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Video intake</p>
        <h1>Media assets</h1>
        <p class="lead">Upload video, inspect it with FFprobe, generate a thumbnail and keep the asset ready for posts.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="panel upload-panel">
        <div>
          <h2>Upload video</h2>
          <p>Supported input: video files. Limits come from env configuration.</p>
        </div>
        <form class="upload-form" action="/media/uploads" method="post" enctype="multipart/form-data">
          <input type="file" name="video" accept="video/*" required />
          <button type="submit">Upload and inspect</button>
        </form>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>Recent media</h2>
          <span class="muted-label">${options.media.length} assets</span>
        </div>
        ${mediaTable(options.media)}
      </section>
    `
  });
}
