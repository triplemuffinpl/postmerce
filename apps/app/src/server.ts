import { env } from "./config/env.js";
import { createServer } from "./http/server.js";
import { logger } from "./services/logger.js";

const server = await createServer();

try {
  await server.listen({ host: env.host, port: env.port });
  logger.info("server", "Postmerce app started", {
    host: env.host,
    port: env.port,
    env: env.appEnv
  });
} catch (error) {
  logger.error("server", "Failed to start Postmerce app", {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
}
