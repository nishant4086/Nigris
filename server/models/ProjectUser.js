import mongoose from "mongoose";

const projectUserSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      default: "viewer",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    inviteEmail: {
      type: String, // Stores email for users who don't exist yet
      lowercase: true,
    },
  },
  { timestamps: true }
);

// One membership per user per project
projectUserSchema.index({ project: 1, user: 1 }, { unique: true });
projectUserSchema.index({ inviteEmail: 1, project: 1 });

export default mongoose.model("ProjectUser", projectUserSchema);
