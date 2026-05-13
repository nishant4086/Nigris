import EmailTemplate from "../../models/EmailTemplate.js";
import EmailLog from "../../models/EmailLog.js";
import mailService from "../../services/mailService.js";
import asyncHandler from "../../utils/asyncHandler.js";

const sanitizeMailError = (error) => {
  const msg = error.message || "";
  if (error.code === "EAUTH" || msg.includes("auth")) return "SMTP authentication failed. Check project SMTP settings.";
  if (error.code === "ECONNREFUSED" || msg.includes("ECONNREFUSED")) return "Mail server connection refused.";
  if (error.code === "ETIMEDOUT" || msg.includes("timeout")) return "Mail server timed out.";
  if (msg.includes("No recipients") || msg.includes("recipient")) return "Invalid recipient address.";
  return "Email delivery failed. Please check your configuration.";
};

export const sendTemplatedEmail = asyncHandler(async (req, res) => {
  const { template: slug, to, variables } = req.body;
  const projectId = req.project._id; // Set by apiKeyMiddleware

  const template = await EmailTemplate.findOne({ project: projectId, slug });

  if (!template) {
    return res.status(404).json({ error: "Email template not found" });
  }

  try {
    const result = await mailService.sendTemplatedEmail({
      projectId,
      to,
      template,
      variables,
    });
    res.json(result);
  } catch (error) {
    console.error("[Mail] sendTemplatedEmail error:", error.message);
    res.status(400).json({ error: sanitizeMailError(error) });
  }
});

export const testSendTemplate = asyncHandler(async (req, res) => {
  const { templateId, to, variables } = req.body;
  const template = await EmailTemplate.findById(templateId);

  if (!template) {
    return res.status(404).json({ error: "Email template not found" });
  }

  try {
    const result = await mailService.sendTemplatedEmail({
      projectId: template.project,
      to,
      template,
      variables,
    });
    res.json(result);
  } catch (error) {
    console.error("[Mail] testSendTemplate error:", error.message);
    res.status(400).json({ error: sanitizeMailError(error) });
  }
});

export const sendDirectEmail = asyncHandler(async (req, res) => {
  const { to, subject, html } = req.body;
  const projectId = req.project?._id || req.body.projectId;
  
  try {
    const result = await mailService.sendDirectEmail({
      projectId,
      to,
      subject,
      html,
    });
    res.json(result);
  } catch (error) {
    console.error("[Mail] sendDirectEmail error:", error.message);
    res.status(400).json({ error: sanitizeMailError(error) });
  }
});

export const getEmailLogs = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const logs = await EmailLog.find({ project: projectId })
    .populate("template", "name slug")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(logs);
});
