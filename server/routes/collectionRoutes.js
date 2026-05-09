import express from "express";
import {
  createCollection,
  getCollections,
  getCollectionById,
  deleteCollection,
  updateCollection,
} from "../modules/collections/collectionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProjectRole from "../middleware/requireProjectRole.js";

const router = express.Router();

// ⚠️ Specific routes FIRST (before parameterized routes)
router.post("/", authMiddleware, requireProjectRole("collections.create"), createCollection);
router.get("/detail/:id", authMiddleware, getCollectionById);
router.patch("/:id", authMiddleware, updateCollection); // ✨ NEW: Update collection fields/name
router.delete("/:id", authMiddleware, deleteCollection);

// ⚠️ Generic/parameterized routes LAST (matches any ID)
router.get("/:projectId", authMiddleware, requireProjectRole("entries.read"), getCollections);

export default router;