import type { FastifyInstance } from "fastify";
import { bodyToFormRecord, formValue } from "../form.js";
import {
  cancelTarget,
  deleteTarget,
  duplicateTarget,
  getCalendarPageData,
  getPublishingControlData,
  parseControlView,
  queueTargetFromForm,
  updateTargetFromForm,
  type TargetActionResult
} from "../../services/target-service.js";
import { calendarPage } from "../../ui/pages/calendar-page.js";
import { publishingControlPage } from "../../ui/pages/publishing-control-page.js";

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseTargetId(params: unknown): number | null {
  const id = Number((params as { id?: string }).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function safeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/control";
  }

  return value;
}

function redirectForResult(result: TargetActionResult, returnTo: string): string {
  const separator = returnTo.includes("?") ? "&" : "?";
  const key = result.ok ? "notice" : "error";
  return `${returnTo}${separator}${key}=${encodeURIComponent(result.message)}`;
}

async function targetActionRedirect(
  requestBody: unknown,
  action: (form: ReturnType<typeof bodyToFormRecord>) => Promise<TargetActionResult>
): Promise<string> {
  const form = bodyToFormRecord(requestBody);
  const returnTo = safeReturnTo(formValue(form, "return_to") || "/control");
  const result = await action(form);

  return redirectForResult(result, returnTo);
}

export async function registerPublishingRoutes(server: FastifyInstance): Promise<void> {
  server.get("/control", async (request, reply) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    const data = await getPublishingControlData(parseControlView(firstQueryValue(query.view)));
    const notice = firstQueryValue(query.notice);
    const error = firstQueryValue(query.error);

    return reply.type("text/html").send(
      publishingControlPage({
        ...data,
        ...(notice ? { notice } : {}),
        ...(error ? { error } : {})
      })
    );
  });

  server.get("/calendar", async (request, reply) => {
    const query = request.query as Record<string, string | string[] | undefined>;
    const data = await getCalendarPageData(firstQueryValue(query.month));
    const notice = firstQueryValue(query.notice);
    const error = firstQueryValue(query.error);

    return reply.type("text/html").send(
      calendarPage({
        ...data,
        ...(notice ? { notice } : {}),
        ...(error ? { error } : {})
      })
    );
  });

  server.post("/targets/:id/update", async (request, reply) => {
    const targetId = parseTargetId(request.params);

    if (!targetId) {
      return reply.redirect("/control?error=Invalid+target");
    }

    return reply.redirect(
      await targetActionRedirect(request.body, (form) => updateTargetFromForm(targetId, form))
    );
  });

  server.post("/targets/:id/queue", async (request, reply) => {
    const targetId = parseTargetId(request.params);

    if (!targetId) {
      return reply.redirect("/control?error=Invalid+target");
    }

    return reply.redirect(
      await targetActionRedirect(request.body, (form) => queueTargetFromForm(targetId, form))
    );
  });

  server.post("/targets/:id/cancel", async (request, reply) => {
    const targetId = parseTargetId(request.params);

    if (!targetId) {
      return reply.redirect("/control?error=Invalid+target");
    }

    return reply.redirect(
      await targetActionRedirect(request.body, async () => cancelTarget(targetId))
    );
  });

  server.post("/targets/:id/duplicate", async (request, reply) => {
    const targetId = parseTargetId(request.params);

    if (!targetId) {
      return reply.redirect("/control?error=Invalid+target");
    }

    return reply.redirect(
      await targetActionRedirect(request.body, async () => duplicateTarget(targetId))
    );
  });

  server.post("/targets/:id/delete", async (request, reply) => {
    const targetId = parseTargetId(request.params);

    if (!targetId) {
      return reply.redirect("/control?error=Invalid+target");
    }

    return reply.redirect(
      await targetActionRedirect(request.body, async () => deleteTarget(targetId))
    );
  });
}
