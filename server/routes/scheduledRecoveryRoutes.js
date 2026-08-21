const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getScheduledRecoveries,
  createScheduledRecovery,
  cancelScheduledRecovery
} = require('../controllers/scheduledRecoveryController');

router.use(protect);

router.get('/', getScheduledRecoveries);
router.post('/', createScheduledRecovery);
router.patch('/:id/cancel', cancelScheduledRecovery);

module.exports = router;
