const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['Patient', 'Doctor', 'Receptionist', 'Admin'];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,           // allows multiple null values
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      // Multiple users CAN share a phone number (per requirements);
      // uniqueness is enforced via aadhaarNumber for patients.
    },

    // 12-digit Aadhaar — unique identity for patients
    aadhaarNumber: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v) => !v || /^\d{12}$/.test(v),
        message: 'Aadhaar number must be exactly 12 digits',
      },
    },

    isAadhaarVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,          // never returned in queries by default
    },

    role: {
      type: String,
      enum: ROLES,
      required: [true, 'Role is required'],
    },

    avatar: {
      type: String,
      default: null,
    },

    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems too high'],
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
      default: null,
    },

    // Patient-specific
    allergies: {
      type: [String],
      default: [],
    },

    // Soft-delete flag
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,     // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1, role: 1 });
UserSchema.index({ role: 1 });

// ─── Pre-save: hash password ──────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: public profile (no password) ────────────────────────────────
UserSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
