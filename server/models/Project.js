import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active"
    },
    settings: {
      isPublic: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, status: 1 });

export default mongoose.model("Project", projectSchema);