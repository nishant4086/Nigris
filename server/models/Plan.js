import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    required: true,
  },

  requestLimit: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Plan", planSchema);