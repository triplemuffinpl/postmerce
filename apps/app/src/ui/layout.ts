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
        
        <!-- Preconnect Google Fonts for faster load times -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        
        <link rel="stylesheet" href="/assets/app.css" />
        
        <!-- Blocking inline script to apply theme preference instantly before render -->
        <script>
          (function() {
            try {
              const theme = localStorage.getItem('postmerce-theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark-theme');
              }
              const hue = localStorage.getItem('postmerce-hue');
              if (hue) {
                document.documentElement.style.setProperty('--primary-hue', hue);
              }
            } catch (e) {
              console.error('Failed to load theme configs from localStorage', e);
            }
          })();
        </script>
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
