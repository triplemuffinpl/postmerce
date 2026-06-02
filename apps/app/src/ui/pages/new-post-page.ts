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
    return `<option value="">No ready media assets</option>`;
  }

  return media
    .map((item) => `<option value="${item.id}">${escapeHtml(item.originalFilename)}</option>`)
    .join("");
}

function mediaPreviewGrid(media: MediaAssetRecord[]): string {
  if (media.length === 0) {
    return `
      <section class="empty-state">
        <h2>No ready media</h2>
        <p>Upload and inspect a video before creating a post.</p>
      </section>
    `;
  }

  return `
    <div class="compact-media-grid">
      ${media
        .slice(0, 6)
        .map((item) => `
          <article>
            <div class="media-thumb">${mediaThumbnail(item)}</div>
            <span>${escapeHtml(item.originalFilename)}</span>
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
        <article class="platform-editor ${platform.enabled ? "" : "is-disabled"}">
          <label class="target-toggle">
            <input type="checkbox" name="platforms" value="${platformId}" ${checked} ${disabled} />
            <span>${escapeHtml(platform.label)}</span>
          </label>
          <div class="form-grid two">
            <label>
              <span>Platform title</span>
              <input name="${platformId}_title" type="text" ${disabled} />
            </label>
            <label>
              <span>Privacy</span>
              <select name="${platformId}_privacy" ${disabled}>
                <option value="default">Default</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>
          <label>
            <span>Platform caption</span>
            <textarea name="${platformId}_caption" rows="4" ${disabled}></textarea>
          </label>
          <label>
            <span>Platform hashtags</span>
            <input name="${platformId}_hashtags" type="text" ${disabled} />
          </label>
        </article>
      `;
    })
    .join("");
}

export function newPostPage(options: NewPostPageOptions): string {
  return layout({
    title: "New post",
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Stage 3</p>
        <h1>New post</h1>
        <p class="lead">Create the parent post and independent target drafts. Queue publishing comes next.</p>
      </section>

      ${errorList(options.errors)}

      <form class="post-form" action="/posts" method="post">
        <section class="panel">
          <div class="section-heading">
            <h2>Media</h2>
            <a class="text-link" href="/media">Upload more</a>
          </div>
          <label>
            <span>Ready media asset</span>
            <select name="media_asset_id" required>
              ${mediaOptions(options.media)}
            </select>
          </label>
          ${mediaPreviewGrid(options.media)}
        </section>

        <section class="panel">
          <h2>Base copy</h2>
          <div class="form-grid two">
            <label>
              <span>Title</span>
              <input name="title" type="text" required />
            </label>
            <label>
              <span>Scheduled at</span>
              <input name="scheduled_at" type="datetime-local" />
            </label>
          </div>
          <label>
            <span>Base caption</span>
            <textarea name="base_caption" rows="5"></textarea>
          </label>
          <label>
            <span>Base hashtags</span>
            <input name="base_hashtags" type="text" placeholder="#postmerce #content" />
          </label>
        </section>

        <section class="panel">
          <div class="section-heading">
            <h2>Platform targets</h2>
            <span class="muted-label">Enabled platforms are checked by default</span>
          </div>
          <div class="platform-editor-grid">
            ${platformFields(options.platforms)}
          </div>
        </section>

        <section class="form-actions">
          <button class="button-link secondary" type="submit" name="action" value="draft">Save draft</button>
          <button class="button-link" type="submit" name="action" value="schedule">Queue dry-run publish</button>
        </section>
      </form>
    `
  });
}
