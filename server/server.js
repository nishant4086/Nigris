import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import "./workers/webhookWorker.js";

const PORT = process.env.PORT || 8000;

// ─── STABILITY & ERROR HANDLING ──────────────────────────
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! ⚠️");
  console.error(err);
  // Don't crash – allow the server to continue handling requests
  // Redis/BullMQ connection failures should not take down the whole server
});

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}\n`);
});

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // 1. Stop accepting new requests
  server.close(() => {
    console.log("HTTP server closed.");
  });

  try {
    // 2. Close MongoDB connection
    const { default: mongoose } = await import("mongoose");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }

    // 3. Close Redis connection
    const { default: redis } = await import("./config/redis.js");
    if (redis && typeof redis.quit === "function") {
      await redis.quit();
      console.log("Redis connection closed.");
    }

    // 4. Close Webhook Worker
    const { webhookWorker } = await import("./workers/webhookWorker.js");
    if (webhookWorker) {
      await webhookWorker.close();
      console.log("Webhook worker closed.");
    }

    console.log("Shutdown complete. Goodbye! 👋");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
