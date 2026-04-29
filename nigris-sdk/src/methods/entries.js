export async function createEntry(client, collectionId, data) {
  if (!client) {
    throw new Error("A client instance is required");
  }

  if (!collectionId || typeof collectionId !== "string") {
    throw new Error("collectionId is required");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("data must be an object");
  }

  return client.request({
    method: "POST",
    url: `/collections/${collectionId}/entries`,
    data,
  });
}

export async function listEntries(client, collectionId) {
  if (!client) {
    throw new Error("A client instance is required");
  }

  if (!collectionId || typeof collectionId !== "string") {
    throw new Error("collectionId is required");
  }

  return client.request({
    method: "GET",
    url: `/collections/${collectionId}`,
  });
}