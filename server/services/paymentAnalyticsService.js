const Payment = require('../models/Payment');
const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const RecoveryAction = require('../models/RecoveryAction');
const { calculateCustomerRecoveryScore, calculateRevenueRisk } = require('./revenueRiskService');
const { classifyFailure } = require('./failureClassificationService');

/**
 * Tool 1: getPaymentSummary
 * Calculates revenue today, success rate, failed payments count, total attempts
 */
const getPaymentSummary = async () => {
  const allPayments = await Payment.find().sort({ createdAt: -1 });

  let totalAttempts = allPayments.length;
  let successfulCount = 0;
  let failedCount = 0;
  let totalRevenueToday = 0;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  allPayments.forEach(p => {
    if (p.status === 'captured' || p.status === 'authorized') {
      successfulCount++;
      if (new Date(p.createdAt) >= startOfToday) {
        totalRevenueToday += p.amount;
      }
    } else if (p.status === 'failed') {
      failedCount++;
    }
  });

  // Calculate success rate
  const successRate = totalAttempts > 0 ? ((successfulCount / totalAttempts) * 100).toFixed(1) : 100;
  const failureRate = totalAttempts > 0 ? ((failedCount / totalAttempts) * 100).toFixed(1) : 0;

  // Calculate recovered revenue from completed RecoveryActions
  const completedActions = await RecoveryAction.find({ status: { $in: ['PAID', 'SUCCESSFUL'] } });
  const totalRecoveredAmount = completedActions.reduce((acc, act) => acc + (act.actualRecovery || act.estimatedRecovery || 0), 0);

  const riskData = await getRevenueAtRisk();

  return {
    totalRevenueToday: Math.round(totalRevenueToday),
    paymentSuccessRate: parseFloat(successRate),
    failureRate: parseFloat(failureRate),
    totalAttempts,
    successfulCount,
    failedCount,
    totalRecoveredAmount: Math.round(totalRecoveredAmount),
    revenueAtRisk: riskData.revenueAtRisk,
    potentiallyRecoverable: riskData.potentiallyRecoverable,
    highProbCustomersCount: riskData.highProbCustomersCount
  };
};

/**
 * Tool 2: getFailureBreakdown
 * Aggregates failure counts by category and payment method
 */
const getFailureBreakdown = async () => {
  const failures = await PaymentFailure.find();
  
  const categoryMap = {};
  const methodMap = {};

  failures.forEach(f => {
    categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    methodMap[f.method] = (methodMap[f.method] || 0) + 1;
  });

  const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
    category: cat,
    count: categoryMap[cat]
  })).sort((a, b) => b.count - a.count);

  const methodBreakdown = Object.keys(methodMap).map(m => ({
    method: m,
    count: methodMap[m]
  })).sort((a, b) => b.count - a.count);

  return {
    totalFailures: failures.length,
    categoryBreakdown,
    methodBreakdown
  };
};

/**
 * Tool 3: getRevenueAtRisk
 * Calculates total failed transaction value and estimated recoverable amount
 */
const getRevenueAtRisk = async () => {
  const failures = await PaymentFailure.find().populate('customerId');
  return calculateRevenueRisk(failures);
};

/**
 * Tool 4: getTopRecoverablePayments
 * Returns failed payments ranked by customer recovery score & transaction amount
 */
const getTopRecoverablePayments = async (limit = 15) => {
  const failures = await PaymentFailure.find({ retryable: true })
    .populate('paymentId')
    .populate('customerId')
    .sort({ createdAt: -1 });

  const ranked = failures.map(f => {
    const cust = f.customerId;
    const scoreObj = calculateCustomerRecoveryScore(cust, f.amount, f.category, f.attemptNumber);
    const classification = classifyFailure(f.method, f.paymentId?.errorCode, f.paymentId?.errorDescription, f.paymentId?.errorReason);

    return {
      failureId: f._id,
      paymentId: f.paymentId ? f.paymentId.razorpayPaymentId : 'pay_unknown',
      mongoPaymentId: f.paymentId ? f.paymentId._id : null,
      amount: f.amount,
      method: f.method,
      category: f.category,
      reason: f.reason,
      createdAt: f.createdAt,
      customer: {
        id: cust ? cust._id : null,
        name: cust ? cust.name : 'Unknown Customer',
        email: cust ? cust.email : '',
        phone: cust ? cust.phone : '',
        totalPayments: cust ? cust.totalPayments : 0,
        successfulPayments: cust ? cust.successfulPayments : 0
      },
      recoveryScore: scoreObj.score,
      recoveryLabel: scoreObj.label,
      recoveryProbability: scoreObj.probability,
      estimatedRecoverable: Math.round(f.amount * scoreObj.probability),
      aiRecommendation: classification.recommendation
    };
  }).sort((a, b) => b.recoveryScore - a.recoveryScore);

  return ranked.slice(0, limit);
};

/**
 * Tool 5: getPaymentTrend
 * Returns daily and hourly transaction failure trends over the last 7 days
 */
const getPaymentTrend = async () => {
  const payments = await Payment.find().sort({ createdAt: 1 });
  
  const hourlyFailures = Array(24).fill(0);
  const dailyData = {};

  payments.forEach(p => {
    const d = new Date(p.createdAt);
    const dayKey = d.toISOString().split('T')[0];
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = { date: dayKey, successful: 0, failed: 0, revenue: 0, failedAmount: 0 };
    }

    if (p.status === 'captured' || p.status === 'authorized') {
      dailyData[dayKey].successful++;
      dailyData[dayKey].revenue += p.amount;
    } else if (p.status === 'failed') {
      dailyData[dayKey].failed++;
      dailyData[dayKey].failedAmount += p.amount;
      hourlyFailures[d.getHours()]++;
    }
  });

  const dailyTrend = Object.values(dailyData);

  const hourlyTrend = hourlyFailures.map((count, hour) => ({
    hour: `${hour}:00`,
    failures: count
  }));

  return {
    dailyTrend,
    hourlyTrend
  };
};

/**
 * Tool 6: getCustomerHistory
 * Fetches customer profile, transaction count, success rate, and last payment date
 */
const getCustomerHistory = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) return null;

  const payments = await Payment.find({ customerId }).sort({ createdAt: -1 }).limit(10);
  const successRate = customer.totalPayments > 0 
    ? ((customer.successfulPayments / customer.totalPayments) * 100).toFixed(1)
    : 0;

  return {
    customer,
    successRate: parseFloat(successRate),
    recentPayments: payments
  };
};

module.exports = {
  getPaymentSummary,
  getFailureBreakdown,
  getRevenueAtRisk,
  getTopRecoverablePayments,
  getPaymentTrend,
  getCustomerHistory
};
