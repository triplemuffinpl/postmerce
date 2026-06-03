import { env } from "../config/env.js";
import { getConnectedSocialAccount, getSocialAccountById } from "../db/account-repository.js";
import {
  cancelPublishJob,
  claimNextPublishJob,
  deletePublishJob,
  getPublishJobContext,
  listPublishJobs,
  listWorkerHeartbeats,
  markPublishJobFailed,
  markPublishJobMissingContext,
  markPublishJobSucceeded,
  markTargetPublishing,
  retryPublishJob,
  updateWorkerHeartbeat
} from "../db/queue-repository.js";
import type {
  ErrorClass,
  Platform,
  PublishJobListItem,
  PublishJobStatus,
  PublishResult,
  SocialAccountRecord,
  WorkerHeartbeatRecord,
  PublishJobContext
} from "../domain.js";
import { DryRunPublisher } from "../platforms/dry-run-publisher.js";
import type { PlatformPublisher } from "../platforms/platform-publisher.js";
import { YouTubePublisher } from "../platforms/youtube-publisher.js";
import { logger } from "./logger.js";
import { classifyError, getRetryDecision } from "./retry.js";
import { getAppSettings } from "./settings-service.js";

export interface JobsPageData {
  jobs: PublishJobListItem[];
  heartbeats: WorkerHeartbeatRecord[];
  settings: Awaited<ReturnType<typeof getAppSettings>>;
  view: JobsView;
  counts: Record<JobsView, number>;
}

export type JobsView = "active" | "problems" | "history" | "all";

export interface ProcessPublishJobResult {
  processed: boolean;
  jobId: number | null;
  status: PublishJobStatus | null;
  message: string;
}

const dryRunPublisher = new DryRunPublisher();
const youtubePublisher = new YouTubePublisher();

function getPublisher(platform: Platform, dryRun: boolean): PlatformPublisher | null {
  if (dryRun) {
    return dryRunPublisher;
  }

  if (platform === "youtube") {
    return youtubePublisher;
  }

  return null;
}

function dryRunAccount(context: PublishJobContext): SocialAccountRecord {
  return {
    id: context.target.socialAccountId ?? 0,
    platform: context.target.platform,
    platformUserId: "dry_run",
    displayName: "Dry Run Account",
    username: "dry_run",
    avatarUrl: null,
    accountType: "test",
    status: "connected",
    metadata: {
      mode: "dry_run"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function getPublishAccount(context: PublishJobContext, dryRun: boolean): Promise<SocialAccountRecord | null> {
  if (dryRun) {
    return dryRunAccount(context);
  }

  if (context.target.socialAccountId !== null) {
    const account = await getSocialAccountById(context.target.socialAccountId);
    return account?.status === "connected" ? account : null;
  }

  return getConnectedSocialAccount(context.target.platform);
}

async function recordFailure(
  context: PublishJobContext,
  errorCode: string | null,
  errorMessage: string,
  retryable: boolean
): Promise<void> {
  const errorClass = classifyError(errorCode, retryable);
  const retryDecision = retryable
    ? getRetryDecision(errorClass, context.job.attempts, context.job.maxAttempts)
    : {
        shouldRetry: false,
        nextRunAt: null,
        finalStatus: finalStatusFromErrorClass(errorClass)
      };

  await markPublishJobFailed({
    job: context.job,
    context,
    errorClass,
    errorCode,
    errorMessage,
    retryAt: retryDecision.shouldRetry ? retryDecision.nextRunAt : null,
    finalTargetStatus: retryDecision.finalStatus ?? finalStatusFromErrorClass(errorClass)
  });
}

function finalStatusFromErrorClass(errorClass: ErrorClass): "failed" | "requires_user_action" {
  return errorClass === "auth" ? "requires_user_action" : "failed";
}

function failedValidationResult(errors: string[]): PublishResult {
  return {
    ok: false,
    status: "failed",
    externalPostId: null,
    externalUrl: null,
    requiresPolling: false,
    redactedRawResponse: {
      validationErrors: errors
    },
    errorCode: "validation_failed",
    errorMessage: errors.join(" "),
    retryable: false
  };
}

function jobsForView(jobs: PublishJobListItem[], view: JobsView): PublishJobListItem[] {
  if (view === "active") {
    return jobs.filter((job) => job.status === "pending" || job.status === "running");
  }

  if (view === "problems") {
    return jobs.filter((job) => job.status === "failed");
  }

  if (view === "history") {
    return jobs.filter((job) => job.status === "succeeded" || job.status === "cancelled");
  }

  return jobs;
}

export function parseJobsView(value: string | undefined): JobsView {
  return value === "problems" || value === "history" || value === "all" ? value : "active";
}

export async function getJobsPageData(view: JobsView): Promise<JobsPageData> {
  const [allJobs, heartbeats, settings] = await Promise.all([
    listPublishJobs(300),
    listWorkerHeartbeats(10),
    getAppSettings()
  ]);

  return {
    jobs: jobsForView(allJobs, view),
    heartbeats,
    settings,
    view,
    counts: {
      active: jobsForView(allJobs, "active").length,
      problems: jobsForView(allJobs, "problems").length,
      history: jobsForView(allJobs, "history").length,
      all: allJobs.length
    }
  };
}

export async function retryJob(jobId: number): Promise<boolean> {
  return retryPublishJob(jobId);
}

export async function cancelJob(jobId: number): Promise<boolean> {
  return cancelPublishJob(jobId);
}

export async function deleteJob(jobId: number): Promise<boolean> {
  return deletePublishJob(jobId);
}

export async function processNextPublishJob(workerId: string): Promise<ProcessPublishJobResult> {
  const settings = await getAppSettings();

  await updateWorkerHeartbeat(workerId, {
    mode: settings.dryRun ? "dry_run" : "live",
    appEnv: env.appEnv,
    timezone: settings.timezone,
    lastTickAt: new Date().toISOString()
  });

  const claimedJob = await claimNextPublishJob(workerId, env.workerLockSeconds);

  if (!claimedJob) {
    return {
      processed: false,
      jobId: null,
      status: null,
      message: "No due publish jobs."
    };
  }

  const context = await getPublishJobContext(claimedJob.id);

  if (!context) {
    await markPublishJobMissingContext(claimedJob, "Publish job context is missing post, target or media.");
    return {
      processed: true,
      jobId: claimedJob.id,
      status: "failed",
      message: "Publish job context is missing."
    };
  }

  try {
    await markTargetPublishing(context);
    const publisher = getPublisher(context.target.platform, settings.dryRun);

    if (!publisher) {
      await recordFailure(
        context,
        "validation_publisher_missing",
        "Real platform publisher is not configured. Enable tryb testowy or add a platform adapter.",
        false
      );

      return {
        processed: true,
        jobId: context.job.id,
        status: "failed",
        message: "Publisher missing."
      };
    }

    const validation = await publisher.validate(context.target, context.media);
    const account = await getPublishAccount(context, settings.dryRun);

    if (!account) {
      await recordFailure(
        context,
        "auth_account_missing",
        `No connected ${context.target.platform} account is available for publishing.`,
        false
      );

      return {
        processed: true,
        jobId: context.job.id,
        status: "failed",
        message: "Publishing account missing."
      };
    }

    const publishResult = validation.ok
      ? await publisher.publish(context.target, context.media, account)
      : failedValidationResult(validation.errors);

    if (publishResult.ok) {
      await markPublishJobSucceeded(context, publishResult);
      return {
        processed: true,
        jobId: context.job.id,
        status: "succeeded",
        message: `Published through ${settings.dryRun ? "dry-run" : "platform"} publisher.`
      };
    }

    await recordFailure(
      context,
      publishResult.errorCode,
      publishResult.errorMessage ?? "Publish failed.",
      publishResult.retryable
    );

    return {
      processed: true,
      jobId: context.job.id,
      status: publishResult.retryable ? "pending" : "failed",
      message: publishResult.errorMessage ?? "Publish failed."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown worker error.";
    logger.error("worker", "Publish job failed with unexpected error", {
      workerId,
      jobId: context.job.id,
      error: message
    });
    await recordFailure(context, "temporary_worker_error", message, true);

    return {
      processed: true,
      jobId: context.job.id,
      status: "pending",
      message
    };
  }
}

export async function processDuePublishJobs(workerId: string, limit: number): Promise<ProcessPublishJobResult[]> {
  const results: ProcessPublishJobResult[] = [];

  for (let index = 0; index < limit; index += 1) {
    const result = await processNextPublishJob(workerId);
    results.push(result);

    if (!result.processed) {
      break;
    }
  }

  return results;
}
