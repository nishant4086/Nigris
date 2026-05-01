import axios from "axios";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import ApiKey from "../models/ApiKey.js";
import Webhook from "../models/Webhook.js";
import WebhookLog from "../models/WebhookLog.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = "4acd3af573186b9c4864cce3000c7aec4057a05da6488cb1064aa8b1f3522e8d";
const BASE_URL = "http://localhost:8000/api";
const COLLECTION_ID = "69f1b66189e041aab07678f3";

async function run() {
  await connectDB();
  console.log("Connected to DB");

  // Get project from API key
  const apiKey = await ApiKey.findOne({ key: API_KEY });
  const projectId = apiKey.project;

  // Cleanup old webhooks and logs
  await Webhook.deleteMany({ project: projectId });
  await WebhookLog.deleteMany({ project: projectId });

  const client = axios.create({
    baseURL: BASE_URL,
    headers: { "x-api-key": API_KEY },
  });

  try {
    console.log("1. Creating webhook...");
    const hookRes = await client.post("/webhooks", {
      url: "https://httpbin.org/post",
      event: "entry.created"
    });
    console.log("Webhook created:", hookRes.data._id);

    console.log("2. Creating entry...");
    const entryRes = await client.post(`/public/collections/${COLLECTION_ID}/entries`, {
      name: "Webhook Test",
      email: "test@hook.com",
    });
    console.log("Entry created:", entryRes.data._id);

    console.log("3. Waiting for worker to process job...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("4. Fetching logs...");
    const logsRes = await client.get("/webhooks/logs");
    console.log("Logs:", logsRes.data.data.map(l => ({ url: l.url, status: l.status, code: l.responseCode })));

    console.log("5. Testing failure...");
    await client.post("/webhooks", {
      url: "https://httpbin.org/status/500",
      event: "entry.created"
    });

    console.log("Creating another entry...");
    await client.post(`/public/collections/${COLLECTION_ID}/entries`, {
      name: "Failure Test",
    });

    console.log("Waiting for worker...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newLogsRes = await client.get("/webhooks/logs");
    console.log("New Logs:", newLogsRes.data.data.map(l => ({ url: l.url, status: l.status, err: l.errorMessage })));

    console.log("✅ End to End Test Passed");
    process.exit(0);
  } catch (err) {
    console.error("Test failed", err.response?.data || err.message);
    process.exit(1);
  }
}

run();
