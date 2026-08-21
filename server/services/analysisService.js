const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const { calculateCustomerRecoveryScore } = require('./revenueRiskService');
const { analyzeFailuresWithAI } = require('./aiService');

const ALL_CATEGORIES = [
  'MERCHANT_SIDE',
  'CUSTOMER_SIDE',
  'BANK_OR_UPI',
  'PAYMENT_METHOD',
  'AUTHENTICATION',
  'INSUFFICIENT_FUNDS',
  'NETWORK_OR_TIMEOUT',
  'PAYMENT_ABANDONED',
  'UNKNOWN'
];

/**
 * Generates aggregated category cards and AI header summary
 */
const getGroupedFailureAnalysis = async (merchantId) => {
  // Query all failures in demo mode or for merchant
  const failures = await PaymentFailure.find({}).populate('customerId').populate('paymentId');

  let totalRisk = 0;
  let totalRecoverable = 0;
  const categoryStats = {};

  ALL_CATEGORIES.forEach(cat => {
    categoryStats[cat] = {
      category: cat,
      totalFailedPayments: 0,
      customerSet: new Set(),
      revenueAtRisk: 0,
      potentiallyRecoverable: 0,
      scoreSum: 0,
      recommendedAction: '',
      recommendedDelay: 0
    };
  });

  failures.forEach(f => {
    const cat = categoryStats[f.category] ? f.category : 'UNKNOWN';
    const cust = f.customerId;
    const scoreObj = calculateCustomerRecoveryScore(cust, f.amount, f.category, f.attemptNumber);
    const recoverableAmount = Math.round(f.amount * scoreObj.probability);

    categoryStats[cat].totalFailedPayments += 1;
    if (cust && cust._id) categoryStats[cat].customerSet.add(cust._id.toString());
    categoryStats[cat].revenueAtRisk += f.amount;
    categoryStats[cat].potentiallyRecoverable += recoverableAmount;
    categoryStats[cat].scoreSum += scoreObj.score;
    categoryStats[cat].recommendedAction = f.recommendedAction || categoryStats[cat].recommendedAction;
    categoryStats[cat].recommendedDelay = f.recommendedDelay || categoryStats[cat].recommendedDelay;

    totalRisk += f.amount;
    totalRecoverable += recoverableAmount;
  });

  const categoryCards = ALL_CATEGORIES.map(cat => {
    const stat = categoryStats[cat];
    const affectedCustomers = stat.customerSet.size;
    const avgScore = stat.totalFailedPayments > 0 ? Math.round(stat.scoreSum / stat.totalFailedPayments) : 0;

    return {
      category: cat,
      totalFailedPayments: stat.totalFailedPayments,
      affectedCustomers,
      revenueAtRisk: Math.round(stat.revenueAtRisk),
      potentiallyRecoverable: Math.round(stat.potentiallyRecoverable),
      averageRecoveryScore: avgScore,
      recommendedAction: stat.recommendedAction || 'Send recovery payment link.',
      recommendedDelay: stat.recommendedDelay
    };
  });

  const aiIntelligence = await analyzeFailuresWithAI();

  return {
    totalFailedPaymentsCount: failures.length,
    totalRevenueAtRisk: Math.round(totalRisk),
    totalPotentiallyRecoverable: Math.round(totalRecoverable),
    aiIntelligence,
    categoryCards
  };
};

/**
 * Returns affected customers list for a given category with filters & sorting
 */
const getCategoryCustomers = async (merchantId, category) => {
  const query = { category };

  const failures = await PaymentFailure.find(query)
    .populate('customerId')
    .populate('paymentId')
    .sort({ createdAt: -1 });

  return failures.map(f => {
    const cust = f.customerId;
    const scoreObj = calculateCustomerRecoveryScore(cust, f.amount, f.category, f.attemptNumber);
    
    let riskTag = 'LOW';
    if (scoreObj.score >= 80) riskTag = 'HIGH';
    else if (scoreObj.score >= 50) riskTag = 'MEDIUM';

    return {
      failureId: f._id,
      paymentId: f.paymentId ? f.paymentId.razorpayPaymentId : 'pay_unknown',
      mongoPaymentId: f.paymentId ? f.paymentId._id : null,
      customerId: cust ? cust._id : null,
      customerName: cust ? cust.name : 'Unknown Customer',
      customerEmail: cust ? cust.email : '',
      customerPhone: cust ? cust.phone : '',
      amount: f.amount,
      reason: f.reason,
      failureSubReason: f.failureSubReason || 'GENERIC_FAILURE',
      category: f.category,
      recoveryScore: scoreObj.score,
      recoveryScoreTag: riskTag, // HIGH, MEDIUM, LOW
      recoveryProbability: scoreObj.probability,
      recommendedAction: f.recommendedAction || 'Send recovery link',
      createdAt: f.createdAt
    };
  });
};

module.exports = {
  getGroupedFailureAnalysis,
  getCategoryCustomers
};
