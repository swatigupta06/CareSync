const express = require('express');
const router = express.Router();
const { getAnalytics, getRecentActivity } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require Admin role
router.use(protect, authorize('Admin'));

// GET /api/admin/analytics
router.get('/analytics', getAnalytics);

// GET /api/admin/recent-activity
router.get('/recent-activity', getRecentActivity);

module.exports = router;
