const { getGroupedFailureAnalysis, getCategoryCustomers } = require('../services/analysisService');

const getOverview = async (req, res) => {
  try {
    const analysis = await getGroupedFailureAnalysis(req.user?.id);
    res.json({ success: true, ...analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const analysis = await getGroupedFailureAnalysis(req.user?.id);
    res.json({ success: true, categoryCards: analysis.categoryCards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCategoryDetails = async (req, res) => {
  try {
    const { category } = req.params;
    const analysis = await getGroupedFailureAnalysis(req.user?.id);
    const card = analysis.categoryCards.find(c => c.category === category);
    res.json({ success: true, category: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCategoryCustomersHandler = async (req, res) => {
  try {
    const { category } = req.params;
    const customers = await getCategoryCustomers(req.user?.id, category);
    res.json({ success: true, category, count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const refreshAnalysis = async (req, res) => {
  try {
    const analysis = await getGroupedFailureAnalysis(req.user?.id);
    res.json({ success: true, message: 'Analysis refreshed successfully', analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOverview,
  getCategories,
  getCategoryDetails,
  getCategoryCustomersHandler,
  refreshAnalysis
};
