import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import dynamicRoutes from "./routes/dynamicRoutes.js";



dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP"
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/", limiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/data", dataRoutes);
app.use("/api", dynamicRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorMiddleware);


export default app;