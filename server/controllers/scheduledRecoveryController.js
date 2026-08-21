const ScheduledRecovery = require('../models/ScheduledRecovery');

const getScheduledRecoveries = async (req, res) => {
  try {
    const query = req.user?.id ? { merchantId: req.user.id } : {};
    const items = await ScheduledRecovery.find(query)
      .populate('paymentId')
      .populate('customerId')
      .sort({ scheduledFor: 1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createScheduledRecovery = async (req, res) => {
  try {
    const { paymentId, customerId, failureCategory, scheduledFor } = req.body;
    const scheduled = await ScheduledRecovery.create({
      merchantId: req.user?.id,
      paymentId,
      customerId,
      failureCategory: failureCategory || 'CUSTOMER_SIDE',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 60 * 60 * 1000),
      status: 'PENDING'
    });
    res.json({ success: true, scheduled });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const cancelScheduledRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ScheduledRecovery.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Scheduled recovery task not found' });
    res.json({ success: true, message: 'Scheduled recovery task cancelled', scheduled: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getScheduledRecoveries,
  createScheduledRecovery,
  cancelScheduledRecovery
};
