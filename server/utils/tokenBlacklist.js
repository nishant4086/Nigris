import redis, { isRedisAvailable } from "../config/redis.js";

/**
 * Blacklists a JWT token until its expiration.
 * @param {string} token - The raw JWT token string
 * @param {number} expiresInSeconds - Time until the token naturally expires
 */
export const blacklistToken = async (token, expiresInSeconds) => {
  if (!redis || !isRedisAvailable) {
    console.warn("[TokenBlacklist] Redis unavailable, token revocation will not persist across restarts.");
    // Optional: add to a local Set if Redis is down
    return;
  }

  try {
    const key = `blacklist:${token}`;
    await redis.set(key, "1", "EX", Math.max(expiresInSeconds, 1));
    console.log(`[TokenBlacklist] Token revoked for ${expiresInSeconds}s`);
  } catch (error) {
    console.error("[TokenBlacklist] Failed to blacklist token:", error.message);
  }
};

/**
 * Checks if a token is blacklisted.
 */
export const isTokenBlacklisted = async (token) => {
  if (!redis || !isRedisAvailable) return false;

  try {
    const exists = await redis.exists(`blacklist:${token}`);
    return exists === 1;
  } catch (error) {
    console.error("[TokenBlacklist] Check failed:", error.message);
    return false;
  }
};
