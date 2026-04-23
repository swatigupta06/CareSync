const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'Bed number is required'],
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['General', 'ICU', 'Semi-Private', 'Private'],
      required: true,
    },

    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Emergency', 'Maintenance'],
      default: 'Available',
    },

    // If occupied
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    patientName: {
      type: String,
      default: null,
    },

    ward: {
      type: String,
      default: 'General Ward',
    },

    // Who assigned the bed
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

BedSchema.index({ status: 1 });
BedSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Bed', BedSchema);
