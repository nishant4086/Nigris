import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    variables: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ["transactional", "marketing"],
      default: "transactional",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Slug should be unique per project
emailTemplateSchema.index({ project: 1, slug: 1 }, { unique: true });

const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);
export default EmailTemplate;
