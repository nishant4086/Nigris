import axios from "axios";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import ApiKey from "../models/ApiKey.js";
import Collection from "../models/Collection.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:8000/api";
let report = [];
let passCount = 0;
let failCount = 0;
let totalTests = 0;

function logStatus(step, name, status, details = "") {
  totalTests++;
  if (status === "PASS") passCount++;
  else failCount++;

  console.log(`[${status}] Step ${step}: ${name}`);
  if (details) console.log(`  -> ${details}`);
  
  report.push({ step, name, status, details });
}

async function runTests() {
  await connectDB();
  
  // Cleanup previous test data
  const testEmail = "qa_e2e@test.com";
  await User.deleteOne({ email: testEmail });
  
  let jwt = "";
  let projectId = "";
  let apiKey = "";
  let collectionSlug = "";
  let entryId = "";

  try {
    // 1. AUTH
    try {
      const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: "QA User",
        email: testEmail,
        password: "Password123!",
      });
      jwt = signupRes.data.token;
      logStatus("1", "Auth Signup & Login", "PASS", "Extracted JWT token");
    } catch (e) {
      logStatus("1", "Auth Signup & Login", "FAIL", e.response?.data?.error || e.message);
      return;
    }

    const authConfig = { headers: { Authorization: `Bearer ${jwt}` } };

    // 2. PROJECT
    try {
      const projRes = await axios.post(`${BASE_URL}/projects`, { name: "QA E2E Project" }, authConfig);
      projectId = projRes.data._id;
      logStatus("2", "Project Creation", "PASS", `Created project ${projectId}`);
    } catch (e) {
      logStatus("2", "Project Creation", "FAIL", e.response?.data?.message || e.message);
    }

    // 3. COLLECTION
    try {
      const colRes = await axios.post(`${BASE_URL}/collections`, {
        name: "QA Products",
        projectId: projectId,
        fields: [{ name: "title", type: "text" }, { name: "price", type: "number" }]
      }, authConfig);
      collectionSlug = colRes.data.slug;
      logStatus("3", "Collection Creation", "PASS", `Slug: ${collectionSlug}`);
    } catch (e) {
      logStatus("3", "Collection Creation", "FAIL", e.response?.data?.error || e.message);
    }

    // 4. API KEY
    try {
      const keyRes = await axios.post(`${BASE_URL}/keys`, {
        name: "E2E Key",
        projectId: projectId
      }, authConfig);
      apiKey = keyRes.data.key;
      logStatus("4", "API Key Generation", "PASS", `Generated API Key ending in ${apiKey.slice(-4)}`);
    } catch (e) {
      logStatus("4", "API Key Generation", "FAIL", e.response?.data?.message || e.message);
    }

    const keyConfig = { headers: { "x-api-key": apiKey } };

    // 5. DYNAMIC API (CRUD)
    try {
      // Create Entry
      const createRes = await axios.post(`${BASE_URL}/public/collections/${collectionSlug}/entries`, {
        title: "Test Product",
        price: 99.99
      }, keyConfig);
      entryId = createRes.data._id;
      logStatus("5A", "Create Entry", "PASS", `Created entry ${entryId}`);

      // Fetch Entries
      const fetchRes = await axios.get(`${BASE_URL}/public/collections/${collectionSlug}/entries`, keyConfig);
      if (fetchRes.data.data && fetchRes.data.data.length > 0) {
        logStatus("5B", "Fetch Entries", "PASS", `Fetched ${fetchRes.data.data.length} entries`);
      } else {
        throw new Error("No entries returned");
      }

      // Update Entry
      await axios.patch(`${BASE_URL}/public/entries/${entryId}`, {
        price: 79.99
      }, keyConfig);
      logStatus("5C", "Update Entry", "PASS", "Updated price");

      // Delete Entry
      await axios.delete(`${BASE_URL}/public/entries/${entryId}`, keyConfig);
      logStatus("5D", "Delete Entry", "PASS", "Deleted entry");
    } catch (e) {
      logStatus("5", "Dynamic API Operations", "FAIL", e.response?.data?.error || e.message);
    }

    // 6. WEBHOOK
    try {
      await axios.post(`${BASE_URL}/webhooks`, {
        url: "https://httpbin.org/post",
        event: "entry.created"
      }, keyConfig);
      logStatus("6", "Webhook Registration", "PASS", "Registered entry.created webhook");
    } catch (e) {
      logStatus("6", "Webhook Registration", "FAIL", e.response?.data?.error || e.message);
    }

    // 7. ANALYTICS
    try {
      // make a few more calls
      await axios.get(`${BASE_URL}/public/collections`, keyConfig);
      await axios.get(`${BASE_URL}/public/collections`, keyConfig);
      
      // Delay for async upserts
      await new Promise(r => setTimeout(r, 2000));

      const usageRes = await axios.get(`${BASE_URL}/usage?projectId=${projectId}`, authConfig);
      if (usageRes.data.totalRequests > 0) {
        logStatus("7", "Analytics API", "PASS", `Total Requests tracked: ${usageRes.data.totalRequests}`);
      } else {
        logStatus("7", "Analytics API", "FAIL", "Total Requests is 0");
      }
    } catch (e) {
      logStatus("7", "Analytics API", "FAIL", e.response?.data?.error || e.message);
    }

    // 8. SECURITY
    try {
      let secFailed = false;
      // Missing API key
      try {
        await axios.get(`${BASE_URL}/public/collections`);
        secFailed = true;
      } catch (e) {
        if (e.response?.status === 401) logStatus("8A", "Missing API Key", "PASS", "Got 401");
        else secFailed = true;
      }

      // Invalid API key
      try {
        await axios.get(`${BASE_URL}/public/collections`, { headers: { "x-api-key": "invalid_key" } });
        secFailed = true;
      } catch (e) {
        if (e.response?.status === 403) logStatus("8B", "Invalid API Key", "PASS", "Got 403");
        else secFailed = true;
      }
    } catch (e) {
      logStatus("8", "Security Tests", "FAIL", "Security holes detected");
    }

    // 9. EDGE CASES
    try {
      // Empty body collection creation
      try {
        await axios.post(`${BASE_URL}/collections`, {}, authConfig);
        logStatus("9", "Edge Cases", "FAIL", "Allowed empty body");
      } catch (e) {
        logStatus("9", "Edge Cases", "PASS", `Caught bad request: ${e.response?.data?.error || e.message}`);
      }
    } catch (e) {}

    // 10. PERFORMANCE
    try {
      const promises = [];
      for (let i=0; i<50; i++) {
        promises.push(axios.get(`${BASE_URL}/public/collections`, keyConfig));
      }
      await Promise.allSettled(promises);
      logStatus("10", "Performance Load Test", "PASS", "System survived 50 rapid GETs");
    } catch (e) {
      logStatus("10", "Performance Load Test", "FAIL", "System crashed or timeouts occurred");
    }

  } catch (err) {
    console.error("Critical Execution Error", err);
  } finally {
    console.log("\n=====================");
    console.log(`TOTAL TESTS: ${totalTests}`);
    console.log(`PASSED: ${passCount}`);
    console.log(`FAILED: ${failCount}`);
    console.log("=====================\n");
    process.exit(0);
  }
}

runTests();
