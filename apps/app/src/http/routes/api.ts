import type { FastifyInstance } from "fastify";
import { listSocialAccounts } from "../../db/account-repository.js";
import { getPostDetails, getPostList } from "../../services/post-service.js";
import { getCalendarPageData, getPublishingControlData } from "../../services/target-service.js";

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function registerApiRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/social-accounts", async () => ({
    accounts: await listSocialAccounts()
  }));

  server.get("/api/posts", async () => ({
    posts: await getPostList()
  }));

  server.get("/api/publishing-targets", async () => getPublishingControlData());

  server.get("/api/calendar", async (request) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    return getCalendarPageData(firstQueryValue(query.month));
  });

  server.get("/api/posts/:id/results", async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(404).send({
        error: "Post not found."
      });
    }

    const details = await getPostDetails(id);

    if (!details) {
      return reply.code(404).send({
        error: "Post not found."
      });
    }

    return {
      post: details.post,
      targets: details.targets
    };
  });
}
