import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import formBody from "@fastify/formbody";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { ensureStorageDirectories } from "../services/storage-service.js";
import { registerAccountRoutes } from "./routes/accounts.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerJobRoutes } from "./routes/jobs.js";
import { registerMediaRoutes } from "./routes/media.js";
import { registerPostRoutes } from "./routes/posts.js";

const currentFile = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(currentFile), "../..");

export async function createServer() {
  const server = Fastify({
    logger: false
  });

  await ensureStorageDirectories();
  await server.register(formBody);
  await server.register(multipart, {
    limits: {
      files: 1,
      fileSize: env.maxUploadMb * 1024 * 1024
    },
    throwFileSizeLimit: true
  });
  await server.register(fastifyStatic, {
    root: path.join(appRoot, "public"),
    prefix: "/assets/"
  });
  await server.register(fastifyStatic, {
    root: path.join(env.storageRoot, "uploads"),
    prefix: "/uploads/",
    decorateReply: false
  });
  await server.register(fastifyStatic, {
    root: path.join(env.storageRoot, "thumbnails"),
    prefix: "/thumbnails/",
    decorateReply: false
  });

  await registerHealthRoutes(server);
  await registerDashboardRoutes(server);
  await registerAccountRoutes(server);
  await registerMediaRoutes(server);
  await registerPostRoutes(server);
  await registerJobRoutes(server);

  return server;
}
