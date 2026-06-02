import type { PlatformConfig } from "../../domain.js";
import { platformList } from "../components/platform-list.js";
import { layout } from "../layout.js";

interface DashboardPageOptions {
  platforms: PlatformConfig[];
}

export function dashboardPage(options: DashboardPageOptions): string {
  return layout({
    title: "Dashboard",
    active: "dashboard",
    body: `
      <section class="page-header">
        <p class="eyebrow">Prywatne centrum dystrybucji</p>
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Dzień dobry, Wojtek</h1>
        <p class="lead">
          Postmerce to Twój zautomatyzowany panel dystrybucji wideo. Prześlij jeden plik, spersonalizuj opisy i rozpropaguj go asynchronicznie na wszystkie platformy społecznościowe.
        </p>
      </section>

      <section class="metric-grid" aria-label="Status systemu Postmerce">
        <!-- Tryb działania card -->
        <article>
          <div class="metric-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div class="metric-content">
            <span>Tryb operacyjny</span>
            <strong>Testowy (Dry-run)</strong>
          </div>
        </article>
        
        <!-- Kolejka zadań card -->
        <article>
          <div class="metric-icon" style="color: var(--warning); background: var(--warning-soft);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V10.125m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
            </svg>
          </div>
          <div class="metric-content">
            <span>Kolejka zleceń</span>
            <strong>Baza PostgreSQL</strong>
          </div>
        </article>
        
        <!-- Stan interfejsu card -->
        <article>
          <div class="metric-icon" style="color: var(--success); background: var(--success-soft);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <div class="metric-content">
            <span>Architektura UI</span>
            <strong>Nowoczesny SSR Shell</strong>
          </div>
        </article>
      </section>

      <section class="panel">
        <div class="panel-header" style="margin-bottom: 24px;">
          <div style="display: grid; gap: 4px;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Kanały Dystrybucji</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 0; font-weight: 500;">Status integracji i dostępność platform społecznościowych w Postmerce.</p>
          </div>
          <a class="text-link" style="font-weight: 700;" href="/accounts">Zarządzaj kontami</a>
        </div>
        ${platformList(options.platforms)}
      </section>
    `
  });
}
