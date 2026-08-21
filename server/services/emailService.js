const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Brevo Email Service with Simulation Fallback & Category Templates
 */

const getEmailTemplate = (category, { customerName, amount, paymentLink }) => {
  const formattedAmount = `₹${(amount || 0).toLocaleString('en-IN')}`;
  const linkUrl = paymentLink || 'https://payguard.ai/retry';
  const name = customerName || 'Valued Customer';

  switch (category) {
    case 'MERCHANT_SIDE':
      return {
        subject: `Update on your order: Alternate payment link for ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">PayGuard Merchant Notice</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>We noticed an issue with our gateway routing during your recent payment attempt of <strong>${formattedAmount}</strong>. We have set up an alternate payment route for your order.</p>
            <p>Please click the button below to complete your payment securely:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Payment Now</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
            <p>Thank you for your business!</p>
          </div>
        `
      };

    case 'CUSTOMER_SIDE':
      return {
        subject: `Complete your pending payment of ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Pending Payment Reminder</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>We noticed that your recent payment of <strong>${formattedAmount}</strong> could not be completed.</p>
            <p>You can retry your payment securely using the link below whenever you are ready:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Retry Secure Payment</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
            <p>Thank you!</p>
          </div>
        `
      };

    case 'BANK_OR_UPI':
      return {
        subject: `Bank servers are back online: Retry your ${formattedAmount} payment`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">UPI / Bank Server Restored</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your previous UPI / Bank payment attempt of <strong>${formattedAmount}</strong> was interrupted due to temporary bank network congestion.</p>
            <p>Banking servers are now functioning smoothly. You can complete your transaction securely now:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Retry Payment Now</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
            <p>Thank you!</p>
          </div>
        `
      };

    case 'NETWORK_OR_TIMEOUT':
      return {
        subject: `Connection interrupted: Fresh payment link for ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Network Timeout Recovery</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>It looks like a temporary network timeout interrupted your checkout attempt for <strong>${formattedAmount}</strong>.</p>
            <p>Here is your fresh payment link to complete your order without repeating setup:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Payment</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
          </div>
        `
      };

    case 'AUTHENTICATION':
      return {
        subject: `Authorization retry: Finish your payment of ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Security Authentication Retry</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your payment of <strong>${formattedAmount}</strong> could not be authenticated during 3DS OTP verification.</p>
            <p>Please click below to generate a fresh OTP authorization and finish your order:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Authenticate & Pay</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
          </div>
        `
      };

    case 'INSUFFICIENT_FUNDS':
      return {
        subject: `Your pending transaction of ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Payment Status Notice</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your previous payment of <strong>${formattedAmount}</strong> could not be completed. You may retry whenever convenient.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Retry Payment Link</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
            <p>Thank you!</p>
          </div>
        `
      };

    case 'PAYMENT_ABANDONED':
    default:
      return {
        subject: `Complete your checkout for ${formattedAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Items Still In Your Cart</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>We saved your pending order of <strong>${formattedAmount}</strong>. Complete your checkout securely using the link below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${linkUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Checkout</a>
            </p>
            <p style="font-size: 12px; color: #64748b;">Link URL: <a href="${linkUrl}">${linkUrl}</a></p>
          </div>
        `
      };
  }
};

const sendEmail = async ({ toEmail, toName, category, amount, paymentLink, customSubject, customBody }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'recovery@payguard.ai';
  const senderName = process.env.BREVO_SENDER_NAME || 'PayGuard AI Recovery';

  const template = getEmailTemplate(category, { customerName: toName, amount, paymentLink });
  const subject = customSubject || template.subject;
  const htmlContent = customBody ? customBody.replace(/\{\{paymentLink\}\}/g, paymentLink).replace(/\{\{customerName\}\}/g, toName).replace(/\{\{amount\}\}/g, amount) : template.html;

  // SIMULATION MODE CHECK
  if (!apiKey || apiKey.includes('YOUR_') || apiKey.trim() === '') {
    logger.info(`[EMAIL SIMULATION MODE] To: ${toEmail} | Category: ${category} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'This email was simulated. No real email was sent.',
      recipient: toEmail,
      subject
    };
  }

  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      simulated: false,
      messageId: res.data.messageId,
      recipient: toEmail
    };
  } catch (error) {
    logger.error(`Brevo API Email Error for ${toEmail}: ${error.response?.data?.message || error.message}`);
    return {
      success: false,
      simulated: false,
      error: error.response?.data?.message || error.message,
      recipient: toEmail
    };
  }
};

module.exports = {
  getEmailTemplate,
  sendEmail
};
