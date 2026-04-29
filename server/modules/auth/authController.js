import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken } from "../../utils/tokenUtils.js";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../../utils/validation.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

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

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
    },
  });
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

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
    },
  });
});
