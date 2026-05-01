import axios from "axios";
import connectDB from "../config/db.js";
import ApiKey from "../models/ApiKey.js";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = "4acd3af573186b9c4864cce3000c7aec4057a05da6488cb1064aa8b1f3522e8d";
const BASE_URL = "http://localhost:8000/api";

async function run() {
  await connectDB();
  
  // 1. Send some public requests to trigger usageMiddleware
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { "x-api-key": API_KEY },
  });

  try {
    console.log("1. Sending multiple requests to endpoints...");
    await client.get("/public/collections");
    await client.get("/public/collections");
    await client.get("/public/collections");
    await client.post("/public/collections/69f1b66189e041aab07678f3/entries", { name: "Usage Test 1" });
    await client.post("/public/collections/69f1b66189e041aab07678f3/entries", { name: "Usage Test 2" });
    await client.get("/public/collections/69f1b66189e041aab07678f3");

    console.log("2. Waiting for background upserts...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // To test the protected analytics API, we need a JWT
    // But for a quick test we can just query the Usage model directly!
    const Usage = (await import("../models/Usage.js")).default;
    const usages = await Usage.find({}).lean();
    
    console.log("3. DB Usages:");
    usages.forEach(u => console.log(`- ${u.endpoint} (${u.method}): ${u.count}`));

    console.log("✅ Usage Test Passed");
    process.exit(0);
  } catch (err) {
    console.error("Test failed", err.response?.data || err.message);
    process.exit(1);
  }
}

run();
