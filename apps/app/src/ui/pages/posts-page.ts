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
    title: "Wpisy i Publikacje",
    active: "posts",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Przebieg dystrybucji</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Wpisy i Publikacje</h1>
        <p class="lead">Stwórz jeden nadrzędny wpis bazowy, a następnie dostosuj opisy i hasztagi niezależnie dla każdej wybranej sieci społecznościowej.</p>
      </section>

      ${noticeBanner(options.notice)}

      <!-- Sleek premium action call card -->
      <section class="panel action-panel" style="margin-bottom: 32px;">
        <div>
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Utwórz nowy wpis</h2>
          <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">
            Wybierz plik wideo, uzupełnij opisy bazowe oraz wskaż docelowe platformy do publikacji.
          </p>
        </div>
        <a class="button-link" href="/posts/new">
          <svg style="width:18px; height:18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Stwórz wpis
        </a>
      </section>

      <!-- Posts List Panel -->
      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Utworzone wpisy</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Lista wszystkich postów bazowych wraz z ich planami dystrybucji.</p>
          </div>
          <span class="status-badge status-muted" style="font-weight: 700;">Suma: ${options.posts.length} wpisów</span>
        </div>
        ${postTable(options.posts)}
      </section>
    `
  });
}
