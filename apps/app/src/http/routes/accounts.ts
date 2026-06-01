import type { FastifyInstance } from "fastify";
import { getPlatformConfigs } from "../../services/platform-registry.js";
import { accountsPage } from "../../ui/pages/accounts-page.js";

export async function registerAccountRoutes(server: FastifyInstance): Promise<void> {
  server.get("/accounts", async (_request, reply) => {
    return reply.type("text/html").send(
      accountsPage({
        platforms: getPlatformConfigs()
      })
    );
  });
}
