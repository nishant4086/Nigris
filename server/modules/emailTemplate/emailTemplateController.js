import EmailTemplate from "../../models/EmailTemplate.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { extractVariables } from "../../utils/templateRenderer.js";

const getUserId = (req) => req.user?.userId || req.user?.id;

export const getEmailTemplates = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const templates = await EmailTemplate.find({ project: projectId });
  res.json(templates);
});

export const getEmailTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await EmailTemplate.findById(id);
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  res.json(template);
});

export const createEmailTemplate = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, slug, subject, html, type, isDefault } = req.body;

  const variables = extractVariables(html);
  const userId = getUserId(req);

  const template = await EmailTemplate.create({
    user: userId,
    project: projectId,
    name,
    slug,
    subject,
    html,
    variables,
    type,
    isDefault,
  });

  res.status(201).json(template);
});

export const updateEmailTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, subject, html, type, isDefault, isDraft } = req.body;

  const variables = html ? extractVariables(html) : undefined;

  const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
    id,
    { name, slug, subject, html, variables, type, isDefault, isDraft },
    { new: true }
  );

  res.json(updatedTemplate);
});

export const deleteEmailTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await EmailTemplate.findByIdAndDelete(id);
  res.status(204).end();
});
