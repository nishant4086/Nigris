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

  console.log("\n🧪 NIGRIS SDK CRUD EXAMPLE\n");

  // 1️⃣ CREATE ENTRIES
  console.log("1️⃣ CREATE ENTRIES");
  console.log("-------------------------------------");
  const created1 = await client.create(COLLECTION_ID, {
    name: "Alice Johnson",
    email: "alice@example.com",
    age: 28,
  });
  const entryId1 = created1._id;
  console.log(`✅ Created entry: ${entryId1}`);
  console.log(`   Name: ${created1.data.name}`);

  const created2 = await client.create(COLLECTION_ID, {
    name: "Bob Smith",
    email: "bob@example.com",
    age: 32,
  });
  const entryId2 = created2._id;
  console.log(`✅ Created entry: ${entryId2}`);

  // 2️⃣ LIST WITH PAGINATION
  console.log("\n2️⃣ LIST WITH PAGINATION");
  console.log("-------------------------------------");
  const page1 = await client.list(COLLECTION_ID, {
    page: 1,
    limit: 10,
  });
  console.log(`✅ Total entries: ${page1.pagination.total}`);
  console.log(`   Page: ${page1.pagination.page}/${page1.pagination.pages}`);
  console.log(`   Showing: ${page1.data.length} entries`);

  // 3️⃣ LIST WITH FILTERING
  console.log("\n3️⃣ LIST WITH FILTERING");
  console.log("-------------------------------------");
  const filtered = await client.list(COLLECTION_ID, {
    filters: {
      email: "alice@example.com",
    },
  });
  console.log(`✅ Filtered by email=alice@example.com: ${filtered.data.length} entries`);
  if (filtered.data.length > 0) {
    console.log(`   Name: ${filtered.data[0].data.name}`);
    console.log(`   Age: ${filtered.data[0].data.age}`);
  }

  // 4️⃣ UPDATE ENTRY
  console.log("\n4️⃣ UPDATE ENTRY (DATA MERGE)");
  console.log("-------------------------------------");
  const updated = await client.entries.update(entryId1, {
    age: 29,
    city: "Boston",
  });
  console.log(`✅ Updated entry ${entryId1}`);
  console.log(`   Name: ${updated.data.name} (preserved)`);
  console.log(`   Age: ${updated.data.age} (updated to 29)`);
  console.log(`   City: ${updated.data.city} (added)`);

  // 5️⃣ DELETE ENTRY
  console.log("\n5️⃣ DELETE ENTRY");
  console.log("-------------------------------------");
  const deleted = await client.entries.delete(entryId2);
  console.log(`✅ ${deleted.message}`);
  console.log(`   Entry ID: ${entryId2}`);

  // 6️⃣ VERIFY DELETION
  console.log("\n6️⃣ VERIFY FINAL STATE");
  console.log("-------------------------------------");
  const final = await client.list(COLLECTION_ID);
  console.log(`✅ Final entry count: ${final.pagination.total}`);

  console.log("\n✨ ALL OPERATIONS COMPLETED SUCCESSFULLY!\n");
}

main().catch((error) => {
  console.error("❌ Example failed:", error.message);
  process.exit(1);
});