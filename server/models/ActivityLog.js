import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for fast queries by date
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
