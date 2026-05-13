import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js";
import Project from "../models/Project.js";
import Plan from "../models/Plan.js";
import jwt from "jsonwebtoken";

describe("Production Security Audit", () => {
  let user;
  let token;
  let project;
  let apiKey1;
  let apiKey2;

  beforeEach(async () => {
    process.env.NODE_ENV = "production"; // Force production mode for error scrubbing tests
    await Plan.create({ name: "free", requestLimit: 10, price: 0 });
    user = await User.create({
      name: "Security User",
      email: "secure@test.com",
      password: "Password123",
      emailVerified: true
    });
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    project = await Project.create({ name: "Security Project", user: user._id });
    
    apiKey1 = await ApiKey.create({
      user: user._id,
      project: project._id,
      key: "key_one_123",
      limit: 10
    });
    
    apiKey2 = await ApiKey.create({
      user: user._id,
      project: project._id,
      key: "key_two_456",
      limit: 10
    });
  });

  describe("1. NoSQL Injection", () => {
    test("Should reject object-based email in login", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: { "$gt": "" }, password: "any" });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });

  describe("2. JWT Security", () => {
    test("Should reject tampered JWT payload", async () => {
      const parts = token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      payload.role = "admin";
      const tamperedToken = `${parts[0]}.${Buffer.from(JSON.stringify(payload)).toString("base64")}.${parts[2]}`;
      
      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${tamperedToken}`);
      
      expect(res.status).toBe(401);
    });

    test("Should reject 'none' algorithm", async () => {
      const parts = token.split(".");
      const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
      header.alg = "none";
      const insecureToken = `${Buffer.from(JSON.stringify(header)).toString("base64")}.${parts[1]}.`;
      
      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${insecureToken}`);
      
      expect(res.status).toBe(401);
    });
  });

  describe("3. Information Disclosure", () => {
    test("Should scrub stack traces in production mode", async () => {
      // Trigger a malformed JSON error
      const res = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send('{"email": "test@test.com", "password": "abc"'); // Missing closing brace
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Malformed JSON payload");
      expect(res.body.stack).toBeUndefined();
    });
  });

  describe("4. Rate Limit Isolation", () => {
    test("Keys should have independent quotas", async () => {
      // Exhaust key1's per-key quota (limit: 10)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get("/api/public/collections")
          .set("x-api-key", "key_one_123");
      }

      // key1 should now be 429 (quota exhausted)
      const res1 = await request(app)
        .get("/api/public/collections")
        .set("x-api-key", "key_one_123");

      // key2 should still work independently
      const res2 = await request(app)
        .get("/api/public/collections")
        .set("x-api-key", "key_two_456");

      expect(res1.status).toBe(429);
      expect(res2.status).toBe(200);
    });
  });

  describe("5. Payload Depth Protection", () => {
    test("Should block deeply nested objects", async () => {
      const deepObject = {};
      let current = deepObject;
      for (let i = 0; i < 10; i++) {
        current.a = {};
        current = current.a;
      }
      
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send(deepObject);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("depth");
    });
  });
});
