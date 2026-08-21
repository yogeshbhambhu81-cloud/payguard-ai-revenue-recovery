const { initiateRecovery } = require('../services/recoveryService');
const RecoveryAction = require('../models/RecoveryAction');

const createPaymentLink = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId parameter is required.' });
    }

    const recoveryResult = await initiateRecovery(paymentId);
    res.status(201).json({
      success: true,
      message: 'Razorpay Payment Link generated successfully.',
      data: recoveryResult
    });
  } catch (error) {
    next(error);
  }
};

const getActions = async (req, res, next) => {
  try {
    const actions = await RecoveryAction.find()
      .populate('paymentId')
      .populate('customerId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    next(error);
  }
};

const getActionById = async (req, res, next) => {
  try {
    const action = await RecoveryAction.findById(req.params.id)
      .populate('paymentId')
      .populate('customerId');

    if (!action) {
      return res.status(404).json({ success: false, message: 'Recovery action not found.' });
    }

    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentLink,
  getActions,
  getActionById
};
