const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOverview,
  getCategories,
  getCategoryDetails,
  getCategoryCustomersHandler,
  refreshAnalysis
} = require('../controllers/analysisController');

router.use(protect);

router.get('/overview', getOverview);
router.get('/categories', getCategories);
router.get('/category/:category', getCategoryDetails);
router.get('/category/:category/customers', getCategoryCustomersHandler);
router.post('/refresh', refreshAnalysis);

module.exports = router;
