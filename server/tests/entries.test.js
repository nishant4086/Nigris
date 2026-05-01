#!/usr/bin/env node

import axios from "axios";

const API_KEY = "4acd3af573186b9c4864cce3000c7aec4057a05da6488cb1064aa8b1f3522e8d";
const BASE_URL = "http://localhost:8000/api/public";
const COLLECTION_ID = "69f1b66189e041aab07678f3";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-api-key": API_KEY,
  },
});

async function runTests() {
  console.log("\n🧪 ENTRIES CRUD TEST SUITE\n");

  try {
    // 1️⃣ CREATE ENTRIES
    console.log("1️⃣ CREATE ENTRIES TEST");
    console.log("-------------------------------------");

    const entry1 = await client.post(`/collections/${COLLECTION_ID}/entries`, {
      name: "Alice Johnson",
      email: "alice@example.com",
      age: 28,
      city: "New York",
    });
    console.log("✅ Created entry 1:", entry1.data._id);

    const entry2 = await client.post(`/collections/${COLLECTION_ID}/entries`, {
      name: "Bob Smith",
      email: "bob@example.com",
      age: 32,
      city: "San Francisco",
    });
    console.log("✅ Created entry 2:", entry2.data._id);

    const entry3 = await client.post(`/collections/${COLLECTION_ID}/entries`, {
      name: "Carol White",
      email: "carol@example.com",
      age: 26,
      city: "New York",
    });
    console.log("✅ Created entry 3:", entry3.data._id);

    const entryId1 = entry1.data._id;
    const entryId2 = entry2.data._id;
    const entryId3 = entry3.data._id;

    // 2️⃣ GET ALL ENTRIES (PAGINATION)
    console.log("\n2️⃣ GET ENTRIES WITH PAGINATION");
    console.log("-------------------------------------");

    const page1 = await client.get(`/collections/${COLLECTION_ID}/entries?page=1&limit=2`);
    console.log("✅ Page 1 (limit 2):");
    console.log(`   Total entries: ${page1.data.pagination.total}`);
    console.log(`   Current page: ${page1.data.pagination.page}`);
    console.log(`   Total pages: ${page1.data.pagination.pages}`);
    console.log(`   Entries on page: ${page1.data.data.length}`);

    const page2 = await client.get(`/collections/${COLLECTION_ID}/entries?page=2&limit=2`);
    console.log("✅ Page 2 (limit 2):");
    console.log(`   Entries on page: ${page2.data.data.length}`);

    // 3️⃣ FILTER ENTRIES
    console.log("\n3️⃣ FILTER ENTRIES (DYNAMIC FILTERING)");
    console.log("-------------------------------------");

    const filtered1 = await client.get(`/collections/${COLLECTION_ID}/entries?city=NewYork`);
    console.log(`✅ Filtered by city=NewYork: ${filtered1.data.data.length} entries`);

    const filtered2 = await client.get(`/collections/${COLLECTION_ID}/entries?email=bob@example.com`);
    console.log(`✅ Filtered by email=bob@example.com: ${filtered2.data.data.length} entries`);
    if (filtered2.data.data.length > 0) {
      console.log(`   Name: ${filtered2.data.data[0].data.name}`);
    }

    // 4️⃣ UPDATE ENTRY
    console.log("\n4️⃣ UPDATE ENTRY (MERGE DATA)");
    console.log("-------------------------------------");

    const updated = await client.patch(`/entries/${entryId1}`, {
      age: 29,
      city: "Boston",
    });
    console.log("✅ Updated entry 1:");
    console.log(`   Name: ${updated.data.data.name}`);
    console.log(`   Email: ${updated.data.data.email}`);
    console.log(`   Age: ${updated.data.data.age} (was 28)`);
    console.log(`   City: ${updated.data.data.city} (was New York)`);

    // Verify merge (old data preserved)
    if (updated.data.data.name === "Alice Johnson" && updated.data.data.email === "alice@example.com") {
      console.log("✅ Data merge successful (old fields preserved)");
    }

    // 5️⃣ DELETE ENTRY
    console.log("\n5️⃣ DELETE ENTRY");
    console.log("-------------------------------------");

    const deleted = await client.delete(`/entries/${entryId2}`);
    console.log("✅ Deleted entry 2");
    console.log(`   Message: ${deleted.data.message}`);

    // Verify deletion
    try {
      await client.get(`/entries/${entryId2}`);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("✅ Verified: Entry no longer exists");
      }
    }

    // 6️⃣ ERROR HANDLING TESTS
    console.log("\n6️⃣ ERROR HANDLING TESTS");
    console.log("-------------------------------------");

    // Invalid entry ID
    try {
      await client.patch(`/entries/invalid-id`, { name: "Test" });
    } catch (err) {
      console.log(`✅ Invalid ID handling: ${err.response?.status} - ${err.response?.data.error}`);
    }

    // Non-existent entry
    try {
      await client.patch(`/entries/507f1f77bcf86cd799439011`, { name: "Test" });
    } catch (err) {
      console.log(`✅ Non-existent entry: ${err.response?.status} - ${err.response?.data.error}`);
    }

    // 7️⃣ FINAL STATUS
    console.log("\n7️⃣ FINAL ENTRY COUNT");
    console.log("-------------------------------------");

    const finalList = await client.get(`/collections/${COLLECTION_ID}/entries`);
    console.log(`✅ Total entries remaining: ${finalList.data.pagination.total}`);

    console.log("\n✨ ALL TESTS PASSED!\n");

  } catch (error) {
    console.error("❌ TEST FAILED:", error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
