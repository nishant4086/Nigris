import mongoose from "mongoose";
import Collection from "../../models/Collection.js";
import Data from "../../models/Data.js";
import asyncHandler from "../../utils/asyncHandler.js";
import buildSafeFilter from "../../utils/buildSafeFilter.js";
import { validateData } from "../../utils/dataValidation.js";

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

// Helper to populate references — single batched query for all ref fields
const populateReferences = async (collection, dataItems) => {
  const refFields = (collection.fields || []).filter(f => f.type === "reference");
  if (refFields.length === 0 || dataItems.length === 0) return dataItems;

  const populatedItems = JSON.parse(JSON.stringify(dataItems));

  // Collect ALL reference IDs across ALL fields in one pass
  const allIds = new Set();
  for (const field of refFields) {
    for (const item of populatedItems) {
      const refId = item.data?.[field.name];
      if (refId) allIds.add(refId);
    }
  }

  if (allIds.size === 0) return populatedItems;

  // Single batched DB query instead of one per field
  const referencedEntries = await Data.find({ _id: { $in: [...allIds] } }).lean();
  const entryMap = {};
  for (const entry of referencedEntries) {
    entryMap[entry._id.toString()] = entry.data;
  }

  // Distribute results across all fields
  for (const field of refFields) {
    for (const item of populatedItems) {
      const refId = item.data?.[field.name];
      if (refId && entryMap[refId]) {
        item.data[field.name] = { _id: refId, ...entryMap[refId] };
      }
    }
  }

  return populatedItems;
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
    collectionId: collection._id,
    ...dynamicFilter,
  };

  // Execute query with pagination
  const total = await Data.countDocuments(baseFilter);
  const skip = (page - 1) * limit;

  const rawEntries = await Data.find(baseFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const populatedEntries = await populateReferences(collection, rawEntries);

  const pages = Math.ceil(total / limit) || 1;

  res.json({
    data: populatedEntries.map(item => ({ _id: item._id, ...item.data, createdAt: item.createdAt, updatedAt: item.updatedAt })),
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

  const entry = await Data.findById(entryId);
  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  const collection = await Collection.findOne({ _id: entry.collectionId, project: project._id });
  if (!collection) {
    return res.status(403).json({ error: "Not authorized to update this entry" });
  }

  const mergedData = { ...entry.data, ...req.body };

  const { errors, cleanedData } = await validateData(collection, mergedData, entryId);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  entry.data = cleanedData;
  await entry.save();

  res.json({ _id: entry._id, ...entry.data, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
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

  const entry = await Data.findById(entryId);
  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  const collection = await Collection.findOne({ _id: entry.collectionId, project: project._id });
  if (!collection) {
    return res.status(403).json({ error: "Not authorized to delete this entry" });
  }

  await Data.findByIdAndDelete(entryId);

  res.json({
    success: true,
    message: "Entry deleted successfully",
  });
});
