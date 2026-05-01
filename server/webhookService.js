import { webhookQueue } from "./queue/webhookQueue.js";

export const triggerWebhook = async (event, payload, projectId) => {
  try {
    if (!webhookQueue) {
      console.warn("[Webhook] Queue unavailable (Redis down) – skipping webhook for:", event);
      return;
    }
    // Non-blocking: pushes to BullMQ queue
    await webhookQueue.add(
      "processWebhook",
      { event, data: payload, projectId },
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for debugging
      }
    );
  } catch (err) {
    console.error("Failed to enqueue webhook job:", err.message);
  }
};