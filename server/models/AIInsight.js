const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  type: { type: String, enum: ['DAILY_REPORT', 'ANOMALY_DETECTION', 'FAILURE_ANALYSIS', 'RECOVERY_STRATEGY'], required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  metric: { type: String },
  metricValue: { type: String },
  recommendation: { type: String },
  confidence: { type: Number, default: 0.85 },
  dataSnapshot: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIInsight', aiInsightSchema);
