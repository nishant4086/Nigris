import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";

describe("Auth Module - Extended Scenarios", () => {
  let user;

  beforeEach(async () => {
    // Clear potentially conflicting plans
    await Plan.deleteMany({});
    await Plan.create({ name: "free", requestLimit: 100, price: 0 });
    
    // Clear and recreate user for each test
    await User.deleteMany({});
    const crypto = await import("crypto");
    const hashedToken = crypto.createHash("sha256").update("valid-token").digest("hex");
    
    user = await User.create({
      name: "QA User",
      email: "qa@auth.com",
      password: "Password123",
      emailVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(Date.now() + 3600000)
    });
  });

  test("Should verify email with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/verify-email/valid-token");
    
    expect(res.status).toBe(200);
    const updatedUser = await User.findOne({ email: "qa@auth.com" });
    expect(updatedUser.emailVerified).toBe(true);
  });

  test("Should fail email verification with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/verify-email/invalid-token");
    
    expect(res.status).toBe(400);
  });

  test("Should fail login if email is not verified (if enforced)", async () => {
    // Note: Depends on whether the app enforces verification for login.
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "qa@auth.com", password: "Password123" });
    
    expect(res.status).toBe(403); // Nigris enforces email verification
  });

  test("Should initiate password reset", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "qa@auth.com" });
    
    expect(res.status).toBe(200);
    const updatedUser = await User.findOne({ email: "qa@auth.com" });
    expect(updatedUser.resetPasswordToken).toBeDefined();
  });
});
