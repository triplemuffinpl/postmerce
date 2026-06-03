import type { FastifyInstance } from "fastify";
import { getDashboardData } from "../../services/dashboard-service.js";
import { dashboardPage } from "../../ui/pages/dashboard-page.js";

export async function registerDashboardRoutes(server: FastifyInstance): Promise<void> {
  server.get("/", async (_request, reply) => {
    return reply.type("text/html").send(dashboardPage(await getDashboardData()));
  });
}
