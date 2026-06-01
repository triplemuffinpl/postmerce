import type { FastifyInstance } from "fastify";
import { getPlatformConfigs } from "../../services/platform-registry.js";
import { dashboardPage } from "../../ui/pages/dashboard-page.js";

export async function registerDashboardRoutes(server: FastifyInstance): Promise<void> {
  server.get("/", async (_request, reply) => {
    return reply.type("text/html").send(
      dashboardPage({
        platforms: getPlatformConfigs()
      })
    );
  });
}
