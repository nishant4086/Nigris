import assert from "node:assert/strict";
import Nigris, { createEntry, listEntries, updateEntry, deleteEntry } from "../src/index.js";

class MockNigris extends Nigris {
  constructor(apiKey) {
    super(apiKey);
    this.calls = [];
  }

  async request(config) {
    this.calls.push(config);

    if (config.method === "GET" && config.url === "/collections/collection-1/schema") {
      return {
        fields: [
          { name: "name", type: "text", required: true },
          { name: "age", type: "number", required: false },
          { name: "active", type: "boolean", required: false },
        ],
      };
    }

    if (config.method === "GET" && config.url === "/entries/entry-2") {
      return {
        _id: "entry-2",
        collectionId: "collection-1",
        data: { name: "Fallback" },
      };
    }

    if (config.method === "POST") {
      return {
        _id: "entry-1",
        collectionId: "collection-1",
        data: config.data,
      };
    }

    if (config.method === "PATCH") {
      return {
        _id: config.url.split("/").pop(),
        collectionId: "collection-1",
        data: config.data,
      };
    }

    if (config.method === "DELETE") {
      return { success: true };
    }

    return { ok: true, config };
  }
}

const run = async () => {
  const client = new MockNigris("test-key");

  await assert.rejects(() => createEntry(client, null, {}), /Invalid collectionId/);
  await assert.rejects(() => createEntry(client, "collection-1", null), /Data must be an object/);
  await assert.rejects(() => listEntries(client, 123), /Invalid collectionId/);
  await assert.rejects(() => updateEntry(client, null, {}), /Invalid entryId/);
  await assert.rejects(() => updateEntry(client, "entry-1", []), /Data must be an object/);
  await assert.rejects(() => deleteEntry(client, ""), /Invalid entryId/);

  const created = await client.create("collection-1", { name: "Alice", age: 28 });
  assert.equal(created._id, "entry-1");
  assert.equal(client.calls[0].method, "GET");
  assert.equal(client.calls[1].method, "POST");

  const secondCreated = await client.create("collection-1", { name: "Bob", active: true });
  assert.equal(secondCreated._id, "entry-1");
  assert.equal(client.calls[2].method, "POST");

  const listed = await client.list("collection-1", {
    page: 2,
    limit: 5,
    filters: { email: "alice@example.com" },
  });
  assert.equal(listed.ok, true);
  assert.equal(client.calls[3].method, "GET");
  assert.deepEqual(client.calls[3].params, {
    page: 2,
    limit: 5,
    email: "alice@example.com",
  });

  const updated = await client.update("entry-1", { active: true });
  assert.equal(updated._id, "entry-1");
  assert.equal(client.calls[4].method, "PATCH");

  const fallbackUpdated = await client.update("entry-2", { age: 31 });
  assert.equal(fallbackUpdated._id, "entry-2");
  assert.equal(client.calls[5].method, "GET");
  assert.equal(client.calls[6].method, "PATCH");

  const deleted = await client.delete("entry-1");
  assert.equal(deleted.success, true);
  assert.equal(client.calls[7].method, "DELETE");

  console.log("✅ Validation tests passed");
};

run().catch((error) => {
  console.error("❌ Validation tests failed:", error);
  process.exit(1);
});