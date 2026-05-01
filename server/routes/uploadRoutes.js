import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadMedia } from "../modules/upload/uploadController.js";

const router = express.Router();

// Single file upload — field name "file"
router.post("/", authMiddleware, upload.single("file"), uploadMedia);

export default router;
