import express from "express";
import { getPlans } from "../modules/plans/planController.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

router.get("/", optionalAuth, getPlans);

export default router;
