import Nigris from "./src/index.js";

const API_KEY = process.env.NIGRIS_API_KEY;
const COLLECTION_ID = process.env.NIGRIS_COLLECTION_ID;

if (!API_KEY || !COLLECTION_ID) {
  throw new Error("Set NIGRIS_API_KEY and NIGRIS_COLLECTION_ID before running the example");
}

async function main() {
  const client = new Nigris(API_KEY, {
    baseURL: process.env.NIGRIS_BASE_URL || "http://localhost:8000/api/public",
    timeout: 15000,
  });

  const created = await client.create(COLLECTION_ID, {
    name: "Rahul",
    email: "rahul@gmail.com",
    message: "Hello from test",
  });

  console.log("Created entry:", created);

  const entries = await client.list(COLLECTION_ID);
  console.log("Entries:", entries);
}

main().catch((error) => {
  console.error("Example failed:", error.message);
  process.exit(1);
});