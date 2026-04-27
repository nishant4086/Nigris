import express from "express";
import {
  createData,
  getData,
  updateData,
  deleteData,
} from "../modules/data/dataController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:collectionId", authMiddleware, createData);
router.get("/:collectionId", authMiddleware, getData);
router.put("/:id", authMiddleware, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;