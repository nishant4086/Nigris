import NigrisClient from "./client.js";
import { createEntry, listEntries } from "./methods/entries.js";

export default class Nigris extends NigrisClient {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.entries = {
      create: this.create.bind(this),
      list: this.list.bind(this),
    };
  }

  async create(collectionId, data) {
    return createEntry(this, collectionId, data);
  }

  async list(collectionId) {
    return listEntries(this, collectionId);
  }
}

export { createEntry, listEntries };