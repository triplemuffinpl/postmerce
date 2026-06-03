import type { MediaAssetRecord, MediaStatus } from "../../domain.js";
import { escapeHtml } from "../html.js";
import { storagePathToPublicUrl } from "../../services/storage-service.js";

const statusLabels: Record<MediaStatus, string> = {
  uploaded: "Przesłany",
  probing: "Analizowanie",
  ready: "Gotowy",
  invalid: "Niepoprawny",
  deleted: "Usunięty"
};

const statusClasses: Record<MediaStatus, string> = {
  uploaded: "status-blue",
  probing: "status-cyan",
  ready: "status-green",
  invalid: "status-red",
  deleted: "status-slate"
};

export function metricValue(value: number | null, kind: "bytes" | "seconds" | "number"): string {
  if (value === null) {
    return "brak";
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
  return `<span class="status-badge ${statusClasses[status]}">${statusLabels[status]}</span>`;
}

export function mediaThumbnail(media: MediaAssetRecord): string {
  const thumbnailUrl = storagePathToPublicUrl(media.thumbnailPath);
  const videoUrl = storagePathToPublicUrl(media.storagePath);

  if (thumbnailUrl) {
    return `<img src="${thumbnailUrl}" alt="Miniatura ${escapeHtml(media.originalFilename)}" loading="lazy" />`;
  }

  if (videoUrl) {
    return `
      <video controls preload="metadata" style="pointer-events: none; width:100%; height:100%; object-fit:cover;">
        <source src="${videoUrl}" type="${escapeHtml(media.mimeType)}" />
      </video>
    `;
  }

  return `
    <div class="media-placeholder">
      <svg style="width: 20px; height: 20px; color: var(--muted);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    </div>
  `;
}

export function mediaTable(mediaItems: MediaAssetRecord[]): string {
  if (mediaItems.length === 0) {
    return `
      <section class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h2>Brak plików wideo</h2>
        <p>Prześlij swój pierwszy plik wideo powyżej, aby automatycznie zbadać jego parametry techniczne i wygenerować miniatury.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table">
        <thead>
          <tr>
            <th>Podgląd</th>
            <th>Plik</th>
            <th>Status</th>
            <th>Czas trwania</th>
            <th>Rozmiar</th>
            <th>Rozdzielczość</th>
          </tr>
        </thead>
        <tbody>
          ${mediaItems
            .map((media) => {
              const dimensions = media.width && media.height ? `${media.width} x ${media.height}` : "brak danych";
              return `
                <tr>
                  <td><a class="media-thumb" href="/media/${media.id}">${mediaThumbnail(media)}</a></td>
                  <td>
                    <a class="row-title" style="font-weight: 700;" href="/media/${media.id}">${escapeHtml(media.originalFilename)}</a>
                    <span class="row-meta" style="font-weight: 600;">ID: #${media.id} · Kodek: ${escapeHtml(media.videoCodec ?? "brak")}</span>
                  </td>
                  <td>${mediaStatusBadge(media.status)}</td>
                  <td><strong style="font-size:0.9rem;">${metricValue(media.durationSec, "seconds")}</strong></td>
                  <td><strong style="font-size:0.9rem;">${metricValue(media.sizeBytes, "bytes")}</strong></td>
                  <td><span class="row-meta" style="font-weight:600;">${escapeHtml(dimensions)}</span></td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
