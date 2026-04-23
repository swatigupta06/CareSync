const { validationResult, body, param } = require('express-validator');

/**
 * Runs express-validator checks and returns 422 if any fail.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['Patient', 'Doctor', 'Receptionist', 'Admin'])
    .withMessage('Invalid role'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('aadhaarNumber')
    .optional({ checkFalsy: true })
    .matches(/^\d{12}$/)
    .withMessage('Aadhaar must be exactly 12 digits'),
];

const loginRules = [
  body('identifier').trim().notEmpty().withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role')
    .isIn(['Patient', 'Doctor', 'Receptionist', 'Admin'])
    .withMessage('Invalid role'),
];

// ─── Appointment validators ───────────────────────────────────────────────
const appointmentRules = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('symptoms').trim().notEmpty().withMessage('Symptoms are required'),
];

// ─── Lab booking validators ───────────────────────────────────────────────
const labBookingRules = [
  body('testName').trim().notEmpty().withMessage('Test name is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('paymentMethod')
    .isIn(['UPI', 'Card', 'Net Banking'])
    .withMessage('Payment method must be UPI, Card, or Net Banking'),
];

// ─── Bed validators ───────────────────────────────────────────────────────
const bedAssignRules = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
];

// ─── Mongo ObjectId param validator ──────────────────────────────────────
const mongoIdParam = (paramName) =>
  param(paramName).isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId`);

module.exports = {
  validate,
  signupRules,
  loginRules,
  appointmentRules,
  labBookingRules,
  bedAssignRules,
  mongoIdParam,
};
