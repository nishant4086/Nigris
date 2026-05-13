import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Collection from "../models/Collection.js";
import ApiKey from "../models/ApiKey.js";
import Plan from "../models/Plan.js";
import jwt from "jsonwebtoken";

describe("Dynamic Engine - Validation & Edge Cases", () => {
  let user;
  let token;
  let project;
  let apiKey;
  let collection;

  beforeEach(async () => {
    await Plan.create({ name: "free", requestLimit: 100, price: 0 });
    user = await User.create({ name: "QA", email: "qa@val.com", password: "Password123" });
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    project = await Project.create({ name: "Test Proj", user: user._id });
    
    collection = await Collection.create({
      name: "Products",
      slug: "products",
      project: project._id,
      createdBy: user._id,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "price", type: "number" },
        { name: "description", type: "text" }
      ]
    });

    apiKey = await ApiKey.create({
      user: user._id,
      project: project._id,
      key: "test_val_key_dynamic",
      isActive: true,
      permissions: ["read", "write"]
    });
  });

  test("Should fail if required field is missing", async () => {
    const res = await request(app)
      .post(`/api/public/collections/${collection.slug}/entries`)
      .set("x-api-key", "test_val_key_dynamic")
      .send({ price: 10 });

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toContain("required");
  });

  test("Should fail if type mismatch (number vs text)", async () => {
    const res = await request(app)
      .post(`/api/public/collections/${collection.slug}/entries`)
      .set("x-api-key", "test_val_key_dynamic")
      .send({ title: "Product", price: "expensive" });

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toContain("number");
  });

  test("Should block deeply nested objects (depth limit)", async () => {
    const nested = { a: { b: { c: { d: { e: 1 } } } } };
    const res = await request(app)
      .post(`/api/public/collections/${collection.slug}/entries`)
      .set("x-api-key", "test_val_key_dynamic")
      .send({ title: "Bad", ...nested });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("depth");
  });

  test("Should handle large string payloads (memory safety check)", async () => {
    const res = await request(app)
      .post(`/api/public/collections/${collection.slug}/entries`)
      .set("x-api-key", "test_val_key_dynamic")
      .send({ title: "Large Desc", description: "x".repeat(5000) });

    expect(res.status).toBe(201);
  });
});
