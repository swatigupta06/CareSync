const express = require('express');
const router = express.Router();
const {
  getLabTests,
  bookLabTest,
  payForBooking,
  getLabBookings,
  updateBookingStatus,
  uploadLabReport,
  getLabReports,
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');
const { labBookingRules, mongoIdParam, validate } = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');

// GET  /api/lab/tests     — Any authenticated user
router.get('/tests', protect, getLabTests);

// POST /api/lab/book      — Patient only
router.post(
  '/book',
  protect,
  authorize('Patient'),
  labBookingRules,
  validate,
  bookLabTest
);

// GET  /api/lab/bookings              — Patient (own) / Staff (all)
router.get('/bookings', protect, getLabBookings);

// POST /api/lab/bookings/:id/pay     — Patient only
router.post(
  '/bookings/:id/pay',
  protect,
  authorize('Patient'),
  mongoIdParam('id'),
  validate,
  payForBooking
);

// PATCH /api/lab/bookings/:id/status  — Receptionist / Admin / Lab(Doctor)
router.patch(
  '/bookings/:id/status',
  protect,
  authorize('Receptionist', 'Admin', 'Doctor'),
  mongoIdParam('id'),
  validate,
  updateBookingStatus
);

// POST  /api/lab/reports              — Receptionist / Admin / Doctor
router.post(
  '/reports',
  protect,
  authorize('Receptionist', 'Admin', 'Doctor'),
  uploadSingle,
  uploadLabReport
);

// GET   /api/lab/reports              — Patient (own) / Staff (all/by patient)
router.get('/reports', protect, getLabReports);

module.exports = router;
