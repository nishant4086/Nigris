import express from "express";
import { sendTemplatedEmail, getEmailLogs, testSendTemplate, sendDirectEmail } from "./mailController.js";
import apiKeyMiddleware from "../../middleware/apiKeyMiddleware.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public API for SDK
router.post("/send", apiKeyMiddleware, sendTemplatedEmail);

// Dashboard API for logs
router.get("/logs/:projectId", authMiddleware, getEmailLogs);
router.post("/test-send", authMiddleware, testSendTemplate);
router.post("/send-direct", authMiddleware, sendDirectEmail);

export default router;
