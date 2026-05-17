import { Worker } from "bullmq";
import connection from "../config/redis.js";
import Usage from "../models/Usage.js";
import Project from "../models/Project.js";
import { analyticsEmitter } from "../utils/analyticsEmitter.js";

export let analyticsWorker = null;

if (connection) {
  analyticsWorker = new Worker(
    "analyticsQueue",
    async (job) => {
      const logs = job.data.logs;
      if (!logs || !logs.length) return;

      try {
        // Bulk insert to reduce database load
        const insertedLogs = await Usage.insertMany(logs);
        
        // Emit events for live dashboard after successful insertion
        for (const log of logs) {
           if (log.projectUserId) {
              analyticsEmitter.emit(`new_usage_${log.projectUserId}`, log);
           }
        }
        
      } catch (error) {
        console.error("[Analytics Worker] Failed to insert usage logs", error);
        throw error;
      }
    },
    { connection, concurrency: 5 }
  );

  analyticsWorker.on("completed", (job) => {
    // Optionally log completion
  });

  analyticsWorker.on("failed", (job, err) => {
    console.error(`[Analytics Worker] Job ${job.id} failed:`, err.message);
  });
}
