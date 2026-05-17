import mongoose from "mongoose";

const SystemErrorSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stackTrace: { type: String },
    route: { type: String },
    method: { type: String },
    statusCode: { type: Number },
    traceId: { type: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const SystemError = mongoose.models.SystemError || mongoose.model("SystemError", SystemErrorSchema);

export default SystemError;
