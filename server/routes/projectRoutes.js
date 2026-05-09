"use strict";

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireProjectRole from "../middleware/requireProjectRole.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../modules/projects/projectController.js";
import {
  inviteUser,
  acceptInvite,
  listMembers,
  changeRole,
  removeMember,
  getMyInvites,
  acceptInviteByToken,
} from "../modules/projects/teamController.js";

const router = express.Router();

router.use(authMiddleware);

// Projects CRUD
router.get("/", getProjects);
router.post("/", createProject);
router.get("/invites/mine", getMyInvites);
router.post("/invites/accept-token", acceptInviteByToken);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Team management (role-gated)
router.get("/:id/members", requireProjectRole("members.view"), listMembers);
router.post("/:id/invite", requireProjectRole("members.invite"), inviteUser);
router.post("/:id/accept", acceptInvite);
router.patch("/:id/members/:userId", requireProjectRole("members.changeRole"), changeRole);
router.delete("/:id/members/:userId", requireProjectRole("members.remove"), removeMember);

export default router;