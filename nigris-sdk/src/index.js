import { NigrisClient } from "./client.js";
import {
  createEntry,
  listEntries,
  updateEntry,
  deleteEntry,
} from "./methods/entries.js";
import { sendTemplate, sendDirect } from "./methods/mail.js";

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

    this.mail = {
      sendTemplate: this.sendTemplate.bind(this),
      send: this.sendMail.bind(this),
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
  async update(entryId, data, options = {}) {
    return updateEntry(this, entryId, data, options);
  }

  // ❌ DELETE entry
  async delete(entryId) {
    return deleteEntry(this, entryId);
  }

  async sendTemplate(options) {
    return sendTemplate(this, options);
  }

  async sendMail(options) {
    return sendDirect(this, options);
  }
}

// Export all methods for modular usage
export { createEntry, listEntries, updateEntry, deleteEntry, sendTemplate, sendDirect };