import { nav } from "./components/nav.js";

interface LayoutOptions {
  title: string;
  active: string;
  body: string;
}

export function layout(options: LayoutOptions): string {
  return `<!doctype html>
    <html lang="pl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${options.title} - Postmerce</title>
        <link rel="stylesheet" href="/assets/app.css" />
      </head>
      <body>
        <div class="app-shell">
          ${nav(options.active)}
          <main class="content-shell">
            ${options.body}
          </main>
        </div>
      </body>
    </html>`;
}
