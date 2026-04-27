import express from "express";
import {
  createApiKey,
  getApiKeys,
  deleteApiKey,
  getUsage,
} from "../controllers/apiKeyController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createApiKey);
router.get("/", authMiddleware, getApiKeys);
router.delete("/:id", authMiddleware, deleteApiKey);
router.get("/usage", authMiddleware, getUsage);

export default router;