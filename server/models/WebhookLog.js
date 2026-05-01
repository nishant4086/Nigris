import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    webhookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webhook",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    responseCode: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying
webhookLogSchema.index({ project: 1, createdAt: -1 });
webhookLogSchema.index({ project: 1, event: 1 });
webhookLogSchema.index({ webhookId: 1 });

export default mongoose.model("WebhookLog", webhookLogSchema);
