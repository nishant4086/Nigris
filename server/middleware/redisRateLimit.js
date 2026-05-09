import redis, { isRedisAvailable } from "../config/redis.js";

const PLAN_MULTIPLIERS = {
  free: 1,
  pro: 10,
  enterprise: 100,
};

export const redisRateLimit = (baseLimit, windowSeconds) => {
  return async (req, res, next) => {
    // If Redis is unavailable, skip rate limiting and allow the request
    if (!redis || !isRedisAvailable) {
      return next();
    }

    try {
      // Tenant isolation: build a stable redis key based on the API key document.
      // publicApiKeyMiddleware attaches `req.apiKey` as a Mongo document.
      // IMPORTANT: Always use _id (immutable) for keying. Never use hashedKey
      // because it changes on key rotation, which would reset the rate-limit
      // window and allow a bypass.
      const apiKeyId = req.apiKey?._id?.toString?.() || null;
      const tenantId = req.project?._id?.toString?.() || null;

      // Tenant isolation key.
      // Note: req.apiKey is only attached for API-key protected routes.
      // For routes without apiKey (e.g. public routes), we fall back to IP-based partition.
      const keyPartition = apiKeyId
        ? `k:${apiKeyId}`
        : `ip:${req.ip || req.headers['x-forwarded-for'] || 'unknown'}`;

      // If no tenant info exists but we still want isolation, we still use a partitioned key.
      const tenantPartition = tenantId || 'tenant?';

      // Determine plan (default to free)
      const plan = req.project?.user?.plan || "free";

      const multiplier = PLAN_MULTIPLIERS[plan] || 1;
      const totalLimit = baseLimit * multiplier;

      // Include tenant partition + key/IP partition to prevent cross-tenant collisions.
      const redisKey = `rate:${tenantPartition}:${keyPartition}`;



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
