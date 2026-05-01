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
  const email1 = "usage1@test.com";
  await User.deleteMany({ email: email1 });
  try {
    await mongoose.connection.collection("usages").drop();
  } catch(e) {}

  let jwt1, proj1, key1, colSlug1;
  const res1 = await axios.post(`${BASE_URL}/auth/register`, { name: "Usage User", email: email1, password: "Password123!" });
  jwt1 = res1.data.token;
  const authConf = { headers: { Authorization: `Bearer ${jwt1}` } };
  
  const res2 = await axios.post(`${BASE_URL}/projects`, { name: "Usage Project" }, authConf);
  proj1 = res2.data._id;
  
  const res3 = await axios.post(`${BASE_URL}/collections`, { name: "Usage Col", projectId: proj1, fields: [{ name: "price", type: "number" }] }, authConf);
  colSlug1 = res3.data.slug;
  
  const res4 = await axios.post(`${BASE_URL}/keys`, { name: "Usage Key", projectId: proj1 }, authConf);
  key1 = res4.data.key;

  const keyConf = { headers: { "x-api-key": key1 } };

  console.log("Setup complete. Generating usage...");

  // Send 10 successful requests
  for (let i = 0; i < 10; i++) {
    await axios.get(`${BASE_URL}/public/collections/${colSlug1}/entries`, keyConf);
  }

  // Send 5 error requests (invalid ID)
  for (let i = 0; i < 5; i++) {
    try {
      await axios.get(`${BASE_URL}/public/entries/invalid123`, keyConf);
    } catch(e) {}
  }

  // Wait for async usage tracking
  await new Promise(r => setTimeout(r, 2000));

  console.log("Fetching summary...");
  const sumRes = await axios.get(`${BASE_URL}/usage/summary?projectId=${proj1}`, authConf);
  console.log("Summary:", sumRes.data);

  console.log("Fetching timeseries...");
  const timeRes = await axios.get(`${BASE_URL}/usage/timeseries?projectId=${proj1}&groupBy=hour`, authConf);
  console.log("Timeseries:", timeRes.data);

  console.log("Fetching top endpoints...");
  const topRes = await axios.get(`${BASE_URL}/usage/top-endpoints?projectId=${proj1}`, authConf);
  console.log("Top Endpoints:", topRes.data);

  if (sumRes.data.totalRequests === 15 && sumRes.data.successCount === 10 && sumRes.data.errorCount === 5) {
    console.log("[PASS] Analytics accuracy confirmed.");
  } else {
    console.log("[FAIL] Analytics counts do not match expected.");
  }

  process.exit(0);
}

runTests();
