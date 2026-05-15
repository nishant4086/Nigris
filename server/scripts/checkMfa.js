// Diagnostic: node scripts/checkMfa.js <email>
import "dotenv/config";
import mongoose from "mongoose";
import speakeasy from "speakeasy";
import User from "../models/User.js";

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/checkMfa.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne({ email }).select("+totpSecret");

if (!user) {
  console.log("❌ User not found:", email);
  process.exit(1);
}

console.log("\n=== MFA Diagnostic for", email, "===");
console.log("mfaEnabled:", user.mfaEnabled);
console.log("totpSecret in DB:", user.totpSecret ? `${user.totpSecret.slice(0, 6)}…${user.totpSecret.slice(-4)} (${user.totpSecret.length} chars)` : "(missing!)");

if (user.totpSecret) {
  const expected = speakeasy.totp({
    secret: user.totpSecret,
    encoding: "base32",
  });
  console.log("\n👉 Expected TOTP code right NOW:", expected);
  console.log("   Compare this to what your authenticator app shows.");
  console.log("   If they DON'T match → your app has a stale secret. Re-setup MFA.");
}

await mongoose.disconnect();
