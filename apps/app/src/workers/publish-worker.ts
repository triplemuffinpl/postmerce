import { nanoid } from "nanoid";
import { env } from "../config/env.js";
import { closeDatabase } from "../db/client.js";
import { logger } from "../services/logger.js";
import { processDuePublishJobs } from "../services/queue-service.js";

const workerId = `postmerce-worker-${nanoid(8)}`;
const runOnce = process.argv.includes("--once");
let shuttingDown = false;

logger.info("worker", "Publish worker booted", {
  workerId,
  mode: env.dryRun ? "dry_run" : "live",
  runOnce
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function requestShutdown(signal: string): void {
  shuttingDown = true;
  logger.info("worker", "Publish worker shutdown requested", {
    workerId,
    signal
  });
}

process.once("SIGINT", () => {
  requestShutdown("SIGINT");
});

process.once("SIGTERM", () => {
  requestShutdown("SIGTERM");
});

async function tick(): Promise<void> {
  const results = await processDuePublishJobs(workerId, env.workerBatchSize);
  const processed = results.filter((result) => result.processed);

  for (const result of processed) {
    logger.info("worker", "Publish job processed", {
      workerId,
      jobId: result.jobId,
      status: result.status,
      message: result.message
    });
  }
}

try {
  if (runOnce) {
    await tick();
  } else {
    while (!shuttingDown) {
      await tick();
      await sleep(env.workerPollMs);
    }
  }
} catch (error) {
  logger.error("worker", "Publish worker crashed", {
    workerId,
    error: error instanceof Error ? error.message : String(error)
  });
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
