console.log("Loading smtpController.js...");
import SmtpConfig from "../../models/SmtpConfig.js";
import { encryptPassword } from "../../utils/smtpCrypto.js";
import mailService from "../../services/mailService.js";
import asyncHandler from "../../utils/asyncHandler.js";

const getUserId = (req) => req.user?.userId || req.user?.id;

export const getSmtpConfigs = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const configs = await SmtpConfig.find({ project: projectId }).select("-encryptedPassword -iv -tag");
  res.json(configs);
});

export const createSmtpConfig = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { provider, host, port, secure, username, password, fromEmail, fromName } = req.body;

  const { encryptedPassword, iv, tag } = encryptPassword(password);
  const userId = getUserId(req);

  // If this is the first config or explicitly set, make others inactive
  // For now, let's just allow one active config per project
  await SmtpConfig.updateMany({ project: projectId }, { isActive: false });

  const config = await SmtpConfig.create({
    user: userId,
    project: projectId,
    provider,
    host,
    port,
    secure,
    username,
    encryptedPassword,
    iv,
    tag,
    fromEmail,
    fromName,
    isActive: true,
  });

  res.status(201).json(config);
});

export const updateSmtpConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { provider, host, port, secure, username, password, fromEmail, fromName, isActive } = req.body;

  const updateData = { provider, host, port, secure, username, fromEmail, fromName, isActive };

  if (password) {
    const { encryptedPassword, iv, tag } = encryptPassword(password);
    updateData.encryptedPassword = encryptedPassword;
    updateData.iv = iv;
    updateData.tag = tag;
  }

  if (isActive === true) {
    const config = await SmtpConfig.findById(id);
    await SmtpConfig.updateMany({ project: config.project }, { isActive: false });
  }

  const updatedConfig = await SmtpConfig.findByIdAndUpdate(id, updateData, { new: true }).select("-encryptedPassword -iv -tag");
  res.json(updatedConfig);
});

export const deleteSmtpConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await SmtpConfig.findByIdAndDelete(id);
  res.status(204).end();
});

export const testSmtpConnection = asyncHandler(async (req, res) => {
  try {
    const result = await mailService.testConnection(req.body);
    res.json(result);
  } catch (error) {
    console.error("SMTP Test Error:", error.message);
    // Sanitize error messages — SMTP libraries may leak hostnames/credentials
    let safeMessage = "Connection failed. Verify your SMTP settings.";
    if (error.code === "EAUTH" || error.message?.includes("auth")) {
      safeMessage = "Authentication failed. Check your username and password.";
    } else if (error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED")) {
      safeMessage = "Connection refused. Verify the host and port.";
    } else if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
      safeMessage = "Connection timed out. Check host, port, and firewall settings.";
    } else if (error.message?.includes("certificate") || error.message?.includes("TLS")) {
      safeMessage = "TLS/SSL error. Try toggling the 'secure' setting.";
    }
    res.status(400).json({ error: safeMessage });
  }
});
