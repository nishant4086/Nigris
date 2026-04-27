import express from "express";
import {
  createCollection,
  getCollections,
  deleteCollection,
} from "../modules/collections/collectionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCollection);
router.get("/:projectId", authMiddleware, getCollections);
router.delete("/:id", authMiddleware, deleteCollection);

export default router;