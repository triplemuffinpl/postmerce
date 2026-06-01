import fastifyStatic from "@fastify/static";
import formBody from "@fastify/formbody";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

  await server.register(formBody);
  await server.register(fastifyStatic, {
    root: path.join(appRoot, "public"),
    prefix: "/assets/"
  });

  await registerHealthRoutes(server);
  await registerDashboardRoutes(server);
  await registerAccountRoutes(server);
  await registerMediaRoutes(server);
  await registerPostRoutes(server);
  await registerJobRoutes(server);

  return server;
}
