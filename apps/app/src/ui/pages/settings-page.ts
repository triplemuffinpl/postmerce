import type { AppSettings } from "../../domain.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";

interface SettingsPageOptions {
  settings: AppSettings;
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  return message ? `<div class="message ${type}">${escapeHtml(message)}</div>` : "";
}

function modePanel(settings: AppSettings): string {
  const modeClass = settings.dryRun ? "mode-dry-run" : "mode-live";
  const modeLabel = settings.dryRun ? "Tryb testowy" : "Publikowanie live";
  const modeDescription = settings.dryRun
    ? "Worker wykonuje pełny przepływ, ale nie wysyła materiałów na platformy."
    : "Worker może realnie publikować na podłączonych platformach. Obecnie adapter live działa dla YouTube.";
  const buttonLabel = settings.dryRun ? "Włącz publikowanie live" : "Wróć do trybu testowego";

  return `
    <section class="settings-mode-panel ${modeClass}">
      <div>
        <span class="settings-kicker">Tryb publikacji</span>
        <h2>${modeLabel}</h2>
        <p>${modeDescription}</p>
      </div>
      <form action="/settings/toggle-dry-run" method="post">
        <button class="button-link ${settings.dryRun ? "danger" : "secondary"}" type="submit" onclick="return confirm('${settings.dryRun ? "Włączyć publikowanie live? Zaległe zlecenia mogą zostać wysłane na platformy." : "Wrócić do trybu testowego?"}')">
          ${buttonLabel}
        </button>
      </form>
    </section>
  `;
}

export function settingsPage(options: SettingsPageOptions): string {
  return layout({
    title: "Ustawienia",
    active: "settings",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Konfiguracja operacyjna</p>
        <h1>Ustawienia</h1>
        <p class="lead">Kontroluj sposób publikowania i strefę czasową używaną w całym panelu.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      ${modePanel(options.settings)}

      <section class="panel settings-panel">
        <div class="panel-header">
          <div>
            <h2>Strefa czasowa</h2>
            <p>Wszystkie godziny w formularzach, kalendarzu i kolejce są wyświetlane według tej strefy.</p>
          </div>
          <span class="status-badge status-blue">${escapeHtml(options.settings.timezone)}</span>
        </div>
        <form class="post-form settings-timezone-form" action="/settings/timezone" method="post">
          <label>
            <span>Strefa IANA</span>
            <input id="timezoneInput" name="timezone" type="text" value="${escapeHtml(options.settings.timezone)}" list="timezoneSuggestions" required />
          </label>
          <datalist id="timezoneSuggestions">
            <option value="Europe/Warsaw"></option>
            <option value="Europe/London"></option>
            <option value="Europe/Berlin"></option>
            <option value="UTC"></option>
            <option value="America/New_York"></option>
            <option value="America/Los_Angeles"></option>
            <option value="Asia/Dubai"></option>
            <option value="Asia/Tokyo"></option>
            <option value="Australia/Sydney"></option>
          </datalist>
          <div class="form-actions settings-form-actions">
            <button class="button-link secondary" type="button" onclick="useBrowserTimezone()">Użyj strefy przeglądarki</button>
            <button class="button-link" type="submit">Zapisz strefę</button>
          </div>
        </form>
      </section>

      <script>
        function useBrowserTimezone() {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezone) {
            document.getElementById('timezoneInput').value = timezone;
          }
        }
      </script>
    `
  });
}
