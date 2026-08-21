const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { rawBodyParser } = require('./middleware/webhookMiddleware');
const logger = require('./utils/logger');

// Initialize Database Connection
connectDB();

const app = express();

// Security Helmet Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled for hackathon demo versatility
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature']
}));

// Request Logging
app.use(morgan('dev'));

// Special Webhook Route with Raw Body Buffer Parsing
app.use('/api/webhooks', rawBodyParser, require('./routes/webhookRoutes'));

// Body Parser for JSON & URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting for AI Endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per min
  message: { success: false, message: 'Too many requests to AI endpoints, please try again later.' }
});

const { startScheduler } = require('./services/schedulerService');

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
app.use('/api/recovery', require('./routes/recoveryRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/recovery-campaigns', require('./routes/campaignRoutes'));
app.use('/api/scheduled-recoveries', require('./routes/scheduledRecoveryRoutes'));
app.use('/api/demo', require('./routes/demoRoutes'));

// System Health & Demo Status Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PayGuard AI - Revenue Recovery Platform',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`PayGuard AI Server running on http://localhost:${PORT}`);
  logger.info(`DEMO MODE: ${process.env.DEMO_MODE === 'true' ? 'ACTIVE' : 'INACTIVE'}`);
  logger.info(`==================================================`);
  startScheduler();
});
