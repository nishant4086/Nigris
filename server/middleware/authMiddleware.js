import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

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
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;