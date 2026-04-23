const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile,
  getAllUsers, getUserById, deactivateUser,
  getDoctors, getPatients,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// ── Profile (any authenticated user) ─────────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingle, updateProfile);

// ── Doctor listing (authenticated) ───────────────────────────────────────
router.get('/doctors', protect, getDoctors);

// ── Patient listing (Receptionist / Doctor / Admin) ──────────────────────
router.get(
  '/patients',
  protect,
  authorize('Receptionist', 'Doctor', 'Admin'),
  getPatients
);

// ── Admin: all users ──────────────────────────────────────────────────────
router.get('/', protect, authorize('Admin'), getAllUsers);
router.get('/:id', protect, authorize('Admin', 'Doctor', 'Receptionist'), getUserById);
router.put('/:id/deactivate', protect, authorize('Admin'), deactivateUser);

module.exports = router;
