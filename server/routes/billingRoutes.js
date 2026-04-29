import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createCheckoutSession } from "../modules/billing/billingController.js";

const router = express.Router();

router.post("/checkout", authMiddleware, createCheckoutSession);

export default router;
