import "dotenv/config";
import { validateEnv } from "./utils/envValidation.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import "./workers/webhookWorker.js";
import "./workers/analyticsWorker.js";
import "./workers/aiWorker.js";
import "./workers/billingWorker.js";
import "./jobs/cronJobs.js";

// Validate environment variables before anything else
validateEnv();

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

// ─── STARTUP ───────────────────────────────────
// 1. Start Listening Immediately (Crucial for Render Port Detection)
const server = app.listen(PORT, () => {
  console.log(`==> 🚀 Nigris Server is listening on port ${PORT}`);
  console.log(`==> 📡 Binding to 0.0.0.0 for Render compatibility`);
});

const startServer = async () => {
  try {
    // 2. Connect to Database in the background
    await connectDB();
    console.log("==> ✅ Database connected successfully");

    // ─── GRACEFUL SHUTDOWN ───────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        console.log("HTTP server closed.");
      });

      try {
        const { default: mongoose } = await import("mongoose");
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        }

        const { default: redis } = await import("./config/redis.js");
        if (redis && typeof redis.quit === "function") {
          await redis.quit();
          console.log("Redis connection closed.");
        }

        const { webhookWorker } = await import("./workers/webhookWorker.js");
        if (webhookWorker) {
          await webhookWorker.close();
          console.log("Webhook worker closed.");
        }

        const { analyticsWorker } = await import("./workers/analyticsWorker.js");
        if (analyticsWorker) {
          await analyticsWorker.close();
          console.log("Analytics worker closed.");
        }

        const { aiWorker } = await import("./workers/aiWorker.js");
        if (aiWorker) {
          await aiWorker.close();
          console.log("AI worker closed.");
        }

        const { billingWorker } = await import("./workers/billingWorker.js");
        if (billingWorker) {
          await billingWorker.close();
          console.log("Billing worker closed.");
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

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
