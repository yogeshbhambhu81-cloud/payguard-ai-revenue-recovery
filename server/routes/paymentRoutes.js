const express = require('express');
const router = express.Router();
const { getPayments, getPaymentById, getFailedPayments, syncPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPayments);
router.get('/failed', protect, getFailedPayments);
router.get('/:id', protect, getPaymentById);
router.post('/sync', protect, syncPayments);

module.exports = router;
