import type { MediaAssetRecord, Platform, PostListItem, PostStatus, PostTargetRecord, PostTargetStatus } from "../../domain.js";
import { storagePathToPublicUrl } from "../../services/storage-service.js";
import { escapeHtml, classNames } from "../html.js";

const postStatusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  queued: "Queued",
  publishing: "Publishing",
  partially_published: "Partially published",
  published: "Published",
  failed: "Failed",
  cancelled: "Cancelled"
};

const targetStatusLabels: Record<PostTargetStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  queued: "Queued",
  publishing: "Publishing",
  processing_on_platform: "Processing",
  published: "Published",
  simulated: "Simulated",
  failed: "Failed",
  requires_user_action: "Needs action",
  cancelled: "Cancelled",
  skipped: "Skipped"
};

const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok"
};

export function postStatusBadge(status: PostStatus): string {
  const className = classNames([
    "status-badge",
    status === "draft" && "status-muted",
    status === "scheduled" && "status-ok",
    status === "queued" && "status-ok",
    status === "publishing" && "status-ok",
    status === "published" && "status-ok",
    status === "failed" && "status-danger",
    status !== "draft" &&
      status !== "scheduled" &&
      status !== "queued" &&
      status !== "publishing" &&
      status !== "published" &&
      status !== "failed" &&
      "status-muted"
  ]);

  return `<span class="${className}">${postStatusLabels[status]}</span>`;
}

export function targetStatusBadge(status: PostTargetStatus): string {
  const className = classNames([
    "status-badge",
    status === "draft" && "status-muted",
    status === "scheduled" && "status-ok",
    status === "queued" && "status-ok",
    status === "publishing" && "status-ok",
    status === "published" && "status-ok",
    status === "simulated" && "status-ok",
    status === "failed" && "status-danger",
    status === "requires_user_action" && "status-danger",
    status !== "draft" &&
      status !== "scheduled" &&
      status !== "queued" &&
      status !== "publishing" &&
      status !== "published" &&
      status !== "simulated" &&
      status !== "failed" &&
      status !== "requires_user_action" &&
      "status-muted"
  ]);

  return `<span class="${className}">${targetStatusLabels[status]}</span>`;
}

export function platformLabel(platform: Platform): string {
  return platformLabels[platform];
}

function thumbnailFromPath(path: string | null, label: string): string {
  const thumbnailUrl = storagePathToPublicUrl(path);

  if (!thumbnailUrl) {
    return `<div class="media-placeholder">No preview</div>`;
  }

  return `<img src="${thumbnailUrl}" alt="${escapeHtml(label)}" loading="lazy" />`;
}

export function postTable(posts: PostListItem[]): string {
  if (posts.length === 0) {
    return `
      <section class="empty-state">
        <h2>No posts yet</h2>
        <p>Create a post from a ready media asset, then add platform-specific captions.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table">
        <thead>
          <tr>
            <th>Media</th>
            <th>Post</th>
            <th>Status</th>
            <th>Targets</th>
            <th>Scheduled</th>
          </tr>
        </thead>
        <tbody>
          ${posts
            .map((post) => `
              <tr>
                <td>
                  <a class="media-thumb" href="/posts/${post.id}">
                    ${thumbnailFromPath(post.mediaThumbnailPath, post.mediaOriginalFilename ?? post.title)}
                  </a>
                </td>
                <td>
                  <a class="row-title" href="/posts/${post.id}">${escapeHtml(post.title)}</a>
                  <span class="row-meta">${escapeHtml(post.mediaOriginalFilename ?? "No media")}</span>
                </td>
                <td>${postStatusBadge(post.status)}</td>
                <td>${post.targetCount}</td>
                <td>${post.scheduledAt ? escapeHtml(post.scheduledAt.toLocaleString("pl-PL")) : "none"}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function postMediaPreview(media: MediaAssetRecord | null): string {
  if (!media) {
    return `<div class="media-placeholder">No media</div>`;
  }

  const thumbnailUrl = storagePathToPublicUrl(media.thumbnailPath);
  const videoUrl = storagePathToPublicUrl(media.storagePath);

  if (thumbnailUrl) {
    return `<img src="${thumbnailUrl}" alt="${escapeHtml(media.originalFilename)}" loading="lazy" />`;
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

export function targetCards(targets: PostTargetRecord[]): string {
  return `
    <div class="target-grid">
      ${targets
        .map((target) => `
          <article class="target-card">
            <div class="target-card-head">
              <h3>${platformLabel(target.platform)}</h3>
              ${targetStatusBadge(target.status)}
            </div>
            ${
              target.platformTitle
                ? `<p class="target-title">${escapeHtml(target.platformTitle)}</p>`
                : ""
            }
            <p class="target-caption">${escapeHtml(target.platformCaption || "No caption")}</p>
            ${
              target.platformHashtags
                ? `<p class="target-tags">${escapeHtml(target.platformHashtags)}</p>`
                : ""
            }
            <dl class="target-meta">
              <div>
                <dt>Privacy</dt>
                <dd>${escapeHtml(String(target.platformOptions.privacy ?? "default"))}</dd>
              </div>
              <div>
                <dt>Scheduled</dt>
                <dd>${target.scheduledAt ? escapeHtml(target.scheduledAt.toLocaleString("pl-PL")) : "none"}</dd>
              </div>
            </dl>
          </article>
        `)
        .join("")}
    </div>
  `;
}
