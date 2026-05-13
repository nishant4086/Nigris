import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import crypto from "crypto";

async function testVerification() {
  console.log("🚀 Testing Email Verification Flow...");

  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nigris");
    console.log("✅ Database connected");

    const testEmail = "verify-test-" + Date.now() + "@example.com";
    
    // 2. Create Unverified User
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name: "Verify Test",
      email: testEmail,
      password: "password123",
      emailVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: expiresAt,
    });
    console.log(`✅ Created unverified user: ${testEmail}`);
    console.log(`✅ Token: ${token}`);

    // 3. Simulate Verification (Call the same logic as the controller)
    console.log("⏳ Simulating verification call...");
    
    const hashedAttempt = crypto.createHash("sha256").update(token).digest("hex");
    const foundUser = await User.findOne({ verificationToken: hashedAttempt });

    if (!foundUser) {
      throw new Error("User with token not found");
    }

    foundUser.emailVerified = true;
    foundUser.verificationToken = undefined;
    foundUser.verificationTokenExpiry = undefined;
    await foundUser.save();

    console.log("✅ Verification logic executed");

    // 4. Verify Final State
    const updatedUser = await User.findById(user._id);
    if (updatedUser.emailVerified === true) {
      console.log("🎉 TEST PASSED: User is now verified!");
    } else {
      console.log("❌ TEST FAILED: User is still unverified");
    }

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log("🧹 Test user cleaned up");

  } catch (error) {
    console.error("❌ Test failed!");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

testVerification();
