import speakeasy from "speakeasy";
import qrcode from "qrcode";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import asyncHandler from "../../utils/asyncHandler.js";
import otpGenerator from "otp-generator";

export const setupMFA = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const user = await User.findById(userId);

  const secret = speakeasy.generateSecret({
    name: `Nigris (${user.email})`,
  });

  // Temporarily store secret (but don't enable MFA yet)
  user.totpSecret = secret.base32;
  await user.save();

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    qrCodeUrl,
    secret: secret.base32,
  });
});

export const verifyAndEnableMFA = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { token } = req.body;
  const user = await User.findById(userId).select("+totpSecret");

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid OTP code" });
  }

  // Generate Recovery Codes
  const codes = [];
  const hashedCodes = [];
  for (let i = 0; i < 8; i++) {
    const code = otpGenerator.generate(10, { upperCaseAlphabets: true, specialChars: false });
    codes.push(code);
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(code, salt);
    hashedCodes.push(hashedCode);
  }

  user.mfaEnabled = true;
  user.recoveryCodes = hashedCodes; 
  await user.save();

  res.json({
    message: "MFA enabled successfully",
    recoveryCodes: codes,
  });
});

export const disableMFA = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { token } = req.body;
  const user = await User.findById(userId).select("+totpSecret");

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid OTP code" });
  }

  user.mfaEnabled = false;
  user.totpSecret = undefined;
  user.recoveryCodes = undefined;
  await user.save();

  res.json({ message: "MFA disabled successfully" });
});
