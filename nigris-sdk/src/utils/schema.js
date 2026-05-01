import { validateFields } from "./validate.js";

const normalizeFields = (schemaResponse) => {
  if (Array.isArray(schemaResponse)) {
    return schemaResponse;
  }

  if (schemaResponse && Array.isArray(schemaResponse.fields)) {
    return schemaResponse.fields;
  }

  return [];
};

export async function getCollectionSchema(client, collectionId, { forceRefresh = false } = {}) {
  if (!client || typeof client.request !== "function") {
    throw new Error("A valid client instance is required");
  }

  if (!collectionId || typeof collectionId !== "string") {
    throw new Error("Invalid collectionId");
  }

  const cacheKey = `collection:${collectionId}`;
  if (!forceRefresh && client.schemaCache?.has(cacheKey)) {
    return client.schemaCache.get(cacheKey);
  }

  const response = await client.request({
    method: "GET",
    url: `/collections/${collectionId}/schema`,
  });

  const schema = {
    collectionId,
    fields: normalizeFields(response),
    raw: response,
  };

  client.schemaCache?.set(cacheKey, schema);
  return schema;
}

export async function resolveEntryCollectionId(client, entryId) {
  if (!client || typeof client.request !== "function") {
    throw new Error("A valid client instance is required");
  }

  if (!entryId || typeof entryId !== "string") {
    throw new Error("Invalid entryId");
  }

  if (client.entryCollectionCache?.has(entryId)) {
    return client.entryCollectionCache.get(entryId);
  }

  const response = await client.request({
    method: "GET",
    url: `/entries/${entryId}`,
  });

  const collectionId = response?.collectionId;
  if (!collectionId || typeof collectionId !== "string") {
    throw new Error("Unable to resolve collection schema for entry");
  }

  client.entryCollectionCache?.set(entryId, collectionId);
  return collectionId;
}

export async function validateDataAgainstSchema(client, collectionId, data) {
  const schema = await getCollectionSchema(client, collectionId);
  validateFields(data, schema.fields);
  return schema;
}

export function cacheEntryCollection(client, entry) {
  if (!client?.entryCollectionCache || !entry) {
    return;
  }

  if (entry._id && entry.collectionId) {
    client.entryCollectionCache.set(entry._id, entry.collectionId);
  }
}

export function cacheEntryRecord(client, entry) {
  if (!client?.entryCache || !entry || !entry._id) {
    return;
  }

  client.entryCache.set(entry._id, entry);
  cacheEntryCollection(client, entry);
}

export function cacheEntriesFromList(client, entries = []) {
  if (!client?.entryCollectionCache || !Array.isArray(entries)) {
    return;
  }

  for (const entry of entries) {
    cacheEntryRecord(client, entry);
  }
}

export async function getCachedOrFetchedEntry(client, entryId) {
  if (client?.entryCache?.has(entryId)) {
    return client.entryCache.get(entryId);
  }

  if (!client || typeof client.request !== "function") {
    throw new Error("A valid client instance is required");
  }

  if (!entryId || typeof entryId !== "string") {
    throw new Error("Invalid entryId");
  }

  const entry = await client.request({
    method: "GET",
    url: `/entries/${entryId}`,
  });

  cacheEntryRecord(client, entry);
  return entry;
}