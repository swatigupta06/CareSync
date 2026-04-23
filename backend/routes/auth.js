const express = require('express');
const router = express.Router();
const { signup, login, getMe, verifyAadhaar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { signupRules, loginRules, validate } = require('../middleware/validate');

// POST /api/auth/signup
router.post('/signup', signupRules, validate, signup);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

// POST /api/auth/verify-aadhaar  (protected — patient)
router.post('/verify-aadhaar', protect, verifyAadhaar);

module.exports = router;
