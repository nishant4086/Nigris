/**
 * Jest globalSetup – ensures the MongoMemoryServer binary is downloaded
 * once before any test suite runs. This avoids per-suite download races
 * and the portability/timeout issues that plague first-run environments.
 */
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  // Creating (and immediately stopping) a server forces the binary download.
  // Subsequent MongoMemoryServer.create() calls in setup.js will reuse the
  // cached binary and start almost instantly.
  const mongod = await MongoMemoryServer.create();
  // Store the URI so globalTeardown can stop the same instance if needed,
  // but for now we just stop it immediately.
  globalThis.__MONGOD__ = mongod;

  // Expose the URI for potential reuse (not required with current setup.js pattern).
  process.env.__MONGOD_URI__ = mongod.getUri();
}
