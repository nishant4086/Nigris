import "dotenv/config";

import express from "express";
import cors from "cors";
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
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import BlogPost from "./models/BlogPost.js";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import passport from "./config/passportConfig.js";

const MongoStore = MongoDBStore(session);

const app = express();

// Trust proxy (important for Render)
app.set("trust proxy", 1);


// ================== ✅ CORS FIX ==================
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
    : [])
];

console.log("Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(null, false); // ❗ error throw नहीं करना
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
    secret: process.env.SESSION_SECRET || "nigris_secret_key",
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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("combined"));
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
app.use("/api/usage", usageRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/public", dynamicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

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
