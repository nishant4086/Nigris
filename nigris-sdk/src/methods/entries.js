import {
  validateCollectionId,
  validateEntryId,
  validateData,
} from "../utils/validate.js";
import {
  cacheEntriesFromList,
  cacheEntryCollection,
  cacheEntryRecord,
  getCachedOrFetchedEntry,
  getCollectionSchema,
  validateDataAgainstSchema,
} from "../utils/schema.js";


const buildQueryParams = (options = {}) => {
  const params = {};

  if (options.page !== undefined) {
    if (!Number.isInteger(options.page) || options.page < 1) {
      throw new Error("Page must be a positive integer");
    }
    params.page = options.page;
  }

  if (options.limit !== undefined) {
    if (!Number.isInteger(options.limit) || options.limit < 1) {
      throw new Error("Limit must be a positive integer");
    }
    params.limit = options.limit;
  }

  if (options.filters && typeof options.filters === "object" && !Array.isArray(options.filters)) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined) {
        params[key] = value;
      }
    }
  }

  return params;
};

// CREATE
export const createEntry = async (client, collectionId, data) => {
  validateCollectionId(collectionId);
  validateData(data);
  await validateDataAgainstSchema(client, collectionId, data);

  const res = await client.request({
    method: "POST",
    url: `/collections/${collectionId}/entries`,
    data,
  });

  cacheEntryRecord(client, res);
  return res;
};

// LIST
export const listEntries = async (client, collectionId, options = {}) => {
  validateCollectionId(collectionId);

  const params = buildQueryParams(options);
  const res = await client.request({
    method: "GET",
    url: `/collections/${collectionId}/entries`,
    params,
  });

  if (res?.data) {
    cacheEntriesFromList(client, res.data);
  }

  return res;
};

// UPDATE
export const updateEntry = async (client, entryId, data) => {
  validateEntryId(entryId);
  validateData(data);

  const currentEntry = await getCachedOrFetchedEntry(client, entryId);
  const collectionId = currentEntry.collectionId;
  const mergedData = {
    ...(currentEntry.data || {}),
    ...data,
  };

  await validateDataAgainstSchema(client, collectionId, mergedData);

  const res = await client.request({
    method: "PATCH",
    url: `/entries/${entryId}`,
    data,
  });

  cacheEntryRecord(client, res);
  return res;
};

// DELETE
export const deleteEntry = async (client, entryId) => {
  validateEntryId(entryId);

  const res = await client.request({
    method: "DELETE",
    url: `/entries/${entryId}`,
  });

  return res;
};