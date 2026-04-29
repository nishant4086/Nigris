import ApiKey from "../models/ApiKey.js";

const rateLimiter = async (req, res, next) => {
  const apiKey = req.apiKey;

  if (!apiKey) {
    return res.status(500).json({ message: "API key missing in request" });
  }

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

  apiKey.usage += 1;
  apiKey.lastUsedAt = new Date();
  await apiKey.save();

  next();
};

export default rateLimiter;