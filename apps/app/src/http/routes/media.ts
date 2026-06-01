import type { FastifyInstance } from "fastify";
import { mediaPage } from "../../ui/pages/media-page.js";

export async function registerMediaRoutes(server: FastifyInstance): Promise<void> {
  server.get("/media", async (_request, reply) => {
    return reply.type("text/html").send(mediaPage());
  });
}
