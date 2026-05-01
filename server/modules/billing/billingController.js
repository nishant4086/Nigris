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

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const applyPlanToUser = async (user, planName, options = {}) => {
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
  let stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    return res.status(500).send(error.message);
  }
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing stripe signature");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("STRIPE_WEBHOOK_SECRET is not configured");
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const planName = session.metadata?.plan;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        const user = userId
          ? await User.findById(userId)
          : await User.findOne({ stripeCustomerId: customerId });

        if (user && planName) {
          await applyPlanToUser(user, planName, {
            status: "active",
            customerId,
            subscriptionId,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items?.data?.[0]?.price?.id || null;
        const plan = await getPlanByPriceId(priceId);
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user && plan) {
          const renewsAt = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null;

          await applyPlanToUser(user, plan.name, {
            status: subscription.status,
            customerId,
            subscriptionId: subscription.id,
            priceId,
            renewsAt,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          await applyPlanToUser(user, "free", {
            status: "canceled",
            subscriptionId: null,
            priceId: null,
            renewsAt: null,
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });

        if (user) {
          user.planStatus = "past_due";
          await user.save();
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).send(`Webhook handler error: ${error.message}`);
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
  console.log("[Billing] Razorpay webhook received");

  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    console.error("[Billing] Webhook missing x-razorpay-signature header");
    return res.status(400).send("Missing Razorpay signature");
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Billing] RAZORPAY_WEBHOOK_SECRET not set in env");
    return res.status(500).send("RAZORPAY_WEBHOOK_SECRET is not configured");
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

  const eventType = event.event;
  const payload = event.payload;
  console.log("[Billing] Webhook event:", eventType);

  try {
    switch (eventType) {
      case "subscription.activated": {
        const sub = payload.subscription?.entity;
        const userId = sub?.notes?.userId;
        console.log("[Billing] subscription.activated for userId:", userId);
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.subscriptionStatus = "active";
            user.razorpaySubscriptionId = sub.id;
            if (sub.charge_at) {
              user.nextBillingDate = new Date(sub.charge_at * 1000);
            }
            await user.save();

            await applyPlanToUser(user, "pro", { status: "active" });
            console.log("[Billing] ✅ User plan updated to pro via webhook:", userId);
          } else {
            console.error("[Billing] User not found for webhook userId:", userId);
          }
        }
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription?.entity;
        const userId = sub?.notes?.userId;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.subscriptionStatus = "active";
            if (sub.charge_at) {
              user.nextBillingDate = new Date(sub.charge_at * 1000);
            }
            await user.save();
          }
        }
        break;
      }

      case "subscription.completed":
      case "subscription.cancelled": {
        const sub = payload.subscription?.entity;
        const userId = sub?.notes?.userId;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.subscriptionStatus = "cancelled";
            user.razorpaySubscriptionId = null;
            user.nextBillingDate = null;
            await user.save();

            await applyPlanToUser(user, "free", {
              status: "canceled",
              renewsAt: null,
            });
          }
        }
        break;
      }

      case "subscription.halted": {
        const sub = payload.subscription?.entity;
        const userId = sub?.notes?.userId;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.subscriptionStatus = "halted";
            user.planStatus = "past_due";
            await user.save();
          }
        }
        break;
      }

      default:
        break;
    }

    console.log("[Billing] Webhook processed successfully:", eventType);
    res.json({ received: true });
  } catch (error) {
    console.error("[Billing] Razorpay webhook error:", error.message, error.stack);
    res.status(500).send(`Webhook handler error: ${error.message}`);
  }
};
