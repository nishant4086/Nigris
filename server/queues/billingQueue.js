import { Queue } from 'bullmq';
import redisConnection from '../config/redis.js';

export const billingQueue = redisConnection 
  ? new Queue('billing-jobs', { connection: redisConnection }) 
  : { 
      add: async () => console.log('[Mock Billing Queue] Added job (Redis unavailable)'),
      close: async () => {} 
    };
