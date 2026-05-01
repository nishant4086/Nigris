import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import dynamicRoutes from "./routes/dynamicRoutes.js";
import apiKeyRoutes from "./routes/apiKeyRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { handleStripeWebhook, handleRazorpayWebhook } from "./modules/billing/billingController.js";
import mongoSanitize from "express-mongo-sanitize";
import publicRoutes from "./routes/publicRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// ─── PRODUCTION HARDENING ────────────────────────────────
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

// Trust proxy for Render/Vercel (required for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: "Too many requests from this IP",
});

// Support multiple allowed origins (e.g. localhost + Vercel domain)
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((o) => o.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use("/api/billing/razorpay-webhook", express.raw({ type: "application/json" }), handleRazorpayWebhook);

const publicJsonParser = express.json({ limit: "100kb" });
const globalJsonParser = express.json({ limit: "10mb" });
const publicUrlParser = express.urlencoded({ limit: "100kb", extended: true });
const globalUrlParser = express.urlencoded({ limit: "10mb", extended: true });

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/public")) {
    publicJsonParser(req, res, (err) => {
      if (err) return next(err);
      publicUrlParser(req, res, next);
    });
  } else {
    globalJsonParser(req, res, (err) => {
      if (err) return next(err);
      globalUrlParser(req, res, next);
    });
  }
});

// Sanitize inputs to prevent NoSQL injection safely
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const cleanQuery = mongoSanitize.sanitize(req.query);
    // Express req.query is a getter, so we mutate the object in-place
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        delete req.query[key];
      }
    }
    Object.assign(req.query, cleanQuery);
  }
  next();
});

app.use("/api", limiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// Protected Analytics API
app.use("/api/usage", usageRoutes);

// Public API (API-key authenticated) routes
app.use("/api/public", publicRoutes);

// Webhooks API (API-key authenticated)
app.use("/api/webhooks", webhookRoutes);

// Dynamic routes (moved under /api/public to avoid API-key use on /api)
app.use("/api/public", dynamicRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorMiddleware);

export default app;