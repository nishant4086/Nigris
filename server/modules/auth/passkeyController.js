import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendTokenResponse } from "../../utils/tokenUtils.js";

const rpName = "Nigris SaaS";
const rpID = process.env.RP_ID || "localhost";
const origins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const expectedOrigin = origins.length === 1 ? origins[0] : origins;

// 🆔 REGISTRATION
export const generatePasskeyRegistrationOptions = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(user._id.toString())),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  // Persist challenge on the user document (sessions are unreliable for SPAs)
  user.currentPasskeyChallenge = options.challenge;
  await user.save();

  res.json(options);
});

export const verifyPasskeyRegistration = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const registrationResponse = req.body?.body || req.body;
  const user = await User.findById(userId).select("+currentPasskeyChallenge");
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const expectedChallenge = user.currentPasskeyChallenge;
  if (!expectedChallenge) {
    return res.status(400).json({ error: "No active passkey challenge. Please restart registration." });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });
  } catch (err) {
    console.error("[Passkey] Registration verification error:", err.message);
    console.error("[Passkey] Config — rpID:", rpID, "expectedOrigin:", expectedOrigin);
    return res.status(400).json({ error: `Passkey verification failed: ${err.message}` });
  }

  if (!verification.verified) {
    return res.status(400).json({ error: "Passkey verification failed" });
  }

  const { registrationInfo } = verification;
  const { credential } = registrationInfo;

  user.passkeys.push({
    credentialID: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports || [],
  });
  user.currentPasskeyChallenge = undefined; // single-use challenge
  await user.save();

  res.json({ verified: true });
});

// 🔓 AUTHENTICATION
export const generatePasskeyAuthenticationOptions = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.passkeys.length) {
    return res.status(400).json({ error: "No passkeys found for this user" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.passkeys.map((pk) => ({
      id: pk.credentialID,
      type: "public-key",
      transports: pk.transports && pk.transports.length > 0 ? pk.transports : undefined,
    })),
    userVerification: "preferred",
  });

  user.currentPasskeyChallenge = options.challenge;
  await user.save();

  res.json(options);
});

export const verifyPasskeyAuthentication = asyncHandler(async (req, res) => {
  const { email, body } = req.body;
  const user = await User.findOne({ email }).select("+currentPasskeyChallenge");

  if (!user) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  const expectedChallenge = user.currentPasskeyChallenge;
  if (!expectedChallenge) {
    return res.status(400).json({ error: "No active passkey challenge. Please restart login." });
  }

  const passkey = user.passkeys.find((pk) => pk.credentialID === body.id);
  if (!passkey) {
    return res.status(400).json({ error: "Passkey not found" });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
        counter: passkey.counter,
        transports: passkey.transports && passkey.transports.length > 0 ? passkey.transports : undefined,
      },
    });
  } catch (err) {
    console.error("[Passkey] Authentication verification error:", err.message);
    return res.status(401).json({ error: `Authentication failed: ${err.message}` });
  }

  if (!verification.verified) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  // Update counter and clear challenge
  passkey.counter = verification.authenticationInfo.newCounter;
  user.currentPasskeyChallenge = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
