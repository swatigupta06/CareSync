const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// More aggressive rate limiting for AI endpoint (it's expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 20,                  // 20 messages per minute per IP
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ai/chat
router.post('/chat', protect, aiLimiter, chat);

module.exports = router;
