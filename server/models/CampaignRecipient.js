const mongoose = require('mongoose');

const campaignRecipientSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryCampaign', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  recoveryActionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryAction' },
  email: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'SCHEDULED', 'SENT', 'FAILED', 'OPENED', 'CLICKED', 'RECOVERED'], 
    default: 'PENDING' 
  },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  errorLog: { type: String }
});

module.exports = mongoose.model('CampaignRecipient', campaignRecipientSchema);
