const mongoose = require('mongoose');

const recoveryCampaignSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  failureCategory: { type: String, required: true },
  failureSubReason: { type: String, default: 'ALL' },
  emailSubject: { type: String, required: true },
  emailTemplate: { type: String, required: true },
  recipientCount: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecoveryCampaign', recoveryCampaignSchema);
