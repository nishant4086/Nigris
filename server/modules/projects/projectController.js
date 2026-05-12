import mongoose from "mongoose";
import Project from "../../models/Project.js";
import Collection from "../../models/Collection.js";
import ApiKey from "../../models/ApiKey.js";
import Data from "../../models/Data.js";
import User from "../../models/User.js";
import ProjectUser from "../../models/ProjectUser.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getPlanLimits } from "../../utils/planLimits.js";
import { createNotification } from "../../utils/notificationUtils.js";

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const getUserId = (req) => req.user?.userId || req.user?.id;

export const createProject = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  // 🔒 PLAN LIMIT CHECK
  const user = await User.findById(userId);
  const limits = getPlanLimits(user?.plan);
  if (limits.maxProjects > 0) {
    const projectCount = await Project.countDocuments({ user: userId });
    if (projectCount >= limits.maxProjects) {
      return res.status(403).json({
        error: `Project limit reached (${limits.maxProjects}). Upgrade your plan to create more.`,
        limitReached: true,
        current: projectCount,
        max: limits.maxProjects,
      });
    }
  }

  const data = { name, user: userId };
  if (description) data.description = description;

  const hasSlug = Boolean(Project.schema.path("slug"));
  if (hasSlug) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Project.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    data.slug = slug;
  }

  const project = await Project.create(data);

  // Auto-add creator as "owner" in ProjectUser
  await ProjectUser.create({
    project: project._id,
    user: userId,
    role: "owner",
    status: "accepted",
  });

  // 🔔 Create Notification
  await createNotification(userId, "project", `New project "${name}" created successfully.`, project._id);

  return res.status(201).json(project);
});

export const getProjects = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Find all projects the user is a member of
  const memberships = await ProjectUser.find({ user: userId, status: "accepted" }).populate("project");
  const projects = memberships
    .map((m) => m.project)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json(projects);
});

export const getProjectById = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const membership = await ProjectUser.findOne({ project: id, user: userId, status: "accepted" }).populate("project");
  if (!membership || !membership.project) return res.status(404).json({ error: "Project not found or access denied" });

  return res.json(membership.project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const { name, description } = req.body;

  const membership = await ProjectUser.findOne({ project: id, user: userId, status: "accepted" });
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ error: "Insufficient permissions to update project" });
  }

  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();
  return res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  const membership = await ProjectUser.findOne({ project: id, user: userId, status: "accepted" });
  if (!membership || membership.role !== "owner") {
    return res.status(403).json({ error: "Only the project owner can delete the project" });
  }

  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  // Delete all related resources
  await Promise.all([
    Collection.deleteMany({ project: id }),
    ApiKey.deleteMany({ project: id }),
    Data.deleteMany({ project: id }),
    ProjectUser.deleteMany({ project: id }),
    project.deleteOne(),
  ]);

  // 🔔 Create Notification
  await createNotification(userId, "project", `Project "${project.name}" has been deleted.`);

  return res.json({ message: "Project deleted" });
});
