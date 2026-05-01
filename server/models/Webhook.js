import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, "Valid URL required"],
    },
    event: {
      type: String,
      enum: ["entry.created"],
      default: "entry.created",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

webhookSchema.index({ project: 1, event: 1 });

export default mongoose.model("Webhook", webhookSchema);