const Razorpay = require('razorpay');

let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const hasCredentials = Boolean(keyId && keySecret && !keyId.includes('YOUR_'));

if (hasCredentials) {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
  console.log('Razorpay SDK initialized in TEST MODE with provided Key ID.');
} else {
  console.log('Razorpay keys not configured in server/.env. Payment Link recovery will operate in DEMO MOCK mode.');
}

module.exports = {
  razorpayInstance,
  hasCredentials
};
