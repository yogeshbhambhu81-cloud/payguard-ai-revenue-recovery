const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false },
  payloadHash: { type: String }
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
