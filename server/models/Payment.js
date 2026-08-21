const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayPaymentId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true }, // stored in INR float, e.g. 2499.00
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['captured', 'authorized', 'failed', 'refunded'], required: true },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'emi'], default: 'upi' },
  bank: { type: String },
  wallet: { type: String },
  vpa: { type: String },
  email: { type: String },
  contact: { type: String },
  errorCode: { type: String },
  errorDescription: { type: String },
  errorReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  capturedAt: { type: Date },
  metadata: { type: Object, default: {} }
});

module.exports = mongoose.model('Payment', paymentSchema);
