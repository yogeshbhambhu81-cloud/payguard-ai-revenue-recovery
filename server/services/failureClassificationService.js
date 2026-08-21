/**
 * Deterministic Failure Classification Service
 * Assigns one of 9 primary failure categories:
 * 1. MERCHANT_SIDE
 * 2. CUSTOMER_SIDE
 * 3. BANK_OR_UPI
 * 4. PAYMENT_METHOD
 * 5. AUTHENTICATION
 * 6. INSUFFICIENT_FUNDS
 * 7. NETWORK_OR_TIMEOUT
 * 8. PAYMENT_ABANDONED
 * 9. UNKNOWN
 */

const classifyFailure = (method = 'upi', errorCode = '', errorDescription = '', errorReason = '') => {
  const code = (errorCode || '').toLowerCase();
  const desc = (errorDescription || '').toLowerCase();
  const reason = (errorReason || '').toLowerCase();

  // 1. MERCHANT_SIDE
  if (
    reason.includes('merchant') || desc.includes('merchant') || code.includes('merchant') ||
    desc.includes('route') || desc.includes('gateway setup') || desc.includes('key expired') ||
    desc.includes('account inactive') || reason.includes('configuration')
  ) {
    return {
      category: 'MERCHANT_SIDE',
      failureSubReason: 'MERCHANT_GATEWAY_CONFIG_ISSUE',
      failureSource: 'merchant',
      classificationConfidence: 0.96,
      recommendedAction: 'Use alternative payment recovery route with fresh Razorpay link.',
      recommendedDelay: 0 // immediate alternative route
    };
  }

  // 2. CUSTOMER_SIDE (Includes user input errors, cancelled by user, wrong app)
  if (
    reason.includes('customer_declined') || desc.includes('cancelled by user') ||
    reason.includes('user_cancel') || desc.includes('user dropped off') ||
    desc.includes('vpa invalid') || desc.includes('incorrect pin')
  ) {
    return {
      category: 'CUSTOMER_SIDE',
      failureSubReason: 'CUSTOMER_CANCELLED_OR_INPUT_ERROR',
      failureSource: 'customer',
      classificationConfidence: 0.94,
      recommendedAction: 'Send a payment retry link exactly 1 hour after failure.',
      recommendedDelay: 60 // 1 hour delay from failureOccurredAt
    };
  }

  // 3. BANK_OR_UPI (PSP server timeout, bank downtime)
  if (
    method === 'upi' || reason.includes('bank_offline') || desc.includes('npci') ||
    desc.includes('psp') || desc.includes('bank server') || code.includes('bank')
  ) {
    return {
      category: 'BANK_OR_UPI',
      failureSubReason: 'NPCI_UPI_PSP_TIMEOUT',
      failureSource: 'bank_or_upi',
      classificationConfidence: 0.92,
      recommendedAction: 'Wait for bank/UPI PSP servers to stabilize, then send a fresh link.',
      recommendedDelay: 30 // 30 mins delay
    };
  }

  // 4. AUTHENTICATION (3DS auth failure, OTP expired)
  if (
    reason.includes('auth') || desc.includes('otp') || desc.includes('3d secure') ||
    desc.includes('verification failed') || code.includes('auth')
  ) {
    return {
      category: 'AUTHENTICATION',
      failureSubReason: 'AUTHENTICATION_OTP_EXPIRED',
      failureSource: 'customer',
      classificationConfidence: 0.95,
      recommendedAction: 'Send a retry email with clear instructions and a fresh payment link.',
      recommendedDelay: 15
    };
  }

  // 5. INSUFFICIENT_FUNDS
  if (
    reason.includes('insufficient_balance') || desc.includes('insufficient funds') ||
    desc.includes('low balance') || code.includes('insufficient')
  ) {
    return {
      category: 'INSUFFICIENT_FUNDS',
      failureSubReason: 'INSUFFICIENT_ACCOUNT_BALANCE',
      failureSource: 'customer',
      classificationConfidence: 0.98,
      recommendedAction: 'Send a respectful, non-judgmental payment retry reminder.',
      recommendedDelay: 120 // 2 hours delay
    };
  }

  // 6. NETWORK_OR_TIMEOUT
  if (
    desc.includes('timeout') || desc.includes('network') || desc.includes('gateway timeout') ||
    reason.includes('timed_out')
  ) {
    return {
      category: 'NETWORK_OR_TIMEOUT',
      failureSubReason: 'NETWORK_CONNECTION_TIMEOUT',
      failureSource: 'network',
      classificationConfidence: 0.91,
      recommendedAction: 'Send a fresh retry payment link after a short delay.',
      recommendedDelay: 15
    };
  }

  // 7. PAYMENT_METHOD (Card expired, blocked card)
  if (
    reason.includes('card_expired') || desc.includes('card blocked') ||
    desc.includes('unsupported card') || method === 'card'
  ) {
    return {
      category: 'PAYMENT_METHOD',
      failureSubReason: 'PAYMENT_METHOD_RESTRICTED',
      failureSource: 'customer',
      classificationConfidence: 0.89,
      recommendedAction: 'Send a payment link supporting multi-channel retry options (Card, Netbanking, UPI).',
      recommendedDelay: 30
    };
  }

  // 8. PAYMENT_ABANDONED (Checkout closed without attempting)
  if (reason.includes('abandoned') || desc.includes('abandoned') || code.includes('abandoned')) {
    return {
      category: 'PAYMENT_ABANDONED',
      failureSubReason: 'CHECKOUT_DROPPED_OFF',
      failureSource: 'customer',
      classificationConfidence: 0.90,
      recommendedAction: 'Send a gentle payment completion reminder link.',
      recommendedDelay: 45
    };
  }

  // 9. UNKNOWN Fallback
  return {
    category: 'UNKNOWN',
    failureSubReason: 'UNSPECIFIED_FAILURE_REASON',
    failureSource: 'gateway',
    classificationConfidence: 0.70,
    recommendedAction: 'Generate a standard Razorpay recovery payment link.',
    recommendedDelay: 30
  };
};

module.exports = {
  classifyFailure
};
