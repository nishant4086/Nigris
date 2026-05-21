import crypto from "crypto";
import Stripe from "stripe";
import User from "../../models/User.js";
import ApiKey from "../../models/ApiKey.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getPlanByName,
  getPlanByPriceId,
  getStripePriceIdForPlan,
} from "../../utils/planUtils.js";
import getRazorpayInstance from "../../config/razorpay.js";
import { createNotification } from "../../utils/notificationUtils.js";
import ProcessedEvent from "../../models/ProcessedEvent.js";
import { billingQueue } from "../../queues/billingQueue.js";
import { logger } from "../../utils/logger.js";

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const applyPlanToUser = async (user, planName, options = {}) => {
  const plan = await getPlanByName(planName);
  if (!plan) {
    return null;
  }

  user.plan = plan.name;
  if (options.status) user.planStatus = options.status;
  if (options.customerId) user.stripeCustomerId = options.customerId;
  if (options.subscriptionId) user.stripeSubscriptionId = options.subscriptionId;
  if (options.priceId) user.stripePriceId = options.priceId;
  if (options.renewsAt !== undefined) user.planRenewsAt = options.renewsAt;

  await user.save();

  await ApiKey.updateMany(
    { user: user._id },
    { $set: { limit: plan.requestLimit } }
  );

  // 🔔 Create Notification
  await createNotification(user._id, "plan", `Your account has been upgraded to the ${plan.name} plan!`);

  return plan;
};

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { plan } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!plan || plan === "free") {
    return res.status(400).json({ error: "A paid plan is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const priceId = await getStripePriceIdForPlan(plan);
  const stripeSecretConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  if (!stripeSecretConfigured || !priceId) {
    if (process.env.NODE_ENV === "production") {
      return res.status(400).json({
        error: "Stripe is not configured for this plan",
      });
    }

    const upgradedPlan = await applyPlanToUser(user, plan, {
      status: "active",
      priceId,
      renewsAt: null,
    });

    if (!upgradedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    return res.json({
      upgraded: true,
      plan: upgradedPlan.name,
      message: `Upgraded to ${upgradedPlan.name} in local development mode.`,
    });
  }

  const stripe = getStripeClient();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${clientUrl}/dashboard/plans?status=success`,
    cancel_url: `${clientUrl}/dashboard/plans?status=cancel`,
    metadata: {
      userId: user._id.toString(),
      plan,
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    },
  });

  res.json({ url: session.url });
});

export const handleStripeWebhook = async (req, res) => {
  const startTime = Date.now();
  let stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("[Billing] Stripe client init error:", error.message);
    return res.status(500).send("Payment provider unavailable");
  }
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing stripe signature");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Billing] STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).send("Webhook configuration error");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🛡️ IDEMPOTENCY CHECK
  try {
    const alreadyProcessed = await ProcessedEvent.findOne({ eventId: event.id });
    if (alreadyProcessed) {
      console.log(`[Billing] Event ${event.id} already processed. Skipping.`);
      return res.status(200).json({ received: true, duplication: true });
    }
    
    await ProcessedEvent.create({ eventId: event.id, provider: "stripe" });
  } catch (err) {
    console.error("[Billing] Idempotency check failed:", err.message);
    // Continue anyway to avoid blocking payment if DB is slow but entry exists
  }

  try {
    // 🚀 QUEUE THE EVENT FOR ASYNC PROCESSING
    await billingQueue.add('billing-event', { provider: 'stripe', event }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      jobId: `stripe-${event.id}`, // Extra safety
    });

    const latency = Date.now() - startTime;
    logger.info({ route: "/api/billing/webhook", provider: "stripe", latency, queueTime: Date.now() });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Billing] Stripe webhook queueing error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// ─── RAZORPAY ────────────────────────────────────────────

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { plan } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!plan || plan === "free") {
    return res.status(400).json({ error: "A paid plan is required" });
  }

  const planDoc = await getPlanByName(plan);
  if (!planDoc) {
    return res.status(404).json({ error: "Plan not found" });
  }

  if (planDoc.price <= 0) {
    return res.status(400).json({ error: "Cannot create order for free plan" });
  }

  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: planDoc.price * 100, // Convert to paise
    currency: (planDoc.currency || "INR").toUpperCase(),
    receipt: `rcpt_${userId}_${Date.now()}`,
    notes: {
      userId,
      plan: planDoc.name,
    },
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
    req.body || {};

  console.log("[Billing] verifyRazorpayPayment called:", { userId, razorpay_order_id, razorpay_payment_id, plan });

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  if (!plan) {
    return res.status(400).json({ error: "Plan is required" });
  }

  // Generate expected signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.error("[Billing] Payment signature mismatch for user:", userId);
    return res.status(400).json({ error: "Payment verification failed" });
  }

  // Signature is valid — upgrade the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const upgradedPlan = await applyPlanToUser(user, plan, {
    status: "active",
    renewsAt: null,
  });

  if (!upgradedPlan) {
    return res.status(404).json({ error: "Plan not found in database" });
  }

  console.log("[Billing] ✅ User upgraded:", { userId, plan: upgradedPlan.name, previousPlan: user.plan });

  res.json({
    success: true,
    plan: upgradedPlan.name,
    message: `Successfully upgraded to ${upgradedPlan.name}`,
  });
});

// ─── RAZORPAY SUBSCRIPTIONS ─────────────────────────────

const getRazorpayPlanId = (planId) => {
  const map = {
    pro_monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    pro_yearly: process.env.RAZORPAY_PLAN_PRO_YEARLY,
  };
  return map[planId] || planId;
};

export const createRazorpaySubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { planId } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!planId) {
    return res.status(400).json({ error: "planId is required" });
  }

  // Resolve the Razorpay plan_id at runtime
  const razorpayPlanId = getRazorpayPlanId(planId);

  if (!razorpayPlanId || razorpayPlanId === "null") {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const razorpay = getRazorpayInstance();

  let subscription;
  try {
    subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: planId.includes("yearly") ? 5 : 12,
      notes: {
        userId: user._id.toString(),
        userEmail: user.email,
      },
    });
  } catch (err) {
    console.error("Razorpay subscription error:", err.error || err.message || err);
    const msg = err.error?.description || err.message || "Failed to create subscription";
    return res.status(err.statusCode || 500).json({ error: msg });
  }

  res.json({
    subscriptionId: subscription.id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyRazorpaySubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    plan,
  } = req.body || {};

  console.log("[Billing] verifyRazorpaySubscription called:", { userId, razorpay_subscription_id, plan });

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  // For subscriptions: HMAC of payment_id|subscription_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.error("[Billing] Subscription signature mismatch for user:", userId);
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const planName = plan || "pro";
  const upgradedPlan = await applyPlanToUser(user, planName, {
    status: "active",
  });

  if (!upgradedPlan) {
    return res.status(404).json({ error: "Plan not found" });
  }

  user.razorpaySubscriptionId = razorpay_subscription_id;
  user.subscriptionStatus = "active";
  await user.save();

  console.log("[Billing] ✅ Subscription verified:", { userId, plan: upgradedPlan.name, subscriptionId: razorpay_subscription_id });

  res.json({
    success: true,
    plan: upgradedPlan.name,
    message: `Successfully subscribed to ${upgradedPlan.name}`,
  });
});

export const cancelRazorpaySubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.razorpaySubscriptionId) {
    return res.status(400).json({ error: "No active subscription found" });
  }

  const razorpay = getRazorpayInstance();

  try {
    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
  } catch (err) {
    // If subscription is already cancelled on Razorpay, proceed
    if (!err.statusCode || err.statusCode !== 400) {
      throw err;
    }
  }

  await applyPlanToUser(user, "free", {
    status: "canceled",
    renewsAt: null,
  });

  user.razorpaySubscriptionId = null;
  user.subscriptionStatus = "cancelled";
  user.nextBillingDate = null;
  await user.save();

  res.json({
    success: true,
    message: "Subscription cancelled. Downgraded to free plan.",
  });
});

export const handleRazorpayWebhook = async (req, res) => {
  const startTime = Date.now();
  console.log("[Billing] Razorpay webhook received");

  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    console.error("[Billing] Webhook missing x-razorpay-signature header");
    return res.status(400).send("Missing Razorpay signature");
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Billing] RAZORPAY_WEBHOOK_SECRET not set in env");
    return res.status(500).send("Webhook configuration error");
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body) // req.body is raw Buffer from express.raw()
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("[Billing] Webhook signature mismatch — check RAZORPAY_WEBHOOK_SECRET");
    return res.status(400).send("Invalid webhook signature");
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).send("Invalid JSON");
  }

  // 🛡️ IDEMPOTENCY CHECK
  try {
    const alreadyProcessed = await ProcessedEvent.findOne({ eventId: event.id });
    if (alreadyProcessed) {
      console.log(`[Billing] Razorpay Event ${event.id} already processed. Skipping.`);
      return res.status(200).json({ received: true, duplication: true });
    }
    
    await ProcessedEvent.create({ eventId: event.id, provider: "razorpay" });
  } catch (err) {
    console.error("[Billing] Razorpay Idempotency check failed:", err.message);
  }

  const eventType = event.event;
  const payload = event.payload;
  console.log("[Billing] Webhook event:", eventType);

  try {
    // 🚀 QUEUE THE EVENT FOR ASYNC PROCESSING
    await billingQueue.add('billing-event', { provider: 'razorpay', event }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      jobId: `razorpay-${event.id}`, // Extra safety
    });

    const latency = Date.now() - startTime;
    logger.info({ route: "/api/billing/razorpay-webhook", provider: "razorpay", latency, queueTime: Date.now() });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Billing] Razorpay webhook queueing error:", error.message, error.stack);
    res.status(500).send("Internal Server Error");
  }
};
