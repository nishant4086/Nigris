import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
      type: String,
      required: function() { return this.provider === "local"; },
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local"
    },
    providerId: {
      type: String,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    planStatus: {
      type: String,
      enum: [
        "active",
        "canceled",
        "trialing",
        "past_due",
        "incomplete",
        "incomplete_expired",
        "unpaid"
      ],
      default: "active"
    },
    planRenewsAt: {
      type: Date,
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    stripePriceId: {
      type: String,
      default: null
    },
    razorpaySubscriptionId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "halted",
        "cancelled",
        "completed",
        "expired",
        "pending",
        null,
      ],
      default: null,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },
    // Security / MFA
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    totpSecret: {
      type: String,
      select: false
    },
    recoveryCodes: {
      type: [String],
      select: false
    },
    passkeys: {
      type: [{
        credentialID: String,
        publicKey: String,
        counter: Number,
        transports: [String],
      }],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
