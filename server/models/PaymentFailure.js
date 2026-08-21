const mongoose = require('mongoose');

const paymentFailureSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'MERCHANT_SIDE',
      'CUSTOMER_SIDE',
      'BANK_OR_UPI',
      'PAYMENT_METHOD',
      'AUTHENTICATION',
      'INSUFFICIENT_FUNDS',
      'NETWORK_OR_TIMEOUT',
      'PAYMENT_ABANDONED',
      'UNKNOWN'
    ],
    default: 'UNKNOWN'
  },
  failureSubReason: { type: String, default: 'GENERIC_FAILURE' },
  failureSource: { type: String, default: 'gateway' },
  classificationConfidence: { type: Number, default: 0.95 },
  recommendedAction: { type: String, default: 'Generate Razorpay payment link' },
  recommendedDelay: { type: Number, default: 0 }, // in minutes
  recoveryScore: { type: Number, default: 75 }, // 0 to 100
  method: { type: String, default: 'upi' },
  attemptNumber: { type: Number, default: 1 },
  retryable: { type: Boolean, default: true },
  riskLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
  aiClassification: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentFailure', paymentFailureSchema);
