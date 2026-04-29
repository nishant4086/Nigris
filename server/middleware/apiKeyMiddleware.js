import ApiKey from "../models/ApiKey.js";

const apiKeyMiddleware = async (req, res, next) => {
  const key = req.headers["x-api-key"];

  if (!key) {
    return res.status(401).json({ message: "API key required" });
  }

  const apiKey = await ApiKey.findOne({ key, isActive: true });

  if (!apiKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  req.apiKey = apiKey;

  next();
};

export default apiKeyMiddleware;