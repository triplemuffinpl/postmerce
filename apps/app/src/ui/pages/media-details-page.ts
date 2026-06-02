import type { MediaAssetRecord } from "../../domain.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";
import { mediaStatusBadge, mediaThumbnail, metricValue } from "../components/media-components.js";

interface MediaDetailsPageOptions {
  media: MediaAssetRecord | null;
  notice?: string;
}

function detailRow(label: string, value: string): string {
  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function noticeBanner(message: string | undefined): string {
  return message ? `<div class="message notice">${escapeHtml(message)}</div>` : "";
}

export function mediaDetailsPage(options: MediaDetailsPageOptions): string {
  if (!options.media) {
    return layout({
      title: "Media not found",
      active: "media",
      body: `
        <section class="page-header compact">
          <p class="eyebrow">Video intake</p>
          <h1>Media not found</h1>
          <p class="lead">This media asset does not exist or was removed.</p>
        </section>
        <a class="button-link" href="/media">Back to media</a>
      `
    });
  }

  const media = options.media;

  return layout({
    title: media.originalFilename,
    active: "media",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Media asset #${media.id}</p>
        <h1>${escapeHtml(media.originalFilename)}</h1>
        <p class="lead">Stored locally and inspected by FFprobe.</p>
      </section>

      ${noticeBanner(options.notice)}

      <section class="media-detail-grid">
        <div class="media-preview large">
          ${mediaThumbnail(media)}
        </div>
        <div class="panel">
          <div class="section-heading">
            <h2>Metadata</h2>
            ${mediaStatusBadge(media.status)}
          </div>
          <div class="details-list">
            ${detailRow("Size", metricValue(media.sizeBytes, "bytes"))}
            ${detailRow("Duration", metricValue(media.durationSec, "seconds"))}
            ${detailRow("Dimensions", media.width && media.height ? `${media.width} x ${media.height}` : "unknown")}
            ${detailRow("FPS", metricValue(media.fps, "number"))}
            ${detailRow("Video codec", media.videoCodec ?? "unknown")}
            ${detailRow("Audio codec", media.audioCodec ?? "none detected")}
            ${detailRow("MIME", media.mimeType)}
            ${detailRow("Checksum", media.checksum)}
            ${detailRow("Storage", media.storagePath)}
          </div>
        </div>
      </section>

      <a class="button-link secondary" href="/media">Back to media</a>
    `
  });
}
