import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export default connection;
