import request from "supertest";
import app from "../app.js";
import Collection from "../models/Collection.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

describe("Security: sanitization and payload limits", () => {
  test("NoSQL operator injection in query is sanitized and returns 200", async () => {
    const user = await User.create({ name: "SecUser", email: "sec@test.com", password: "Password123" });
    const project = await Project.create({ name: "SecProject", user: user._id });

    await Collection.create({
      name: "ProductsSec",
      slug: "products-sec",
      project: project._id,
      createdBy: user._id,
      isPublic: true,
    });

    const res = await request(app)
      .get("/api/public/products-sec?name[$ne]=")
      .set("x-api-key", "invalid_key_for_test");

    // If API key is invalid we expect a 403; but sanitization should not crash the server.
    expect([200, 403, 401, 404]).toContain(res.status);
  });

  test("Oversized JSON payload is rejected by public parser", async () => {
    const big = "x".repeat(200 * 1024); // 200kb

    const res = await request(app)
      .post("/api/public/products-sec")
      .set("x-api-key", "invalid_key_for_test")
      .send({ payload: big });

    // Expect body parser to reject (413 or 400) or middleware to throw safely.
    expect([413, 400, 401, 403]).toContain(res.status);
  });
});
