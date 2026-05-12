import express from "express";
import {
  getSmtpConfigs,
  createSmtpConfig,
  updateSmtpConfig,
  deleteSmtpConfig,
  testSmtpConnection,
} from "./smtpController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/test", testSmtpConnection);
router.get("/:projectId", getSmtpConfigs);
router.post("/:projectId", createSmtpConfig);
router.put("/:id", updateSmtpConfig);
router.delete("/:id", deleteSmtpConfig);

export default router;
