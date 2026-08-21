const { razorpayInstance, hasCredentials } = require('../config/razorpay');
const logger = require('../utils/logger');

/**
 * Creates a Razorpay Payment Link linked with unique recovery reference.
 * Supports primary or secondary fallback merchant bank routes.
 */
const createRazorpayPaymentLink = async ({
  amount,
  currency = 'INR',
  referenceId,
  description,
  customer,
  recoveryActionId,
  originalPaymentId,
  useSecondaryRoute = false,
  bankRoute = 'PRIMARY'
}) => {
  const amountInPaise = Math.round(amount * 100);
  const isSecondary = useSecondaryRoute || bankRoute === 'SECONDARY_RAZORPAY_ACCOUNT';

  if (hasCredentials && razorpayInstance) {
    try {
      const payload = {
        amount: amountInPaise,
        currency,
        accept_partial: false,
        reference_id: referenceId,
        description: description || (isSecondary ? `PayGuard Backup Bank Route Recovery` : `Payment Recovery - PayGuard AI`),
        customer: {
          name: customer?.name || 'Merchant Customer',
          email: customer?.email || 'customer@example.com',
          contact: customer?.phone || '+919876543210'
        },
        notify: {
          sms: false,
          email: false
        },
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recovery?status=success&ref=${referenceId}`,
        callback_method: 'get',
        notes: {
          recoveryActionId: String(recoveryActionId),
          originalPaymentId: String(originalPaymentId),
          bankRoute: isSecondary ? 'HDFC_SECONDARY_ACCOUNT' : 'PRIMARY_ACCOUNT'
        }
      };

      logger.info(`Creating Razorpay Payment Link (${isSecondary ? 'SECONDARY ROUTE' : 'PRIMARY ROUTE'}) for amount ₹${amount} with ref: ${referenceId}`);
      const link = await razorpayInstance.paymentLink.create(payload);
      
      return {
        id: link.id,
        short_url: link.short_url,
        status: link.status,
        reference_id: link.reference_id,
        routeUsed: isSecondary ? 'HDFC Secondary Merchant Account' : 'Primary Account'
      };
    } catch (error) {
      logger.error('Razorpay API payment link creation error:', error);
      throw error;
    }
  }

  // DEMO MOCK FALLBACK MODE
  logger.info(`Operating in DEMO MOCK mode (${isSecondary ? 'HDFC Secondary Route' : 'Primary Route'}) for amount ₹${amount}`);
  const mockLinkId = `plink_demo_${Date.now()}`;
  const routePrefix = isSecondary ? 'sec_hdfc_route' : 'demo';

  return {
    id: mockLinkId,
    short_url: `https://payp.rzp.io/${routePrefix}_${mockLinkId.slice(-8)}?amt=${amount}`,
    status: 'created',
    reference_id: referenceId,
    routeUsed: isSecondary ? 'HDFC Secondary Merchant Account' : 'Primary Account'
  };
};

module.exports = {
  createRazorpayPaymentLink
};
