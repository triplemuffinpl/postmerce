import type { FastifyInstance } from "fastify";
import { mediaPage } from "../../ui/pages/media-page.js";
import { mediaDetailsPage } from "../../ui/pages/media-details-page.js";
import { getMediaDetails, getRecentMedia, uploadMedia } from "../../services/media-service.js";

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function registerMediaRoutes(server: FastifyInstance): Promise<void> {
  server.get("/media", async (request, reply) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    const media = await getRecentMedia();
    const notice = firstQueryValue(query.notice);
    const error = firstQueryValue(query.error);

    return reply.type("text/html").send(
      mediaPage({
        media,
        ...(notice ? { notice } : {}),
        ...(error ? { error } : {})
      })
    );
  });

  server.get("/media/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const query = request.query as Record<string, string | string[] | undefined>;
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(404).type("text/html").send(mediaDetailsPage({ media: null }));
    }

    const media = await getMediaDetails(id);
    const notice = firstQueryValue(query.notice);
    const statusCode = media ? 200 : 404;
    return reply.code(statusCode).type("text/html").send(
      mediaDetailsPage({
        media,
        ...(notice ? { notice } : {})
      })
    );
  });

  server.post("/media/uploads", async (request, reply) => {
    try {
      const uploadedFile = await request.file();

      if (!uploadedFile) {
        return reply.redirect("/media?error=No+video+file+was+uploaded");
      }

      const result = await uploadMedia(uploadedFile);
      const notice =
        result.warnings.length > 0
          ? encodeURIComponent(result.warnings.join(" "))
          : "Media+asset+uploaded";

      return reply.redirect(`/media/${result.media.id}?notice=${notice}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      return reply.redirect(`/media?error=${encodeURIComponent(message)}`);
    }
  });
}
