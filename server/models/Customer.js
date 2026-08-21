const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  totalPayments: { type: Number, default: 0 },
  successfulPayments: { type: Number, default: 0 },
  failedPayments: { type: Number, default: 0 },
  totalSuccessfulAmount: { type: Number, default: 0 },
  averageTransactionAmount: { type: Number, default: 0 },
  lastPaymentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
