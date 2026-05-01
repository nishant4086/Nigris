import express from "express";
import {
  getEntries,
  updateEntry,
  deleteEntry,
} from "../entries/entryController.js";

const router = express.Router();

// All routes in this file use publicApiKeyMiddleware (applied at parent level)

// 📖 GET entries with pagination & filtering
// GET /api/public/collections/:id/entries
router.get("/collections/:id/entries", getEntries);

// ✏️ UPDATE entry (merge data)
// PATCH /api/public/entries/:entryId
router.patch("/entries/:entryId", updateEntry);

// ❌ DELETE entry
// DELETE /api/public/entries/:entryId
router.delete("/entries/:entryId", deleteEntry);

export default router;
