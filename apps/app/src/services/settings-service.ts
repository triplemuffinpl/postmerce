import { env } from "../config/env.js";
import { isValidTimezone } from "../date-time.js";
import { getSettingValues, setSettingValue } from "../db/settings-repository.js";
import type { AppSettings } from "../domain.js";
import type { FormRecord } from "../http/form.js";
import { formValue } from "../http/form.js";

const dryRunKey = "publishing.dry_run";
const timezoneKey = "user.timezone";

export interface SettingsActionResult {
  ok: boolean;
  message: string;
}

function settingBoolean(value: string | null | undefined, fallback: boolean): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

export async function getAppSettings(): Promise<AppSettings> {
  const values = await getSettingValues([dryRunKey, timezoneKey]);
  const storedTimezone = values.get(timezoneKey)?.trim();

  return {
    dryRun: settingBoolean(values.get(dryRunKey), env.dryRun),
    timezone: storedTimezone && isValidTimezone(storedTimezone) ? storedTimezone : env.timezone
  };
}

export async function toggleDryRunMode(): Promise<SettingsActionResult> {
  const settings = await getAppSettings();
  const dryRun = !settings.dryRun;
  await setSettingValue(dryRunKey, String(dryRun));

  return {
    ok: true,
    message: dryRun
      ? "Włączono tryb testowy. Kolejne zlecenia będą symulowane."
      : "Włączono publikowanie live. Kolejne zlecenia mogą trafić na platformy."
  };
}

export async function updateTimezoneFromForm(form: FormRecord): Promise<SettingsActionResult> {
  const timezone = formValue(form, "timezone").trim();

  if (!timezone || !isValidTimezone(timezone)) {
    return {
      ok: false,
      message: "Podaj poprawną strefę czasową IANA, np. Europe/Warsaw."
    };
  }

  await setSettingValue(timezoneKey, timezone);
  return {
    ok: true,
    message: `Strefa czasowa została ustawiona na ${timezone}.`
  };
}
