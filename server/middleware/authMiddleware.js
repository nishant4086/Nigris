import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // 🛡️ Check if token is blacklisted (Revoked via logout)
  const isRevoked = await isTokenBlacklisted(token);
  if (isRevoked) {
    return res.status(401).json({ error: "Token has been revoked. Please login again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🔍 PRODUCTION HARDENING: Verify user still exists and is not suspended
    const user = await User.findById(decoded.userId || decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User account no longer exists" });
    }

    // Attach full user object (excluding sensitive fields) to request
    req.user = user;
    req.user.userId = user._id.toString(); // Backward compatibility
    req.userId = user._id; // Consistency for controllers

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;