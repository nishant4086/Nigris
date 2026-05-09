import mongoose from "mongoose";
import Collection from "../../models/Collection.js";
import Project from "../../models/Project.js";
import Data from "../../models/Data.js";
import User from "../../models/User.js";
import ProjectUser from "../../models/ProjectUser.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { validateData } from "../../utils/dataValidation.js";
import { getPlanLimits } from "../../utils/planLimits.js";

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

  // Access is handled by requireProjectRole middleware
  // which attaches membership to req.projectMembership

  // 🔒 PLAN LIMIT CHECK
  const user = await User.findById(req.user.userId);
  const limits = getPlanLimits(user?.plan);
  if (limits.maxCollections > 0) {
    const collectionCount = await Collection.countDocuments({ createdBy: req.user.userId });
    if (collectionCount >= limits.maxCollections) {
      return res.status(403).json({
        error: `Collection limit reached (${limits.maxCollections}). Upgrade your plan to create more.`,
        limitReached: true,
        current: collectionCount,
        max: limits.maxCollections,
      });
    }
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

  // Create unique indexes dynamically
  if (fields && fields.length > 0) {
    for (const field of fields) {
      if (field.unique) {
        await Data.collection.createIndex(
          { collectionId: 1, [`data.${field.name}`]: 1 },
          { unique: true, partialFilterExpression: { [`data.${field.name}`]: { $exists: true } } }
        );
      }
    }
  }

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

  // Access handled by middleware

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

  const membership = await ProjectUser.findOne({ project: collection.project, user: req.user.userId, status: "accepted" });
  if (!membership) {
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

  const membership = await ProjectUser.findOne({ project: collection.project, user: req.user.userId, status: "accepted" });
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ error: "Only admins and owners can delete collections" });
  }

  await collection.deleteOne();

  res.json({ message: "Collection deleted" });
});

// ✏️ UPDATE COLLECTION (Fields, Name, etc)
export const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fields, name, isPublic } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid collection ID" });
  }

  const collection = await Collection.findById(id);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  // Check permissions
  const membership = await ProjectUser.findOne({ project: collection.project, user: req.user.userId, status: "accepted" });
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return res.status(403).json({ error: "Only admins and owners can update collections" });
  }

  // Update allowed fields
  if (name !== undefined) collection.name = name;
  if (isPublic !== undefined) collection.isPublic = Boolean(isPublic);
  if (fields !== undefined && Array.isArray(fields)) {
    collection.fields = fields;

    // Create unique indexes for new fields
    for (const field of fields) {
      if (field.unique) {
        try {
          await Data.collection.createIndex(
            { collectionId: 1, [`data.${field.name}`]: 1 },
            { unique: true, partialFilterExpression: { [`data.${field.name}`]: { $exists: true } } }
          );
        } catch (err) {
          // Index may already exist, which is fine
          console.log(`Index creation notice for ${field.name}:`, err.message);
        }
      }
    }
  }

  await collection.save();
  res.json(collection);
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
  const payload = req.body;
  
  console.log("=== publicCreateEntry called ===");
  console.log("Collection ID:", id);
  console.log("Req Body:", JSON.stringify(payload, null, 2));

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

  const errors = await validateData(collection, payload);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newData = await Data.create({
    collectionId: collection._id,
    project: project._id,
    data: payload,
    createdBy: req.apiKey?.user, // Using API key user
  });

  console.log("newData saved:", JSON.stringify(newData, null, 2));

  const { triggerWebhook } = await import("../../webhookService.js");
  triggerWebhook("entry.created", { _id: newData._id, ...newData.data, createdAt: newData.createdAt, updatedAt: newData.updatedAt }, project._id).catch(console.error);

  res.status(201).json({ _id: newData._id, ...newData.data, createdAt: newData.createdAt, updatedAt: newData.updatedAt });
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

  const entry = await Data.findById(entryId);
  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  // Ensure the entry belongs to a collection owned by the project
  const collection = await Collection.findOne({ _id: entry.collectionId, project: project._id });
  if (!collection) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json({ _id: entry._id, ...entry.data, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
});
