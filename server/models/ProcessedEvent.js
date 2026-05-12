import mongoose from "mongoose";

const processedEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 7, // 7 days TTL
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProcessedEvent", processedEventSchema);
