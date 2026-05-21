import SystemMetric from '../../models/SystemMetric.js';
import AiReport from '../../models/AiReport.js';
import { generateAiInsights } from './ollamaService.js';
import * as Sentry from '@sentry/node';

export const generateWeeklyReport = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Aggregate metrics
    const metrics = await SystemMetric.find({ timestamp: { $gte: oneWeekAgo } });
    
    const summary = {
      totalErrors: metrics.reduce((sum, m) => sum + m.errorCount, 0),
      avgCpu: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / (metrics.length || 1),
      avgLatency: metrics.reduce((sum, m) => sum + m.avgLatencyMs, 0) / (metrics.length || 1),
      totalRequests: metrics.reduce((sum, m) => sum + m.requestCount, 0),
    };

    const prompt = `
You are an expert Backend Infrastructure AI. Analyze the following weekly metrics for the Nigris API Platform and provide actionable intelligence.
Metrics Summary:
Total Errors: ${summary.totalErrors}
Average CPU Usage: ${summary.avgCpu.toFixed(2)}%
Average API Latency: ${summary.avgLatency.toFixed(2)}ms
Total Requests Processed: ${summary.totalRequests}

Return ONLY a JSON object exactly matching this schema, with no markdown formatting or extra text:
{
  "healthScore": <number 0-100 based on metrics>,
  "criticalIssues": [<array of strings describing urgent problems>],
  "performanceInsights": [<array of strings on performance optimization>],
  "securityInsights": [<array of strings on security posture>],
  "recommendations": [<array of actionable recommendations>],
  "predictions": [<array of predictive failure warnings>]
}
`;

    const result = await generateAiInsights(prompt);

    if (result.success && result.data) {
      const report = new AiReport({
        healthScore: result.data.healthScore || 50,
        criticalIssues: result.data.criticalIssues || [],
        performanceInsights: result.data.performanceInsights || [],
        securityInsights: result.data.securityInsights || [],
        recommendations: result.data.recommendations || [],
        predictions: result.data.predictions || [],
        rawOllamaResponse: result.raw
      });
      await report.save();
      return report;
    } else {
      Sentry.captureMessage(`AI Report Generation Failed: ${result.error}`);
      throw new Error("AI Generation returned invalid response");
    }

  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating weekly AI report", error);
    throw error;
  }
};
