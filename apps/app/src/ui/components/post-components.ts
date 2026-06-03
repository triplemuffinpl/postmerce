import type { MediaAssetRecord, PostListItem, PostTargetRecord } from "../../domain.js";
import { storagePathToPublicUrl } from "../../services/storage-service.js";
import { escapeHtml } from "../html.js";
import { platformLabel, platformIcon } from "./platform-meta.js";
import { postStatusBadge, targetStatusBadge } from "./status-meta.js";

export { platformLabel, targetStatusBadge, postStatusBadge };

function thumbnailFromPath(path: string | null, label: string): string {
  const thumbnailUrl = storagePathToPublicUrl(path);

  if (!thumbnailUrl) {
    return `
      <div class="media-placeholder">
        <svg style="width: 18px; height: 18px; color: var(--muted);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
    `;
  }

  return `<img src="${thumbnailUrl}" alt="${escapeHtml(label)}" loading="lazy" />`;
}

export function postTable(posts: PostListItem[]): string {
  if (posts.length === 0) {
    return `
      <section class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        <h2>Brak wpisów</h2>
        <p>Utwórz swój pierwszy wpis wybierając jedno z gotowych wideo w zakładce Media, a następnie spersonalizuj opisy dla każdej platformy.</p>
      </section>
    `;
  }

  const rows = posts
    .map((post) => `
      <tr>
        <td>
          <a class="media-thumb" href="/posts/${post.id}">
            ${thumbnailFromPath(post.mediaThumbnailPath, post.mediaOriginalFilename ?? post.title)}
          </a>
        </td>
        <td>
          <a class="row-title" style="font-weight: 700;" href="/posts/${post.id}">${escapeHtml(post.title)}</a>
          <span class="row-meta" style="font-weight: 600;">Plik wideo: ${escapeHtml(post.mediaOriginalFilename ?? "Brak pliku")}</span>
        </td>
        <td>${postStatusBadge(post.status)}</td>
        <td><strong style="font-size: 0.95rem;">${post.targetCount} cel(e)</strong></td>
        <td>
          <strong style="font-size:0.9rem;">
            ${post.scheduledAt ? escapeHtml(post.scheduledAt.toLocaleString("pl-PL")) : `<span style="color:var(--muted); font-weight:500;">Brak harmonogramu</span>`}
          </strong>
        </td>
      </tr>
    `)
    .join("");

  const cards = posts
    .map((post) => `
      <article class="mobile-card">
        <div class="mobile-card-header">
          <a class="row-title" style="font-weight: 700; font-size: 1.05rem;" href="/posts/${post.id}">${escapeHtml(post.title)}</a>
          ${postStatusBadge(post.status)}
        </div>
        <div class="mobile-card-content" style="display: flex; gap: 12px; align-items: center;">
          <a class="media-thumb" style="width: 72px; height: 48px; flex-shrink: 0;" href="/posts/${post.id}">
            ${thumbnailFromPath(post.mediaThumbnailPath, post.mediaOriginalFilename ?? post.title)}
          </a>
          <div>
            <span class="row-meta" style="font-weight: 600; display: block; word-break: break-all;">Wideo: ${escapeHtml(post.mediaOriginalFilename ?? "Brak pliku")}</span>
            <span class="row-meta" style="font-weight: 600; display: block; margin-top: 2px;">Cele: <strong>${post.targetCount}</strong></span>
          </div>
        </div>
        <div class="mobile-card-row" style="border-top: 1px solid var(--line); padding-top: 10px; margin-top: 4px;">
          <span>Harmonogram</span>
          <strong>
            ${post.scheduledAt ? escapeHtml(post.scheduledAt.toLocaleString("pl-PL")) : `<span style="color:var(--muted); font-weight:500;">Brak</span>`}
          </strong>
        </div>
      </article>
    `)
    .join("");

  return `
    <!-- Desktop View -->
    <div class="desktop-only table-wrap">
      <table class="media-table">
        <thead>
          <tr>
            <th>Wideo</th>
            <th>Wpis</th>
            <th>Status</th>
            <th>Ilość celów</th>
            <th>Planowany harmonogram</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div class="mobile-only mobile-cards-list">
      ${cards}
    </div>
  `;
}

export function postMediaPreview(media: MediaAssetRecord | null): string {
  if (!media) {
    return `
      <div class="media-placeholder">
        <svg style="width: 24px; height: 24px; color: var(--muted);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        Brak wideo
      </div>
    `;
  }

  const thumbnailUrl = storagePathToPublicUrl(media.thumbnailPath);
  const videoUrl = storagePathToPublicUrl(media.storagePath);

  if (thumbnailUrl) {
    return `<img src="${thumbnailUrl}" alt="${escapeHtml(media.originalFilename)}" loading="lazy" />`;
  }

  if (videoUrl) {
    return `
      <video controls preload="metadata" style="width:100%; height:100%; object-fit:cover;">
        <source src="${videoUrl}" type="${escapeHtml(media.mimeType)}" />
      </video>
    `;
  }

  return `
    <div class="media-placeholder">
      <svg style="width: 24px; height: 24px; color: var(--muted);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
      Brak podglądu
    </div>
  `;
}

export function targetCards(targets: PostTargetRecord[]): string {
  return `
    <div class="target-grid">
      ${targets
        .map((target) => {
          return `
            <article class="target-card">
              <div class="target-card-head">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${platformIcon(target.platform)}
                  <h3 style="font-size: 1.05rem; font-weight: 700;">${platformLabel(target.platform)}</h3>
                </div>
                ${targetStatusBadge(target.status)}
              </div>
              ${
                target.platformTitle
                  ? `<p class="target-title" style="font-weight: 700;">${escapeHtml(target.platformTitle)}</p>`
                  : ""
              }
              <p class="target-caption" style="font-size: 0.9rem; line-height: 1.5;">${escapeHtml(target.platformCaption || "Brak opisu")}</p>
              ${
                target.platformHashtags
                  ? `<p class="target-tags" style="font-weight: 700; font-size: 0.85rem; margin-top: 6px;">${escapeHtml(target.platformHashtags)}</p>`
                  : ""
              }
              <dl class="target-meta">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                  <dt style="color: var(--muted); font-weight: 600;">Widoczność</dt>
                  <dd style="font-weight: 700;">${escapeHtml(String(target.platformOptions.privacy ?? "domyślna"))}</dd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                  <dt style="color: var(--muted); font-weight: 600;">Konto</dt>
                  <dd style="font-weight: 700;">${target.socialAccountId === null ? "auto" : `#${target.socialAccountId}`}</dd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                  <dt style="color: var(--muted); font-weight: 600;">Harmonogram</dt>
                  <dd style="font-weight: 700;">${target.scheduledAt ? escapeHtml(target.scheduledAt.toLocaleString("pl-PL")) : "brak"}</dd>
                </div>
              </dl>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}
