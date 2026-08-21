const ScheduledRecovery = require('../models/ScheduledRecovery');
const CampaignRecipient = require('../models/CampaignRecipient');
const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { getOrCreateRecoveryAction } = require('./recoveryService');
const { sendEmail } = require('./emailService');
const logger = require('../utils/logger');

let schedulerTimer = null;

/**
 * Calculates scheduledFor timestamp based on original payment failure occurrence
 * Production rule: failureOccurredAt + 1 hour (60 minutes)
 * Demo accelerated rule: failureOccurredAt + DEMO_RECOVERY_DELAY_MINUTES (default 2 mins)
 */
const calculateScheduledTime = (failureOccurredAt, failureCategory = 'CUSTOMER_SIDE') => {
  const failureTime = failureOccurredAt ? new Date(failureOccurredAt).getTime() : Date.now();
  const isDemo = process.env.DEMO_MODE === 'true';

  let delayMinutes = 60; // 1 hour production default for CUSTOMER_SIDE
  if (isDemo) {
    delayMinutes = parseInt(process.env.DEMO_RECOVERY_DELAY_MINUTES || '2', 10);
  }

  const scheduledTime = new Date(failureTime + delayMinutes * 60 * 1000);
  const now = new Date();

  // If the calculated time has already passed, schedule immediately (now + 30 seconds fallback)
  if (scheduledTime <= now) {
    return new Date(now.getTime() + 10 * 1000);
  }

  return scheduledTime;
};

/**
 * Process a single due scheduled recovery task
 */
const processScheduledTask = async (task) => {
  try {
    task.status = 'PROCESSING';
    await task.save();

    const payment = await Payment.findById(task.paymentId);
    const customer = await Customer.findById(task.customerId);
    const failure = await PaymentFailure.findOne({ paymentId: task.paymentId });

    if (!payment || !customer) {
      task.status = 'FAILED';
      task.lastError = 'Payment or Customer model reference missing';
      await task.save();
      return;
    }

    // 1. Generate or retrieve unique per-customer RecoveryAction and Razorpay Payment Link
    const recoveryAction = await getOrCreateRecoveryAction(payment, customer, failure);

    // 2. Dispatch email via Brevo or Simulation engine
    const emailResult = await sendEmail({
      toEmail: customer.email,
      toName: customer.name,
      category: task.failureCategory,
      amount: payment.amount,
      paymentLink: recoveryAction.paymentLinkUrl
    });

    // 3. Update task status & recipient status
    task.status = emailResult.success ? 'COMPLETED' : 'FAILED';
    task.sentAt = new Date();
    task.lastError = emailResult.error || null;
    await task.save();

    if (task.campaignId) {
      await CampaignRecipient.updateOne(
        { campaignId: task.campaignId, customerId: task.customerId, paymentId: task.paymentId },
        { 
          status: emailResult.success ? 'SENT' : 'FAILED',
          recoveryActionId: recoveryAction._id,
          sentAt: new Date(),
          errorLog: emailResult.error || null
        }
      );
    }

    logger.info(`[Scheduler] Processed scheduled recovery for payment ${payment.razorpayPaymentId}. Status: ${task.status}`);
  } catch (error) {
    logger.error(`[Scheduler Error] Task ${task._id} failed: ${error.message}`);
    task.status = 'FAILED';
    task.attempts += 1;
    task.lastError = error.message;
    await task.save();
  }
};

/**
 * Polling loop checking for due scheduled recoveries
 */
const pollScheduledRecoveries = async () => {
  try {
    const dueTasks = await ScheduledRecovery.find({
      status: 'PENDING',
      scheduledFor: { $lte: new Date() }
    }).limit(10);

    for (const task of dueTasks) {
      await processScheduledTask(task);
    }
  } catch (error) {
    logger.error(`[Scheduler Polling Error] ${error.message}`);
  }
};

const startScheduler = () => {
  if (schedulerTimer) clearInterval(schedulerTimer);
  logger.info('[Scheduler Engine] Started polling scheduled recoveries every 15s...');
  schedulerTimer = setInterval(pollScheduledRecoveries, 15000);
};

const stopScheduler = () => {
  if (schedulerTimer) clearInterval(schedulerTimer);
};

module.exports = {
  calculateScheduledTime,
  startScheduler,
  stopScheduler,
  pollScheduledRecoveries
};
