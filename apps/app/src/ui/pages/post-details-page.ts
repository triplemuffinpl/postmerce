import type { PostDetails } from "../../domain.js";
import { postMediaPreview, postStatusBadge, targetCards } from "../components/post-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface PostDetailsPageOptions {
  details: PostDetails | null;
  notice?: string;
}

function noticeBanner(message: string | undefined): string {
  return message ? `<div class="message notice">${escapeHtml(message)}</div>` : "";
}

export function postDetailsPage(options: PostDetailsPageOptions): string {
  if (!options.details) {
    return layout({
      title: "Post not found",
      active: "posts",
      body: `
        <section class="page-header compact">
          <p class="eyebrow">Publishing workflow</p>
          <h1>Post not found</h1>
          <p class="lead">This post does not exist.</p>
        </section>
        <a class="button-link" href="/posts">Back to posts</a>
      `
    });
  }

  const { post, media, targets } = options.details;

  return layout({
    title: post.title,
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Post #${post.id}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="lead">Parent copy plus ${targets.length} platform targets.</p>
      </section>

      ${noticeBanner(options.notice)}

      <section class="media-detail-grid">
        <div class="media-preview large">
          ${postMediaPreview(media)}
        </div>
        <div class="panel">
          <div class="section-heading">
            <h2>Post</h2>
            ${postStatusBadge(post.status)}
          </div>
          <div class="details-list">
            <div class="detail-row">
              <span>Media</span>
              <strong>${escapeHtml(media?.originalFilename ?? "No media")}</strong>
            </div>
            <div class="detail-row">
              <span>Scheduled</span>
              <strong>${post.scheduledAt ? escapeHtml(post.scheduledAt.toLocaleString("pl-PL")) : "none"}</strong>
            </div>
            <div class="detail-row">
              <span>Base tags</span>
              <strong>${escapeHtml(post.baseHashtags ?? "none")}</strong>
            </div>
          </div>
          <div class="copy-block">
            <span>Base caption</span>
            <p>${escapeHtml(post.baseCaption || "No base caption")}</p>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>Targets</h2>
          <span class="muted-label">Publishing jobs arrive in Stage 4</span>
        </div>
        ${targetCards(targets)}
      </section>

      <a class="button-link secondary" href="/posts">Back to posts</a>
    `
  });
}
