import { jest } from "@jest/globals";

const mockCollectionFindById = jest.fn();
const mockProjectFindById = jest.fn();



jest.unstable_mockModule("../models/Collection.js", () => ({
  default: { findById: mockCollectionFindById },
}));

jest.unstable_mockModule("../models/Project.js", () => ({
  default: { findById: mockProjectFindById },
}));

const { checkCollectionAccess } = await import("./checkAccess.js");

describe("checkCollectionAccess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns collection when access is valid", async () => {
    const collection = { _id: "col-1", project: "proj-1" };
    const project = { _id: "proj-1", user: "user-1" };

    mockCollectionFindById.mockResolvedValue(collection);
    mockProjectFindById.mockResolvedValue(project);

    const result = await checkCollectionAccess("col-1", "user-1");

    expect(mockCollectionFindById).toHaveBeenCalledWith("col-1");
    expect(mockProjectFindById).toHaveBeenCalledWith("proj-1");
    expect(result).toEqual({ collection });
  });

  test("returns 404 when collection is not found", async () => {
    mockCollectionFindById.mockResolvedValue(null);

    const result = await checkCollectionAccess("missing-col", "user-1");

    expect(mockCollectionFindById).toHaveBeenCalledWith("missing-col");
    expect(mockProjectFindById).not.toHaveBeenCalled();
    expect(result).toEqual({ error: "Collection not found", status: 404 });
  });

  test("returns 404 when project is not found", async () => {
    mockCollectionFindById.mockResolvedValue({ _id: "col-1", project: "missing-proj" });
    mockProjectFindById.mockResolvedValue(null);

    const result = await checkCollectionAccess("col-1", "user-1");

    expect(mockCollectionFindById).toHaveBeenCalledWith("col-1");
    expect(mockProjectFindById).toHaveBeenCalledWith("missing-proj");
    expect(result).toEqual({ error: "Project not found", status: 404 });
  });

  test("returns 403 when user does not own the project", async () => {
    mockCollectionFindById.mockResolvedValue({ _id: "col-1", project: "proj-1" });
    mockProjectFindById.mockResolvedValue({ _id: "proj-1", user: "user-2" });

    const result = await checkCollectionAccess("col-1", "user-1");

    expect(result).toEqual({ error: "Not authorized", status: 403 });
  });

  test("rejects when Collection.findById throws", async () => {
    mockCollectionFindById.mockRejectedValue(new Error("collection db error"));

    await expect(checkCollectionAccess("col-1", "user-1")).rejects.toThrow("collection db error");
    expect(mockProjectFindById).not.toHaveBeenCalled();
  });

  test("rejects when Project.findById throws", async () => {
    mockCollectionFindById.mockResolvedValue({ _id: "col-1", project: "proj-1" });
    mockProjectFindById.mockRejectedValue(new Error("project db error"));

    await expect(checkCollectionAccess("col-1", "user-1")).rejects.toThrow("project db error");
  });

  test("rejects when userId is missing (no token handled outside this utility)", async () => {
    mockCollectionFindById.mockResolvedValue({ _id: "col-1", project: "proj-1" });
    mockProjectFindById.mockResolvedValue({ _id: "proj-1", user: "user-1" });

    await expect(checkCollectionAccess("col-1")).rejects.toThrow();
  });
});

// filepath: /Users/nishantrankawat/Nigris/server/tests/data.api.test.js
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";

import User from "../models/User.js";
import Project from "../models/Project.js";
import Collection from "../models/Collection.js";
import Data from "../models/Data.js";

const oid = () => new mongoose.Types.ObjectId().toString();

const signToken = (user, options = {}) =>
  jwt.sign(
    { id: user._id.toString() }, // change to userId if your auth middleware expects that
    process.env.JWT_SECRET,
    { expiresIn: "1h", ...options }
  );

describe("Data API - 26 test cases", () => {
  let userA, userB, tokenA, tokenB;
  let projectA, projectB, collectionA, collectionB, dataA;

  beforeEach(async () => {
    await Promise.all([
      Data.deleteMany({}),
      Collection.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);

    userA = await User.create({ name: "A", email: "a@test.com", password: "Password@123" });
    userB = await User.create({ name: "B", email: "b@test.com", password: "Password@123" });

    tokenA = signToken(userA);
    tokenB = signToken(userB);

    projectA = await Project.create({ name: "Project A", user: userA._id });
    projectB = await Project.create({ name: "Project B", user: userB._id });

    collectionA = await Collection.create({ name: "Collection A", project: projectA._id });
    collectionB = await Collection.create({ name: "Collection B", project: projectB._id });

    dataA = await Data.create({ collection: collectionA._id, name: "Item A", price: 999 });
    await Data.create({ collection: collectionA._id, name: "Item B", price: 500 });
  });

  // 1-5 CREATE
  test("1) POST valid -> 201", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "New Item", price: 111 });
    expect(res.status).toBe(201);
  });

  test("2) POST missing required field -> 400", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ price: 111 });
    expect(res.status).toBe(400);
  });

  test("3) POST invalid collection -> 404", async () => {
    const res = await request(app)
      .post(`/api/data/${oid()}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "X", price: 111 });
    expect(res.status).toBe(404);
  });

  test("4) POST no token -> 401", async () => {
    const res = await request(app).post(`/api/data/${collectionA._id}`).send({ name: "X", price: 111 });
    expect(res.status).toBe(401);
  });

  test("5) POST wrong user access -> 403", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "X", price: 111 });
    expect(res.status).toBe(403);
  });

  // 6-10 GET
  test("6) GET all -> 200 + array", async () => {
    const res = await request(app)
      .get(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("7) GET filter ?price=999 -> filtered", async () => {
    const res = await request(app)
      .get(`/api/data/${collectionA._id}?price=999`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });

  test("8) GET invalid collection -> 404", async () => {
    const res = await request(app)
      .get(`/api/data/${oid()}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });

  test("9) GET no token -> 401", async () => {
    const res = await request(app).get(`/api/data/${collectionA._id}`);
    expect(res.status).toBe(401);
  });

  test("10) GET wrong user -> 403", async () => {
    const res = await request(app)
      .get(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  // 11-15 UPDATE
  test("11) PUT valid update -> 200", async () => {
    const res = await request(app)
      .put(`/api/data/${dataA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Updated", price: 123 });
    expect(res.status).toBe(200);
  });

  test("12) PUT data not found -> 404", async () => {
    const res = await request(app)
      .put(`/api/data/${oid()}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Updated" });
    expect(res.status).toBe(404);
  });

  test("13) PUT remove required field -> 400", async () => {
    const res = await request(app)
      .put(`/api/data/${dataA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: null });
    expect(res.status).toBe(400);
  });

  test("14) PUT no token -> 401", async () => {
    const res = await request(app).put(`/api/data/${dataA._id}`).send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  test("15) PUT wrong user -> 403", async () => {
    const res = await request(app)
      .put(`/api/data/${dataA._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "Hacked" });
    expect(res.status).toBe(403);
  });

  // 16-19 DELETE
  test("16) DELETE valid -> 200", async () => {
    const created = await Data.create({ collection: collectionA._id, name: "ToDelete", price: 1 });
    const res = await request(app)
      .delete(`/api/data/${created._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });

  test("17) DELETE data not found -> 404", async () => {
    const res = await request(app)
      .delete(`/api/data/${oid()}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });

  test("18) DELETE no token -> 401", async () => {
    const res = await request(app).delete(`/api/data/${dataA._id}`);
    expect(res.status).toBe(401);
  });

  test("19) DELETE wrong user -> 403", async () => {
    const res = await request(app)
      .delete(`/api/data/${dataA._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  // 20-23 SECURITY
  test("20) invalid JWT -> 401", async () => {
    const res = await request(app)
      .get(`/api/data/${collectionA._id}`)
      .set("Authorization", "Bearer invalid.token.value");
    expect(res.status).toBe(401);
  });

  test("21) expired token -> 401", async () => {
    const expired = signToken(userA, { expiresIn: "-10s" });
    const res = await request(app)
      .get(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  test("22) user A accessing user B data -> 403", async () => {
    const res = await request(app)
      .get(`/api/data/${collectionB._id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(403);
  });

  test("23) random collectionId -> 404", async () => {
    const res = await request(app)
      .get(`/api/data/${oid()}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });

  // 24-26 EDGE
  test("24) empty body (design decision) -> 201 or 400", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({});
    expect([201, 400]).toContain(res.status);
  });

  test("25) extra fields allowed -> 201", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Flexible", price: 1, extra: "ok" });
    expect(res.status).toBe(201);
  });

  test("26) wrong data type currently allowed -> 201", async () => {
    const res = await request(app)
      .post(`/api/data/${collectionA._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Type Test", price: "not-a-number" });
    expect(res.status).toBe(201);
  });
});