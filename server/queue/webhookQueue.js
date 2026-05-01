import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const webhookQueue = new Queue("webhookQueue", { connection });
