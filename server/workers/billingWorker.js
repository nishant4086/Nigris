import { Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import User from '../models/User.js';
import { getPlanByPriceId } from '../utils/planUtils.js';
import { createNotification } from '../utils/notificationUtils.js';
import { applyPlanToUser } from '../modules/billing/billingController.js';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger.js';

export const billingWorker = redisConnection 
  ? new Worker('billing-jobs', async (job) => {
      const { provider, event } = job.data;
      
      const startTime = Date.now();
      logger.info({ msg: `[Billing Worker] Processing ${provider} event: ${event.type || event.event}`, jobId: job.id });

      try {
        if (provider === 'stripe') {
          await handleStripeEvent(event);
        } else if (provider === 'razorpay') {
          await handleRazorpayEvent(event);
        }

        const processingTime = Date.now() - startTime;
        logger.info({ 
          msg: `[Billing Worker] Successfully processed ${provider} event`, 
          jobId: job.id, 
          processingTimeMs: processingTime 
        });

        return { success: true, processedAt: Date.now() };
      } catch (error) {
        logger.error({ 
          msg: `[Billing Worker] Failed to process ${provider} event`, 
          error: error.message, 
          stack: error.stack, 
          jobId: job.id 
        });
        Sentry.captureException(error);
        throw error;
      }
    }, {
      connection: redisConnection,
      concurrency: 5,
    })
  : { on: () => {}, close: async () => {} };

if (redisConnection) {
  billingWorker.on('failed', (job, err) => {
    logger.error({ msg: `[Billing Worker] Job ${job?.id} permanently failed`, error: err.message });
  });
}

// ─── STRIPE LOGIC ──────────────────────────────────────────
async function handleStripeEvent(event) {
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
        await createNotification(user._id, "billing", "Payment failed for your subscription. Please update your payment method.");
      }
      break;
    }
    default:
      break;
  }
}

// ─── RAZORPAY LOGIC ──────────────────────────────────────────
async function handleRazorpayEvent(event) {
  const eventType = event.event;
  const payload = event.payload;

  switch (eventType) {
    case "subscription.activated": {
      const sub = payload.subscription?.entity;
      const userId = sub?.notes?.userId;
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
}
