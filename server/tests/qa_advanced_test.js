import axios from "axios";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import WebhookLog from "../models/WebhookLog.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:8000/api";
let report = [];

function logVuln(id, name, severity, response, finding) {
  console.log(`\n[${severity}] Test ${id}: ${name}`);
  console.log(`  -> Finding: ${finding}`);
  report.push({ id, name, severity, response: response?.toString()?.substring(0, 100), finding });
}

async function runAdvancedTests() {
  await connectDB();

  // Setup User 1 & User 2
  const email1 = "adv1@test.com";
  const email2 = "adv2@test.com";
  await User.deleteMany({ email: { $in: [email1, email2] } });

  let jwt1, proj1, key1, colSlug1, entryId1;
  let jwt2, proj2, key2;

  // USER 1 Setup
  let res = await axios.post(`${BASE_URL}/auth/register`, { name: "User 1", email: email1, password: "Password123!" });
  jwt1 = res.data.token;
  res = await axios.post(`${BASE_URL}/projects`, { name: "Project 1" }, { headers: { Authorization: `Bearer ${jwt1}` } });
  proj1 = res.data._id;
  res = await axios.post(`${BASE_URL}/collections`, { name: "Collection 1", projectId: proj1, fields: [{ name: "price", type: "number" }] }, { headers: { Authorization: `Bearer ${jwt1}` } });
  colSlug1 = res.data.slug;
  res = await axios.post(`${BASE_URL}/keys`, { name: "Key 1", projectId: proj1 }, { headers: { Authorization: `Bearer ${jwt1}` } });
  key1 = res.data.key;

  // USER 2 Setup
  res = await axios.post(`${BASE_URL}/auth/register`, { name: "User 2", email: email2, password: "Password123!" });
  jwt2 = res.data.token;
  res = await axios.post(`${BASE_URL}/projects`, { name: "Project 2" }, { headers: { Authorization: `Bearer ${jwt2}` } });
  proj2 = res.data._id;
  res = await axios.post(`${BASE_URL}/keys`, { name: "Key 2", projectId: proj2 }, { headers: { Authorization: `Bearer ${jwt2}` } });
  key2 = res.data.key;

  const conf1 = { headers: { "x-api-key": key1 } };
  const conf2 = { headers: { "x-api-key": key2 } };

  // 1. NoSQL Injection
  try {
    const qRes = await axios.get(`${BASE_URL}/public/collections/${colSlug1}/entries?price[$gt]=0`, conf1);
    if (qRes.data.data) {
      logVuln("1A", "NoSQL Injection (Query Params)", "High", qRes.status, "MongoDB operators accepted in query params! Filter payload passed directly.");
    }
  } catch (e) {
    logVuln("1A", "NoSQL Injection (Query Params)", "Low", e.response?.status, "Blocked or sanitized");
  }

  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: { $ne: null }, password: "123" });
    logVuln("1B", "NoSQL Injection (Body)", "High", 200, "Successfully logged in with $ne payload!");
  } catch (e) {
    logVuln("1B", "NoSQL Injection (Body)", "Low", e.response?.status, "Login blocked invalid payload types");
  }

  // 2. Malformed JSON
  try {
    await axios.post(`${BASE_URL}/public/collections/${colSlug1}/entries`, "{\"title\": \"broken\"", {
      headers: { "x-api-key": key1, "Content-Type": "application/json" }
    });
    logVuln("2", "Malformed JSON", "High", 200, "Server accepted malformed JSON without crashing? (Unlikely)");
  } catch (e) {
    logVuln("2", "Malformed JSON", "Low", e.response?.status, "Caught JSON parse error safely (400)");
  }

  // 3. Deeply nested objects
  try {
    const deepObj = { level1: { level2: { level3: { level4: { level5: { level6: "deep" } } } } } };
    const createRes = await axios.post(`${BASE_URL}/public/collections/${colSlug1}/entries`, deepObj, conf1);
    entryId1 = createRes.data._id;
    logVuln("3", "Deeply Nested Objects", "Medium", createRes.status, "Allowed 6-level deep object into unstructured 'data' field. Potential risk for document size bloat.");
  } catch (e) {
    logVuln("3", "Deeply Nested Objects", "Low", e.response?.status, "Blocked deep nesting");
  }

  // 4, 5, 8. 200+ Rapid requests & Analytics concurrency & Parallel key usage
  try {
    const promises = [];
    for (let i = 0; i < 200; i++) {
      promises.push(axios.get(`${BASE_URL}/public/collections/${colSlug1}/entries`, conf1));
    }
    const results = await Promise.allSettled(promises);
    const successes = results.filter(r => r.status === "fulfilled").length;
    const rateLimits = results.filter(r => r.status === "rejected" && r.reason.response?.status === 429).length;
    
    // Wait for analytics async
    await new Promise(r => setTimeout(r, 2000));
    const usageRes = await axios.get(`${BASE_URL}/usage?projectId=${proj1}`, { headers: { Authorization: `Bearer ${jwt1}` } });
    
    logVuln("4-5-8", "Concurrency, Limits, and Analytics Tracking", "Low", null, 
      `200 concurrent requests fired. ${successes} succeeded. ${rateLimits} got 429 Rate Limited. Analytics tracked ${usageRes.data.totalRequests} requests.`
    );
    
    if (successes > 150) { // Limit is usually 100
      logVuln("4", "Rate Limiter Validation", "Medium", null, `Rate limiter allowed too many requests: ${successes}`);
    }
  } catch (e) {
    console.error(e);
  }

  // 6. Expired / Altered JWT
  try {
    const alteredJwt = jwt1.slice(0, -5) + "abcde";
    await axios.get(`${BASE_URL}/projects`, { headers: { Authorization: `Bearer ${alteredJwt}` } });
    logVuln("6", "Altered JWT", "Critical", 200, "Accepted an altered JWT signature!");
  } catch (e) {
    logVuln("6", "Altered JWT", "Low", e.response?.status, "Correctly rejected altered JWT signature");
  }

  // 7. Trigger webhook failures using invalid URL
  try {
    await axios.post(`${BASE_URL}/webhooks`, { url: "http://this-url-definitely-does-not-exist.local/hook", event: "entry.created" }, conf1);
    await axios.post(`${BASE_URL}/public/collections/${colSlug1}/entries`, { title: "Trigger Hook" }, conf1);
    
    // Wait for BullMQ worker to fail and log
    await new Promise(r => setTimeout(r, 3000));
    
    const failedLog = await WebhookLog.findOne({ project: proj1, status: "failed" });
    if (failedLog) {
      logVuln("7", "Webhook Failures", "Low", failedLog.status, "Gracefully handled failed webhook and logged error: " + failedLog.errorMessage);
    } else {
      logVuln("7", "Webhook Failures", "Medium", null, "Failed webhook did not create a failure log entry.");
    }
  } catch (e) {
    logVuln("7", "Webhook Failures", "Low", e.response?.status, "Error in webhook setup");
  }

  // 9. Unauthorized access using valid but unrelated API keys
  try {
    // User 2 Key tries to access User 1 Collection
    await axios.get(`${BASE_URL}/public/collections/${colSlug1}/entries`, conf2);
    logVuln("9", "Cross-Tenant Access", "Critical", 200, "User 2 key could access User 1 collection!");
  } catch (e) {
    logVuln("9", "Cross-Tenant Access", "Low", e.response?.status, "Correctly isolated tenants (404/403)");
  }

  // 10. Large payloads (1MB+)
  try {
    const hugeString = "a".repeat(2 * 1024 * 1024); // 2MB
    await axios.post(`${BASE_URL}/public/collections/${colSlug1}/entries`, { data: hugeString }, conf1);
    logVuln("10", "Large Payloads (2MB)", "Medium", 201, "Allowed 2MB payload. If intentional, limit='10mb' is working, but could cause DB strain.");
  } catch (e) {
    if (e.response?.status === 413) {
      logVuln("10", "Large Payloads", "Low", 413, "Correctly rejected large payload");
    } else {
      logVuln("10", "Large Payloads", "Medium", e.response?.status, "Failed for other reason");
    }
  }

  console.log("\nAdvanced Testing Complete.");
  process.exit(0);
}

runAdvancedTests();
