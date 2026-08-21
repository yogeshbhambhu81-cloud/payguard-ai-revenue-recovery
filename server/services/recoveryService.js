const RecoveryAction = require('../models/RecoveryAction');
const Payment = require('../models/Payment');
const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const { createRazorpayPaymentLink } = require('./razorpayService');
const { calculateCustomerRecoveryScore } = require('./revenueRiskService');
const logger = require('../utils/logger');

/**
 * Gets existing active RecoveryAction or creates a fresh one for the payment.
 */
const getOrCreateRecoveryAction = async (payment, customer, failure, options = {}) => {
  const { bankRoute = 'PRIMARY' } = options;
  const isSecondary = failure?.category === 'MERCHANT_SIDE' || bankRoute === 'SECONDARY_RAZORPAY_ACCOUNT';

  let recoveryAction = await RecoveryAction.findOne({ paymentId: payment._id });

  if (!recoveryAction) {
    const referenceId = `ref_rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const category = failure ? failure.category : 'UPI_FAILURE';
    const scoreObj = calculateCustomerRecoveryScore(customer, payment.amount, category);
    const estimatedRecovery = Math.round(payment.amount * (scoreObj.probability || 0.7));

    recoveryAction = await RecoveryAction.create({
      paymentId: payment._id,
      customerId: customer ? customer._id : null,
      actionType: 'PAYMENT_LINK',
      status: 'CREATED',
      referenceId,
      estimatedRecovery
    });

    const linkRes = await createRazorpayPaymentLink({
      amount: payment.amount,
      currency: payment.currency || 'INR',
      referenceId,
      description: isSecondary
        ? `HDFC Backup Merchant Route Recovery for Payment ${payment.razorpayPaymentId}`
        : `PayGuard AI Recovery for Payment ${payment.razorpayPaymentId}`,
      customer: {
        name: customer ? customer.name : 'Valued Customer',
        email: customer ? customer.email : 'customer@example.com',
        phone: customer ? customer.phone : '+919876543210'
      },
      recoveryActionId: recoveryAction._id,
      originalPaymentId: payment.razorpayPaymentId,
      useSecondaryRoute: isSecondary,
      bankRoute: isSecondary ? 'SECONDARY_RAZORPAY_ACCOUNT' : 'PRIMARY'
    });

    recoveryAction.paymentLinkId = linkRes.id;
    recoveryAction.paymentLinkUrl = linkRes.short_url;
    recoveryAction.status = 'SENT';
    await recoveryAction.save();
  }

  return recoveryAction;
};

/**
 * Initiates payment recovery by creating a RecoveryAction and Razorpay Payment Link
 */
const initiateRecovery = async (paymentId, options = {}) => {
  const payment = await Payment.findById(paymentId).populate('customerId');
  if (!payment) {
    throw new Error('Payment record not found');
  }

  const customer = payment.customerId;
  const failure = await PaymentFailure.findOne({ paymentId: payment._id });

  return await getOrCreateRecoveryAction(payment, customer, failure, options);
};

/**
 * Marks a RecoveryAction as successful from Razorpay Webhook event
 */
const completeRecoveryByReference = async (referenceId, paymentLinkId, paidAmount) => {
  let recoveryAction = null;

  if (referenceId) {
    recoveryAction = await RecoveryAction.findOne({ referenceId });
  }

  if (!recoveryAction && paymentLinkId) {
    recoveryAction = await RecoveryAction.findOne({ paymentLinkId });
  }

  if (!recoveryAction) {
    logger.warn(`No RecoveryAction found matching referenceId: ${referenceId} or paymentLinkId: ${paymentLinkId}`);
    return null;
  }

  recoveryAction.status = 'SUCCESSFUL';
  recoveryAction.actualRecovery = paidAmount || recoveryAction.estimatedRecovery;
  recoveryAction.completedAt = new Date();
  await recoveryAction.save();

  // Also update Customer aggregate successful stats
  if (recoveryAction.customerId) {
    const cust = await Customer.findById(recoveryAction.customerId);
    if (cust) {
      cust.successfulPayments += 1;
      cust.totalSuccessfulAmount += recoveryAction.actualRecovery;
      await cust.save();
    }
  }

  logger.info(`RecoveryAction ${recoveryAction._id} marked SUCCESSFUL with amount ₹${recoveryAction.actualRecovery}`);
  return recoveryAction;
};

module.exports = {
  getOrCreateRecoveryAction,
  initiateRecovery,
  completeRecoveryByReference
};
