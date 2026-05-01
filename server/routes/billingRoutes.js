import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCheckoutSession,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createRazorpaySubscription,
  verifyRazorpaySubscription,
  cancelRazorpaySubscription,
} from "../modules/billing/billingController.js";

const router = express.Router();

// Stripe checkout (existing)
router.post("/checkout", authMiddleware, createCheckoutSession);

// Razorpay one-time payments
router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify", authMiddleware, verifyRazorpayPayment);

// Razorpay subscriptions
router.post("/create-subscription", authMiddleware, createRazorpaySubscription);
router.post("/verify-subscription", authMiddleware, verifyRazorpaySubscription);
router.post("/cancel", authMiddleware, cancelRazorpaySubscription);

export default router;
