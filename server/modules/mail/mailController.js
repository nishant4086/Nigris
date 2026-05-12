import EmailTemplate from "../../models/EmailTemplate.js";
import EmailLog from "../../models/EmailLog.js";
import mailService from "../../services/mailService.js";
import asyncHandler from "../../utils/asyncHandler.js";

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
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
});

export const sendDirectEmail = asyncHandler(async (req, res) => {
  const { projectId, to, subject, html } = req.body;
  
  try {
    const result = await mailService.sendDirectEmail({
      projectId,
      to,
      subject,
      html,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
