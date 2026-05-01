import mongoose from "mongoose";
import Webhook from "../../models/Webhook.js";
import WebhookLog from "../../models/WebhookLog.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ➕ CREATE WEBHOOK
export const createWebhook = asyncHandler(async (req, res) => {
  const { url, event, isActive } = req.body;
  const project = req.project;

  if (!url || !event) {
    return res.status(400).json({ error: "URL and event are required" });
  }

  const webhook = await Webhook.create({
    url,
    event,
    isActive: isActive !== undefined ? isActive : true,
    project: project._id,
  });

  res.status(201).json(webhook);
});

// 📥 GET ALL WEBHOOKS
export const getWebhooks = asyncHandler(async (req, res) => {
  const project = req.project;

  const webhooks = await Webhook.find({ project: project._id }).sort({ createdAt: -1 });
  res.json(webhooks);
});

// ✏️ UPDATE WEBHOOK
export const updateWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid webhook ID" });
  }

  const webhook = await Webhook.findOneAndUpdate(
    { _id: id, project: project._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!webhook) {
    return res.status(404).json({ error: "Webhook not found" });
  }

  res.json(webhook);
});

// ❌ DELETE WEBHOOK
export const deleteWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid webhook ID" });
  }

  const webhook = await Webhook.findOneAndDelete({ _id: id, project: project._id });

  if (!webhook) {
    return res.status(404).json({ error: "Webhook not found" });
  }

  res.json({ message: "Webhook deleted successfully" });
});

// 📜 GET WEBHOOK LOGS
export const getWebhookLogs = asyncHandler(async (req, res) => {
  const project = req.project;
  const { event, page = 1, limit = 20 } = req.query;

  const filter = { project: project._id };
  if (event) {
    filter.event = event;
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const total = await WebhookLog.countDocuments(filter);
  const logs = await WebhookLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(l)
    .lean();

  res.json({
    data: logs,
    pagination: {
      total,
      page: p,
      limit: l,
      pages: Math.ceil(total / l),
    },
  });
});

// 🔄 RETRY WEBHOOK
export const retryWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = req.project;

  const log = await WebhookLog.findOne({ _id: id, project: project._id });
  if (!log) {
    return res.status(404).json({ error: "Webhook log not found" });
  }

  if (log.status !== "failed") {
    return res.status(400).json({ error: "Only failed webhooks can be retried" });
  }

  // Ensure webhook still exists and is active
  const webhook = await Webhook.findOne({ _id: log.webhookId, project: project._id, isActive: true });
  if (!webhook) {
    return res.status(400).json({ error: "Original webhook is no longer active or was deleted" });
  }

  // Safety checks
  if (log.retryCount >= 5) {
     return res.status(400).json({ error: "Max manual retry limit reached" });
  }

  // Update retry count
  log.retryCount = (log.retryCount || 0) + 1;
  log.lastRetryAt = new Date();
  await log.save();

  // Push new targeted job to BullMQ
  const { webhookQueue } = await import("../../queue/webhookQueue.js");
  await webhookQueue.add("processWebhook", {
    event: log.event,
    data: log.payload,
    projectId: log.project,
    targetWebhookId: log.webhookId
  });

  res.json({ message: "Webhook retry queued successfully", log });
});
