import redis, { isRedisAvailable } from "../config/redis.js";
import { LRUCache } from "lru-cache";

// Fallback in-memory cache if Redis is down
const localCache = new LRUCache({
  max: 5000,
  ttl: 60 * 1000, // 1 minute default
});

const PLAN_MULTIPLIERS = {
  free: 1,
  pro: 10,
  enterprise: 100,
};

/**
 * Robust Rate Limiter with Redis Atomicity and Local Fallback
 */
export const redisRateLimit = (baseLimit, windowSeconds) => {
  return async (req, res, next) => {
    try {
      const apiKeyId = req.apiKey?._id?.toString?.() || null;
      const tenantId = req.project?._id?.toString?.() || null;
      const plan = req.project?.user?.plan || "free";
      const multiplier = PLAN_MULTIPLIERS[plan] || 1;
      const totalLimit = baseLimit * multiplier;

      // Key construction
      const keyPartition = apiKeyId
        ? `k:${apiKeyId}`
        : `ip:${req.ip || req.headers['x-forwarded-for'] || 'unknown'}`;
      
      const tenantPartition = tenantId || 'system';
      const redisKey = `rate:${tenantPartition}:${keyPartition}`;

      let count = 0;

      if (redis && isRedisAvailable) {
        // 🔒 ATOMIC: INCR + EXPIRE in one MULTI block
        const multi = redis.multi();
        multi.incr(redisKey);
        multi.expire(redisKey, windowSeconds, 'NX'); // 'NX' only sets expiry if not already set
        
        const results = await multi.exec();
        if (!results || !results[0]) throw new Error("Redis execution failed");
        
        count = results[0][1];
      } else {
        // 🛡️ FALLBACK: Use local memory if Redis is down
        const localKey = `local:${redisKey}`;
        const current = localCache.get(localKey) || 0;
        count = current + 1;
        localCache.set(localKey, count); // TTL is handled by LRUCache config
      }

      const remaining = Math.max(0, totalLimit - count);
      res.setHeader("X-RateLimit-Limit", totalLimit);
      res.setHeader("X-RateLimit-Remaining", remaining);

      if (count > totalLimit) {
        return res.status(429).json({ 
          error: "Too many requests",
          retryAfter: windowSeconds
        });
      }

      next();
    } catch (error) {
      console.error("[RateLimiter] Critical Error:", error.message);
      // Fail-safe: allow request but log warning
      next();
    }
  };
};
