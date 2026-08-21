const crypto = require('crypto');
const logger = require('./logger');

const verifyRazorpaySignature = (rawBody, signature, secret) => {
  if (!signature || !secret) {
    logger.warn('Webhook verification failed: Missing signature or webhook secret.');
    return false;
  }
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    logger.error('Signature verification error:', error.message);
    return false;
  }
};

module.exports = {
  verifyRazorpaySignature
};
