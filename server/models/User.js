const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  businessName: { type: String, default: 'Razorpay Merchant Store' },
  primaryRazorpayKeyId: { type: String, default: 'rzp_live_primary_account' },
  secondaryRazorpayKeyId: { type: String, default: 'rzp_live_secondary_hdfc_account' },
  secondaryRazorpayKeySecret: { type: String, default: 'sec_secret_key_hdfc_backup' },
  secondaryBankName: { type: String, default: 'HDFC Secondary Merchant Account' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
