import express from "express";
import {
  createDynamic,
  getDynamic,
  updateDynamic,
  deleteDynamic,
} from "../modules/dynamic/dynamicController.js";
import optionalAuth from "../middleware/optionalAuth.js";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware.js";
import rateLimiter from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// global middleware
router.use(apiKeyMiddleware);
router.use(rateLimiter);

// single registration per route
router.get("/:slug", optionalAuth, getDynamic);
router.post("/:slug", optionalAuth, createDynamic);
router.put("/:slug/:id", optionalAuth, updateDynamic);
router.delete("/:slug/:id", optionalAuth, deleteDynamic);

export default router;