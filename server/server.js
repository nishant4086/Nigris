import app from "./app.js";
import connectDB from "./config/db.js";
import "./workers/webhookWorker.js";

const PORT = process.env.PORT || 8000;

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