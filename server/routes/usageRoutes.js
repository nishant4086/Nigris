import express from "express";
import {
  getUsageSummary,
  getUsageTimeSeries,
  getTopEndpoints,
} from "../modules/usage/usageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getUsageSummary);
router.get("/timeseries", getUsageTimeSeries);
router.get("/top-endpoints", getTopEndpoints);

export default router;
