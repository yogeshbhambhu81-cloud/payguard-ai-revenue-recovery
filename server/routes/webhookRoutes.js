const express = require('express');
const router = express.Router();
const WebhookEvent = require('../models/WebhookEvent');
const { verifyRazorpaySignature } = require('../utils/verifyWebhook');
const { completeRecoveryByReference } = require('../services/recoveryService');
const logger = require('../utils/logger');

router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isDemoSimulation = req.headers['x-demo-simulation'] === 'true' || process.env.DEMO_MODE === 'true';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate Signature if webhook secret is configured and not in demo simulation
    if (secret && !isDemoSimulation) {
      const isValid = verifyRazorpaySignature(req.rawBody, signature, secret);
      if (!isValid) {
        logger.warn('Invalid Razorpay Webhook signature received');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const payload = req.body || {};
    const eventType = payload.event;
    const eventId = payload.account_id ? `${payload.account_id}_${payload.created_at}_${eventType}` : `evt_${Date.now()}_${Math.random()}`;

    // Section 10: Webhook Idempotency
    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent && existingEvent.processed) {
      logger.info(`Webhook event ${eventId} already processed. Returning 200 OK (idempotent response).`);
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    // Save Webhook Event log
    await WebhookEvent.create({
      eventId,
      eventType: eventType || 'unknown',
      processed: false
    });

    logger.info(`Processing Razorpay Webhook Event: ${eventType}`);

    // Process event types
    if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const linkEntity = payload.payload?.payment_link?.entity || {};

      const referenceId = linkEntity.reference_id || paymentEntity.notes?.reference_id || paymentEntity.notes?.recoveryActionId;
      const paymentLinkId = linkEntity.id || paymentEntity.payment_link_id;
      const paidAmount = paymentEntity.amount ? paymentEntity.amount / 100 : (linkEntity.amount ? linkEntity.amount / 100 : 0);

      if (referenceId || paymentLinkId) {
        const updatedAction = await completeRecoveryByReference(referenceId, paymentLinkId, paidAmount);
        if (updatedAction) {
          logger.info(`Successfully processed recovery for reference ${referenceId}. Recovered ₹${paidAmount}`);
        }
      }
    }

    // Mark event as processed
    await WebhookEvent.updateOne({ eventId }, { processed: true });

    res.json({ success: true, message: 'Webhook event processed successfully', eventId });
  } catch (error) {
    logger.error('Error handling Razorpay webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
