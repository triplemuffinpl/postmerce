import type { FastifyInstance } from "fastify";
import { jobsPage } from "../../ui/pages/jobs-page.js";

export async function registerJobRoutes(server: FastifyInstance): Promise<void> {
  server.get("/jobs", async (_request, reply) => {
    return reply.type("text/html").send(jobsPage());
  });
}
