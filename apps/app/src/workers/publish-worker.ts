import { nanoid } from "nanoid";
import { logger } from "../services/logger.js";

const workerId = `postmerce-worker-${nanoid(8)}`;

logger.info("worker", "Publish worker booted", {
  workerId,
  mode: "foundation"
});

logger.info("worker", "No queue polling yet; implement after post target scheduling stage", {
  workerId
});
