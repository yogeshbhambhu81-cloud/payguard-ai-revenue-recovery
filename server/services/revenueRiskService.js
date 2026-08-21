const { classifyFailure } = require('./failureClassificationService');

/**
 * Calculates Customer Recovery Score from 0 to 100
 * Formula weights:
 * 30% historical payment success rate
 * 20% recent successful payments factor
 * 20% failure reason category
 * 15% transaction amount ratio vs historical average
 * 15% number of previous failed attempts
 */
const calculateCustomerRecoveryScore = (customer, paymentAmount, failureCategory, attemptNumber = 1) => {
  let score = 50;

  // 1. Historical success rate (30%)
  if (customer && customer.totalPayments > 0) {
    const successRate = (customer.successfulPayments / customer.totalPayments) * 100;
    score += (successRate * 0.30) - 15; // Shift to -15 to +15 adjustment
  }

  // 2. Recent successful payments (20%)
  if (customer && customer.successfulPayments > 5) {
    score += 15;
  } else if (customer && customer.successfulPayments > 2) {
    score += 8;
  }

  // 3. Failure reason factor (20%)
  const failureWeights = {
    'UPI_FAILURE': 20,
    'BANK_FAILURE': 18,
    'NETWORK_ERROR': 18,
    'AUTHENTICATION_FAILURE': 8,
    'CARD_FAILURE': 10,
    'INSUFFICIENT_FUNDS': 0,
    'CUSTOMER_ERROR': 5,
    'UNKNOWN': 8
  };
  score += failureWeights[failureCategory] || 8;

  // 4. Transaction amount comparison (15%)
  if (customer && customer.averageTransactionAmount > 0) {
    const ratio = paymentAmount / customer.averageTransactionAmount;
    if (ratio <= 1.2) {
      score += 12; // Normal transaction size for this customer
    } else if (ratio <= 2.0) {
      score += 6;
    } else {
      score += 0; // Much higher than normal, higher friction
    }
  }

  // 5. Attempt number penalty (15%)
  if (attemptNumber === 1) {
    score += 15;
  } else if (attemptNumber === 2) {
    score += 5;
  } else {
    score += 0;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let label = 'LOW';
  if (finalScore >= 80) label = 'HIGH';
  else if (finalScore >= 60) label = 'MEDIUM';

  return {
    score: finalScore,
    label,
    probability: (finalScore / 100)
  };
};

/**
 * Calculates total Revenue at Risk and Potentially Recoverable Revenue
 */
const calculateRevenueRisk = (failedPaymentsWithCustomers) => {
  let totalRevenueAtRisk = 0;
  let totalPotentiallyRecoverable = 0;
  let highProbCount = 0;
  let mediumProbCount = 0;
  let lowProbCount = 0;

  failedPaymentsWithCustomers.forEach(fp => {
    const amount = fp.amount || 0;
    totalRevenueAtRisk += amount;

    const classification = classifyFailure(fp.method, fp.errorCode, fp.errorDescription, fp.errorReason);
    const scoreResult = calculateCustomerRecoveryScore(
      fp.customerId, 
      amount, 
      fp.category || classification.category, 
      fp.attemptNumber || 1
    );

    const recoverableForThisPayment = amount * scoreResult.probability;
    totalPotentiallyRecoverable += recoverableForThisPayment;

    if (scoreResult.label === 'HIGH') highProbCount++;
    else if (scoreResult.label === 'MEDIUM') mediumProbCount++;
    else lowProbCount++;
  });

  return {
    revenueAtRisk: Math.round(totalRevenueAtRisk),
    potentiallyRecoverable: Math.round(totalPotentiallyRecoverable),
    highProbCustomersCount: highProbCount,
    mediumProbCustomersCount: mediumProbCount,
    lowProbCustomersCount: lowProbCount
  };
};

module.exports = {
  calculateCustomerRecoveryScore,
  calculateRevenueRisk
};
