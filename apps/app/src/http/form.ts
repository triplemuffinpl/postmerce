import { parseDateTimeLocal } from "../date-time.js";

export type FormRecord = Record<string, string | string[] | undefined>;

export function bodyToFormRecord(body: unknown): FormRecord {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  const output: FormRecord = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      output[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      output[key] = value.filter((item): item is string => typeof item === "string");
    }
  }

  return output;
}

export function formValue(form: FormRecord, key: string): string {
  const value = form[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function formValues(form: FormRecord, key: string): string[] {
  const value = form[key];

  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

export function optionalDateTimeLocal(value: string): Date | null {
  if (!value.trim()) {
    return null;
  }

  return parseDateTimeLocal(value);
}
