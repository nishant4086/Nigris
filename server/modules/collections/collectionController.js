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
  const { name, projectId, fields, isPublic } = req.body;

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
    isPublic: Boolean(isPublic),
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

  const collections = await Collection.find({ project: projectId }).sort({
    createdAt: -1,
  });
  res.json(collections);
});

// 🔍 GET SINGLE COLLECTION BY ID
export const getCollectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid collection ID" });
  }

  const collection = await Collection.findById(id);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  const project = await Project.findById(collection.project);
  if (!project || project.user.toString() !== req.user.userId.toString()) {
    return res.status(403).json({ error: "Not authorized" });
  }

  res.json(collection);
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

// 🌐 PUBLIC: Get collections for API key's project
export const publicGetCollections = asyncHandler(async (req, res) => {
  const project = req.project;
  if (!project) return res.status(400).json({ error: "Project not found on request" });

  const collections = await Collection.find({ project: project._id }).sort({
    createdAt: -1,
  });
  res.json(collections);
});

// 🌐 PUBLIC: Get single collection scoped to API key's project
export const publicGetCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;
  if (!project) return res.status(400).json({ error: "Project not found on request" });

  let collection;
  if (mongoose.Types.ObjectId.isValid(id)) {
    collection = await Collection.findOne({ _id: id, project: project._id });
  } else {
    collection = await Collection.findOne({ slug: id, project: project._id });
  }

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  res.json(collection);
});

// 🌐 PUBLIC: Get collection schema scoped to API key's project
export const publicGetCollectionSchema = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;

  if (!project) {
    return res.status(400).json({ error: "Project not found on request" });
  }

  let collection;
  if (mongoose.Types.ObjectId.isValid(id)) {
    collection = await Collection.findOne({ _id: id, project: project._id }).select("fields name slug project");
  } else {
    collection = await Collection.findOne({ slug: id, project: project._id }).select("fields name slug project");
  }

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  res.json({
    collectionId: collection._id,
    name: collection.name,
    slug: collection.slug,
    project: collection.project,
    fields: collection.fields || [],
  });
});

// 🌐 PUBLIC: Create an entry for a collection (scoped to API key's project)
export const publicCreateEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;
  if (!project) return res.status(400).json({ error: "Project not found on request" });

  let collection;
  if (mongoose.Types.ObjectId.isValid(id)) {
    collection = await Collection.findOne({ _id: id, project: project._id });
  } else {
    collection = await Collection.findOne({ slug: id, project: project._id });
  }

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  const DataModel = await import("../../models/Data.js").then(m => m.default);
  const newData = await DataModel.create({
    collectionId: collection._id,
    project: project._id,
    data: req.body,
    createdBy: req.apiKey?.user || null,
  });

  const { triggerWebhook } = await import("../../webhookService.js");
  triggerWebhook("entry.created", newData, project._id).catch(console.error);

  res.status(201).json(newData);
});

// 🌐 PUBLIC: Get a single entry scoped to API key's project
export const publicGetEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const project = req.project;

  if (!project) {
    return res.status(400).json({ error: "Project not found on request" });
  }

  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(400).json({ error: "Invalid entry ID" });
  }

  const DataModel = await import("../../models/Data.js").then((m) => m.default);
  const entry = await DataModel.findOne({ _id: entryId, project: project._id });

  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(entry);
});
