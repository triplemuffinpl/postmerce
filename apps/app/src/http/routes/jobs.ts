import type { FastifyInstance } from "fastify";
import { cancelJob, getJobsPageData, retryJob } from "../../services/queue-service.js";
import { jobsPage } from "../../ui/pages/jobs-page.js";

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseJobId(params: unknown): number | null {
  const id = Number((params as { id?: string }).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function registerJobRoutes(server: FastifyInstance): Promise<void> {
  server.get("/jobs", async (request, reply) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    const data = await getJobsPageData();
    const notice = firstQueryValue(query.notice);
    const error = firstQueryValue(query.error);

    return reply.type("text/html").send(
      jobsPage({
        ...data,
        ...(notice ? { notice } : {}),
        ...(error ? { error } : {})
      })
    );
  });

  server.post("/jobs/:id/retry", async (request, reply) => {
    const jobId = parseJobId(request.params);

    if (!jobId) {
      return reply.redirect("/jobs?error=Invalid+job");
    }

    const ok = await retryJob(jobId);
    return reply.redirect(ok ? "/jobs?notice=Job+queued+for+retry" : "/jobs?error=Job+cannot+be+retried");
  });

  server.post("/jobs/:id/cancel", async (request, reply) => {
    const jobId = parseJobId(request.params);

    if (!jobId) {
      return reply.redirect("/jobs?error=Invalid+job");
    }

    const ok = await cancelJob(jobId);
    return reply.redirect(ok ? "/jobs?notice=Job+cancelled" : "/jobs?error=Job+cannot+be+cancelled");
  });
}
