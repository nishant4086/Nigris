import { Worker, Queue } from 'bullmq';
import redisConnection from '../config/redis.js';
import { generateWeeklyReport } from '../modules/intelligence/reportGenerator.js';
import * as Sentry from '@sentry/node';

export const aiQueue = new Queue('ai-jobs', { connection: redisConnection });

export const aiWorker = new Worker('ai-jobs', async (job) => {
  if (job.name === 'generate-weekly-report') {
    try {
      console.log(`[AI Worker] Starting weekly report generation...`);
      const report = await generateWeeklyReport();
      console.log(`[AI Worker] Successfully generated weekly report (ID: ${report._id})`);
      return report;
    } catch (error) {
      console.error(`[AI Worker] Failed to generate weekly report:`, error);
      Sentry.captureException(error);
      throw error;
    }
  }
}, {
  connection: redisConnection,
  concurrency: 1, // AI generation is heavy, limit concurrency
});

aiWorker.on('failed', (job, err) => {
  console.error(`[AI Worker] Job ${job.id} failed:`, err);
});
