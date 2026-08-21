const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (process.env.DEMO_MODE === 'true') {
      req.user = { id: 'demo_user_id', email: 'demo@payguard.ai', name: 'Demo Merchant' };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized access. Token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'payguard_ai_secret_key_2026_super_secure_hackathon');
    req.user = decoded;
    next();
  } catch (error) {
    if (process.env.DEMO_MODE === 'true') {
      req.user = { id: 'demo_user_id', email: 'demo@payguard.ai', name: 'Demo Merchant' };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { protect };
