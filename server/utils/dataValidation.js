import mongoose from "mongoose";
import Data from "../models/Data.js";
import Collection from "../models/Collection.js";
import { sanitizeText } from "./sanitizeHtml.js";

/**
 * Validates data against a collection's schema.
 * Supports primary keys (unique) and foreign keys (reference).
 *
 * @param {Object} collection - The Mongoose collection document
 * @param {Object} data - The payload to validate
 * @param {String} entryId - (Optional) The ID of the entry being updated to exclude from unique checks
 * @param {Boolean} skipRequired - (Optional) Skip required field validation (for initial empty entry creation or partial updates)
 * @returns {Array} List of error strings. Empty array if valid.
 */
export const validateData = async (collection, data, entryId = null, skipRequired = false) => {
  const errors = [];
  const cleanedData = {};

  for (const field of collection.fields || []) {
    const value = data[field.name];
    const missing = value === undefined || value === null || value === "";

    // Required check - only validate if field is present in the data being validated
    // (for updates, we allow missing required fields if they were optional in creation)
    if (!skipRequired && field.required && missing) {
      // For updates: only require the field if it's new data being added
      // If entryId is provided (update scenario), skip this check
      if (!entryId) {
        errors.push(`${field.name} is required`);
        continue;
      }
    }

    if (missing) continue;

    // Type check
    let validatedValue = value;
    if (field.type === "number" && typeof value !== "number") {
      errors.push(`${field.name} must be a number`);
    } else if (field.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${field.name} must be a boolean`);
    } else if (["text", "image", "video", "file"].includes(field.type)) {
      if (typeof value !== "string" && typeof value !== "object") {
        errors.push(`${field.name} has an invalid type`);
      }
      // XSS prevention for strings
      if (typeof value === "string") {
        validatedValue = sanitizeText(value);
      }
    } else if (field.type === "reference") {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        errors.push(`${field.name} must be a valid entry ID`);
        continue;
      }

      // Foreign Key Validation
      let referencedCollection;
      if (mongoose.Types.ObjectId.isValid(field.ref)) {
        referencedCollection = await Collection.findById(field.ref);
      } else {
        // Find by slug within the same project
        referencedCollection = await Collection.findOne({ slug: field.ref, project: collection.project });
      }

      if (!referencedCollection) {
        errors.push(`Referenced collection '${field.ref}' for field ${field.name} does not exist`);
        continue;
      }

      const referencedEntry = await Data.findOne({
        _id: value,
        collectionId: referencedCollection._id
      });

      if (!referencedEntry) {
        errors.push(`Invalid reference: Entry ${value} not found in collection ${field.ref}`);
      }
    }

    // Unique check (Primary Key)
    if (field.unique) {
      const query = {
        collectionId: collection._id,
        [`data.${field.name}`]: value,
      };

      // Exclude current entry if updating
      if (entryId) {
        query._id = { $ne: entryId };
      }

      const existing = await Data.findOne(query);
      if (existing) {
        errors.push(`Value for ${field.name} already exists (must be unique)`);
      }
    }

    // If no errors for this field, add to cleaned data
    cleanedData[field.name] = validatedValue;
  }

  return { errors, cleanedData };
};
