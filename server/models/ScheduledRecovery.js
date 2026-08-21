const mongoose = require('mongoose');

const scheduledRecoverySchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryCampaign' },
  failureCategory: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date }
});

module.exports = mongoose.model('ScheduledRecovery', scheduledRecoverySchema);
