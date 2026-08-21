const RecoveryCampaign = require('../models/RecoveryCampaign');
const CampaignRecipient = require('../models/CampaignRecipient');
const ScheduledRecovery = require('../models/ScheduledRecovery');
const PaymentFailure = require('../models/PaymentFailure');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { getOrCreateRecoveryAction } = require('../services/recoveryService');
const { getEmailTemplate, sendEmail } = require('../services/emailService');
const { calculateScheduledTime } = require('../services/schedulerService');

/**
 * Previews recovery campaign before execution
 */
const previewCampaign = async (req, res) => {
  try {
    const { failureCategory, selectedFailureIds } = req.body;

    const query = { _id: { $in: selectedFailureIds } };
    const failures = await PaymentFailure.find(query).populate('customerId').populate('paymentId');

    let totalRisk = 0;
    let totalRecoverable = 0;
    let highRecoveryCount = 0;
    const recipients = [];

    failures.forEach(f => {
      totalRisk += f.amount;
      const recoverable = Math.round(f.amount * (f.recoveryScore / 100));
      totalRecoverable += recoverable;
      if (f.recoveryScore >= 80) highRecoveryCount++;

      recipients.push({
        failureId: f._id,
        customerId: f.customerId ? f.customerId._id : null,
        name: f.customerId ? f.customerId.name : 'Customer',
        email: f.customerId ? f.customerId.email : '',
        amount: f.amount,
        recoveryScore: f.recoveryScore,
        paymentId: f.paymentId ? f.paymentId.razorpayPaymentId : 'pay_unknown',
        failureCreatedAt: f.createdAt
      });
    });

    const sampleRecipient = recipients[0] || { name: 'Demo Customer', amount: 2499 };
    const templateObj = getEmailTemplate(failureCategory, {
      customerName: sampleRecipient.name,
      amount: sampleRecipient.amount,
      paymentLink: 'https://payguard.ai/r/sample_recovery_link'
    });

    const earliestFailureDate = failures.length > 0 ? failures[0].createdAt : new Date();
    const defaultScheduledTime = calculateScheduledTime(earliestFailureDate, failureCategory);

    res.json({
      success: true,
      failureCategory,
      recipientCount: recipients.length,
      highRecoveryCount,
      totalRisk: Math.round(totalRisk),
      totalRecoverable: Math.round(totalRecoverable),
      emailSubject: templateObj.subject,
      emailHtmlPreview: templateObj.html,
      isCustomerSide: failureCategory === 'CUSTOMER_SIDE',
      recommendedStrategy: failureCategory === 'CUSTOMER_SIDE' ? 'SCHEDULE_RETRY' : 'IMMEDIATE',
      defaultScheduledTime,
      recipients
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Creates & dispatches or schedules recovery campaign
 */
const createCampaign = async (req, res) => {
  try {
    const { failureCategory, selectedFailureIds, actionType = 'SEND_NOW', customSubject, customBody, customLink, bankRoute } = req.body;

    const failures = await PaymentFailure.find({ _id: { $in: selectedFailureIds } })
      .populate('customerId')
      .populate('paymentId');

    const sampleTemplate = getEmailTemplate(failureCategory, { customerName: 'Customer', amount: 1000 });

    const campaign = await RecoveryCampaign.create({
      merchantId: req.user?.id,
      failureCategory,
      emailSubject: customSubject || sampleTemplate.subject,
      emailTemplate: customBody || sampleTemplate.html,
      recipientCount: failures.length,
      status: actionType === 'SCHEDULE' || failureCategory === 'CUSTOMER_SIDE' ? 'SCHEDULED' : 'RUNNING'
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const f of failures) {
      if (!f.customerId || !f.paymentId) continue;

      const cust = f.customerId;
      const payment = f.paymentId;

      // 1. Create or fetch unique per-customer RecoveryAction with primary or secondary bank route
      const recoveryAction = await getOrCreateRecoveryAction(payment, cust, f, { bankRoute });
      const linkToUse = customLink || recoveryAction.paymentLinkUrl;

      if (actionType === 'SCHEDULE' || failureCategory === 'CUSTOMER_SIDE') {
        // Schedule email based on exact failureOccurredAt + 1 hour (or demo delay)
        const scheduledTime = calculateScheduledTime(f.createdAt, failureCategory);

        await ScheduledRecovery.create({
          merchantId: req.user?.id,
          paymentId: payment._id,
          customerId: cust._id,
          campaignId: campaign._id,
          failureCategory,
          scheduledFor: scheduledTime,
          status: 'PENDING'
        });

        await CampaignRecipient.create({
          merchantId: req.user?.id,
          campaignId: campaign._id,
          customerId: cust._id,
          paymentId: payment._id,
          recoveryActionId: recoveryAction._id,
          email: cust.email,
          status: 'SCHEDULED',
          scheduledFor: scheduledTime
        });
      } else {
        // Immediate send
        const emailResult = await sendEmail({
          toEmail: cust.email,
          toName: cust.name,
          category: failureCategory,
          amount: f.amount,
          paymentLink: linkToUse,
          customSubject,
          customBody
        });

        if (emailResult.success) sentCount++;
        else failedCount++;

        await CampaignRecipient.create({
          merchantId: req.user?.id,
          campaignId: campaign._id,
          customerId: cust._id,
          paymentId: payment._id,
          recoveryActionId: recoveryAction._id,
          email: cust.email,
          status: emailResult.success ? 'SENT' : 'FAILED',
          sentAt: new Date(),
          errorLog: emailResult.error || null
        });
      }
    }

    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    if (actionType !== 'SCHEDULE' && failureCategory !== 'CUSTOMER_SIDE') {
      campaign.status = 'COMPLETED';
    }
    await campaign.save();

    res.json({
      success: true,
      message: actionType === 'SCHEDULE' || failureCategory === 'CUSTOMER_SIDE'
        ? `Campaign scheduled for ${failures.length} customers successfully!`
        : `Campaign executed! Sent: ${sentCount}, Failed: ${failedCount}`,
      campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Sends a single test email
 */
const sendTestEmail = async (req, res) => {
  try {
    const { failureCategory, testEmail } = req.body;
    const emailToUse = testEmail || req.user?.email || 'demo@payguard.ai';

    const emailResult = await sendEmail({
      toEmail: emailToUse,
      toName: 'Merchant (Test Run)',
      category: failureCategory || 'CUSTOMER_SIDE',
      amount: 2499,
      paymentLink: 'https://payguard.ai/r/demo_test_recovery_link'
    });

    res.json({
      success: true,
      message: emailResult.simulated 
        ? `Test email simulated for ${emailToUse}` 
        : `Test email sent successfully to ${emailToUse}`,
      details: emailResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const query = req.user?.id ? { merchantId: req.user.id } : {};
    const campaigns = await RecoveryCampaign.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await RecoveryCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    const recipients = await CampaignRecipient.find({ campaignId: campaign._id })
      .populate('customerId')
      .populate('paymentId');
    res.json({ success: true, campaign, recipients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  previewCampaign,
  createCampaign,
  sendTestEmail,
  getCampaigns,
  getCampaignById
};
