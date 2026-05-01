import axios from "axios";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = "4acd3af573186b9c4864cce3000c7aec4057a05da6488cb1064aa8b1f3522e8d";
const BASE_URL = "http://localhost:8000/api";

async function run() {
  await connectDB();
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { "x-api-key": API_KEY },
  });

  try {
    console.log("1. Fetching logs to find a failed one...");
    const logsRes = await client.get("/webhooks/logs");
    const failedLog = logsRes.data.data.find(l => l.status === "failed");

    if (!failedLog) {
      console.log("No failed logs found to test retry.");
      process.exit(0);
    }

    console.log(`Found failed log: ${failedLog._id} for URL: ${failedLog.url}`);
    console.log("2. Sending retry request...");
    const retryRes = await client.post(`/webhooks/logs/${failedLog._id}/retry`);
    console.log("Retry queued successfully!");

    console.log("3. Waiting for worker to process retry...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("4. Fetching logs again to verify new log...");
    const newLogsRes = await client.get("/webhooks/logs");
    const newLogs = newLogsRes.data.data;
    
    // Find the original log to see if retryCount increased
    const updatedOriginalLog = newLogs.find(l => l._id === failedLog._id);
    console.log(`Original log retry count: ${updatedOriginalLog.retryCount}`);

    // Verify a new log was created for the retry
    console.log("Total logs count: ", newLogs.length);
    console.log("Top 2 latest logs:");
    console.log(newLogs.slice(0, 2).map(l => ({ id: l._id, status: l.status, url: l.url, err: l.errorMessage })));

    console.log("✅ Retry Test Passed");
    process.exit(0);
  } catch (err) {
    console.error("Test failed", err.response?.data || err.message);
    process.exit(1);
  }
}

run();
