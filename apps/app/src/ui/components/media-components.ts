import type { MediaAssetRecord, MediaStatus } from "../../domain.js";
import { classNames, escapeHtml } from "../html.js";
import { storagePathToPublicUrl } from "../../services/storage-service.js";

const statusLabels: Record<MediaStatus, string> = {
  uploaded: "Uploaded",
  probing: "Probing",
  ready: "Ready",
  invalid: "Invalid",
  deleted: "Deleted"
};

export function metricValue(value: number | null, kind: "bytes" | "seconds" | "number"): string {
  if (value === null) {
    return "unknown";
  }

  if (kind === "bytes") {
    if (value >= 1024 * 1024) {
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    }

    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${value} B`;
  }

  if (kind === "seconds") {
    return `${value.toFixed(2)} s`;
  }

  return String(value);
}

export function mediaStatusBadge(status: MediaStatus): string {
  const className = classNames([
    "status-badge",
    status === "ready" && "status-ok",
    status === "invalid" && "status-danger",
    status !== "ready" && status !== "invalid" && "status-muted"
  ]);

  return `<span class="${className}">${statusLabels[status]}</span>`;
}

export function mediaThumbnail(media: MediaAssetRecord): string {
  const thumbnailUrl = storagePathToPublicUrl(media.thumbnailPath);
  const videoUrl = storagePathToPublicUrl(media.storagePath);

  if (thumbnailUrl) {
    return `<img src="${thumbnailUrl}" alt="Thumbnail for ${escapeHtml(media.originalFilename)}" loading="lazy" />`;
  }

  if (videoUrl) {
    return `
      <video controls preload="metadata">
        <source src="${videoUrl}" type="${escapeHtml(media.mimeType)}" />
      </video>
    `;
  }

  return `<div class="media-placeholder">No preview</div>`;
}

export function mediaTable(mediaItems: MediaAssetRecord[]): string {
  if (mediaItems.length === 0) {
    return `
      <section class="empty-state">
        <h2>No media yet</h2>
        <p>Upload the first video to inspect metadata and prepare it for post targets.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>File</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Size</th>
            <th>Dimensions</th>
          </tr>
        </thead>
        <tbody>
          ${mediaItems
            .map((media) => {
              const dimensions = media.width && media.height ? `${media.width} x ${media.height}` : "unknown";
              return `
                <tr>
                  <td><a class="media-thumb" href="/media/${media.id}">${mediaThumbnail(media)}</a></td>
                  <td>
                    <a class="row-title" href="/media/${media.id}">${escapeHtml(media.originalFilename)}</a>
                    <span class="row-meta">#${media.id} · ${escapeHtml(media.videoCodec ?? "unknown codec")}</span>
                  </td>
                  <td>${mediaStatusBadge(media.status)}</td>
                  <td>${metricValue(media.durationSec, "seconds")}</td>
                  <td>${metricValue(media.sizeBytes, "bytes")}</td>
                  <td>${escapeHtml(dimensions)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
