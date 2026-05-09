/**
 * Jest globalTeardown – stops the MongoMemoryServer instance started
 * in globalSetup so the process exits cleanly.
 */
export default async function globalTeardown() {
  if (globalThis.__MONGOD__) {
    await globalThis.__MONGOD__.stop();
  }
}
