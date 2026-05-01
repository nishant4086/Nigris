import redis from "../config/redis.js";

const PLAN_MULTIPLIERS = {
  free: 1,
  pro: 10,
  enterprise: 100,
};

export const redisRateLimit = (baseLimit, windowSeconds) => {
  return async (req, res, next) => {
    try {
      const apiKey = req.apiKey?.key;

      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      // Determine plan
      const plan = req.project?.user?.plan || "free";
      const multiplier = PLAN_MULTIPLIERS[plan] || 1;
      const totalLimit = baseLimit * multiplier;

      const redisKey = `rate:${apiKey}`;

      // Execute MULTI to ensure atomic INCR + EXPIRE
      const multi = redis.multi();
      multi.incr(redisKey);
      
      // Execute the block and retrieve the new count
      const results = await multi.exec();
      
      // results[0][1] contains the value of INCR
      const count = results[0][1];

      // If it's the first request in the window, set the EXPIRE
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      const remaining = Math.max(0, totalLimit - count);

      // Add response headers
      res.setHeader("X-RateLimit-Limit", totalLimit);
      res.setHeader("X-RateLimit-Remaining", remaining);

      if (count > totalLimit) {
        return res.status(429).json({ error: "Too many requests" });
      }

      next();
    } catch (error) {
      // Fail-safe behavior: Log the error and allow the request
      console.error("Redis Rate Limiting Error:", error.message);
      next();
    }
  };
};
