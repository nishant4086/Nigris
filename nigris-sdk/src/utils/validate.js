export function validateCollectionId(collectionId) {
  if (!collectionId || typeof collectionId !== "string") {
    throw new Error("Invalid collectionId");
  }
}

export function validateEntryId(entryId) {
  if (!entryId || typeof entryId !== "string") {
    throw new Error("Invalid entryId");
  }
}

export function validateData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data must be an object");
  }
}

export function validateFields(data, schema = []) {
  validateData(data);

  if (!Array.isArray(schema)) {
    throw new Error("Schema must be an array");
  }

  for (const field of schema) {
    if (!field || typeof field !== "object") {
      throw new Error("Invalid schema definition");
    }

    const { name, required = false, type } = field;

    if (!name || typeof name !== "string") {
      throw new Error("Invalid schema field name");
    }

    const value = data[name];

    if (required && (value === undefined || value === null || value === "")) {
      throw new Error(`Missing required field: ${name}`);
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (type === "text" && typeof value !== "string") {
      throw new Error(`Field ${name} must be a string`);
    }

    if (type === "number" && typeof value !== "number") {
      throw new Error(`Field ${name} must be a number`);
    }

    if (type === "boolean" && typeof value !== "boolean") {
      throw new Error(`Field ${name} must be a boolean`);
    }

    if (["image", "video", "file"].includes(type) && typeof value !== "string" && typeof value !== "object") {
      throw new Error(`Field ${name} has an invalid type`);
    }

    if (type === "reference") {
      if (typeof value !== "string" || !/^[0-9a-fA-F]{24}$/.test(value)) {
        throw new Error(`Field ${name} must be a valid reference ID`);
      }
    }
  }
}