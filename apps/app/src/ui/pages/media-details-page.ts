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
      <strong style="word-break: break-all;">${escapeHtml(value)}</strong>
    </div>
  `;
}

function noticeBanner(message: string | undefined): string {
  return message ? `<div class="message notice">${escapeHtml(message)}</div>` : "";
}

export function mediaDetailsPage(options: MediaDetailsPageOptions): string {
  if (!options.media) {
    return layout({
      title: "Plik wideo nie istnieje",
      active: "media",
      body: `
        <section class="page-header compact">
          <p class="eyebrow">Analiza wideo</p>
          <h1>Nie znaleziono pliku</h1>
          <p class="lead">Zasób wideo nie istnieje lub został usunięty z dysku serwera.</p>
        </section>
        <a class="button-link" href="/media">
          <svg style="width:16px; height:16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Powrót do biblioteki
        </a>
      `
    });
  }

  const media = options.media;

  return layout({
    title: media.originalFilename,
    active: "media",
    body: `
      <div style="margin-bottom: 24px;">
        <a class="text-link" href="/media" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.9rem;">
          <svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Powrót do biblioteki mediów
        </a>
      </div>

      <section class="page-header compact">
        <p class="eyebrow">Zasób wideo #${media.id}</p>
        <h1 style="font-weight: 800; word-break: break-all;">${escapeHtml(media.originalFilename)}</h1>
        <p class="lead">Plik jest przechowywany w lokalnej pamięci serwera i został pomyślnie zanalizowany.</p>
      </section>

      ${noticeBanner(options.notice)}

      <section class="media-detail-grid" style="margin-bottom: 28px;">
        <!-- Large Video/Image Preview Container -->
        <div class="media-preview large" style="height: 100%; min-height: 380px; box-shadow: var(--shadow-md);">
          ${mediaThumbnail(media)}
        </div>
        
        <!-- Technical Specifications Metadata Panel -->
        <div class="panel">
          <div class="panel-header" style="margin-bottom: 20px;">
            <div style="display: grid; gap: 4px;">
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Metadane FFprobe</h2>
              <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Szczegóły parametrów technicznych kontenera.</p>
            </div>
            ${mediaStatusBadge(media.status)}
          </div>
          <div class="details-list" style="border: none; box-shadow: none; padding: 0;">
            ${detailRow("Rozmiar pliku", metricValue(media.sizeBytes, "bytes"))}
            ${detailRow("Długość klipu", metricValue(media.durationSec, "seconds"))}
            ${detailRow("Rozdzielczość", media.width && media.height ? `${media.width} x ${media.height}` : "brak danych")}
            ${detailRow("Klatkaż (FPS)", metricValue(media.fps, "number"))}
            ${detailRow("Kodek wideo", media.videoCodec ?? "brak")}
            ${detailRow("Kodek audio", media.audioCodec ?? "brak")}
            ${detailRow("MIME Type", media.mimeType)}
            ${detailRow("Suma kontrolna", media.checksum)}
            ${detailRow("Ścieżka storage", media.storagePath)}
          </div>
        </div>
      </section>

      <div style="display: flex; gap: 12px; align-items: center;">
        <a class="button-link" href="/posts/new?mediaAssetId=${media.id}">
          <svg style="width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Utwórz nowy wpis z tego wideo
        </a>
      </div>
    `
  });
}
