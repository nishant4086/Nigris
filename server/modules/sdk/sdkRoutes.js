import express from "express";
import { generateTypeScriptDefinitions } from "./sdkController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import requireProjectRole from "../../middleware/requireProjectRole.js";

const router = express.Router();

// Generate TS definitions (requires auth and project access)
router.get(
  "/types/:projectId",
  authMiddleware,
  requireProjectRole("entries.read"),
  generateTypeScriptDefinitions
);

export default router;
