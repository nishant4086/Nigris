"use strict";

import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "boolean", "image", "video"],
    default: "text",
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    // 🔥 ADD THIS (VERY IMPORTANT)
    slug: {
      type: String,
      required: true,
      unique: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    fields: [fieldSchema],

    isPublic: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);