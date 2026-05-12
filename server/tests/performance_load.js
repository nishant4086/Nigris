import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";
const CONCURRENCY = 20;
const TOTAL_REQUESTS = 100;

async function runLoadTest() {
  console.log(`\n🚀 Starting Performance Load Test (${CONCURRENCY} concurrent, ${TOTAL_REQUESTS} total)...\n`);

  const startTime = Date.now();
  let completed = 0;
  let failed = 0;
  let totalTime = 0;

  const makeRequest = async () => {
    const start = Date.now();
    try {
      await axios.get(`${BASE_URL}/health`);
      const end = Date.now();
      totalTime += (end - start);
      completed++;
    } catch (err) {
      failed++;
    }
  };

  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENCY);
  for (let i = 0; i < batches; i++) {
    const batchPromises = [];
    for (let j = 0; j < CONCURRENCY; j++) {
      if (completed + failed < TOTAL_REQUESTS) {
        batchPromises.push(makeRequest());
      }
    }
    await Promise.all(batchPromises);
    process.stdout.write(`Progress: ${completed + failed}/${TOTAL_REQUESTS}...\r`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const avgLatency = completed > 0 ? (totalTime / completed).toFixed(2) : 0;
  const rps = (completed / duration).toFixed(2);

  console.log("\n\n=====================");
  console.log("LOAD TEST COMPLETE");
  console.log(`Duration: ${duration}s`);
  console.log(`Throughput: ${rps} req/s`);
  console.log(`Avg Latency: ${avgLatency}ms`);
  console.log(`Success: ${completed}`);
  console.log(`Failures: ${failed}`);
  console.log("=====================\n");

  if (failed > 0) {
    console.error("❌ FAIL: Load test encountered errors.");
    process.exit(1);
  } else if (avgLatency > 200) {
    console.warn("⚠️ WARNING: Average latency is high (> 200ms).");
  } else {
    console.log("✅ PASS: Performance within acceptable limits.");
  }
}

runLoadTest();
