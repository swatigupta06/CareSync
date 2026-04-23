const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updatePrescription,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { appointmentRules, mongoIdParam, validate } = require('../middleware/validate');

// GET   /api/appointments          — all roles (scoped by role)
// POST  /api/appointments          — Patient / Receptionist / Admin
router
  .route('/')
  .get(protect, getAppointments)
  .post(
    protect,
    authorize('Patient', 'Receptionist', 'Admin'),
    appointmentRules,
    validate,
    bookAppointment
  );

// GET    /api/appointments/:id
// DELETE /api/appointments/:id     — Admin only
router
  .route('/:id')
  .get(protect, mongoIdParam('id'), validate, getAppointmentById)
  .delete(protect, authorize('Admin'), mongoIdParam('id'), validate, deleteAppointment);

// PATCH /api/appointments/:id/status  — Doctor / Receptionist / Admin / Patient(cancel)
router.patch(
  '/:id/status',
  protect,
  authorize('Doctor', 'Receptionist', 'Admin', 'Patient'),
  mongoIdParam('id'),
  validate,
  updateAppointmentStatus
);

// PATCH /api/appointments/:id/prescription  — Doctor only
router.patch(
  '/:id/prescription',
  protect,
  authorize('Doctor'),
  mongoIdParam('id'),
  validate,
  updatePrescription
);

module.exports = router;
