import "dotenv/config";

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { pinoHttp } from "pino-http";
import { pino } from "pino";
import crypto from "crypto";

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
import depthCheckMiddleware from "./middleware/depthCheckMiddleware.js";
import publicRoutes from "./routes/publicRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import BlogPost from "./models/BlogPost.js";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import passport from "./config/passportConfig.js";
import smtpRoutes from "./modules/smtp/smtpRoutes.js";
import emailTemplateRoutes from "./modules/emailTemplate/emailTemplateRoutes.js";
import mailRoutes from "./modules/mail/mailRoutes.js";
import sdkRoutes from "./modules/sdk/sdkRoutes.js";

const MongoStore = MongoDBStore(session);

const app = express();

// Trust proxy (important for Render)
app.set("trust proxy", 1);


// ================== ✅ CORS FIX ==================
const allowedOrigins = [
  "http://localhost:3000",
  "https://nigris.app",
  "https://www.nigris.app",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
    : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ================== SESSION & PASSPORT ==================
// In production we use Mongo-backed sessions.
// In tests, MongoDB session store must not attempt localhost connections.
const mongoSessionUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  (process.env.NODE_ENV === "test" ? undefined : process.env.MONGODB_URI);

let store = null;
if (mongoSessionUri) {
  store = new MongoStore({
    uri: mongoSessionUri,
    collection: "sessions",
  });
} else {
  console.warn(
    "Mongo session store disabled: missing MONGODB_URI/MONGO_URI (tests will use stateless auth)"
  );
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "nigris_dev_secret_key",
    resave: false,
    saveUninitialized: false,
    store: store || undefined,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());


// ================== SECURITY ==================
// Per-request nonce for CSP script-src (replaces unsafe-inline)
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
          "https://checkout.razorpay.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://js.stripe.com"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ================== 📊 OBSERVABILITY ==================
const isTest = process.env.NODE_ENV === "test";
const logger = pino({
  level: isTest ? "silent" : (process.env.LOG_LEVEL || "info"),
});

app.use(pinoHttp({
  logger,
  autoLogging: !isTest,
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
  },
}));

app.use(compression());


// ================== RATE LIMIT ==================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: "Too many requests from this IP",
});


// ================== WEBHOOK RAW ==================
app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(
  "/api/billing/razorpay-webhook",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);


// ================== BODY PARSER ==================
const publicJsonParser = express.json({ limit: "100kb" });
const globalJsonParser = express.json({ limit: "10mb" });
const publicUrlParser = express.urlencoded({ limit: "100kb", extended: true });
const globalUrlParser = express.urlencoded({ limit: "10mb", extended: true });

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/public")) {
    publicJsonParser(req, res, (err) => {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
      }
      if (err) return next(err);
      publicUrlParser(req, res, next);
    });
  } else {
    globalJsonParser(req, res, (err) => {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
      }
      if (err) return next(err);
      globalUrlParser(req, res, next);
    });
  }
});

// ================== DEPTH CHECK ==================
app.use(depthCheckMiddleware);


// ================== SANITIZE ==================
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const cleanQuery = mongoSanitize.sanitize(req.query);
    for (const key in req.query) delete req.query[key];
    Object.assign(req.query, cleanQuery);
  }
  next();
});


// ================== ROUTES ==================
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/api/health", async (req, res) => {
  const { default: mongoose } = await import("mongoose");
  const { isRedisAvailable } = await import("./config/redis.js");

  const health = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      cache: isRedisAvailable ? "connected" : "disconnected",
    },
    version: process.env.npm_package_version || "1.0.0",
  };

  const isHealthy = health.services.database === "connected";
  res.status(isHealthy ? 200 : 503).json(health);
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
app.use("/api/usage", usageRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/public", dynamicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/smtp", smtpRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/sdk", sdkRoutes);

// Public blog posts endpoint (no auth)
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await BlogPost.find({ status: "published" })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});


// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


// ================== ERROR ==================
app.use(errorMiddleware);

export default app;
