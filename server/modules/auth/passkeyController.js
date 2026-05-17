import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendTokenResponse } from "../../utils/tokenUtils.js";

const getWebAuthnConfig = (req) => {
  const originHeader = req.get("origin") || req.get("referer");

  let currentOrigin = "http://localhost:3000";
  let currentRPID = process.env.RP_ID || "localhost";

  if (originHeader) {
    try {
      const parsedUrl = new URL(originHeader);
      currentOrigin = parsedUrl.origin;
      currentRPID = parsedUrl.hostname;
    } catch (err) {
      // Ignore URL parsing errors
    }
  }

  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nigris.app",
    "https://api.nigris.app",
    "https://www.nigris.app",
    "https://app.nigris.app",
    "https://nigris.org",
    "https://api.nigris.org",
    "https://www.nigris.org",
    "https://app.nigris.org",
    "https://www.app.nigris.org",
    "https://app.nigris.org",
    "https://app.nigris.org",
    "https://app.nigris.org",
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((o) => o.trim()) : []),
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((o) => o.trim()) : [])
  ];

  const validOrigins = Array.from(new Set(allowedOrigins.filter(Boolean)));
  const validRPIDs = Array.from(new Set(validOrigins.map((u) => {
    try { return new URL(u).hostname; } catch (e) { return null; }
  }).filter(Boolean)));

  if (!validRPIDs.includes(currentRPID)) {
    validRPIDs.push(currentRPID);
  }
  if (!validOrigins.includes(currentOrigin)) {
    validOrigins.push(currentOrigin);
  }

  return {
    rpName: "Nigris SaaS",
    rpID: currentRPID,
    expectedOrigin: validOrigins,
    expectedRPID: validRPIDs,
  };
};

// 🆔 REGISTRATION
export const generatePasskeyRegistrationOptions = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { rpName, rpID } = getWebAuthnConfig(req);

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

  const { expectedOrigin, expectedRPID } = getWebAuthnConfig(req);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
    });
  } catch (err) {
    console.error("[Passkey] Registration verification error:", err.message);
    console.error("[Passkey] Config — expectedRPID:", expectedRPID, "expectedOrigin:", expectedOrigin);
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

  const { rpID } = getWebAuthnConfig(req);

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

  const { expectedOrigin, expectedRPID } = getWebAuthnConfig(req);

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
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
