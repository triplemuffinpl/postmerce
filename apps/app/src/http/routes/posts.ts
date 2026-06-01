import type { FastifyInstance } from "fastify";
import { postsPage } from "../../ui/pages/posts-page.js";

export async function registerPostRoutes(server: FastifyInstance): Promise<void> {
  server.get("/posts", async (_request, reply) => {
    return reply.type("text/html").send(postsPage());
  });
}
