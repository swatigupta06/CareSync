const mongoose = require('mongoose');

const SOSAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },

    // Geolocation from the browser
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: 'Unknown location' },
    },

    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved'],
      default: 'Active',
    },

    // Mock nearest hospital returned to the client
    nearestHospital: {
      name: String,
      address: String,
      phone: String,
      distance: String,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

SOSAlertSchema.index({ user: 1, createdAt: -1 });
SOSAlertSchema.index({ status: 1 });

module.exports = mongoose.model('SOSAlert', SOSAlertSchema);
