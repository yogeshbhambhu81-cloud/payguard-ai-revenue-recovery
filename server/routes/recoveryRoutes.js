const express = require('express');
const router = express.Router();
const { createPaymentLink, getActions, getActionById } = require('../controllers/recoveryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/payment-link', protect, createPaymentLink);
router.get('/', protect, getActions);
router.get('/:id', protect, getActionById);

module.exports = router;
