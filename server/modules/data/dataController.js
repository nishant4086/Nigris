import Collection from "../../models/Collection.js";
import Data from "../../models/Data.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { checkCollectionAccess } from "../../utils/checkAccess.js";
import { validateData } from "../../utils/dataValidation.js";

// Helper to populate references
const populateReferences = async (collection, dataItems) => {
  const refFields = (collection.fields || []).filter(f => f.type === "reference");
  if (refFields.length === 0 || dataItems.length === 0) return dataItems;

  const populatedItems = JSON.parse(JSON.stringify(dataItems));

  for (const field of refFields) {
    const idsToFetch = populatedItems.map(item => item.data?.[field.name]).filter(id => id);
    if (idsToFetch.length === 0) continue;

    const referencedEntries = await Data.find({ _id: { $in: idsToFetch } }).lean();
    const entryMap = {};
    for (const entry of referencedEntries) {
      entryMap[entry._id.toString()] = entry.data; // Attach the actual data of the entry
    }

    for (const item of populatedItems) {
      const refId = item.data?.[field.name];
      if (refId && entryMap[refId]) {
        item.data[field.name] = { _id: refId, ...entryMap[refId] };
      }
    }
  }

  return populatedItems;
};

export const createData = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const payload = req.body;

  const access = await checkCollectionAccess(collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const collection = access.collection;

  if (!collection.fields || collection.fields.length === 0) {
    return res.status(400).json({ error: "Collection has no fields defined" });
  }

  const errors = await validateData(collection, payload, null, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newData = await Data.create({
    collectionId: collection._id,
    project: collection.project,
    data: payload,
    createdBy: req.user.userId,
  });

  res.status(201).json(newData);
});

export const getData = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  const access = await checkCollectionAccess(collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const collection = access.collection;

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Sorting
  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;
  const sort = { [sortField === "createdAt" ? "createdAt" : `data.${sortField}`]: sortOrder };

  // Safe filtering
  const filter = { collectionId: collection._id };
  const allowedFields = collection.fields.map((f) => f.name);
  const fieldTypeMap = {};
  for (const f of collection.fields) {
    fieldTypeMap[f.name] = f.type;
  }

  for (const key of Object.keys(req.query)) {
    if (!allowedFields.includes(key)) continue;

    let value = req.query[key];
    const fieldType = fieldTypeMap[key];

    if (typeof value === "object" && !Array.isArray(value)) {
      const opFilter = {};
      if (value.gt !== undefined) opFilter.$gt = fieldType === "number" ? Number(value.gt) : value.gt;
      if (value.lt !== undefined) opFilter.$lt = fieldType === "number" ? Number(value.lt) : value.lt;
      if (value.eq !== undefined) opFilter.$eq = fieldType === "number" ? Number(value.eq) : fieldType === "boolean" ? value.eq === "true" : value.eq;
      if (value.contains !== undefined) opFilter.$regex = new RegExp(value.contains, "i");

      if (Object.keys(opFilter).length > 0) {
        filter[`data.${key}`] = opFilter;
      }
      continue;
    }

    if (typeof value === "object") continue;
    if (typeof value === "string" && (value.includes("$") || value.includes("."))) continue;

    if (fieldType === "number") {
      const num = Number(value);
      if (!isNaN(num)) filter[`data.${key}`] = num;
    } else if (fieldType === "boolean") {
      filter[`data.${key}`] = value === "true";
    } else if (fieldType === "reference") {
       filter[`data.${key}`] = value;
    } else {
      filter[`data.${key}`] = { $regex: value, $options: "i" };
    }
  }

  const [rawItems, total] = await Promise.all([
    Data.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Data.countDocuments(filter),
  ]);

  const populatedData = await populateReferences(collection, rawItems);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
    data: populatedData.map(item => ({ _id: item._id, ...item.data, createdAt: item.createdAt, updatedAt: item.updatedAt })), // flatten for compatibility
  });
});

export const getDataEntry = asyncHandler(async (req, res) => {
  const { collectionId, entryId } = req.params;

  const access = await checkCollectionAccess(collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const collection = access.collection;

  const entry = await Data.findById(entryId).lean();
  if (!entry || entry.collectionId.toString() !== collection._id.toString()) {
    return res.status(404).json({ error: "Entry not found" });
  }

  // Populate references
  const [populatedEntry] = await populateReferences(collection, [entry]);

  res.json({ _id: populatedEntry._id, ...populatedEntry.data, createdAt: populatedEntry.createdAt, updatedAt: populatedEntry.updatedAt });
});

export const updateData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatePayload = req.body;

  console.log("=== updateData called ===");
  console.log("Entry ID:", id);
  console.log("Update Payload:", JSON.stringify(updatePayload, null, 2));

  const doc = await Data.findById(id);
  if (!doc) {
    return res.status(404).json({ error: "Data not found" });
  }

  console.log("Current data:", JSON.stringify(doc.data, null, 2));

  const collection = await Collection.findById(doc.collectionId);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  // Check project membership access (like checkCollectionAccess does)
  const access = await checkCollectionAccess(doc.collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  // Deep merge current data with update payload
  const mergedData = { ...doc.data, ...updatePayload };

  console.log("Merged data:", JSON.stringify(mergedData, null, 2));

  const errors = await validateData(collection, mergedData, id);
  console.log("Validation errors:", errors);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  doc.data = mergedData;
  await doc.save();

  res.json({ _id: doc._id, ...doc.data, createdAt: doc.createdAt, updatedAt: doc.updatedAt });
});

export const deleteData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doc = await Data.findById(id);
  if (!doc) {
    return res.status(404).json({ error: "Data not found" });
  }

  const collection = await Collection.findById(doc.collectionId);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }

  // Check project membership access (like checkCollectionAccess does)
  const access = await checkCollectionAccess(doc.collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  await Data.findByIdAndDelete(id);

  res.json({ message: "Data deleted" });
});
