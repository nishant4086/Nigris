import crypto from "crypto";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken, sendTokenResponse } from "../../utils/tokenUtils.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../utils/emailService.js";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../../utils/validation.js";
import { blacklistToken } from "../../utils/tokenBlacklist.js";
import jwt from "jsonwebtoken";

const normalizeEmail = (email) => email.trim().toLowerCase();
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_PASSWORD_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

  return { token, hashedToken, expiresAt };
};

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_PASSWORD_TOKEN_EXPIRY_MS);

  return { token, hashedToken, expiresAt };
};

const hashVerificationToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!validateName(name) || !validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({ error: "Valid name, email, and password are required" });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const normalizedEmail = normalizeEmail(email);
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const { token: verificationToken, hashedToken, expiresAt } = generateVerificationToken();

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    emailVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpiry: expiresAt,
  });

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    await User.deleteOne({ _id: user._id });
    const mailError = new Error("Failed to send verification email. Check email configuration.");
    mailError.status = 500;
    throw mailError;
  }

  res.status(201).json({
    message: "Check your email to verify your account",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ error: "Token is required" });

  const hashedToken = hashVerificationToken(token);
  const user = await User.findOne({ verificationToken: hashedToken });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired link" });
  }

  if (user.emailVerified) {
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    return res.json({ message: "Email already verified. You can log in." });
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry <= new Date()) {
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    return res.status(400).json({ error: "Invalid or expired link" });
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Email verified successfully. You can now log in." });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) {
    return res.json({ message: "If an account exists and is unverified, a verification email has been sent." });
  }

  if (user.emailVerified) {
    return res.json({ message: "Email already verified. You can log in." });
  }

  const { token: verificationToken, hashedToken, expiresAt } = generateVerificationToken();
  user.verificationToken = hashedToken;
  user.verificationTokenExpiry = expiresAt;
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);

  res.json({ message: "Check your email to verify your account" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) {
    // Return success to prevent email enumeration
    return res.json({ message: "If an account exists with that email, a reset link has been sent." });
  }

  const { token: resetToken, hashedToken, expiresAt } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = expiresAt;
  await user.save();

  await sendResetPasswordEmail(user.email, resetToken);

  res.json({ message: "If an account exists with that email, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const hashedToken = hashResetToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  if (user.mfaEnabled) {
    return res.json({
      mfaRequired: true,
      userId: user._id,
      message: "MFA code required to complete login",
    });
  }

  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (token) {
    try {
      // Decode without verification to get the expiration time
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === "object" && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;
        
        if (expiresIn > 0) {
          await blacklistToken(token, expiresIn);
        }
      }
    } catch (err) {
      console.error("[Logout] Failed to blacklist token:", err.message);
    }
  }

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "User logged out successfully" });
});

export const verifyMfaLogin = asyncHandler(async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).json({ error: "User ID and token are required" });

  const user = await User.findById(userId).select("+totpSecret");
  if (!user || !user.mfaEnabled) return res.status(400).json({ error: "Invalid request" });

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return res.status(401).json({ error: "Invalid MFA code" });
  }

  sendTokenResponse(user, 200, res);
});

export const verifyRecoveryCode = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: "User ID and recovery code are required" });

  const user = await User.findById(userId).select("+recoveryCodes");
  if (!user || !user.mfaEnabled) return res.status(400).json({ error: "Invalid request" });

  let codeIndex = -1;
  for (let i = 0; i < user.recoveryCodes.length; i++) {
    const isMatch = await bcrypt.compare(code, user.recoveryCodes[i]);
    if (isMatch) {
      codeIndex = i;
      break;
    }
  }

  if (codeIndex === -1) {
    return res.status(401).json({ error: "Invalid recovery code" });
  }

  // Remove used recovery code
  user.recoveryCodes.splice(codeIndex, 1);
  await user.save();

  sendTokenResponse(user, 200, res);
});
