const seedData = require('../seed/seedPayments');
const RecoveryAction = require('../models/RecoveryAction');

const seedDemoData = async (req, res, next) => {
  try {
    const result = await seedData();
    res.json({
      success: true,
      message: 'Demo dataset (~750 payments) seeded successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const resetDemoData = async (req, res, next) => {
  try {
    const result = await seedData();
    res.json({
      success: true,
      message: 'Demo data reset and re-seeded successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedDemoData,
  resetDemoData
};
