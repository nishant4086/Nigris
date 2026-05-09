import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  // Ensure all Mongo consumers (mongoose + session store) use the same in-memory server.
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // `connect-mongodb-session` in `server/app.js` reads MONGODB_URI.
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
  if (mongoServer) {
    await mongoServer.stop();
  }
});
