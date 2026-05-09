import mongoose from "mongoose";
import crypto from "crypto";

const maskKey = (rawKey) => {
  if (!rawKey || typeof rawKey !== "string") return "";
  // Keep it deterministic and non-sensitive: last 4 chars only.
  const tail = rawKey.slice(-4);
  return `****${tail}`;
};

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Production fields
    hashedKey: {
      type: String,
      required: false,
      unique: true,
    },
    encryptedKey: {
      type: String,
      select: false,
    },
    keyIv: {
      type: String,
      select: false,
    },
    keyTag: {
      type: String,
      select: false,
    },
    maskedKey: {
      type: String,
      required: false,
    },

    environment: {
      type: String,
      enum: ["Development", "Production"],
      default: "Development",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    name: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    limit: {
      type: Number,
      default: 100,
    },

    usage: {
      type: Number,
      default: 0,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    resetAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },

    permissions: {
      type: [String],
      enum: ["read", "write", "admin"],
      default: ["read"],
    },

    // Legacy input support: allow `key` in create/update calls.
    // We do NOT store it permanently. It is used only to derive hashedKey/maskedKey.
    // Mongoose schema 'key' would persist, so we use a virtual below instead.
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Expose a `key` virtual so legacy code/tests can read `apiKey.key`.
// This does not persist.
apiKeySchema.virtual("key")
  .get(function () {
    return this.__rawKey;
  })
  .set(function (v) {
    this.__rawKey = v;
  });

apiKeySchema.pre("validate", function () {
  // Mongoose pre validate hooks do not always receive a `next` callback
  // depending on version; keep this hook sync.
  const rawKey = this.__rawKey;
  if (rawKey && !this.hashedKey) {
    this.hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  }

  if (rawKey && !this.maskedKey) {
    this.maskedKey = maskKey(rawKey);
  }
});


const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;

