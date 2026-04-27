import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    name: {
      type: String,
    },

    // 🔥 ADD THESE 3 FIELDS HERE

    limit: {
      type: Number,
      default: 100, // free plan limit
    },

    usage: {
      type: Number,
      default: 0,
    },

    resetAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export default mongoose.model("ApiKey", apiKeySchema);