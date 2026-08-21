const express = require('express');
const router = express.Router();
const { analyzePayment, analyzeFailures, getDailyReport, copilot } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze-payment', protect, analyzePayment);
router.post('/analyze-failures', protect, analyzeFailures);
router.get('/daily-report', protect, getDailyReport);
router.post('/copilot', protect, copilot);

module.exports = router;
