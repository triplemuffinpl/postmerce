import { listConnectedSocialAccounts } from "../db/account-repository.js";
import {
  cancelPostTarget,
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
}

export interface CalendarPageData {
  monthStart: Date;
  previousMonth: string;
  nextMonth: string;
  targets: TargetControlItem[];
}

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonth(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [yearValue, monthValue] = value.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);

    if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
      return new Date(year, month - 1, 1);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
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

export async function getPublishingControlData(): Promise<PublishingControlData> {
  const [targets, accounts] = await Promise.all([
    listTargetControlItems(300),
    listConnectedSocialAccounts()
  ]);

  return {
    targets,
    accounts,
    metrics: metricsFromTargets(targets)
  };
}

export async function getCalendarPageData(month: string | undefined): Promise<CalendarPageData> {
  const monthStart = parseMonth(month);
  const nextMonthStart = addMonths(monthStart, 1);
  const calendarStart = addMonths(monthStart, -1);
  const calendarEnd = addMonths(monthStart, 2);

  return {
    monthStart,
    previousMonth: yyyymm(addMonths(monthStart, -1)),
    nextMonth: yyyymm(nextMonthStart),
    targets: await listCalendarTargetItems(calendarStart, calendarEnd)
  };
}

export async function updateTargetFromForm(targetId: number, form: FormRecord): Promise<TargetActionResult> {
  const [target, accounts] = await Promise.all([
    getPostTargetById(targetId),
    listConnectedSocialAccounts()
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

  const updated = await updatePostTarget(targetId, {
    socialAccountId: accountResult.accountId,
    platformTitle: emptyToNull(formValue(form, "platform_title")),
    platformCaption: formValue(form, "platform_caption").trim(),
    platformHashtags: emptyToNull(formValue(form, "platform_hashtags")),
    platformOptions: {
      ...target.platformOptions,
      privacy: formValue(form, "privacy") || "default"
    },
    scheduledAt: optionalDateTimeLocal(formValue(form, "scheduled_at"))
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
  const runAfter = optionalDateTimeLocal(formValue(form, "run_after")) ?? new Date();
  const ok = await queuePostTarget(targetId, runAfter);

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
