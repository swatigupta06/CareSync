const mongoose = require('mongoose');

// ─── Available Lab Tests (catalogue) ─────────────────────────────────────
const LabTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,      // e.g. "30 mins"
      default: 'N/A',
    },
    instructions: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Blood', 'Radiology', 'Cardiology', 'Pathology', 'General'],
      default: 'General',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Lab Booking (patient books a specific test) ──────────────────────────
const LabBookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },

    testName: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Booked', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Booked',
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Net Banking', null],
      default: null,
    },

    amount: {
      type: Number,
      default: 0,
    },

    // Once test is done, a LabReport is linked here
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabReport',
      default: null,
    },
  },
  { timestamps: true }
);

LabBookingSchema.index({ patient: 1, createdAt: -1 });
LabBookingSchema.index({ status: 1 });

// ─── Lab Report (result of a completed test) ──────────────────────────────
const LabReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },

    testName: {
      type: String,
      required: true,
    },

    result: {
      type: String,
      default: 'Pending analysis',
    },

    status: {
      type: String,
      enum: ['Pending', 'Final'],
      default: 'Pending',
    },

    fileUrl: {
      type: String,
      default: null,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabBooking',
      default: null,
    },
  },
  { timestamps: true }
);

LabReportSchema.index({ patient: 1, createdAt: -1 });

module.exports = {
  LabTest: mongoose.model('LabTest', LabTestSchema),
  LabBooking: mongoose.model('LabBooking', LabBookingSchema),
  LabReport: mongoose.model('LabReport', LabReportSchema),
};
