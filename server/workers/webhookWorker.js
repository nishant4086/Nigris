import { Worker } from "bullmq";
import axios from "axios";
import Webhook from "../models/Webhook.js";
import WebhookLog from "../models/WebhookLog.js";
import connection from "../config/redis.js";

const processJob = async (job) => {
  const { event, data, projectId, targetWebhookId } = job.data;
  
  // Base query
  const query = {
    project: projectId,
    event,
    isActive: true,
  };

  // If this is a targeted retry, only fetch the specific webhook
  if (targetWebhookId) {
    query._id = targetWebhookId;
  }

  // Fetch active webhooks from DB
  const webhooks = await Webhook.find(query);

  if (!webhooks || webhooks.length === 0) {
    return "No active webhooks found";
  }

  let hasError = false;

  for (const hook of webhooks) {
    try {
      const response = await axios.post(hook.url, {
        event,
        data,
        timestamp: new Date(),
      });

      await WebhookLog.create({
        webhookId: hook._id,
        project: projectId,
        url: hook.url,
        event,
        payload: data,
        status: "success",
        responseCode: response.status,
      });
    } catch (err) {
      hasError = true;
      await WebhookLog.create({
        webhookId: hook._id,
        project: projectId,
        url: hook.url,
        event,
        payload: data,
        status: "failed",
        errorMessage: err.message,
      });
    }
  }

  if (hasError) {
    throw new Error(`One or more webhooks failed to process out of ${webhooks.length}. See logs for details.`);
  }

  return `Successfully processed ${webhooks.length} webhooks`;
};

export const webhookWorker = new Worker("webhookQueue", processJob, {
  connection,
});

webhookWorker.on("completed", (job, returnvalue) => {
  console.log(`[BullMQ] Webhook job ${job.id} completed: ${returnvalue}`);
});

webhookWorker.on("failed", (job, err) => {
  console.error(`[BullMQ] Webhook job ${job.id} failed:`, err.message);
});
