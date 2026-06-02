import type { FastifyInstance } from "fastify";
import { bodyToFormRecord } from "../form.js";
import { createPostFromForm, getNewPostFormData, getPostDetails, getPostList } from "../../services/post-service.js";
import { newPostPage } from "../../ui/pages/new-post-page.js";
import { postDetailsPage } from "../../ui/pages/post-details-page.js";
import { postsPage } from "../../ui/pages/posts-page.js";

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function registerPostRoutes(server: FastifyInstance): Promise<void> {
  server.get("/posts", async (request, reply) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    const posts = await getPostList();
    const notice = firstQueryValue(query.notice);

    return reply.type("text/html").send(
      postsPage({
        posts,
        ...(notice ? { notice } : {})
      })
    );
  });

  server.get("/posts/new", async (_request, reply) => {
    const data = await getNewPostFormData();
    return reply.type("text/html").send(newPostPage(data));
  });

  server.post("/posts", async (request, reply) => {
    const result = await createPostFromForm(bodyToFormRecord(request.body));

    if (!result.ok || !result.post) {
      const data = await getNewPostFormData();
      return reply.code(422).type("text/html").send(
        newPostPage({
          ...data,
          errors: result.errors
        })
      );
    }

    const notice =
      result.enqueuedJobCount > 0
        ? `Post+created+and+${result.enqueuedJobCount}+jobs+queued`
        : "Post+draft+created";

    return reply.redirect(`/posts/${result.post.id}?notice=${notice}`);
  });

  server.get("/posts/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const query = request.query as Record<string, string | string[] | undefined>;
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(404).type("text/html").send(postDetailsPage({ details: null }));
    }

    const details = await getPostDetails(id);
    const notice = firstQueryValue(query.notice);

    return reply
      .code(details ? 200 : 404)
      .type("text/html")
      .send(
        postDetailsPage({
          details,
          ...(notice ? { notice } : {})
        })
      );
  });
}
