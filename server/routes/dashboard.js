// Dashboard uchun API: umumiy statistika.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const statsService = require('../../services/statsService');
const logger = require('../../utils/logger');

const router = express.Router();

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await statsService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    logger.error('Dashboard summary xatosi:', error);
    res.status(500).json({ error: 'Ichki server xatosi yuz berdi.' });
  }
});

router.get('/growth', authMiddleware, async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 14, 90);

  try {
    const growth = await statsService.getUserGrowth(days);
    res.json({ growth });
  } catch (error) {
    logger.error('Dashboard growth xatosi:', error);
    res.status(500).json({ error: 'Ichki server xatosi yuz berdi.' });
  }
});

router.get('/top-viewed', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

  try {
    const topViewed = await statsService.getTopViewedMovies(limit);
    res.json({ topViewed });
  } catch (error) {
    logger.error('Dashboard top-viewed xatosi:', error);
    res.status(500).json({ error: 'Ichki server xatosi yuz berdi.' });
  }
});

module.exports = router;
