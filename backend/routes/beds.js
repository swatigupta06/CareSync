const express = require('express');
const router = express.Router();
const {
  getBeds, createBed, assignBed, dischargeBed, updateBed, deleteBed,
} = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/auth');
const { bedAssignRules, mongoIdParam, validate } = require('../middleware/validate');

// GET  /api/beds         — All authenticated (staff sees all, patients see available)
// POST /api/beds         — Admin only
router
  .route('/')
  .get(protect, getBeds)
  .post(protect, authorize('Admin'), createBed);

// PATCH /api/beds/:id/assign    — Receptionist / Admin
router.patch(
  '/:id/assign',
  protect,
  authorize('Receptionist', 'Admin'),
  mongoIdParam('id'),
  bedAssignRules,
  validate,
  assignBed
);

// PATCH /api/beds/:id/discharge — Receptionist / Admin
router.patch(
  '/:id/discharge',
  protect,
  authorize('Receptionist', 'Admin'),
  mongoIdParam('id'),
  validate,
  dischargeBed
);

// PATCH  /api/beds/:id   — Admin
// DELETE /api/beds/:id   — Admin
router
  .route('/:id')
  .patch(protect, authorize('Admin'), mongoIdParam('id'), validate, updateBed)
  .delete(protect, authorize('Admin'), mongoIdParam('id'), validate, deleteBed);

module.exports = router;
