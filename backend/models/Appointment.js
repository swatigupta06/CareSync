const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
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

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      default: '',
    },

    date: {
      type: String,      // stored as "YYYY-MM-DD" string for simplicity
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,      // stored as "HH:MM" string
      required: [true, 'Appointment time is required'],
    },

    symptoms: {
      type: String,
      required: [true, 'Symptoms are required'],
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },

    prescription: {
      type: String,
      default: null,
    },

    // Who booked (patient themselves or receptionist)
    bookedBy: {
      type: String,
      enum: ['patient', 'receptionist', 'admin'],
      default: 'patient',
    },

    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ patient: 1, date: -1 });
AppointmentSchema.index({ doctor: 1, date: -1 });
AppointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
