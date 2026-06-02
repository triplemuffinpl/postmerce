import type { PostDetails, SocialAccountRecord } from "../../domain.js";
import { postMediaPreview, postStatusBadge, targetCards, targetStatusBadge, platformLabel } from "../components/post-components.js";
import { targetEditorForm } from "../components/target-control-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface PostDetailsPageOptions {
  details: PostDetails | null;
  accounts: SocialAccountRecord[];
  notice?: string;
  error?: string;
}

function noticeBanner(message: string | undefined): string {
  return message ? `<div class="message notice">${escapeHtml(message)}</div>` : "";
}

function errorBanner(message: string | undefined): string {
  return message ? `<div class="message error">${escapeHtml(message)}</div>` : "";
}

export function postDetailsPage(options: PostDetailsPageOptions): string {
  if (!options.details) {
    return layout({
      title: "Nie znaleziono wpisu",
      active: "posts",
      body: `
        <section class="page-header compact">
          <p class="eyebrow">Dystrybucja postów</p>
          <h1>Wpis nie istnieje</h1>
          <p class="lead">Zasób wpisu o podanym identyfikatorze nie istnieje.</p>
        </section>
        <a class="button-link" href="/posts">
          <svg style="width:16px; height:16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Powrót do listy wpisów
        </a>
      `
    });
  }

  const { post, media, targets } = options.details;

  return layout({
    title: post.title,
    active: "posts",
    body: `
      <div style="margin-bottom: 24px;">
        <a class="text-link" href="/posts" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.9rem;">
          <svg style="width: 16px; height: 16px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Powrót do listy wpisów
        </a>
      </div>

      <section class="page-header compact">
        <p class="eyebrow">Wpis #${post.id}</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em; word-break: break-all;">${escapeHtml(post.title)}</h1>
        <p class="lead">Tekst bazowy powiązany z ${targets.length} celami platform społecznościowych.</p>
      </section>

      ${noticeBanner(options.notice)}
      ${errorBanner(options.error)}

      <!-- Media Preview & Metadata Split Grid -->
      <section class="media-detail-grid" style="margin-bottom: 32px;">
        <div class="media-preview large" style="height: 100%; min-height: 380px; box-shadow: var(--shadow-md);">
          ${postMediaPreview(media)}
        </div>
        <div class="panel">
          <div class="panel-header" style="margin-bottom: 20px;">
            <div style="display: grid; gap: 4px;">
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Dane wpisu</h2>
              <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Opisy domyślne powiązane z wideo.</p>
            </div>
            ${postStatusBadge(post.status)}
          </div>
          <div class="details-list" style="border: none; box-shadow: none; padding: 0;">
            <div class="detail-row">
              <span>Wideo</span>
              <strong style="word-break: break-all;">${escapeHtml(media?.originalFilename ?? "Brak pliku wideo")}</strong>
            </div>
            <div class="detail-row">
              <span>Harmonogram</span>
              <strong>${post.scheduledAt ? escapeHtml(post.scheduledAt.toLocaleString("pl-PL")) : `<span style="color:var(--muted); font-weight:500;">Brak (publikacja ręczna)</span>`}</strong>
            </div>
            <div class="detail-row">
              <span>Tagi bazowe</span>
              <strong>${escapeHtml(post.baseHashtags ?? "brak")}</strong>
            </div>
          </div>
          <div class="copy-block" style="margin-top: 14px; padding-top: 14px;">
            <span>Opis bazowy</span>
            <p style="margin-top: 8px; font-size:0.95rem; line-height:1.55; color: var(--muted);">${escapeHtml(post.baseCaption || "Brak opisu bazowego")}</p>
          </div>
        </div>
      </section>

      <!-- Targets list panel -->
      <section class="panel" style="margin-bottom: 32px;">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Cele Dystrybucji</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Podgląd dedykowanych wersji opisów dla wybranych platform social.</p>
          </div>
          <a class="text-link" style="font-weight:700;" href="/jobs">Pokaż kolejkę (Jobs)</a>
        </div>
        ${targetCards(targets)}
      </section>

      <section class="panel" style="margin-bottom: 32px;">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Edycja i akcje targetow</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Zmien konto, harmonogram, opis albo od razu kolejkuj wybrany target.</p>
          </div>
          <a class="text-link" href="/control">Centrum kontroli</a>
        </div>
        <div class="target-grid">
          ${targets
            .map((target) => `
              <article class="target-card">
                <div class="target-card-head">
                  <div>
                    <h3>${escapeHtml(platformLabel(target.platform))} #${target.id}</h3>
                    <p class="row-meta" style="margin: 4px 0 0;">Konto: ${target.socialAccountId === null ? "auto" : `#${target.socialAccountId}`}</p>
                  </div>
                  ${targetStatusBadge(target.status)}
                </div>
                ${targetEditorForm(target, options.accounts, `/posts/${post.id}`)}
              </article>
            `)
            .join("")}
        </div>
      </section>
    `
  });
}
