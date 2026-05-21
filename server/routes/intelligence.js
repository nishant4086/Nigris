import express from 'express';
import AiReport from '../models/AiReport.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get the latest AI Intelligence Report
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const report = await AiReport.findOne().sort({ reportDate: -1 });
    if (!report) {
      return res.json(null);
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching latest AI report:', error);
    res.status(500).json({ error: 'Failed to fetch AI report' });
  }
});

// Get a list of historical reports
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const reports = await AiReport.find().sort({ reportDate: -1 }).limit(10).select('-rawOllamaResponse');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

// Force generate a report (Admin only)
import { aiQueue } from '../workers/aiWorker.js';
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    await aiQueue.add('generate-weekly-report', { triggeredBy: req.user.id });
    res.json({ message: 'AI Report generation queued successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue AI generation' });
  }
});

export default router;
