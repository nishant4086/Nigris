import { Queue } from "bullmq";
import connection from "../config/redis.js";

// Only create the queue if Redis is available
export const webhookQueue = connection
  ? new Queue("webhookQueue", { connection })
  : null;
