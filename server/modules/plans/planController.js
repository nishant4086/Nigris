import asyncHandler from "../../utils/asyncHandler.js";
import User from "../../models/User.js";
import { listPlans } from "../../utils/planUtils.js";

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await listPlans();
  let currentPlan = null;

  if (req.user?.userId) {
    const user = await User.findById(req.user.userId);
    currentPlan = user?.plan || null;
  }

  const payload = plans.map((plan) => ({
    name: plan.name,
    requestLimit: plan.requestLimit,
    price: plan.price,
    currency: plan.currency || "inr",
    stripeConfigured: Boolean(plan.stripePriceId && process.env.STRIPE_SECRET_KEY),
    isCurrent: currentPlan === plan.name,
  }));

  res.json(payload);
});
