import { NigrisClient } from "./client.js";
import {
  createEntry,
  listEntries,
  updateEntry,
  deleteEntry,
} from "./methods/entries.js";

export default class Nigris extends NigrisClient {
  constructor(apiKey, options = {}) {
    super(apiKey, options);

    // Namespace support: client.entries.create(), client.entries.list(), etc.
    this.entries = {
      create: this.create.bind(this),
      list: this.list.bind(this),
      update: this.update.bind(this),
      delete: this.delete.bind(this),
    };
  }

  // 📝 CREATE entry
  async create(collectionId, data) {
    return createEntry(this, collectionId, data);
  }

  // 📖 LIST entries (pagination + filtering)
  async list(collectionId, options = {}) {
    return listEntries(this, collectionId, options);
  }

  // ✏️ UPDATE entry (merge data)
  async update(entryId, data) {
    return updateEntry(this, entryId, data);
  }

  // ❌ DELETE entry
  async delete(entryId) {
    return deleteEntry(this, entryId);
  }
}

// Export all methods for modular usage
export { createEntry, listEntries, updateEntry, deleteEntry };