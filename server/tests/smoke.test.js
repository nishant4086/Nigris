/**
 * Post-fix smoke suite covering:
 *   1. API-key analytics endpoints (usage, summary, time-series, distribution, logs, export, alerts)
 *   2. Dynamic CRUD via public API (create, read, update, delete entries)
 *   3. Webhook CRUD (create, list, delete)
 *
 * Runs fully self-contained inside the Jest + MongoMemoryServer harness.
 */
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";

// ── helpers ──────────────────────────────────────────────

const seedPlans = async () => {
  await Plan.create({ name: "free", requestLimit: 100, price: 0 });
  await Plan.create({ name: "pro", requestLimit: 10000, price: 499 });
  await Plan.create({ name: "enterprise", requestLimit: 1000000, price: 1999 });
};

/**
 * Register → verify email → login → return { token, userId }
 */
const createVerifiedUser = async (overrides = {}) => {
  const name = overrides.name || "Smoke User";
  const email = overrides.email || "smoke@test.com";
  const password = overrides.password || "Password123";

  await request(app).post("/api/auth/signup").send({
    name,
    email,
    password,
    confirmPassword: password,
  });

  await User.updateOne({ email }, { emailVerified: true });

  const login = await request(app).post("/api/auth/login").send({ email, password });
  return { token: login.body.token, userId: login.body.user?.id };
};

// ── suite ────────────────────────────────────────────────

describe("Smoke suite", () => {
  let token;
  let projectId;
  let collectionId;
  let apiKeyId;
  let rawApiKey;

  beforeEach(async () => {
    await seedPlans();
    const user = await createVerifiedUser();
    token = user.token;

    // Create project
    const projRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Smoke Project", description: "test" });
    projectId = projRes.body._id;

    // Create collection with fields
    const colRes = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Smoke Items",
        projectId,
        fields: [
          { name: "title", type: "text" },
          { name: "price", type: "number" },
        ],
      });
    collectionId = colRes.body._id;

    // Create API key
    const keyRes = await request(app)
      .post("/api/keys")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Smoke Key", projectId, permissions: ["read", "write"] });
    apiKeyId = keyRes.body._id;
    rawApiKey = keyRes.body.key;
  });

  // ── 1. API-key analytics endpoints ────────────────────

  describe("API-key analytics", () => {
    test("GET /api/keys/usage returns array", async () => {
      const res = await request(app)
        .get("/api/keys/usage")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/keys/summary returns totals", async () => {
      const res = await request(app)
        .get("/api/keys/summary")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalLimit");
      expect(res.body).toHaveProperty("totalUsage");
      expect(res.body).toHaveProperty("remaining");
    });

    test("GET /api/keys/analytics/time-series returns array", async () => {
      const res = await request(app)
        .get("/api/keys/analytics/time-series?days=7")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/keys/analytics/distribution returns shape", async () => {
      const res = await request(app)
        .get("/api/keys/analytics/distribution?days=7")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("statusData");
      expect(res.body).toHaveProperty("endpointsData");
    });

    test("GET /api/keys/analytics/logs returns array", async () => {
      const res = await request(app)
        .get("/api/keys/analytics/logs")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/keys/analytics/export returns CSV or 404", async () => {
      const res = await request(app)
        .get("/api/keys/analytics/export?days=7")
        .set("Authorization", `Bearer ${token}`);
      // 200 with CSV or 404 if no data yet – both are valid
      expect([200, 404]).toContain(res.status);
    });

    test("GET /api/keys/alerts returns array", async () => {
      const res = await request(app)
        .get("/api/keys/alerts")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── 2. Dynamic CRUD via public API ────────────────────

  describe("Dynamic CRUD", () => {
    let slug;

    beforeEach(async () => {
      // Fetch the created collection to get its slug
      const cols = await request(app)
        .get(`/api/collections/${projectId}`)
        .set("Authorization", `Bearer ${token}`);
      slug = cols.body[0]?.slug;
    });

    test("POST + GET + PATCH + DELETE entry lifecycle", async () => {
      // CREATE
      const createRes = await request(app)
        .post(`/api/public/collections/${collectionId}/entries`)
        .set("x-api-key", rawApiKey)
        .send({ title: "Widget", price: 42 });
      expect(createRes.status).toBe(201);
      const entryId = createRes.body._id;
      expect(entryId).toBeTruthy();

      // READ
      const readRes = await request(app)
        .get(`/api/public/collections/${collectionId}/entries`)
        .set("x-api-key", rawApiKey);
      expect(readRes.status).toBe(200);
      expect(readRes.body.data?.length || readRes.body.length).toBeGreaterThanOrEqual(1);

      // UPDATE
      const patchRes = await request(app)
        .patch(`/api/public/entries/${entryId}`)
        .set("x-api-key", rawApiKey)
        .send({ price: 99 });
      expect(patchRes.status).toBe(200);

      // DELETE
      const delRes = await request(app)
        .delete(`/api/public/entries/${entryId}`)
        .set("x-api-key", rawApiKey);
      expect(delRes.status).toBe(200);
    });

    test("Missing API key returns 401", async () => {
      const res = await request(app).get(`/api/public/collections/${collectionId}/entries`);
      expect(res.status).toBe(401);
    });
  });

  // ── 3. Webhook CRUD ───────────────────────────────────

  describe("Webhooks", () => {
    test("POST + GET + DELETE webhook lifecycle", async () => {
      // CREATE
      const createRes = await request(app)
        .post("/api/webhooks")
        .set("x-api-key", rawApiKey)
        .send({ url: "https://example.com/hook", event: "entry.created" });
      expect(createRes.status).toBe(201);
      const webhookId = createRes.body._id;
      expect(webhookId).toBeTruthy();

      // LIST
      const listRes = await request(app)
        .get("/api/webhooks")
        .set("x-api-key", rawApiKey);
      expect(listRes.status).toBe(200);

      // DELETE
      const delRes = await request(app)
        .delete(`/api/webhooks/${webhookId}`)
        .set("x-api-key", rawApiKey);
      expect(delRes.status).toBe(200);
    });

    test("GET /api/webhooks/logs returns data", async () => {
      const res = await request(app)
        .get("/api/webhooks/logs")
        .set("x-api-key", rawApiKey);
      expect(res.status).toBe(200);
    });
  });

  // ── 4. Error response safety ──────────────────────────

  describe("Error response safety", () => {
    test("500 errors never include stack traces", async () => {
      // Trigger an error by sending invalid ObjectId
      const res = await request(app)
        .get("/api/keys/invalidObjectId/reveal")
        .set("Authorization", `Bearer ${token}`);

      // Should not contain stack trace fields
      expect(res.body.stack).toBeUndefined();
      expect(res.body.code).toBeUndefined();
      expect(res.body.name).toBeUndefined();
    });

    test("404 returns clean error", async () => {
      const res = await request(app).get("/api/nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Route not found");
    });
  });
});
