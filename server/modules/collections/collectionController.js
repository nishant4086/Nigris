import mongoose from "mongoose";
import Collection from "../../models/Collection.js";
import Project from "../../models/Project.js";
import asyncHandler from "../../utils/asyncHandler.js";

// 🔧 slug generator
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

// ➕ CREATE COLLECTION
export const createCollection = asyncHandler(async (req, res) => {
  const { name, projectId, fields } = req.body;

  if (!name || !projectId) {
    return res.status(400).json({ error: "Name and projectId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // 🔥 better slug logic (fix infinite bug)
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await Collection.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const collection = await Collection.create({
    name,
    slug,
    project: projectId,
    fields: fields || [],
    createdBy: req.user.userId,
  });

  res.status(201).json(collection);
});


// 📥 GET COLLECTIONS
export const getCollections = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const collections = await Collection.find({ project: projectId });
  res.json(collections);
});


// ❌ DELETE COLLECTION
export const deleteCollection = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.slug;

  let collection;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    collection = await Collection.findById(identifier);
  } else {
    collection = await Collection.findOne({ slug: identifier });
  }

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  const project = await Project.findById(collection.project);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (project.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  await collection.deleteOne();

  res.json({ message: "Collection deleted" });
});