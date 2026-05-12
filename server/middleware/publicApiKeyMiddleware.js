import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import Project from "../models/Project.js";
import Alert from "../models/Alert.js";
import { analyticsEmitter } from "../utils/analyticsEmitter.js";

const publicApiKeyMiddleware = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return res.status(401).json({ message: "API key required" });
    }

    const keyHash = crypto.createHash("sha256").update(key).digest("hex");
    const apiKey = await ApiKey.findOne({ hashedKey: keyHash, isActive: true });
    if (!apiKey) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    // attach apiKey
    req.apiKey = apiKey;

    // load project and attach
    const project = await Project.findById(apiKey.project).populate("user", "plan");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    req.project = project;

    // initialize usage/reset fields
    if (!apiKey.resetAt) {
      apiKey.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    if (apiKey.usage === undefined || apiKey.usage === null) {
      apiKey.usage = 0;
    }

    // reset logic
    if (new Date() > apiKey.resetAt) {
      apiKey.usage = 0;
      apiKey.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    if (apiKey.limit > 0) {
      if (apiKey.usage >= apiKey.limit) {
        if (apiKey.usage === apiKey.limit) {
          // Exactly hit the limit now
          const alert = await Alert.create({
            userId: project.user._id,
            projectId: project._id,
            type: "quota",
            message: `API Key "${apiKey.name || 'Untitled'}" has reached its limit of ${apiKey.limit} requests.`
          });
          analyticsEmitter.emit(`new_alert_${project.user._id}`, alert);
        }
        return res.status(429).json({ message: "Rate limit exceeded" });
      } else if (apiKey.usage === Math.floor(apiKey.limit * 0.8)) {
        // Just crossed 80%
        const alert = await Alert.create({
            userId: project.user._id,
            projectId: project._id,
            type: "quota",
            message: `API Key "${apiKey.name || 'Untitled'}" has used 80% of its ${apiKey.limit} requests quota.`
        });
        analyticsEmitter.emit(`new_alert_${project.user._id}`, alert);
      }
    }

    // 🚀 SCALABILITY FIX: Atomic increment to prevent race conditions
    await ApiKey.updateOne(
      { _id: apiKey._id },
      { 
        $inc: { usage: 1 }, 
        $set: { 
          lastUsedAt: new Date(),
          resetAt: apiKey.resetAt 
        } 
      }
    );

    // Update local object for downstream middleware (e.g. usage tracking)
    apiKey.usage += 1;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireApiKeyPermission = (requiredPermission) => {
  return (req, res, next) => {
    const apiKey = req.apiKey;
    if (!apiKey) {
      return res.status(401).json({ message: "API key not found on request" });
    }

    const permissions = apiKey.permissions || ["read"];
    
    // admin permission bypasses others
    if (permissions.includes("admin")) {
      return next();
    }

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: `Forbidden: This API key does not have "${requiredPermission}" permission.` 
      });
    }

    next();
  };
};

export default publicApiKeyMiddleware;
