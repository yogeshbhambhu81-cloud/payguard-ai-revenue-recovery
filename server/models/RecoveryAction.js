const mongoose = require('mongoose');

const recoveryActionSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  actionType: { type: String, enum: ['PAYMENT_LINK', 'DIRECT_RETRY', 'DISCOUNT_OFFER'], default: 'PAYMENT_LINK' },
  status: { type: String, enum: ['CREATED', 'SENT', 'PAID', 'SUCCESSFUL', 'EXPIRED', 'FAILED'], default: 'CREATED' },
  paymentLinkId: { type: String },
  paymentLinkUrl: { type: String },
  referenceId: { type: String, required: true },
  estimatedRecovery: { type: Number, required: true },
  actualRecovery: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('RecoveryAction', recoveryActionSchema);
