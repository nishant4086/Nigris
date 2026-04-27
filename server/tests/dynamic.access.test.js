import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";

// import User from "../models/User.js";
// import Collection from "../models/Collection.js";
// import Product from "../models/Product.js";

const signToken = (user) =>
  jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Dynamic routes access", () => {
  let owner, otherUser, ownerToken;
  // let publicCollection, privateCollection;

  beforeEach(async () => {
    // seed:
    // 1) owner user
    // 2) other user
    // 3) public collection with slug=products, visibility=public
    // 4) private collection with slug=products, visibility=private
    // 5) owner owns both
    ownerToken = signToken(owner);
  });

  test("Public collection: GET /api/products works without token", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
  });

  test("Private collection: GET /api/products without token -> 403", async () => {
    // set products collection visibility private
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(403);
  });

  test("Private collection: GET /api/products with token -> works", async () => {
    // set products collection visibility private
    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
  });

  test("Write: POST /api/products only owner allowed", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "New Product", price: 99 });

    expect([200, 201]).toContain(res.status);
  });

  test("Write: POST /api/products non-owner denied", async () => {
    const otherToken = signToken(otherUser);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "Hack Product", price: 99 });

    expect(res.status).toBe(403);
  });
});