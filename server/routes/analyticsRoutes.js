const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRevenue,
  getFailures,
  getRevenueRisk,
  getRecovery,
  getTrends
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);
router.get('/revenue', protect, getRevenue);
router.get('/failures', protect, getFailures);
router.get('/revenue-risk', protect, getRevenueRisk);
router.get('/recovery', protect, getRecovery);
router.get('/trends', protect, getTrends);

module.exports = router;
