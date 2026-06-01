import type { FastifyInstance } from "fastify";
import { checkDatabase } from "../../db/client.js";

export async function registerHealthRoutes(server: FastifyInstance): Promise<void> {
  server.get("/health", async (_request, reply) => {
    try {
      const dbOk = await checkDatabase();
      const status = dbOk ? 200 : 503;
      return reply.code(status).send({
        ok: dbOk,
        app: "ok",
        db: dbOk ? "ok" : "error"
      });
    } catch (error) {
      return reply.code(503).send({
        ok: false,
        app: "ok",
        db: "error",
        error: error instanceof Error ? error.message : "unknown"
      });
    }
  });
}
