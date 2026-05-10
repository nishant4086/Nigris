/**
 * Set a user's role to "admin"
 *
 * Usage:
 *   node scripts/setAdmin.js <email>
 *
 * Examples:
 *   node scripts/setAdmin.js rankawatnishant41@gmail.com
 *   MONGO_URI=mongodb+srv://... node scripts/setAdmin.js rankawatnishant41@gmail.com
 */

import "dotenv/config";
import mongoose from "mongoose";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/setAdmin.js <email>");
  process.exit(1);
}

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGO_URI or MONGODB_URI found in environment");
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to:", uri.replace(/\/\/.*@/, "//***@"));

  const result = await mongoose.connection.db
    .collection("users")
    .findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role: "admin" } },
      { returnDocument: "after" }
    );

  if (result) {
    console.log(`✅ ${result.name} (${result.email}) is now admin`);
  } else {
    console.error(`❌ No user found with email: ${email}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
