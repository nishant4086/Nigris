import express from "express";
import publicApiKeyMiddleware, { requireApiKeyPermission } from "../middleware/publicApiKeyMiddleware.js";
import { redisRateLimit } from "../middleware/redisRateLimit.js";
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

const router = express.Router();

// All public routes require a valid API key via `x-api-key` header
router.use(publicApiKeyMiddleware);
router.use(usageTracker);

// Collection endpoints
router.get("/collections", requireApiKeyPermission("read"), redisRateLimit(100, 60), publicGetCollections);
router.get("/collections/:id", requireApiKeyPermission("read"), redisRateLimit(100, 60), publicGetCollection);
router.get("/collections/:id/schema", requireApiKeyPermission("read"), redisRateLimit(100, 60), publicGetCollectionSchema);
router.post("/collections/:id/entries", requireApiKeyPermission("write"), redisRateLimit(50, 60), depthCheckMiddleware, publicCreateEntry);
router.get("/entries/:entryId", requireApiKeyPermission("read"), redisRateLimit(100, 60), publicGetEntry);

// Entry endpoints
router.get("/collections/:id/entries", requireApiKeyPermission("read"), redisRateLimit(100, 60), getEntries);
router.patch("/entries/:entryId", requireApiKeyPermission("write"), redisRateLimit(50, 60), depthCheckMiddleware, updateEntry);
router.delete("/entries/:entryId", requireApiKeyPermission("write"), redisRateLimit(30, 60), deleteEntry);

export default router;
