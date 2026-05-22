import "dotenv/config";
import connectDB from "../config/db.js";
import SystemMetric from "../models/SystemMetric.js";
import { generateWeeklyReport } from "../modules/intelligence/reportGenerator.js";
import mongoose from "mongoose";

async function run() {
  try {
    await connectDB();
    console.log("==> Connected to MongoDB");

    // 1. Seed some SystemMetric records for the past week if needed or just add them
    const count = await SystemMetric.countDocuments();
    console.log(`==> Current SystemMetric count: ${count}`);

    console.log("==> Seeding SystemMetric records for the past 7 days...");
    const now = new Date();
    const metricsToInsert = [];

    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(now.getTime() - i * 12 * 60 * 60 * 1000); // every 12 hours
      metricsToInsert.push({
        timestamp,
        cpuUsage: Math.round((20 + Math.random() * 40) * 100) / 100,
        memoryUsage: Math.round((45 + Math.random() * 15) * 100) / 100,
        activeConnections: Math.floor(Math.random() * 20),
        avgLatencyMs: Math.round((50 + Math.random() * 100) * 100) / 100,
        errorCount: Math.floor(Math.random() * 5),
        requestCount: Math.floor(100 + Math.random() * 500),
      });
    }

    await SystemMetric.deleteMany({ timestamp: { $gte: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) } });
    await SystemMetric.insertMany(metricsToInsert);
    console.log("==> Successfully seeded SystemMetric records!");

    // 2. Trigger report generation
    console.log("==> Generating weekly report...");
    const report = await generateWeeklyReport();
    console.log("==> Weekly AI Report generated successfully!");
    console.log("Report ID:", report._id);
    console.log("Health Score:", report.healthScore);
    console.log("Critical Issues:", report.criticalIssues);
    console.log("Performance Insights:", report.performanceInsights);
    console.log("Recommendations:", report.recommendations);
    console.log("Predictions:", report.predictions);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error running report generation test:", error);
    process.exit(1);
  }
}

run();
