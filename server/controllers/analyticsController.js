const analyticsTools = require('../services/paymentAnalyticsService');

const getOverview = async (req, res, next) => {
  try {
    const summary = await analyticsTools.getPaymentSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const summary = await analyticsTools.getPaymentSummary();
    res.json({
      success: true,
      data: {
        totalRevenueToday: summary.totalRevenueToday,
        paymentSuccessRate: summary.paymentSuccessRate,
        recoveredAmount: summary.totalRecoveredAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFailures = async (req, res, next) => {
  try {
    const breakdown = await analyticsTools.getFailureBreakdown();
    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};

const getRevenueRisk = async (req, res, next) => {
  try {
    const risk = await analyticsTools.getRevenueAtRisk();
    res.json({ success: true, data: risk });
  } catch (error) {
    next(error);
  }
};

const getRecovery = async (req, res, next) => {
  try {
    const topRecoverable = await analyticsTools.getTopRecoverablePayments(20);
    res.json({ success: true, data: topRecoverable });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const trends = await analyticsTools.getPaymentTrend();
    res.json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getRevenue,
  getFailures,
  getRevenueRisk,
  getRecovery,
  getTrends
};
