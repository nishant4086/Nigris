import express from "express";

import {
  createDynamic,
  getDynamic,
  updateDynamic,
  deleteDynamic,
} from "../modules/dynamic/dynamicController.js";
import optionalAuth from "../middleware/optionalAuth.js";
import publicApiKeyMiddleware from "../middleware/publicApiKeyMiddleware.js";

const router = express.Router();

// Apply API-key auth for all dynamic routes.
// `publicApiKeyMiddleware` also attaches `req.project`.
router.use(publicApiKeyMiddleware);
// Allow Authorization header to be parsed when present so handlers can prefer
// user-based permissions over API-key project context.
router.use(optionalAuth);

// single registration per route
// optionalAuth is not required here since API-key middleware already provides auth context.
router.get("/:slug", getDynamic);
router.post("/:slug", createDynamic);
router.put("/:slug/:id", updateDynamic);
router.delete("/:slug/:id", deleteDynamic);

export default router;
