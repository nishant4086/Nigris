import Usage from "../models/Usage.js";
import Alert from "../models/Alert.js";
import { analyticsEmitter } from "../utils/analyticsEmitter.js";

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

      // Asynchronously save to DB without blocking the event loop or response
      Usage.create({
        projectId,
        apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: new Date(),
      }).then((newUsage) => {
        // Emit live event to SSE for this user
        if (project.user && project.user._id) {
          analyticsEmitter.emit(`new_usage_${project.user._id}`, newUsage);
        }
      }).catch((err) => {
        console.error("Failed to save usage log:", err.message);
      });
    } catch (error) {
      console.error("Usage tracker error:", error.message);
    }
  });

  next();
};

export default usageTracker;
