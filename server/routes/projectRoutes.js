"use strict";

import express from "express";
import {
  createProject,
  getProjects,
  deleteProject,
} from "../modules/projects/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.delete("/:id", authMiddleware, deleteProject);

export default router;