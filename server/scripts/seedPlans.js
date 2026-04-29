import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../models/Plan.js";

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // optional: delete old plans
    await Plan.deleteMany();

    await Plan.insertMany([
      { name: "free", requestLimit: 100, price: 0, currency: "inr", stripePriceId: null },
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
    ]);

    console.log("✅ Plans seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();