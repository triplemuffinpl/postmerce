import type { MediaAssetRecord, PlatformConfig } from "../../domain.js";
import { mediaThumbnail } from "../components/media-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface NewPostPageOptions {
  media: MediaAssetRecord[];
  platforms: PlatformConfig[];
  errors?: string[];
}

function errorList(errors: string[] | undefined): string {
  if (!errors || errors.length === 0) {
    return "";
  }

  return `
    <div class="message error">
      ${errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("")}
    </div>
  `;
}

function mediaOptions(media: MediaAssetRecord[]): string {
  if (media.length === 0) {
    return `<option value="">Brak gotowych plików wideo</option>`;
  }

  return media
    .map((item) => `<option value="${item.id}">${escapeHtml(item.originalFilename)} (ID: #${item.id})</option>`)
    .join("");
}

function mediaPreviewGrid(media: MediaAssetRecord[]): string {
  if (media.length === 0) {
    return `
      <section class="empty-state" style="padding: 24px;">
        <h2>Brak gotowych klipów</h2>
        <p>Prześlij plik wideo przed utworzeniem wpisu.</p>
      </section>
    `;
  }

  return `
    <div class="compact-media-grid" style="margin-top: 20px;">
      ${media
        .slice(0, 6)
        .map((item) => `
          <article style="cursor: pointer;" onclick="document.querySelector('select[name=\\'media_asset_id\\']').value='${item.id}';">
            <div class="media-thumb" style="height: 60px;">${mediaThumbnail(item)}</div>
            <span style="font-size: 0.75rem; font-weight:600; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.originalFilename)}</span>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function platformFields(platforms: PlatformConfig[]): string {
  return platforms
    .map((platform) => {
      const disabled = platform.enabled ? "" : "disabled";
      const checked = platform.enabled ? "checked" : "";
      const platformId = platform.platform;

      return `
        <article class="platform-editor ${platform.enabled ? "" : "is-disabled"}" style="padding: 24px; border: 1px solid var(--line); border-radius: var(--radius-lg); margin-bottom: 16px;">
          <label class="target-toggle" style="margin-bottom: 16px;">
            <input type="checkbox" name="platforms" value="${platformId}" ${checked} ${disabled} style="height: 20px; width: 20px;" />
            <span style="font-size: 1.1rem; font-weight: 700;">Dystrybucja na: ${escapeHtml(platform.label)}</span>
          </label>
          <div class="form-grid two">
            <label>
              <span>Tytuł dla ${escapeHtml(platform.label)}</span>
              <input name="${platformId}_title" type="text" ${disabled} placeholder="Zostaw puste, aby użyć tytułu bazowego" />
            </label>
            <label>
              <span>Widoczność (Privacy)</span>
              <select name="${platformId}_privacy" ${disabled}>
                <option value="default">Domyślna dla konta</option>
                <option value="private">Prywatna (Private)</option>
                <option value="unlisted">Niepubliczna (Unlisted)</option>
                <option value="public">Publiczna (Public)</option>
              </select>
            </label>
          </div>
          <label style="margin-top: 14px;">
            <span>Opis / Caption dla ${escapeHtml(platform.label)}</span>
            <textarea name="${platformId}_caption" rows="4" ${disabled} placeholder="Zostaw puste, aby użyć opisu bazowego"></textarea>
          </label>
          <label style="margin-top: 14px;">
            <span>Hashtagi (#tag1 #tag2)</span>
            <input name="${platformId}_hashtags" type="text" ${disabled} placeholder="Zostaw puste, aby użyć hashtagów bazowych" />
          </label>
        </article>
      `;
    })
    .join("");
}

export function newPostPage(options: NewPostPageOptions): string {
  return layout({
    title: "Nowy Wpis",
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Dystrybucja etap 1</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Utwórz Nowy Wpis</h1>
        <p class="lead">Zdefiniuj główny wpis, wybierz powiązany klip wideo, a następnie spersonalizuj opisy dla poszczególnych mediów społecznościowych.</p>
      </section>

      ${errorList(options.errors)}

      <form class="post-form" action="/posts" method="post" style="display: grid; gap: 24px;">
        <!-- Plik wideo selector card -->
        <section class="panel">
          <div class="panel-header" style="margin-bottom: 20px;">
            <div style="display: grid; gap: 4px;">
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">1. Powiązany plik wideo</h2>
              <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Wskaż, który plik wideo z biblioteki mediów ma zostać opublikowany.</p>
            </div>
            <a class="text-link" style="font-weight:700;" href="/media">Wgraj wideo</a>
          </div>
          
          <label style="margin-top: 0;">
            <span style="font-size: 0.8rem; font-weight:700; color: var(--muted); margin-bottom: 6px; display:inline-block;">Wybierz wideo z biblioteki</span>
            <select name="media_asset_id" required style="max-width: 100%;">
              ${mediaOptions(options.media)}
            </select>
          </label>
          ${mediaPreviewGrid(options.media)}
        </section>

        <!-- Base copy panel -->
        <section class="panel">
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">2. Dane bazowe wpisu</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Wpisz domyślny tytuł, opis i tagi. Zostaną one automatycznie skopiowane do platform docelowych, jeśli ich nie nadpiszesz.</p>
          </div>
          <div class="form-grid two">
            <label>
              <span>Tytuł wpisu (Bazowy)</span>
              <input name="title" type="text" required placeholder="Wpisz chwytliwy tytuł wideo" />
            </label>
            <label>
              <span>Data i czas publikacji (Harmonogram)</span>
              <input name="scheduled_at" type="datetime-local" />
            </label>
          </div>
          <label style="margin-top: 14px;">
            <span>Opis wpisu (Bazowy)</span>
            <textarea name="base_caption" rows="5" placeholder="Główna treść wpisu..."></textarea>
          </label>
          <label style="margin-top: 14px;">
            <span>Hashtagi bazowe</span>
            <input name="base_hashtags" type="text" placeholder="np. #postmerce #content #shorts" />
          </label>
        </section>

        <!-- Platform specific fields overrides card -->
        <section class="panel">
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">3. Personalizacja platform</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Możesz dostosować tytuły, opisy i opcje prywatności niezależnie dla każdej platformy.</p>
          </div>
          <div class="platform-editor-grid">
            ${platformFields(options.platforms)}
          </div>
        </section>

        <!-- Actions panel -->
        <section class="form-actions" style="margin-top: 16px;">
          <button class="button-link secondary" type="submit" name="action" value="draft">
            Zapisz jako szkic
          </button>
          <button class="button-link" type="submit" name="action" value="schedule">
            Zaplanuj / Wyślij do kolejki testowej
          </button>
        </section>
      </form>

      <!-- Client-side auto pre-selector and form overrides handling script -->
      <script>
        (function() {
          try {
            const params = new URLSearchParams(window.location.search);
            const mediaId = params.get('mediaAssetId');
            if (mediaId) {
              const select = document.querySelector('select[name="media_asset_id"]');
              if (select) {
                select.value = mediaId;
              }
            }
          } catch(e) {
            console.error('Error preselecting video dropdown asset ID', e);
          }
        })();
      </script>
    `
  });
}
