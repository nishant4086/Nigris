import express from "express";
import {
  createCollection,
  getCollections,
  getCollectionById,
  deleteCollection,
} from "../modules/collections/collectionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCollection);
router.get("/detail/:id", authMiddleware, getCollectionById);
router.get("/:projectId", authMiddleware, getCollections);
router.delete("/:id", authMiddleware, deleteCollection);

export default router;