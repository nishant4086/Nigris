import express from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { 
  login, 
  signup, 
  verifyEmail, 
  resendVerificationEmail,
  forgotPassword, 
  resetPassword,
  verifyMfaLogin,
  verifyRecoveryCode,
  logout
} from "../modules/auth/authController.js";
import { generateToken } from "../utils/tokenUtils.js";
import { 
  setupMFA, 
  verifyAndEnableMFA, 
  disableMFA 
} from "../modules/auth/mfaController.js";
import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication
} from "../modules/auth/passkeyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification email requests. Please try again later." },
});

// 📧 Standard Auth
router.post("/signup", signup);
router.post("/register", signup);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, resendVerificationEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 🔐 MFA Routes
router.post("/mfa/verify-login", verifyMfaLogin);
router.post("/mfa/verify-recovery", verifyRecoveryCode);
router.post("/mfa/setup", authMiddleware, setupMFA);
router.post("/mfa/enable", authMiddleware, verifyAndEnableMFA);
router.delete("/mfa/disable", authMiddleware, disableMFA);

// 🔑 Passkeys (WebAuthn)
router.post("/passkey/register-options", authMiddleware, generatePasskeyRegistrationOptions);
router.post("/passkey/register-verify", authMiddleware, verifyPasskeyRegistration);
router.post("/passkey/login-options", generatePasskeyAuthenticationOptions);
router.post("/passkey/login-verify", verifyPasskeyAuthentication);

// 🌐 OAuth Routes
router.get("/google", (req, res, next) => {
  if (!passport._strategy("google")) {
    return res.status(400).json({ error: "Google login is not configured on this server." });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!passport._strategy("google")) {
    return res.status(400).json({ error: "Google login is not configured on this server." });
  }
  passport.authenticate("google", { session: false })(req, res, (err) => {
    if (err) return next(err);
    const token = generateToken(req.user._id); 
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  });
});

router.get("/github", (req, res, next) => {
  if (!passport._strategy("github")) {
    return res.status(400).json({ error: "GitHub login is not configured on this server." });
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

router.get("/github/callback", (req, res, next) => {
  if (!passport._strategy("github")) {
    return res.status(400).json({ error: "GitHub login is not configured on this server." });
  }
  passport.authenticate("github", { session: false })(req, res, (err) => {
    if (err) return next(err);
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  });
});

export default router;
