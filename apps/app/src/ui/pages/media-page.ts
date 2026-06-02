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
    title: "Biblioteka Mediów",
    active: "media",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Przetwarzanie wideo</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Biblioteka Mediów</h1>
        <p class="lead">Wgraj swoje klipy wideo, a silnik automatycznie zbada parametry techniczne wideo przez FFprobe oraz wygeneruje miniaturki za pomocą FFmpeg.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <!-- Gorgeous white-label premium upload panel -->
      <section class="panel upload-panel" style="display: block; margin-bottom: 32px;">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Wgraj plik wideo</h2>
          <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Obsługiwane formaty wideo (.mp4, .mov itp.). Plik zostanie zanalizowany przez FFprobe.</p>
        </div>
        
        <form id="uploadForm" action="/media/uploads" method="post" enctype="multipart/form-data" style="display: grid; gap: 16px;">
          <!-- Dashed upload zone matching mockup -->
          <div class="upload-dashed-box" id="uploadZone">
            <div class="upload-dashed-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <span class="upload-dashed-text">Wgraj plik wideo lub rolkę (.mp4, .mov)</span>
            <span class="upload-dashed-subtext">Przeciągnij plik tutaj lub kliknij, aby wybrać z komputera</span>
            <input type="file" name="video" accept="video/*" required onchange="handleFileSelected(this)" />
          </div>

          <!-- Selected file details pill (Hidden initially) exactly like instrukcje.md mockup -->
          <div class="uploaded-file-pill" id="filePill" style="display: none;">
            <div class="uploaded-file-details">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
              <span class="uploaded-file-name" id="fileName">nazwa_pliku.mp4</span>
              <span class="uploaded-file-size" id="fileSize">0.0 KB</span>
            </div>
            <div class="uploaded-file-actions">
              <button type="button" class="uploaded-file-clear-btn" onclick="clearFileSelection()" title="Usuń plik">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-actions" id="submitAction" style="display: none; justify-content: stretch;">
            <button type="submit" class="button-link" style="width: 100%; min-height: 48px;">
              Rozpocznij analizę wideo i generowanie miniatury
            </button>
          </div>
        </form>

        <script>
          function handleFileSelected(input) {
            const pill = document.getElementById('filePill');
            const submitBtn = document.getElementById('submitAction');
            const zone = document.getElementById('uploadZone');
            
            if (input.files && input.files[0]) {
              const file = input.files[0];
              document.getElementById('fileName').textContent = file.name;
              
              let sizeText = file.size + ' B';
              if (file.size >= 1024 * 1024) {
                sizeText = (file.size / 1024 / 1024).toFixed(1) + ' MB';
              } else if (file.size >= 1024) {
                sizeText = (file.size / 1024).toFixed(1) + ' KB';
              }
              
              document.getElementById('fileSize').textContent = sizeText;
              
              pill.style.display = 'flex';
              submitBtn.style.display = 'flex';
              zone.style.display = 'none';
            }
          }
          
          function clearFileSelection() {
            const input = document.querySelector('input[type="file"]');
            const pill = document.getElementById('filePill');
            const submitBtn = document.getElementById('submitAction');
            const zone = document.getElementById('uploadZone');
            
            input.value = '';
            pill.style.display = 'none';
            submitBtn.style.display = 'none';
            zone.style.display = 'flex';
          }
        </script>
      </section>

      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Dostępne Media</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Przeglądaj przesłane pliki wideo, zanalizowane kodeki i ich parametry.</p>
          </div>
          <span class="status-badge status-muted" style="font-weight: 700;">Suma: ${options.media.length} plików</span>
        </div>
        ${mediaTable(options.media)}
      </section>
    `
  });
}
