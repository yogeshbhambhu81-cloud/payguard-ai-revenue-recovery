const Payment = require('../models/Payment');
const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const { calculateCustomerRecoveryScore } = require('../services/revenueRiskService');
const { classifyFailure } = require('../services/failureClassificationService');

const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.method = method;
    if (search) {
      query.$or = [
        { razorpayPaymentId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('customerId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('customerId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    let failureInfo = null;
    let customerHistory = null;
    let recoveryScore = null;

    if (payment.status === 'failed') {
      failureInfo = await PaymentFailure.findOne({ paymentId: payment._id });
      if (payment.customerId) {
        const customerPayments = await Payment.find({ customerId: payment.customerId._id }).sort({ createdAt: -1 });
        customerHistory = {
          totalPayments: payment.customerId.totalPayments,
          successfulPayments: payment.customerId.successfulPayments,
          failedPayments: payment.customerId.failedPayments,
          averageAmount: payment.customerId.averageTransactionAmount,
          recentPayments: customerPayments.slice(0, 5)
        };

        const scoreObj = calculateCustomerRecoveryScore(
          payment.customerId,
          payment.amount,
          failureInfo ? failureInfo.category : 'UPI_FAILURE',
          failureInfo ? failureInfo.attemptNumber : 1
        );
        recoveryScore = scoreObj;
      }
    }

    res.json({
      success: true,
      payment,
      failureInfo,
      customerHistory,
      recoveryScore
    });
  } catch (error) {
    next(error);
  }
};

const getFailedPayments = async (req, res, next) => {
  try {
    const { riskLevel, method, category, limit = 50 } = req.query;
    const query = {};

    if (riskLevel) query.riskLevel = riskLevel;
    if (method) query.method = method;
    if (category) query.category = category;

    const failures = await PaymentFailure.find(query)
      .populate('paymentId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Enrich failures with calculated recovery scores
    const enriched = failures.map(f => {
      const cust = f.customerId;
      const scoreObj = calculateCustomerRecoveryScore(cust, f.amount, f.category, f.attemptNumber);
      const classification = classifyFailure(f.method, f.paymentId?.errorCode, f.paymentId?.errorDescription, f.paymentId?.errorReason);

      return {
        _id: f._id,
        paymentId: f.paymentId ? f.paymentId.razorpayPaymentId : 'pay_unknown',
        mongoPaymentId: f.paymentId ? f.paymentId._id : null,
        amount: f.amount,
        method: f.method,
        category: f.category,
        reason: f.reason,
        attemptNumber: f.attemptNumber,
        retryable: f.retryable,
        createdAt: f.createdAt,
        customer: cust ? {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          successfulPayments: cust.successfulPayments,
          totalPayments: cust.totalPayments
        } : null,
        recoveryScore: scoreObj.score,
        recoveryLabel: scoreObj.label,
        recoveryProbability: scoreObj.probability,
        aiRecommendation: classification.recommendation
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

const syncPayments = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Razorpay payment sync executed successfully.',
      syncedCount: 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  getFailedPayments,
  syncPayments
};
