import { env } from "./config/env.js";

interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const dateTimeLocalPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const dateTimePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: env.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23"
});

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value ?? "0");
}

function isValidWallClock(parts: DateTimeParts): boolean {
  const candidate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  );

  return (
    candidate.getUTCFullYear() === parts.year &&
    candidate.getUTCMonth() + 1 === parts.month &&
    candidate.getUTCDate() === parts.day &&
    candidate.getUTCHours() === parts.hour &&
    candidate.getUTCMinutes() === parts.minute &&
    candidate.getUTCSeconds() === parts.second
  );
}

function sameParts(first: DateTimeParts, second: DateTimeParts): boolean {
  return (
    first.year === second.year &&
    first.month === second.month &&
    first.day === second.day &&
    first.hour === second.hour &&
    first.minute === second.minute &&
    first.second === second.second
  );
}

function timezoneOffsetMilliseconds(date: Date): number {
  const parts = appDateTimeParts(date);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  const dateWithoutMilliseconds = Math.floor(date.getTime() / 1000) * 1000;

  return representedAsUtc - dateWithoutMilliseconds;
}

export function appDateTimeParts(date: Date): DateTimeParts {
  const parts = dateTimePartsFormatter.formatToParts(date);

  return {
    year: partValue(parts, "year"),
    month: partValue(parts, "month"),
    day: partValue(parts, "day"),
    hour: partValue(parts, "hour"),
    minute: partValue(parts, "minute"),
    second: partValue(parts, "second")
  };
}

export function parseDateTimeLocal(value: string): Date | null {
  const match = dateTimeLocalPattern.exec(value.trim());

  if (!match) {
    return null;
  }

  const wallClock: DateTimeParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? "0")
  };

  if (!isValidWallClock(wallClock)) {
    return null;
  }

  const wallClockAsUtc = Date.UTC(
    wallClock.year,
    wallClock.month - 1,
    wallClock.day,
    wallClock.hour,
    wallClock.minute,
    wallClock.second
  );
  let timestamp = wallClockAsUtc;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const offset = timezoneOffsetMilliseconds(new Date(timestamp));
    const adjustedTimestamp = wallClockAsUtc - offset;

    if (adjustedTimestamp === timestamp) {
      break;
    }

    timestamp = adjustedTimestamp;
  }

  const parsed = new Date(timestamp);
  return sameParts(appDateTimeParts(parsed), wallClock) ? parsed : null;
}

export function formatAppDateTime(date: Date): string {
  return date.toLocaleString("pl-PL", { timeZone: env.timezone });
}

export function formatDateTimeLocalInput(date: Date | null): string {
  if (!date) {
    return "";
  }

  const parts = appDateTimeParts(date);
  const pad = (value: number): string => String(value).padStart(2, "0");

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}
