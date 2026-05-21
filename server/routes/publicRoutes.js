import express from "express";
import publicApiKeyMiddleware, { requireApiKeyPermission } from "../middleware/publicApiKeyMiddleware.js";
import { apiKeyLimiter } from "../middleware/redisRateLimit.js";
import usageTracker from "../middleware/usageTracker.js";
import depthCheckMiddleware from "../middleware/depthCheckMiddleware.js";
import {
  publicGetCollections,
  publicGetCollection,
  publicGetCollectionSchema,
  publicCreateEntry,
  publicGetEntry,
} from "../modules/collections/collectionController.js";
import {
  getEntries,
  updateEntry,
  deleteEntry,
} from "../modules/entries/entryController.js";
import { sendTemplatedEmail, sendDirectEmail } from "../modules/mail/mailController.js";

const router = express.Router();

// All public routes require a valid API key via `x-api-key` header
router.use(publicApiKeyMiddleware);
router.use(usageTracker);

// Collection endpoints
router.get("/collections", requireApiKeyPermission("read"), apiKeyLimiter, publicGetCollections);
router.get("/collections/:id", requireApiKeyPermission("read"), apiKeyLimiter, publicGetCollection);
router.get("/collections/:id/schema", requireApiKeyPermission("read"), apiKeyLimiter, publicGetCollectionSchema);
router.post("/collections/:id/entries", requireApiKeyPermission("write"), apiKeyLimiter, depthCheckMiddleware, publicCreateEntry);
router.get("/entries/:entryId", requireApiKeyPermission("read"), apiKeyLimiter, publicGetEntry);

// Entry endpoints
router.get("/collections/:id/entries", requireApiKeyPermission("read"), apiKeyLimiter, getEntries);
router.patch("/entries/:entryId", requireApiKeyPermission("write"), apiKeyLimiter, depthCheckMiddleware, updateEntry);
router.delete("/entries/:entryId", requireApiKeyPermission("write"), apiKeyLimiter, deleteEntry);

// Mail endpoints (SDK-compatible, API-key auth)
router.post("/mail/send", requireApiKeyPermission("write"), apiKeyLimiter, sendTemplatedEmail);
router.post("/mail/send-direct", requireApiKeyPermission("write"), apiKeyLimiter, sendDirectEmail);

export default router;
