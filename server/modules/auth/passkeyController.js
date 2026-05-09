import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken } from "../../utils/tokenUtils.js";

const rpName = "Nigris SaaS";
const rpID = process.env.RP_ID || "localhost";
const origin = process.env.FRONTEND_URL || "http://localhost:3000";

// 🆔 REGISTRATION
export const generatePasskeyRegistrationOptions = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const user = await User.findById(userId);

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

  // Store challenge temporarily (e.g., in user doc or session)
  // For simplicity, we'll use the user doc
  req.session.currentChallenge = options.challenge;

  res.json(options);
});

export const verifyPasskeyRegistration = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { body } = req.body;
  const user = await User.findById(userId);

  const expectedChallenge = req.session.currentChallenge;

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified) {
    const { registrationInfo } = verification;
    const { credential } = registrationInfo;

    user.passkeys.push({
      credentialID: credential.id, // already a base64url string in v10+
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports || [],
    });

    await user.save();
    res.json({ verified: true });
  } else {
    res.status(400).json({ error: "Passkey verification failed" });
  }
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

  req.session.currentChallenge = options.challenge;

  res.json(options);
});

export const verifyPasskeyAuthentication = asyncHandler(async (req, res) => {
  const { email, body } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  const expectedChallenge = req.session.currentChallenge;
  const passkey = user.passkeys.find((pk) => pk.credentialID === body.id);

  if (!passkey) {
    return res.status(400).json({ error: "Passkey not found" });
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.credentialID,
      publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
      counter: passkey.counter,
      transports: passkey.transports && passkey.transports.length > 0 ? passkey.transports : undefined,
    },
  });

  if (verification.verified) {
    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } else {
    res.status(401).json({ error: "Authentication failed" });
  }
});
