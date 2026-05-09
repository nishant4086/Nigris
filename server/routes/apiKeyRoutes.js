import express from "express";
import {
  createApiKey,
  getApiKeys,
  deleteApiKey,
  getUsage,
  updateApiKey,
  revealApiKey,
  getUsageSummary,
  getAnalyticsTimeSeries,
  getAnalyticsDistribution,
  getAnalyticsLogs,
  exportAnalyticsCsv,
  getAnalyticsLive,
  getAlerts,
  markAlertRead
} from "../modules/apiKey/apiKeyController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createApiKey);
router.get("/", authMiddleware, getApiKeys);
router.get("/usage", authMiddleware, getUsage);
router.get("/summary", authMiddleware, getUsageSummary);
router.get("/analytics/time-series", authMiddleware, getAnalyticsTimeSeries);
router.get("/analytics/distribution", authMiddleware, getAnalyticsDistribution);
router.get("/analytics/logs", authMiddleware, getAnalyticsLogs);
router.get("/analytics/export", authMiddleware, exportAnalyticsCsv);
router.get("/analytics/live", authMiddleware, getAnalyticsLive);
router.get("/alerts", authMiddleware, getAlerts);
router.patch("/alerts/:id/read", authMiddleware, markAlertRead);
router.get("/:id/reveal", authMiddleware, revealApiKey);
router.patch("/:id", authMiddleware, updateApiKey);
router.delete("/:id", authMiddleware, deleteApiKey);

export default router;