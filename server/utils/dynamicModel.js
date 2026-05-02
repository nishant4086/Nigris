import mongoose from "mongoose";

const collectionModels = {};

export function getOrCreateCollectionModel(collectionId, fields = []) {
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
