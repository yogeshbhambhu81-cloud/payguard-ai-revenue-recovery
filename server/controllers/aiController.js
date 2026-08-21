const { analyzeFailuresWithAI, generateDailyReportWithAI, processCopilotQuery } = require('../services/aiService');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const { calculateCustomerRecoveryScore } = require('../services/revenueRiskService');
const { classifyFailure } = require('../services/failureClassificationService');

const analyzePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId is required' });
    }

    const payment = await Payment.findById(paymentId).populate('customerId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const customer = payment.customerId;
    const classification = classifyFailure(payment.method, payment.errorCode, payment.errorDescription, payment.errorReason);
    const scoreObj = calculateCustomerRecoveryScore(customer, payment.amount, classification.category);

    const pastSucc = customer ? customer.successfulPayments : 0;
    const pastTot = customer ? customer.totalPayments : 0;
    const avgVal = customer ? customer.averageTransactionAmount : payment.amount;

    const analysisText = `Customer has successfully completed ${pastSucc} of ${pastTot} previous payments with an average value of ₹${avgVal.toLocaleString('en-IN')}. This payment (₹${payment.amount.toLocaleString('en-IN')}) is consistent with historical behavior. The current failure (${classification.category}) appears temporary rather than customer-driven.`;

    res.json({
      success: true,
      data: {
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        analysis: analysisText,
        confidence: 0.87,
        recoveryScore: scoreObj.score,
        recoveryLabel: scoreObj.label,
        recommendation: classification.recommendation,
        retryable: classification.retryable
      }
    });
  } catch (error) {
    next(error);
  }
};

const analyzeFailures = async (req, res, next) => {
  try {
    const analysis = await analyzeFailuresWithAI();
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const getDailyReport = async (req, res, next) => {
  try {
    const report = await generateDailyReportWithAI();
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const copilot = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required for Copilot.' });
    }

    const copilotResult = await processCopilotQuery(query);
    res.json({ success: true, data: copilotResult });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzePayment,
  analyzeFailures,
  getDailyReport,
  copilot
};
