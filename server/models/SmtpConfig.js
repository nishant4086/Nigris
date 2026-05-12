import mongoose from "mongoose";

const smtpConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      default: "custom",
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    secure: {
      type: Boolean,
      default: true,
    },
    username: {
      type: String,
      required: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one active config per project (or we can allow multiple and pick active)
smtpConfigSchema.index({ project: 1, isActive: 1 });

const SmtpConfig = mongoose.model("SmtpConfig", smtpConfigSchema);
export default SmtpConfig;
