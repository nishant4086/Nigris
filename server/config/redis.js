import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

let connection = null;
let isRedisAvailable = false;

if (REDIS_URL) {
  try {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      // Reconnect with exponential back-off, cap at 5 s
      retryStrategy(times) {
        if (times > 10) {
          console.warn("[Redis] Exceeded 10 reconnect attempts – giving up.");
          return null; // stop retrying
        }
        return Math.min(times * 200, 5000);
      },
      // TLS required by most cloud Redis providers (Render, Upstash, etc.)
      ...(REDIS_URL.startsWith("rediss://") ? { tls: { rejectUnauthorized: false } } : {}),
    });

    connection.on("connect", () => {
      console.log("[Redis] Connected successfully");
      isRedisAvailable = true;
    });

    connection.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
      isRedisAvailable = false;
    });

    connection.on("close", () => {
      console.warn("[Redis] Connection closed");
      isRedisAvailable = false;
    });
  } catch (err) {
    console.error("[Redis] Failed to initialise:", err.message);
    connection = null;
  }
} else {
  console.warn("[Redis] REDIS_URL not set – Redis features disabled.");
}

export { isRedisAvailable };
export default connection;
