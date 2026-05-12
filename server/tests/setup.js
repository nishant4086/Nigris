import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  // Use the URI from globalSetup.js
  const uri = process.env.__MONGOD_URI__;
  if (!uri) {
    throw new Error("MONGODB_URI not found in process.env. Ensure globalSetup.js is running.");
  }

  process.env.MONGODB_URI = uri;
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri, { dbName: "jest" });
});


afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
