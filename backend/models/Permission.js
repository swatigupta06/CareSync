const mongoose = require('mongoose');

/**
 * Permission tracks a doctor's request to access a patient's medical records.
 * One document per (doctor, patient) pair — upserted on repeated requests.
 */
const PermissionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    // Reason provided by the doctor when making the request
    reason: {
      type: String,
      default: '',
      maxlength: 500,
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce one active request per doctor-patient pair
PermissionSchema.index({ doctor: 1, patient: 1 }, { unique: true });
PermissionSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Permission', PermissionSchema);
