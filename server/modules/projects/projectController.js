import mongoose from "mongoose";
import Project from "../../models/Project.js";
import Collection from "../../models/Collection.js";
import ApiKey from "../../models/ApiKey.js";
import Data from "../../models/Data.js";
import asyncHandler from "../../utils/asyncHandler.js";

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
  return res.status(201).json(project);
});

export const getProjects = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
  return res.json(projects);
});

export const getProjectById = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const project = await Project.findOne({ _id: id, user: userId });
  if (!project) return res.status(404).json({ error: "Project not found" });

  return res.json(project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const { name, description } = req.body;

  if (name !== undefined && !name) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  const update = {};
  if (name) update.name = name;
  if (description !== undefined) update.description = description;

  const hasSlug = Boolean(Project.schema.path("slug"));
  if (hasSlug && name) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Project.findOne({ slug, _id: { $ne: id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    update.slug = slug;
  }

  const project = await Project.findOneAndUpdate(
    { _id: id, user: userId },
    update,
    { new: true }
  );

  if (!project) return res.status(404).json({ error: "Project not found" });

  return res.json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const project = await Project.findOneAndDelete({ _id: id, user: userId });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const collections = await Collection.find({ project: project._id }).select("_id");
  const collectionIds = collections.map((collection) => collection._id);

  await Promise.all([
    Collection.deleteMany({ project: project._id }),
    ApiKey.deleteMany({ project: project._id }),
    Data.deleteMany({ collectionId: { $in: collectionIds } }),
  ]);

  return res.json({ message: "Project deleted" });
});
