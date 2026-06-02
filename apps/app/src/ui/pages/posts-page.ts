import type { PostListItem } from "../../domain.js";
import { postTable } from "../components/post-components.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface PostsPageOptions {
  posts: PostListItem[];
  notice?: string;
}

function noticeBanner(message: string | undefined): string {
  return message ? `<div class="message notice">${escapeHtml(message)}</div>` : "";
}

export function postsPage(options: PostsPageOptions): string {
  return layout({
    title: "Posts",
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Publishing workflow</p>
        <h1>Posts</h1>
        <p class="lead">Create one parent post, then shape independent target copies per platform.</p>
      </section>

      ${noticeBanner(options.notice)}

      <section class="panel action-panel">
        <div>
          <h2>New post</h2>
          <p>Use a ready media asset, add base copy and choose target platforms.</p>
        </div>
        <a class="button-link" href="/posts/new">Create post</a>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>Recent posts</h2>
          <span class="muted-label">${options.posts.length} posts</span>
        </div>
        ${postTable(options.posts)}
      </section>
    `
  });
}
