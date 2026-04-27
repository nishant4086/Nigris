import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
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

    limit: {
      type: Number,
      default: 100,
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

const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;