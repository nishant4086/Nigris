import crypto from "crypto";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

describe("Email verification", () => {
  test("signup either sends verification email or auto-verifies on failure", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Verify Me",
      email: "verify@test.com",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();

    const user = await User.findOne({ email: "verify@test.com" });
    if (user.emailVerified) {
      // Email service failed → user auto-verified to avoid lockout
      expect(res.body.message).toContain("You can now log in");
    } else {
      // Email sent successfully → user must verify
      expect(res.body.message).toContain("check your email");
      expect(user.verificationToken).toBeTruthy();
      expect(user.verificationTokenExpiry.getTime()).toBeGreaterThan(Date.now());
    }
  });

  test("login is blocked for manually unverified users", async () => {
    // Directly create an unverified user (simulates successful email send path)
    await User.create({
      name: "Blocked User",
      email: "blocked@test.com",
      password: "Password123",
      emailVerified: false,
      verificationToken: hashToken("some-token"),
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "blocked@test.com",
      password: "Password123",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Please verify your email before logging in");
  });

  test("verify email marks the user verified and removes token fields", async () => {
    const rawToken = "valid-email-verification-token";
    await User.create({
      name: "Token User",
      email: "token@test.com",
      password: "Password123",
      emailVerified: false,
      verificationToken: hashToken(rawToken),
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const res = await request(app).get(`/api/auth/verify-email/${rawToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully. You can now log in.");

    const user = await User.findOne({ email: "token@test.com" });
    expect(user.emailVerified).toBe(true);
    expect(user.verificationToken).toBeUndefined();
    expect(user.verificationTokenExpiry).toBeUndefined();
  });

  test("expired verification token returns a safe error", async () => {
    const rawToken = "expired-email-verification-token";
    await User.create({
      name: "Expired User",
      email: "expired@test.com",
      password: "Password123",
      emailVerified: false,
      verificationToken: hashToken(rawToken),
      verificationTokenExpiry: new Date(Date.now() - 1000),
    });

    const res = await request(app).get(`/api/auth/verify-email/${rawToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired link");

    const user = await User.findOne({ email: "expired@test.com" });
    expect(user.emailVerified).toBe(false);
    expect(user.verificationToken).toBeUndefined();
    expect(user.verificationTokenExpiry).toBeUndefined();
  });
});
