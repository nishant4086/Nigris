/**
 * Centralized environment variable validation.
 * Called at server startup to fail-fast on missing critical config.
 */

const REQUIRED_VARS = {
  // Always required in production
  production: [
    "SESSION_SECRET",
    "JWT_SECRET",
    "SMTP_ENCRYPTION_KEY",
  ],
  // Required if features are enabled
  conditional: [
    { key: "STRIPE_SECRET_KEY", condition: () => !!process.env.ENABLE_STRIPE || !!process.env.STRIPE_SECRET_KEY },
    { key: "STRIPE_WEBHOOK_SECRET", condition: () => !!process.env.STRIPE_SECRET_KEY },
    { key: "RAZORPAY_KEY_ID", condition: () => !!process.env.ENABLE_RAZORPAY || !!process.env.RAZORPAY_KEY_ID },
  ],
  // At least one must be set
  database: ["MONGODB_URI", "MONGO_URI"],
};

export function validateEnv() {
  const isProd = process.env.NODE_ENV === "production";
  const errors = [];
  const warnings = [];

  // Database: at least one URI must exist
  const hasDbUri = REQUIRED_VARS.database.some((key) => !!process.env[key]);
  if (!hasDbUri) {
    errors.push(`One of [${REQUIRED_VARS.database.join(", ")}] is required`);
  }

  // Production-required vars
  if (isProd) {
    for (const key of REQUIRED_VARS.production) {
      if (!process.env[key]) {
        errors.push(`${key} is required in production`);
      }
    }
  } else {
    // Warn in dev if missing
    for (const key of REQUIRED_VARS.production) {
      if (!process.env[key]) {
        warnings.push(`${key} is not set (using dev fallback)`);
      }
    }
  }

  // Conditional vars
  for (const { key, condition } of REQUIRED_VARS.conditional) {
    if (condition() && !process.env[key]) {
      if (isProd) {
        errors.push(`${key} is required when its feature is enabled`);
      } else {
        warnings.push(`${key} is not set but its feature appears enabled`);
      }
    }
  }

  // Print warnings
  for (const w of warnings) {
    console.warn(`[ENV] ⚠️  ${w}`);
  }

  // Fail on errors in production, warn in dev
  if (errors.length > 0) {
    const msg = `[ENV] Missing critical environment variables:\n  - ${errors.join("\n  - ")}`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
}
