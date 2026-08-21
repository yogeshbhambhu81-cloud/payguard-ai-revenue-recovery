const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  previewCampaign,
  createCampaign,
  sendTestEmail,
  getCampaigns,
  getCampaignById
} = require('../controllers/campaignController');

router.use(protect);

router.post('/preview', previewCampaign);
router.post('/create', createCampaign);
router.post('/send-test', sendTestEmail);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);

module.exports = router;
