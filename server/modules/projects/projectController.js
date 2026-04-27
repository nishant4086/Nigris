import Project from "../../models/Project.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const project = await Project.create({
    name,
    description,
    user: req.user.userId,
  });

  res.status(201).json(project);
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user.userId });
  res.json(projects);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});