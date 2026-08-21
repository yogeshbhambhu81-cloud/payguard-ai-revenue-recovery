const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const PaymentFailure = require('../models/PaymentFailure');
const AIInsight = require('../models/AIInsight');
const RecoveryAction = require('../models/RecoveryAction');
const WebhookEvent = require('../models/WebhookEvent');
const RecoveryCampaign = require('../models/RecoveryCampaign');
const ScheduledRecovery = require('../models/ScheduledRecovery');
const CampaignRecipient = require('../models/CampaignRecipient');

const seedData = async () => {
  try {
    console.log('Seeding database with ~750 realistic merchant transactions across 9 failure categories...');
    
    // Clear existing collections
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Payment.deleteMany({});
    await PaymentFailure.deleteMany({});
    await AIInsight.deleteMany({});
    await RecoveryAction.deleteMany({});
    await WebhookEvent.deleteMany({});
    await RecoveryCampaign.deleteMany({});
    await ScheduledRecovery.deleteMany({});
    await CampaignRecipient.deleteMany({});

    // Create Demo Merchant
    const passwordHash = await bcrypt.hash('demo123', 10);
    const demoUser = await User.create({
      name: 'Demo Merchant',
      email: 'demo@payguard.ai',
      passwordHash,
      businessName: 'Apex Fashion & Tech India'
    });
    console.log(`Created demo user: ${demoUser.email}`);

    // Create 45 Tiered Customers
    const customerDocs = [];
    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Rohan', 'Ananya', 'Vikram', 'Pooja', 'Suresh', 'Kavita', 'Neeraj', 'Divya', 'Deepak', 'Meera', 'Rajesh', 'Aditi', 'Sanjay', 'Ritu', 'Manish', 'Shweta', 'Arjun', 'Tanvi', 'Karan', 'Simran', 'Gaurav', 'Nisha', 'Aakash', 'Kriti', 'Varun', 'Swati', 'Tarun', 'Ishita', 'Abhishek', 'Bhavna', 'Pranav', 'Richa', 'Nikhil', 'Juhi', 'Siddharth', 'Preeti', 'Yash', 'Rupal', 'Rohit', 'Garima', 'Saurabh'];
    const lastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Joshi', 'Chawla', 'Mehta', 'Nair', 'Deshmukh', 'Shah', 'Aggarwal', 'Bhasin', 'Bhatia', 'Capoor', 'Dutta', 'Gill', 'Kapoor'];

    for (let i = 0; i < 45; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      let tier = 'HIGH';
      let totalP = 15;
      let succP = 13;
      let failP = 2;

      if (i >= 20 && i < 35) {
        tier = 'MEDIUM';
        totalP = 10;
        succP = 6;
        failP = 4;
      } else if (i >= 35) {
        tier = 'LOW';
        totalP = 8;
        succP = 2;
        failP = 6;
      }

      const avgAmt = 1500 + Math.floor(Math.random() * 4000);
      const cust = await Customer.create({
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@example.com`,
        phone: `+9198765${10000 + i}`,
        totalPayments: totalP,
        successfulPayments: succP,
        failedPayments: failP,
        totalSuccessfulAmount: succP * avgAmt,
        averageTransactionAmount: avgAmt,
        lastPaymentAt: new Date()
      });
      customerDocs.push({ doc: cust, tier });
    }

    console.log(`Created ${customerDocs.length} customers.`);

    const paymentsToInsert = [];
    const failuresToInsert = [];
    const now = new Date();

    const getRandomDate = (startDaysAgo, endDaysAgo, forceHour = null) => {
      const d = new Date(now.getTime());
      const daysOffset = startDaysAgo + Math.random() * (endDaysAgo - startDaysAgo);
      d.setDate(d.getDate() - daysOffset);
      if (forceHour !== null) {
        d.setHours(forceHour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      } else {
        d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      }
      return d;
    };

    let pIndex = 1000;

    // 1. Successful payments (450)
    for (let i = 0; i < 450; i++) {
      const custObj = customerDocs[i % customerDocs.length].doc;
      const amt = 500 + Math.floor(Math.random() * 5000);
      const pDate = getRandomDate(0, 7);
      const rzpId = `pay_succ_${pIndex++}`;

      paymentsToInsert.push({
        razorpayPaymentId: rzpId,
        razorpayOrderId: `order_${pIndex}`,
        customerId: custObj._id,
        amount: amt,
        currency: 'INR',
        status: 'captured',
        method: ['upi', 'card', 'netbanking'][Math.floor(Math.random() * 3)],
        email: custObj.email,
        contact: custObj.phone,
        createdAt: pDate,
        capturedAt: pDate
      });
    }

    // 9 Category Failures Configuration (300 Total Failed Payments)
    const categoryConfigs = [
      {
        category: 'BANK_OR_UPI',
        count: 98,
        reason: 'NPCI UPI PSP Server Timeout (7 PM - 9 PM Peak Load)',
        subReason: 'NPCI_UPI_PSP_TIMEOUT',
        source: 'bank_or_upi',
        action: 'Retry after suitable delay using fresh payment link.',
        delay: 30,
        method: 'upi',
        scoreBase: 85
      },
      {
        category: 'CUSTOMER_SIDE',
        count: 75,
        reason: 'Customer Declined / Cancelled Payment Window',
        subReason: 'CUSTOMER_CANCELLED_OR_INPUT_ERROR',
        source: 'customer',
        action: 'Send retry email exactly 1 hour after failure.',
        delay: 60,
        method: 'upi',
        scoreBase: 78
      },
      {
        category: 'MERCHANT_SIDE',
        count: 42,
        reason: 'Merchant Gateway Route Setup / Config Issue',
        subReason: 'MERCHANT_GATEWAY_CONFIG_ISSUE',
        source: 'merchant',
        action: 'Use alternative payment recovery route with fresh Razorpay link.',
        delay: 0,
        method: 'card',
        scoreBase: 92
      },
      {
        category: 'PAYMENT_ABANDONED',
        count: 45,
        reason: 'Checkout Window Dropped Off Without Attempt',
        subReason: 'CHECKOUT_DROPPED_OFF',
        source: 'customer',
        action: 'Send payment completion reminder link.',
        delay: 45,
        method: 'card',
        scoreBase: 70
      },
      {
        category: 'INSUFFICIENT_FUNDS',
        count: 15,
        reason: 'Insufficient Account Balance',
        subReason: 'INSUFFICIENT_ACCOUNT_BALANCE',
        source: 'customer',
        action: 'Send respectful, non-judgmental payment retry reminder.',
        delay: 120,
        method: 'card',
        scoreBase: 45
      },
      {
        category: 'AUTHENTICATION',
        count: 10,
        reason: '3DS OTP Verification Failed',
        subReason: 'AUTHENTICATION_OTP_EXPIRED',
        source: 'customer',
        action: 'Send retry email with clear instructions and fresh payment link.',
        delay: 15,
        method: 'card',
        scoreBase: 80
      },
      {
        category: 'NETWORK_OR_TIMEOUT',
        count: 8,
        reason: 'Gateway Network Timeout',
        subReason: 'NETWORK_CONNECTION_TIMEOUT',
        source: 'network',
        action: 'Send fresh retry link after short delay.',
        delay: 15,
        method: 'netbanking',
        scoreBase: 82
      },
      {
        category: 'PAYMENT_METHOD',
        count: 4,
        reason: 'Card Expired or Restricted',
        subReason: 'PAYMENT_METHOD_RESTRICTED',
        source: 'customer',
        action: 'Send multi-channel retry link.',
        delay: 30,
        method: 'card',
        scoreBase: 65
      },
      {
        category: 'UNKNOWN',
        count: 3,
        reason: 'Unspecified System Error',
        subReason: 'UNSPECIFIED_FAILURE_REASON',
        source: 'gateway',
        action: 'Generate standard Razorpay recovery link.',
        delay: 30,
        method: 'upi',
        scoreBase: 50
      }
    ];

    let custCounter = 0;
    categoryConfigs.forEach(cfg => {
      for (let i = 0; i < cfg.count; i++) {
        const custMeta = customerDocs[custCounter % customerDocs.length];
        custCounter++;
        const custObj = custMeta.doc;

        const isHighVal = (i === 0 || i === 3);
        const amt = isHighVal ? (12000 + Math.floor(Math.random() * 10000)) : (1400 + Math.floor(Math.random() * 3500));
        const hour = cfg.category === 'BANK_OR_UPI' ? (i % 2 === 0 ? 19 : 20) : null;
        const pDate = getRandomDate(0, 3, hour);
        const rzpId = `pay_${cfg.category.toLowerCase()}_${pIndex++}`;

        paymentsToInsert.push({
          razorpayPaymentId: rzpId,
          razorpayOrderId: `order_${pIndex}`,
          customerId: custObj._id,
          amount: amt,
          currency: 'INR',
          status: 'failed',
          method: cfg.method,
          email: custObj.email,
          contact: custObj.phone,
          errorCode: 'BAD_REQUEST_ERROR',
          errorDescription: cfg.reason,
          errorReason: cfg.subReason.toLowerCase(),
          createdAt: pDate
        });

        const score = Math.min(98, Math.max(20, cfg.scoreBase + (custMeta.tier === 'HIGH' ? 10 : (custMeta.tier === 'MEDIUM' ? 0 : -20))));

        failuresToInsert.push({
          razorpayPaymentId: rzpId,
          customerId: custObj._id,
          amount: amt,
          reason: cfg.reason,
          category: cfg.category,
          failureSubReason: cfg.subReason,
          failureSource: cfg.source,
          classificationConfidence: 0.95,
          recommendedAction: cfg.action,
          recommendedDelay: cfg.delay,
          recoveryScore: score,
          method: cfg.method,
          attemptNumber: 1,
          retryable: true,
          riskLevel: score >= 80 ? 'HIGH' : (score >= 50 ? 'MEDIUM' : 'LOW'),
          createdAt: pDate
        });
      }
    });

    console.log(`Inserting ${paymentsToInsert.length} payments into MongoDB...`);
    const createdPayments = await Payment.insertMany(paymentsToInsert);

    const paymentMap = new Map();
    createdPayments.forEach(p => paymentMap.set(p.razorpayPaymentId, p._id));

    const finalFailures = failuresToInsert.map(f => ({
      paymentId: paymentMap.get(f.razorpayPaymentId),
      customerId: f.customerId,
      merchantId: demoUser._id,
      amount: f.amount,
      reason: f.reason,
      category: f.category,
      failureSubReason: f.failureSubReason,
      failureSource: f.failureSource,
      classificationConfidence: f.classificationConfidence,
      recommendedAction: f.recommendedAction,
      recommendedDelay: f.recommendedDelay,
      recoveryScore: f.recoveryScore,
      method: f.method,
      attemptNumber: f.attemptNumber,
      retryable: f.retryable,
      riskLevel: f.riskLevel,
      aiClassification: {
        category: f.category,
        retryable: f.retryable,
        confidence: 0.95,
        recommendation: f.recommendedAction
      },
      createdAt: f.createdAt
    }));

    await PaymentFailure.insertMany(finalFailures);

    console.log(`Seeded dataset created successfully! Total Payments: ${paymentsToInsert.length}, Failures: ${finalFailures.length}`);

    // Create Initial AI Insight
    await AIInsight.create({
      type: 'ANOMALY_DETECTION',
      title: '⚠️ UPI Payment Spike Detected (7 PM - 9 PM)',
      summary: 'Payment success rate dropped by 8.2% today. 47% of failed payments are related to UPI/PSP failures during peak evening hours (7 PM to 9 PM).',
      severity: 'high',
      metric: 'Revenue At Risk',
      metricValue: '₹72,400',
      recommendation: 'Prioritize retryable high-probability customers and generate Razorpay Payment Links.',
      confidence: 0.91,
      dataSnapshot: {
        revenueAtRisk: 72400,
        potentiallyRecoverable: 38000,
        highProbCustomers: 20
      }
    });

    return {
      success: true,
      totalPayments: paymentsToInsert.length,
      totalFailures: finalFailures.length,
      totalCustomers: customerDocs.length
    };
  } catch (error) {
    console.error('Error seeding payment data:', error);
    throw error;
  }
};

if (require.main === module) {
  const connectDB = require('../config/db');
  require('dotenv').config();
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedData;
