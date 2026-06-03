import type { AppSettings, MediaAssetRecord, PlatformConfig, SocialAccountRecord } from "../../domain.js";
import { mediaThumbnail } from "../components/media-components.js";
import { platformBadge } from "../components/platform-meta.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface NewPostPageOptions {
  media: MediaAssetRecord[];
  platforms: PlatformConfig[];
  accounts: SocialAccountRecord[];
  settings: AppSettings;
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

function accountLabel(account: SocialAccountRecord): string {
  return account.displayName ?? account.username ?? account.platformUserId ?? `Konto #${account.id}`;
}

function accountOptions(accounts: SocialAccountRecord[], platform: PlatformConfig): string {
  const platformAccounts = accounts.filter((account) => account.platform === platform.platform);

  if (platformAccounts.length === 0) {
    return `<option value="">Auto / dry-run / brak polaczonego konta</option>`;
  }

  return [
    `<option value="">Auto: pierwsze polaczone konto</option>`,
    ...platformAccounts.map((account, index) => {
      const selected = index === 0 ? "selected" : "";
      return `<option value="${account.id}" ${selected}>${escapeHtml(accountLabel(account))} (#${account.id})</option>`;
    })
  ].join("");
}

function accountHint(accounts: SocialAccountRecord[], platform: PlatformConfig): string {
  const platformAccounts = accounts.filter((account) => account.platform === platform.platform);

  if (platformAccounts.length > 0) {
    return "Wybrane konto zostanie zapisane przy tym targecie.";
  }

  return platform.platform === "youtube"
    ? `Brak polaczonego konta. <a class="text-link" href="/accounts">Polacz w zakladce Konta</a>.`
    : "Brak polaczonego konta. W dry-run target nadal moze byc kolejkowany.";
}

function platformFields(platforms: PlatformConfig[], accounts: SocialAccountRecord[]): string {
  return platforms
    .map((platform) => {
      const disabled = platform.enabled ? "" : "disabled";
      const platformId = platform.platform;
      const connectedCount = accounts.filter((account) => account.platform === platform.platform).length;

      return `
        <article class="platform-editor platform-selector ${platform.enabled ? "" : "is-disabled"}" data-platform-editor="${platformId}">
          <label class="target-toggle platform-selector-head">
            <input type="checkbox" name="platforms" value="${platformId}" ${disabled} onchange="togglePlatformEditor('${platformId}', this.checked)" />
            <span class="platform-selector-identity">
              ${platformBadge(platform.platform)}
              <span class="platform-selector-copy">
                <strong>${escapeHtml(platform.label)}</strong>
                <small>${platform.enabled ? `${connectedCount} połączonych kont` : "Integracja wyłączona"}</small>
              </span>
            </span>
            <span class="platform-selector-state">${platform.enabled ? "Wybierz" : "Niedostępna"}</span>
          </label>
          <div class="platform-selector-body" data-platform-body="${platformId}" hidden>
            <div class="form-grid two">
              <label>
                <span>Konto publikujące</span>
                <select name="${platformId}_account_id" ${disabled}>
                  ${accountOptions(accounts, platform)}
                </select>
              </label>
              ${
                platform.platform === "youtube"
                  ? `
                    <label>
                      <span>Typ publikacji</span>
                      <select name="${platformId}_content_type" ${disabled}>
                        <option value="short">Short</option>
                        <option value="video">Film</option>
                      </select>
                    </label>
                  `
                  : ""
              }
            </div>
            <p class="field-hint">${accountHint(accounts, platform)}</p>
            <details class="platform-overrides">
              <summary>Dostosuj treść i widoczność dla ${escapeHtml(platform.label)}</summary>
              <div class="platform-overrides-body">
                <div class="form-grid two">
                  <label>
                    <span>Tytuł</span>
                    <input name="${platformId}_title" type="text" ${disabled} placeholder="Użyj tytułu bazowego" />
                  </label>
                  <label>
                    <span>Widoczność</span>
                    <select name="${platformId}_privacy" ${disabled}>
                      <option value="default">Domyślna dla konta</option>
                      <option value="private">Prywatna</option>
                      <option value="unlisted">Niepubliczna</option>
                      <option value="public">Publiczna</option>
                    </select>
                  </label>
                </div>
                <label>
                  <span>Opis / caption</span>
                  <textarea name="${platformId}_caption" rows="4" ${disabled} placeholder="Użyj opisu bazowego"></textarea>
                </label>
                <label>
                  <span>Hashtagi</span>
                  <input name="${platformId}_hashtags" type="text" ${disabled} placeholder="Użyj hashtagów bazowych" />
                </label>
              </div>
            </details>
          </div>
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
        <p class="eyebrow">Nowa publikacja</p>
        <h1 style="font-weight: 800;">Utwórz wpis</h1>
        <p class="lead">Wybierz materiał, przygotuj treść bazową i dodaj tylko te kanały, na które chcesz publikować.</p>
      </section>

      ${errorList(options.errors)}

      <form class="post-form" action="/posts" method="post" style="display: grid; gap: 24px;">
        <!-- Plik wideo selector card -->
        <section class="panel">
          <div class="panel-header" style="margin-bottom: 20px;">
            <div style="display: grid; gap: 4px;">
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">1. Materiał</h2>
              <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Wybierz gotowe wideo z biblioteki.</p>
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
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">2. Treść i termin</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Ta treść zostanie użyta wszędzie, gdzie nie ustawisz osobnego wariantu.</p>
          </div>
          <div class="form-grid two">
            <label>
              <span>Tytuł wpisu (Bazowy)</span>
              <input name="title" type="text" required placeholder="Wpisz chwytliwy tytuł wideo" />
            </label>
            <label>
              <span>Data i czas publikacji · ${escapeHtml(options.settings.timezone)}</span>
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
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">3. Kanały dystrybucji</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Wybierz platformy. Dopiero wtedy pokażą się ustawienia konta i opcjonalne nadpisania.</p>
          </div>
          <div class="platform-editor-grid">
            ${platformFields(options.platforms, options.accounts)}
          </div>
        </section>

        <!-- Actions panel -->
        <section class="form-actions" style="margin-top: 16px;">
          <button class="button-link secondary" type="submit" name="action" value="draft">
            Zapisz jako szkic
          </button>
          <button class="button-link" type="submit" name="action" value="schedule">
            ${options.settings.dryRun ? "Dodaj do kolejki testowej" : "Zaplanuj publikację live"}
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

        function togglePlatformEditor(platform, checked) {
          const editor = document.querySelector('[data-platform-editor="' + platform + '"]');
          const body = document.querySelector('[data-platform-body="' + platform + '"]');
          if (!editor || !body) return;
          editor.classList.toggle('is-selected', checked);
          body.hidden = !checked;
          const state = editor.querySelector('.platform-selector-state');
          if (state) state.textContent = checked ? 'Wybrana' : 'Wybierz';
        }
      </script>
    `
  });
}
