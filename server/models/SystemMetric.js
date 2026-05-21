import mongoose from "mongoose";

const SystemMetricSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  cpuUsage: { type: Number, required: true },
  memoryUsage: { type: Number, required: true },
  activeConnections: { type: Number, default: 0 },
  avgLatencyMs: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  requestCount: { type: Number, default: 0 },
});

export default mongoose.model("SystemMetric", SystemMetricSchema);
