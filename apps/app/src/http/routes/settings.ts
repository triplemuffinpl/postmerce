import type { FastifyInstance } from "fastify";
import { getAppSettings, toggleDryRunMode, updateTimezoneFromForm } from "../../services/settings-service.js";
import { settingsPage } from "../../ui/pages/settings-page.js";
import { bodyToFormRecord } from "../form.js";

function queryValue(query: unknown, key: string): string {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return "";
  }

  const value = (query as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function resultRedirect(result: Awaited<ReturnType<typeof toggleDryRunMode>>): string {
  const key = result.ok ? "notice" : "error";
  return `/settings?${key}=${encodeURIComponent(result.message)}`;
}

export async function registerSettingsRoutes(server: FastifyInstance): Promise<void> {
  server.get("/settings", async (request, reply) => {
    return reply.type("text/html").send(
      settingsPage({
        settings: await getAppSettings(),
        notice: queryValue(request.query, "notice"),
        error: queryValue(request.query, "error")
      })
    );
  });

  server.post("/settings/toggle-dry-run", async (_request, reply) => {
    return reply.redirect(resultRedirect(await toggleDryRunMode()));
  });

  server.post("/settings/timezone", async (request, reply) => {
    return reply.redirect(resultRedirect(await updateTimezoneFromForm(bodyToFormRecord(request.body))));
  });
}
