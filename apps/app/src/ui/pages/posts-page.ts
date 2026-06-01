import { layout } from "../layout.js";

export function postsPage(): string {
  return layout({
    title: "Posts",
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Publishing workflow</p>
        <h1>Posts</h1>
        <p class="lead">Draft creation, per-platform captions and scheduling come after the media stage.</p>
      </section>
      <section class="empty-state">
        <h2>No posts yet</h2>
        <p>Postmerce will keep one parent post and independent platform targets with their own statuses.</p>
      </section>
    `
  });
}
