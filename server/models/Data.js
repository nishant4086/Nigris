import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    data: {
      type: Object,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound index for paginated entry listing sorted by createdAt
dataSchema.index({ collectionId: 1, createdAt: -1 });

export default mongoose.model("Data", dataSchema);