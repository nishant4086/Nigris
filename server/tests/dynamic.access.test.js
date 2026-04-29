import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Collection from "../models/Collection.js";
import ApiKey from "../models/ApiKey.js";
import Plan from "../models/Plan.js";

const signToken = (user) =>
  jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

describe("Dynamic routes access", () => {
  let owner;
  let otherUser;
  let ownerToken;
  let otherToken;
  let project;
  let apiKey;

  beforeEach(async () => {
    await Plan.create({ name: "free", requestLimit: 100, price: 0 });

    owner = await User.create({
      name: "Owner",
      email: "owner@test.com",
      password: "Password123",
    });
    otherUser = await User.create({
      name: "Other",
      email: "other@test.com",
      password: "Password123",
    });

    ownerToken = signToken(owner);
    otherToken = signToken(otherUser);

    project = await Project.create({ name: "Project", user: owner._id });
    apiKey = await ApiKey.create({
      user: owner._id,
      project: project._id,
      key: "test_key_123",
      name: "Default",
      limit: 100,
      usage: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  });

  test("Public collection: GET works without token", async () => {
    await Collection.create({
      name: "Products",
      slug: "products",
      project: project._id,
      createdBy: owner._id,
      isPublic: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-api-key", apiKey.key);

    expect(res.status).toBe(200);
  });

  test("Private collection: GET without token -> 403", async () => {
    await Collection.create({
      name: "Products",
      slug: "products",
      project: project._id,
      createdBy: owner._id,
      isPublic: false,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-api-key", apiKey.key);

    expect(res.status).toBe(403);
  });

  test("Private collection: GET with token -> 200", async () => {
    await Collection.create({
      name: "Products",
      slug: "products",
      project: project._id,
      createdBy: owner._id,
      isPublic: false,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-api-key", apiKey.key)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  test("Write: POST only owner allowed", async () => {
    await Collection.create({
      name: "Products",
      slug: "products",
      project: project._id,
      createdBy: owner._id,
      isPublic: false,
    });

    const allowed = await request(app)
      .post("/api/products")
      .set("x-api-key", apiKey.key)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "New Product", price: 99 });

    expect([200, 201]).toContain(allowed.status);

    const denied = await request(app)
      .post("/api/products")
      .set("x-api-key", apiKey.key)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "Hack Product", price: 99 });

    expect(denied.status).toBe(403);
  });
});
