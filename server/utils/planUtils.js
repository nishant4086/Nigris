import Plan from "../models/Plan.js";

const buildDefaultPlans = () => [
  {
    name: "free",
    requestLimit: 100,
    price: 0,
    currency: "inr",
    stripePriceId: null,
  },
  {
    name: "pro",
    requestLimit: 10000,
    price: 499,
    currency: "inr",
    stripePriceId: process.env.STRIPE_PRICE_PRO || null,
  },
  {
    name: "enterprise",
    requestLimit: 1000000,
    price: 1999,
    currency: "inr",
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
  },
];

export const ensurePlans = async () => {
  const plans = buildDefaultPlans();

  await Promise.all(
    plans.map((plan) => {
      const update = { ...plan };
      if (!update.stripePriceId) {
        delete update.stripePriceId;
      }

      return Plan.findOneAndUpdate({ name: plan.name }, update, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      });
    })
  );

  return Plan.find().sort({ price: 1 });
};

export const listPlans = async () => {
  return ensurePlans();
};

export const getPlanByName = async (name) => {
  if (!name) return null;
  let plan = await Plan.findOne({ name });
  if (!plan) {
    await ensurePlans();
    plan = await Plan.findOne({ name });
  }
  return plan;
};

export const getPlanByPriceId = async (priceId) => {
  if (!priceId) return null;
  let plan = await Plan.findOne({ stripePriceId: priceId });
  if (!plan) {
    await ensurePlans();
    plan = await Plan.findOne({ stripePriceId: priceId });
  }
  return plan;
};

export const getStripePriceIdForPlan = async (name) => {
  const plan = await getPlanByName(name);
  return plan?.stripePriceId || null;
};
