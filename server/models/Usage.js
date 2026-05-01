import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Compound indexes for time-series filtering
usageSchema.index({ projectId: 1, timestamp: 1 });
usageSchema.index({ apiKeyId: 1, timestamp: 1 });

export default mongoose.model("Usage", usageSchema);
