import express from "express";
import publicApiKeyMiddleware from "../middleware/publicApiKeyMiddleware.js";
import {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
  retryWebhook,
} from "../modules/webhooks/webhookController.js";

const router = express.Router();

// Apply API Key Middleware globally to webhook routes (scopes to req.project)
router.use(publicApiKeyMiddleware);

// Webhook CRUD
router.post("/", createWebhook);
router.get("/", getWebhooks);
router.patch("/:id", updateWebhook);
router.delete("/:id", deleteWebhook);

// Webhook Logs
router.get("/logs", getWebhookLogs);
router.post("/logs/:id/retry", retryWebhook);

export default router;
