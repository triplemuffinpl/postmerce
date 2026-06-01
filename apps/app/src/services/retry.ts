import type { ErrorClass } from "../domain.js";

const retryDelaysSeconds = [0, 120, 600, 1800, 7200] as const;

export interface RetryDecision {
  shouldRetry: boolean;
  nextRunAt: Date | null;
  finalStatus: "failed" | "requires_user_action" | null;
}

export function classifyError(errorCode: string | null, retryable: boolean): ErrorClass {
  if (errorCode?.startsWith("auth_")) {
    return "auth";
  }

  if (errorCode?.startsWith("validation_")) {
    return "validation";
  }

  if (retryable) {
    return "temporary";
  }

  return "unknown";
}

export function getRetryDecision(errorClass: ErrorClass, attempts: number, maxAttempts: number): RetryDecision {
  if (errorClass === "auth") {
    return {
      shouldRetry: false,
      nextRunAt: null,
      finalStatus: "requires_user_action"
    };
  }

  if (errorClass === "validation") {
    return {
      shouldRetry: false,
      nextRunAt: null,
      finalStatus: "failed"
    };
  }

  if (attempts >= maxAttempts) {
    return {
      shouldRetry: false,
      nextRunAt: null,
      finalStatus: "failed"
    };
  }

  const delaySeconds = retryDelaysSeconds[Math.min(attempts, retryDelaysSeconds.length - 1)] ?? 7200;
  return {
    shouldRetry: true,
    nextRunAt: new Date(Date.now() + delaySeconds * 1000),
    finalStatus: null
  };
}
