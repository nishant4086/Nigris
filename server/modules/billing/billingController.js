import Stripe from "stripe";
import User from "../../models/User.js";
import ApiKey from "../../models/ApiKey.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getPlanByName,
  getPlanByPriceId,
  getStripePriceIdForPlan,
} from "../../utils/planUtils.js";

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
