const META_KEYS = new Set([
  "_id",
  "id",
  "collectionId",
  "project",
  "createdAt",
  "updatedAt",
  "__v",
]);

export const normalizeEntry = (entry) => {
  if (!entry || typeof entry !== "object") {
    return entry;
  }

  if (entry.data && typeof entry.data === "object" && !Array.isArray(entry.data)) {
    return entry;
  }

  const data = {};
  for (const [key, value] of Object.entries(entry)) {
    if (!META_KEYS.has(key)) {
      data[key] = value;
    }
  }

  return { ...entry, data };
};

export const mergeEntryData = (entry, updates) => {
  const normalized = normalizeEntry(entry) || {};
  const base = normalized.data && typeof normalized.data === "object" ? normalized.data : {};
  return { ...base, ...updates };
};
