import express from "express";
import publicApiKeyMiddleware from "../middleware/publicApiKeyMiddleware.js";
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
router.get("/collections", redisRateLimit(100, 60), publicGetCollections);
router.get("/collections/:id", redisRateLimit(100, 60), publicGetCollection);
router.get("/collections/:id/schema", redisRateLimit(100, 60), publicGetCollectionSchema);
router.post("/collections/:id/entries", redisRateLimit(50, 60), depthCheckMiddleware, publicCreateEntry);
router.get("/entries/:entryId", redisRateLimit(100, 60), publicGetEntry);

// Entry endpoints
router.get("/collections/:id/entries", redisRateLimit(100, 60), getEntries);
router.patch("/entries/:entryId", redisRateLimit(50, 60), depthCheckMiddleware, updateEntry);
router.delete("/entries/:entryId", redisRateLimit(30, 60), deleteEntry);

export default router;
