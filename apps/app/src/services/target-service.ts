import { listConnectedSocialAccounts } from "../db/account-repository.js";
import {
  cancelPostTarget,
  deletePostTarget,
  duplicatePostTarget,
  getPostTargetById,
  listCalendarTargetItems,
  listTargetControlItems,
  queuePostTarget,
  updatePostTarget,
  type TargetControlItem
} from "../db/target-repository.js";
import type { Platform, PostTargetStatus, SocialAccountRecord } from "../domain.js";
import type { FormRecord } from "../http/form.js";
import { formValue, optionalDateTimeLocal } from "../http/form.js";
import { parseDateTimeLocal } from "../date-time.js";
import { getAppSettings } from "./settings-service.js";

export interface TargetActionResult {
  ok: boolean;
  message: string;
}

export interface PublishingControlMetrics {
  total: number;
  queued: number;
  failed: number;
  requiresAction: number;
  published: number;
  draft: number;
}

export interface PublishingControlData {
  targets: TargetControlItem[];
  accounts: SocialAccountRecord[];
  metrics: PublishingControlMetrics;
  settings: Awaited<ReturnType<typeof getAppSettings>>;
  view: ControlView;
  counts: Record<ControlView, number>;
}

export interface CalendarPageData {
  monthStart: Date;
  previousMonth: string;
  nextMonth: string;
  targets: TargetControlItem[];
  timezone: string;
}

export type ControlView = "operational" | "problems" | "upcoming" | "drafts" | "completed" | "all";

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalPositiveInteger(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function yyyymm(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonth(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [yearValue, monthValue] = value.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);

    if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
      return new Date(Date.UTC(year, month - 1, 1, 12));
    }
  }

  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12));
}

function addMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12));
}

function targetDate(target: TargetControlItem): Date {
  return target.scheduledAt ?? target.postScheduledAt ?? target.createdAt;
}

function metricsFromTargets(targets: TargetControlItem[]): PublishingControlMetrics {
  return {
    total: targets.length,
    queued: targets.filter((target) => target.status === "queued" || target.status === "scheduled").length,
    failed: targets.filter((target) => target.status === "failed").length,
    requiresAction: targets.filter((target) => target.status === "requires_user_action").length,
    published: targets.filter((target) => target.status === "published" || target.status === "simulated").length,
    draft: targets.filter((target) => target.status === "draft").length
  };
}

function validateSelectedAccount(
  platform: Platform,
  accountId: number | null,
  accounts: SocialAccountRecord[]
): { ok: true; accountId: number | null } | { ok: false; message: string } {
  if (accountId === null) {
    return {
      ok: true,
      accountId: null
    };
  }

  const account = accounts.find((item) => item.id === accountId);

  if (!account) {
    return {
      ok: false,
      message: "Wybrane konto nie istnieje albo nie jest polaczone."
    };
  }

  if (account.platform !== platform || account.status !== "connected") {
    return {
      ok: false,
      message: "Wybrane konto nie pasuje do platformy targetu."
    };
  }

  return {
    ok: true,
    accountId
  };
}

export function targetScheduleDate(target: TargetControlItem): Date {
  return targetDate(target);
}

function targetsForView(targets: TargetControlItem[], view: ControlView): TargetControlItem[] {
  if (view === "operational") {
    return targets.filter((target) =>
      ["failed", "requires_user_action", "publishing", "processing_on_platform", "queued", "scheduled", "draft"].includes(target.status)
    );
  }

  if (view === "problems") {
    return targets.filter((target) => target.status === "failed" || target.status === "requires_user_action");
  }

  if (view === "upcoming") {
    return targets.filter((target) =>
      ["publishing", "processing_on_platform", "queued", "scheduled"].includes(target.status)
    );
  }

  if (view === "drafts") {
    return targets.filter((target) => target.status === "draft");
  }

  if (view === "completed") {
    return targets.filter((target) =>
      ["published", "simulated", "cancelled", "skipped"].includes(target.status)
    );
  }

  return targets;
}

export function parseControlView(value: string | undefined): ControlView {
  return value === "problems" || value === "upcoming" || value === "drafts" || value === "completed" || value === "all"
    ? value
    : "operational";
}

export async function getPublishingControlData(view: ControlView = "operational"): Promise<PublishingControlData> {
  const [allTargets, accounts, settings] = await Promise.all([
    listTargetControlItems(300),
    listConnectedSocialAccounts(),
    getAppSettings()
  ]);

  return {
    targets: targetsForView(allTargets, view),
    accounts,
    settings,
    view,
    metrics: metricsFromTargets(allTargets),
    counts: {
      operational: targetsForView(allTargets, "operational").length,
      problems: targetsForView(allTargets, "problems").length,
      upcoming: targetsForView(allTargets, "upcoming").length,
      drafts: targetsForView(allTargets, "drafts").length,
      completed: targetsForView(allTargets, "completed").length,
      all: allTargets.length
    }
  };
}

export async function getCalendarPageData(month: string | undefined): Promise<CalendarPageData> {
  const settings = await getAppSettings();
  const monthStart = parseMonth(month);
  const nextMonthStart = addMonths(monthStart, 1);
  const calendarStartKey = yyyymm(addMonths(monthStart, -1));
  const calendarEndKey = yyyymm(addMonths(monthStart, 2));
  const calendarStart = parseDateTimeLocal(`${calendarStartKey}-01T00:00`, settings.timezone) ?? addMonths(monthStart, -1);
  const calendarEnd = parseDateTimeLocal(`${calendarEndKey}-01T00:00`, settings.timezone) ?? addMonths(monthStart, 2);

  return {
    monthStart,
    previousMonth: yyyymm(addMonths(monthStart, -1)),
    nextMonth: yyyymm(nextMonthStart),
    targets: await listCalendarTargetItems(calendarStart, calendarEnd),
    timezone: settings.timezone
  };
}

export async function updateTargetFromForm(targetId: number, form: FormRecord): Promise<TargetActionResult> {
  const [target, accounts, settings] = await Promise.all([
    getPostTargetById(targetId),
    listConnectedSocialAccounts(),
    getAppSettings()
  ]);

  if (!target) {
    return {
      ok: false,
      message: "Target nie istnieje."
    };
  }

  const accountId = optionalPositiveInteger(formValue(form, "social_account_id"));
  const accountResult = validateSelectedAccount(target.platform, accountId, accounts);

  if (!accountResult.ok) {
    return accountResult;
  }

  const scheduledAtRaw = formValue(form, "scheduled_at");
  const scheduledAt = optionalDateTimeLocal(scheduledAtRaw, settings.timezone);

  if (scheduledAtRaw.trim() && !scheduledAt) {
    return {
      ok: false,
      message: `Niepoprawna data harmonogramu dla strefy ${settings.timezone}.`
    };
  }

  const updated = await updatePostTarget(targetId, {
    socialAccountId: accountResult.accountId,
    platformTitle: emptyToNull(formValue(form, "platform_title")),
    platformCaption: formValue(form, "platform_caption").trim(),
    platformHashtags: emptyToNull(formValue(form, "platform_hashtags")),
    platformOptions: {
      ...target.platformOptions,
      privacy: formValue(form, "privacy") || "default",
      ...(target.platform === "youtube"
        ? { contentType: formValue(form, "content_type") === "video" ? "video" : "short" }
        : {})
    },
    scheduledAt
  });

  return updated
    ? {
        ok: true,
        message: "Target zaktualizowany."
      }
    : {
        ok: false,
        message: "Target nie moze byc edytowany podczas publikacji."
      };
}

export async function queueTargetFromForm(targetId: number, form: FormRecord): Promise<TargetActionResult> {
  const settings = await getAppSettings();
  const runAfterRaw = formValue(form, "run_after");
  const runAfter = optionalDateTimeLocal(runAfterRaw, settings.timezone);

  if (runAfterRaw.trim() && !runAfter) {
    return {
      ok: false,
      message: `Niepoprawna data kolejki dla strefy ${settings.timezone}.`
    };
  }

  const ok = await queuePostTarget(targetId, runAfter ?? new Date());

  return ok
    ? {
        ok: true,
        message: "Target dodany do kolejki."
      }
    : {
        ok: false,
        message: "Target nie moze byc dodany do kolejki."
      };
}

export async function cancelTarget(targetId: number): Promise<TargetActionResult> {
  const ok = await cancelPostTarget(targetId);

  return ok
    ? {
        ok: true,
        message: "Target anulowany."
      }
    : {
        ok: false,
        message: "Target nie moze byc anulowany."
      };
}

export async function deleteTarget(targetId: number): Promise<TargetActionResult> {
  const ok = await deletePostTarget(targetId);

  return ok
    ? {
        ok: true,
        message: "Target i jego lokalne zlecenia zostały usunięte."
      }
    : {
        ok: false,
        message: "Target nie może być usunięty podczas publikacji."
      };
}

export async function duplicateTarget(targetId: number): Promise<TargetActionResult> {
  const target = await duplicatePostTarget(targetId);

  return target
    ? {
        ok: true,
        message: "Target skopiowany jako szkic."
      }
    : {
        ok: false,
        message: "Target nie moze byc skopiowany."
      };
}

export function targetStatusGroup(status: PostTargetStatus): "ready" | "active" | "done" | "problem" {
  if (status === "draft" || status === "scheduled") {
    return "ready";
  }

  if (status === "queued" || status === "publishing" || status === "processing_on_platform") {
    return "active";
  }

  if (status === "published" || status === "simulated") {
    return "done";
  }

  return "problem";
}
