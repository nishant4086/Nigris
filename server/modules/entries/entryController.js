import mongoose from "mongoose";
import Collection from "../../models/Collection.js";
import asyncHandler from "../../utils/asyncHandler.js";
import buildSafeFilter from "../../utils/buildSafeFilter.js";
import { getOrCreateCollectionModel } from "../../utils/dynamicModel.js";


// ✅ HELPER: Validate pagination params
const validatePaginationParams = (page, limit) => {
  let p = parseInt(page) || 1;
  let l = parseInt(limit) || 10;

  // Prevent negative and unreasonable values
  if (p < 1) p = 1;
  if (l < 1) l = 10;
  if (l > 100) l = 100; // Cap limit at 100

  return { page: p, limit: l };
};

// 📖 GET ENTRIES (with pagination + filtering)
// GET /api/public/collections/:id/entries
export const getEntries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;

  if (!project) {
    return res.status(400).json({ error: "Project not found on request" });
  }

  // Validate collection ID/slug
  let collection;
  if (mongoose.Types.ObjectId.isValid(id)) {
    collection = await Collection.findOne({ _id: id, project: project._id });
  } else {
    collection = await Collection.findOne({ slug: id, project: project._id });
  }

  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  // Validate and extract pagination params
  const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);

  // Build dynamic filter securely from query params
  const dynamicFilter = buildSafeFilter(req.query, collection.fields || []);

  // Base filter: entries belong to this collection implicitly
  const baseFilter = {
    ...dynamicFilter,
  };

  const collectionModel = getOrCreateCollectionModel(collection._id, collection.fields || []);

  // Execute query with pagination
  const total = await collectionModel.countDocuments(baseFilter);
  const skip = (page - 1) * limit;

  const entries = await collectionModel.find(baseFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const pages = Math.ceil(total / limit) || 1;

  res.json({
    data: entries,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  });
});

// ✏️ UPDATE ENTRY
// PATCH /api/public/entries/:entryId
export const updateEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const project = req.project;

  if (!project) {
    return res.status(400).json({ error: "Project not found on request" });
  }

  // Validate entry ID
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(400).json({ error: "Invalid entry ID" });
  }

  const collections = await Collection.find({ project: project._id });
  let entry = null;

  for (const collection of collections) {
    const collectionModel = getOrCreateCollectionModel(collection._id, collection.fields || []);
    const doc = await collectionModel.findById(entryId);
    if (doc) {
      // Found the document
      // Merge old data with new data (shallow merge)
      // Since it's a dynamic model, the fields are at the root level!
      const updatedData = { ...req.body };
      for (const key of Object.keys(updatedData)) {
        doc[key] = updatedData[key];
      }
      await doc.save();
      entry = doc;
      break;
    }
  }

  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json(entry);
});

// ❌ DELETE ENTRY
// DELETE /api/public/entries/:entryId
export const deleteEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const project = req.project;

  if (!project) {
    return res.status(400).json({ error: "Project not found on request" });
  }

  // Validate entry ID
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(400).json({ error: "Invalid entry ID" });
  }

  const collections = await Collection.find({ project: project._id });
  let entry = null;

  for (const collection of collections) {
    const collectionModel = getOrCreateCollectionModel(collection._id, collection.fields || []);
    const doc = await collectionModel.findByIdAndDelete(entryId);
    if (doc) {
      entry = doc;
      break;
    }
  }

  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  res.json({
    success: true,
    message: "Entry deleted successfully",
  });
});
