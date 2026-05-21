import mongoose from "mongoose";
import ApiKey from "../models/ApiKey.js";

const ensureApiKeyIndexes = async (conn) => {
  try {
    const collection = conn.connection.collection("apikeys");
    const indexes = await collection.indexes();
    const legacyIndex = indexes.find((index) => index.name === "keyHash_1");

    if (legacyIndex) {
      await collection.dropIndex("keyHash_1");
      console.log("Dropped legacy ApiKey index: keyHash_1");
    }

    await ApiKey.syncIndexes();
  } catch (error) {
    console.warn("ApiKey index check failed:", error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      maxPoolSize: 10,
      // tls: true,
      // tlsAllowInvalidCertificates: true, // 👈 accept self-signed/untrusted cert
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await ensureApiKeyIndexes(conn);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB