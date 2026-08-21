const express = require('express');
const router = express.Router();
const { seedDemoData, resetDemoData } = require('../controllers/demoController');

router.post('/seed', seedDemoData);
router.post('/reset', resetDemoData);

module.exports = router;
