import axios from "axios";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:8000/api";

async function runTests() {
  await connectDB();

  // Create test user and project
  const email1 = "rl1@test.com";
  await User.deleteMany({ email: email1 });

  let jwt1, proj1, key1, colSlug1;
  const res1 = await axios.post(`${BASE_URL}/auth/register`, { name: "RL User", email: email1, password: "Password123!" });
  jwt1 = res1.data.token;
  const authConf = { headers: { Authorization: `Bearer ${jwt1}` } };
  
  const res2 = await axios.post(`${BASE_URL}/projects`, { name: "RL Project" }, authConf);
  proj1 = res2.data._id;
  
  const res3 = await axios.post(`${BASE_URL}/collections`, { name: "RL Col", projectId: proj1, fields: [{ name: "price", type: "number" }] }, authConf);
  colSlug1 = res3.data.slug;
  
  const res4 = await axios.post(`${BASE_URL}/keys`, { name: "RL Key", projectId: proj1 }, authConf);
  key1 = res4.data.key;

  const keyConf = { headers: { "x-api-key": key1 } };

  console.log("Setup complete. Starting rate limit test...");

  // Send 120 requests to GET /collections/:id/entries (limit is 100)
  let successful = 0;
  let limited = 0;
  let lastHeaders = {};

  for (let i = 1; i <= 120; i++) {
    try {
      const resp = await axios.get(`${BASE_URL}/public/collections/${colSlug1}/entries`, keyConf);
      successful++;
      lastHeaders = resp.headers;
      if (successful === 50) console.log("Success Headers at 50:", resp.headers);
    } catch (err) {
      if (err.response?.status === 429) {
        limited++;
        lastHeaders = err.response.headers;
        if (limited === 1) console.log("First 429 Error Data:", err.response.data);
      }
    }
  }

  console.log(`Sent 120 requests. Successful: ${successful}, Limited (429): ${limited}`);
  console.log("Last Headers:", {
    "X-RateLimit-Limit": lastHeaders["x-ratelimit-limit"],
    "X-RateLimit-Remaining": lastHeaders["x-ratelimit-remaining"]
  });

  if (successful === 100 && limited === 20) {
    console.log("[PASS] Strict per-route rate limiting works accurately.");
  } else {
    console.log("[FAIL] Rate limit counts are wrong.");
  }

  process.exit(0);
}

runTests();
