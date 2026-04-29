import express from "express";
import publicApiKeyMiddleware from "../middleware/publicApiKeyMiddleware.js";
import {
  publicGetCollections,
  publicGetCollection,
  publicCreateEntry,
} from "../modules/collections/collectionController.js";

const router = express.Router();

// All public routes require a valid API key via `x-api-key` header
router.use(publicApiKeyMiddleware);

router.get("/collections", publicGetCollections);
router.get("/collections/:id", publicGetCollection);
router.post("/collections/:id/entries", publicCreateEntry);

export default router;
