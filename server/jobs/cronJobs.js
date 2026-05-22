import cron from 'node-cron';
import os from 'os';
import { aiQueue } from '../workers/aiWorker.js';
import SystemMetric from '../models/SystemMetric.js';
import Usage from '../models/Usage.js';

// Run every minute to collect system metrics
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    // Aggregate requests from Usage collection in the last minute
    const usageStats = await Usage.aggregate([
      { $match: { timestamp: { $gte: oneMinuteAgo } } },
      {
        $group: {
          _id: null,
          requestCount: { $sum: 1 },
          errorCount: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
          avgLatencyMs: { $avg: "$responseTime" }
        }
      }
    ]);

    const stats = usageStats[0] || { requestCount: 0, errorCount: 0, avgLatencyMs: 0 };

    // Calculate Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Calculate CPU Usage
    const uptimeSeconds = process.uptime() || 1;
    const cpuUsageMicroseconds = process.cpuUsage().user + process.cpuUsage().system;
    const cpuUsage = Math.min((cpuUsageMicroseconds / (uptimeSeconds * 1000000)) * 100, 100);

    // Save metric record
    const metric = new SystemMetric({
      timestamp: now,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      activeConnections: 0,
      avgLatencyMs: Math.round(stats.avgLatencyMs * 100) / 100,
      errorCount: stats.errorCount,
      requestCount: stats.requestCount,
    });

    await metric.save();
  } catch (error) {
    console.error('[Cron] Failed to collect system metrics:', error.message);
  }
});

// Run every Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  console.log('[Cron] Triggering weekly AI report generation...');
  await aiQueue.add('generate-weekly-report', {}, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 }
  });
});
