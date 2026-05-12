/**
 * Jest globalSetup – ensures the MongoMemoryServer binary is downloaded
 * once before any test suite runs. This avoids per-suite download races
 * and the portability/timeout issues that plague first-run environments.
 */
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  try {
    const mongod = await MongoMemoryServer.create({
      binary: {
        version: "7.0.24",
      }
    });
    globalThis.__MONGOD__ = mongod;
    process.env.__MONGOD_URI__ = mongod.getUri();
  } catch (err) {
    console.error("Failed to start MongoMemoryServer in globalSetup:", err);
    throw err;
  }
}
