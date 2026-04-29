import request from "supertest";
import app from "../app.js";
import Plan from "../models/Plan.js";

const seedPlans = async () => {
  await Plan.create({ name: "free", requestLimit: 100, price: 0 });
  await Plan.create({ name: "pro", requestLimit: 10000, price: 499 });
  await Plan.create({ name: "enterprise", requestLimit: 1000000, price: 1999 });
};

describe("Core API flows", () => {
  let token;
  let userId;

  beforeEach(async () => {
    await seedPlans();

    const signup = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "user@test.com",
      password: "Password123",
      confirmPassword: "Password123",
    });

    token = signup.body.token;
    userId = signup.body.user?.id;
  });

  test("login works with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "Password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test("projects + collections + api keys flow", async () => {
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Alpha", description: "Test" });

    expect(projectRes.status).toBe(201);

    const listProjects = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(listProjects.status).toBe(200);
    expect(Array.isArray(listProjects.body)).toBe(true);

    const projectId = projectRes.body._id;

    const collectionRes = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Items", projectId });

    expect(collectionRes.status).toBe(201);

    const listCollections = await request(app)
      .get(`/api/collections/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(listCollections.status).toBe(200);
    expect(Array.isArray(listCollections.body)).toBe(true);

    const apiKeyRes = await request(app)
      .post("/api/keys")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Default", projectId });

    expect(apiKeyRes.status).toBe(201);
    expect(apiKeyRes.body.key).toBeTruthy();

    const updateRes = await request(app)
      .patch(`/api/keys/${apiKeyRes.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated", rotate: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Updated");

    const usageRes = await request(app)
      .get("/api/keys/usage")
      .set("Authorization", `Bearer ${token}`);

    expect(usageRes.status).toBe(200);
    expect(Array.isArray(usageRes.body)).toBe(true);

    const summaryRes = await request(app)
      .get("/api/keys/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.totalLimit).toBeGreaterThan(0);
  });

  test("plans and user profile endpoints", async () => {
    const plansRes = await request(app).get("/api/plans");
    expect(plansRes.status).toBe(200);
    expect(plansRes.body.length).toBeGreaterThanOrEqual(3);

    const meRes = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.id).toBe(userId);
  });

  test("plan upgrade works in local development mode without Stripe env", async () => {
    const upgradeRes = await request(app)
      .post("/api/billing/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ plan: "pro" });

    expect(upgradeRes.status).toBe(200);
    expect(upgradeRes.body.upgraded).toBe(true);
    expect(upgradeRes.body.plan).toBe("pro");

    const meRes = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.plan).toBe("pro");
    expect(meRes.body.requestLimit).toBe(10000);
  });
});
