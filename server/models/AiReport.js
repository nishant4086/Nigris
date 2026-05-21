import mongoose from "mongoose";

const AiReportSchema = new mongoose.Schema({
  reportDate: { type: Date, default: Date.now, index: true },
  healthScore: { type: Number, required: true },
  criticalIssues: [{ type: String }],
  performanceInsights: [{ type: String }],
  securityInsights: [{ type: String }],
  recommendations: [{ type: String }],
  predictions: [{ type: String }],
  rawOllamaResponse: { type: String }
});

export default mongoose.model("AiReport", AiReportSchema);
