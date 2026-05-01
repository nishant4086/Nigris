import ApiKey from "../models/ApiKey.js";
import Project from "../models/Project.js";

const publicApiKeyMiddleware = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return res.status(401).json({ message: "API key required" });
    }

    const apiKey = await ApiKey.findOne({ key, isActive: true });
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

    if (apiKey.limit > 0 && apiKey.usage >= apiKey.limit) {
      return res.status(429).json({ message: "Rate limit exceeded" });
    }

    // increment usage
    apiKey.usage += 1;
    apiKey.lastUsedAt = new Date();
    await apiKey.save();

    next();
  } catch (error) {
    next(error);
  }
};

export default publicApiKeyMiddleware;
