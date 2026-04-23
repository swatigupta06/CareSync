const express = require('express');
const router = express.Router();
const {
  uploadRecord,
  getRecords,
  deleteRecord,
  requestAccess,
  getPermissions,
  respondToRequest,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const { mongoIdParam, validate } = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');

// POST /api/records                    — Patient / Receptionist / Admin
router.post(
  '/',
  protect,
  authorize('Patient', 'Receptionist', 'Admin', 'Doctor'),
  uploadSingle,
  uploadRecord
);

// GET  /api/records                    — Role-scoped
router.get('/', protect, getRecords);

// DELETE /api/records/:id              — Patient (own) / Admin
router.delete(
  '/:id',
  protect,
  mongoIdParam('id'),
  validate,
  deleteRecord
);

// ── Permission system ──────────────────────────────────────────────────────

// POST /api/records/permissions/request    — Doctor requests access
router.post(
  '/permissions/request',
  protect,
  authorize('Doctor'),
  requestAccess
);

// GET  /api/records/permissions            — Patient sees incoming, Doctor sees own requests
router.get('/permissions', protect, getPermissions);

// PATCH /api/records/permissions/:id/respond — Patient approves or rejects
router.patch(
  '/permissions/:id/respond',
  protect,
  authorize('Patient'),
  mongoIdParam('id'),
  validate,
  respondToRequest
);

module.exports = router;
