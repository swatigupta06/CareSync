const mongoose = require('mongoose');

/**
 * Doctor extends the base User with professional fields.
 * Linked 1-to-1 with the User document.
 */
const DoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },

    experience: {
      type: String,          // e.g. "8 years"
      trim: true,
      default: '0 years',
    },

    // Days available: ["Mon", "Wed", "Fri"]
    availability: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((d) =>
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(d)
          ),
        message: 'Availability must use 3-letter day abbreviations',
      },
    },

    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DoctorSchema.index({ user: 1 });
DoctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
