import EmailTemplate from "../../models/EmailTemplate.js";
import EmailLog from "../../models/EmailLog.js";
import mailService from "../../services/mailService.js";
import asyncHandler from "../../utils/asyncHandler.js";

const sanitizeMailError = (error) => {
  const msg = error.message || "";
  if (msg.includes("No active SMTP")) return "No active SMTP configuration found for this project. Please configure SMTP in your project dashboard before sending emails.";
  if (error.code === "EAUTH" || msg.includes("auth")) return "SMTP authentication failed. Check your SMTP username and password in project settings.";
  if (error.code === "ECONNREFUSED" || msg.includes("ECONNREFUSED")) return "Mail server connection refused. Verify your SMTP host and port.";
  if (error.code === "ETIMEDOUT" || msg.includes("timeout")) return "Mail server timed out. Check your SMTP host and port.";
  if (msg.includes("No recipients") || msg.includes("recipient")) return "Invalid recipient address.";
  if (msg.includes("decrypt") || msg.includes("cipher")) return "SMTP credentials are corrupted. Please re-save your SMTP configuration.";
  return "Email delivery failed. Please check your SMTP configuration.";
};

export const sendTemplatedEmail = asyncHandler(async (req, res) => {
  const { template: slug, to, variables } = req.body;
  const projectId = req.project._id; // Set by apiKeyMiddleware

  if (!slug) return res.status(400).json({ error: "'template' (slug) is required." });
  if (!to) return res.status(400).json({ error: "'to' (recipient email) is required." });

  const template = await EmailTemplate.findOne({ project: projectId, slug });

  if (!template) {
    return res.status(404).json({ error: `Email template '${slug}' not found. Create it in your project dashboard first.` });
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
    const status = error.message?.includes("No active SMTP") ? 422 : 400;
    res.status(status).json({ error: sanitizeMailError(error) });
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

  if (!to) return res.status(400).json({ error: "'to' (recipient email) is required." });
  if (!subject) return res.status(400).json({ error: "'subject' is required." });
  if (!html) return res.status(400).json({ error: "'html' (email body) is required." });
  if (!projectId) return res.status(400).json({ error: "Could not determine project. Ensure you are using a valid API key." });

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
    const status = error.message?.includes("No active SMTP") ? 422 : 400;
    res.status(status).json({ error: sanitizeMailError(error) });
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
