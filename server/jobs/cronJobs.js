import cron from 'node-cron';
import { aiQueue } from '../workers/aiWorker.js';

// Run every Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  console.log('[Cron] Triggering weekly AI report generation...');
  await aiQueue.add('generate-weekly-report', {}, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 }
  });
});
