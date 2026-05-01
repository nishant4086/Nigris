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
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1); // Optional: in a real environment you might attempt a graceful shutdown first
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();