const express = require('express');
const router = express.Router();
const { triggerSOS, getAlerts, resolveAlert } = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdParam, validate } = require('../middleware/validate');

// POST /api/sos/trigger   — Any authenticated user
router.post('/trigger', protect, triggerSOS);

// GET  /api/sos            — Patient (own) / Staff (all)
router.get('/', protect, getAlerts);

// PATCH /api/sos/:id/resolve — Receptionist / Admin
router.patch(
  '/:id/resolve',
  protect,
  authorize('Receptionist', 'Admin', 'Doctor'),
  mongoIdParam('id'),
  validate,
  resolveAlert
);

module.exports = router;
