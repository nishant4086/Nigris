import Collection from "../../models/Collection.js";
import asyncHandler from "../../utils/asyncHandler.js";
import mongoose from "mongoose";
import { checkCollectionAccess } from "../../utils/checkAccess.js";

const collectionModels = {};

function getOrCreateCollectionModel(collectionId, fields) {
  const modelName = `Collection_${collectionId}`;

  if (collectionModels[modelName]) {
    return collectionModels[modelName];
  }

  const schema = new mongoose.Schema({}, { strict: false });

  for (const field of fields) {
    let fieldType = String;
    if (field.type === "number") fieldType = Number;
    if (field.type === "boolean") fieldType = Boolean;
    // text, image, and video map to String (URL)

    schema.add({
      [field.name]: {
        type: fieldType,
        required: field.required || false,
      },
    });
  }

  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  try {
    collectionModels[modelName] = mongoose.model(modelName);
  } catch {
    collectionModels[modelName] = mongoose.model(
      modelName,
      schema,
      `collection_${collectionId}`
    );
  }

  return collectionModels[modelName];
}

export const createData = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const data = req.body;

  const access = await checkCollectionAccess(collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const collection = access.collection;

  if (!collection.fields || collection.fields.length === 0) {
    return res.status(400).json({ error: "Collection has no fields defined" });
  }

  const validationErrors = [];
  for (const field of collection.fields) {
    if (field.required && !data[field.name]) {
      validationErrors.push(`${field.name} is required`);
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const collectionModel = getOrCreateCollectionModel(collectionId, collection.fields);
  const newData = new collectionModel(data);
  await newData.save();

  res.status(201).json(newData);
});

export const getData = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  const access = await checkCollectionAccess(collectionId, req.user?.userId);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const collection = access.collection;
  const collectionModel = getOrCreateCollectionModel(collectionId, collection.fields);

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Sorting
  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  // Safe filtering — only allow known collection fields
  const filter = {};
  const allowedFields = collection.fields.map((f) => f.name);
  const fieldTypeMap = {};
  for (const f of collection.fields) {
    fieldTypeMap[f.name] = f.type;
  }

  for (const key of Object.keys(req.query)) {
    if (!allowedFields.includes(key)) continue;

    let value = req.query[key];

    // Block NoSQL injection — reject objects/arrays
    if (typeof value === "object") continue;
    // Block keys containing $ or .
    if (typeof value === "string" && (value.includes("$") || value.includes("."))) continue;

    // Cast based on field type
    const fieldType = fieldTypeMap[key];
    if (fieldType === "number") {
      const num = Number(value);
      if (!isNaN(num)) filter[key] = num;
    } else if (fieldType === "boolean") {
      filter[key] = value === "true";
    } else {
      // Case-insensitive text match
      filter[key] = { $regex: value, $options: "i" };
    }
  }

  const [data, total] = await Promise.all([
    collectionModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    collectionModel.countDocuments(filter),
  ]);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
    data,
  });
});

export const updateData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const collections = await Collection.find({});
  let targetCollection = null;
  let updatedDoc = null;

  for (const collection of collections) {
    const collectionModel = getOrCreateCollectionModel(collection._id, collection.fields);
    const doc = await collectionModel.findById(id);
    if (doc) {
      if (collection.createdBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: "Not authorized to update this data" });
      }
      
      targetCollection = collection;
      const validationErrors = [];
      for (const field of collection.fields) {
        if (field.required && !updateData[field.name] && !doc[field.name]) {
          validationErrors.push(`${field.name} is required`);
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      updatedDoc = await collectionModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      break;
    }
  }

  if (!targetCollection) {
    return res.status(404).json({ error: "Data not found" });
  }

  res.json(updatedDoc);
});

export const deleteData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const collections = await Collection.find({});
  let targetCollection = null;

  for (const collection of collections) {
    const collectionModel = getOrCreateCollectionModel(collection._id, collection.fields);
    const doc = await collectionModel.findById(id);
    if (doc) {
      if (collection.createdBy.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: "Not authorized to delete this data" });
      }
      
      targetCollection = collection;
      await collectionModel.findByIdAndDelete(id);
      break;
    }
  }

  if (!targetCollection) {
    return res.status(404).json({ error: "Data not found" });
  }

  res.json({ message: "Data deleted" });
});
