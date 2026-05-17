import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const analyticsQueue = connection
  ? new Queue("analyticsQueue", { connection })
  : null;
