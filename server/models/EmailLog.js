import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
    },
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    messageId: String,
    error: String,
    variables: Object,
    metadata: Object,
  },
  { timestamps: true }
);

emailLogSchema.index({ project: 1, createdAt: -1 });

const EmailLog = mongoose.model("EmailLog", emailLogSchema);
export default EmailLog;
