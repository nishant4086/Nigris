import express from "express";
import {
  createApiKey,
  getApiKeys,
  deleteApiKey,
  getUsage,
  updateApiKey,
  getUsageSummary,
} from "../modules/apiKey/apiKeyController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createApiKey);
router.get("/", authMiddleware, getApiKeys);
router.get("/usage", authMiddleware, getUsage);
router.get("/summary", authMiddleware, getUsageSummary);
router.patch("/:id", authMiddleware, updateApiKey);
router.delete("/:id", authMiddleware, deleteApiKey);

export default router;