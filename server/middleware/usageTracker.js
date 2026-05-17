import Usage from "../models/Usage.js";
import { analyticsEmitter } from "../utils/analyticsEmitter.js";
import { analyticsQueue } from "../queue/analyticsQueue.js";

let logBuffer = [];
let flushTimeout = null;

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 100;

const flushLogs = async () => {
  if (logBuffer.length === 0) return;
  const logsToProcess = [...logBuffer];
  logBuffer = [];
  
  if (analyticsQueue) {
    try {
      await analyticsQueue.add("processLogs", { logs: logsToProcess });
    } catch (error) {
      console.error("[UsageTracker] Failed to queue logs, falling back to direct insert", error);
      fallbackInsert(logsToProcess);
    }
  } else {
    fallbackInsert(logsToProcess);
  }
};

const fallbackInsert = async (logs) => {
  try {
    await Usage.insertMany(logs);
    for (const log of logs) {
       if (log.projectUserId) {
          analyticsEmitter.emit(`new_usage_${log.projectUserId}`, log);
       }
    }
  } catch (err) {
    console.error("Failed to fallback log usage", err.message);
  }
};

const queueLog = (logData) => {
  logBuffer.push(logData);

  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = null;
    flushLogs();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushTimeout = null;
      flushLogs();
    }, FLUSH_INTERVAL);
  }
};

const usageTracker = (req, res, next) => {
  // Capture the start time
  const start = Date.now();

  res.on("finish", () => {
    try {
      const apiKeyId = req.apiKey?._id;
      const project = req.project;
      const projectId = project?._id;

      if (!projectId) {
        return; // Don't track if we can't associate it with a project
      }

      // Normalize MongoDB ObjectIDs in the URL path to ':id'
      let endpoint = req.originalUrl.split("?")[0];
      endpoint = endpoint.replace(/\/[a-f0-9]{24}\b/gi, "/:id");

      const method = req.method;
      const statusCode = res.statusCode;
      const responseTime = Date.now() - start;
      const projectUserId = project.user && project.user._id ? project.user._id : null;

      queueLog({
        projectId,
        apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: new Date(),
        projectUserId
      });
      
    } catch (error) {
      console.error("Usage tracker error:", error.message);
    }
  });

  next();
};

export default usageTracker;
