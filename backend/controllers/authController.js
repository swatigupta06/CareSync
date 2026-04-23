const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { createTokenResponse } = require('../utils/jwt');
const { success, created, error } = require('../utils/apiResponse');

// ─── POST /api/auth/signup ────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const {
      name, email, phoneNumber, password, role,
      aadhaarNumber, age, gender, allergies,
      // Doctor-specific fields
      specialization, experience, availability, bio,
    } = req.body;

    // For Patients, aadhaar uniqueness is the identity anchor
    if (role === 'Patient' && aadhaarNumber) {
      const existing = await User.findOne({ aadhaarNumber });
      if (existing) {
        return error(res, 'A user with this Aadhaar number already exists.', 409);
      }
    }

    // Email uniqueness (if provided)
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return error(res, 'An account with this email already exists.', 409);
      }
    }

    // Build user doc
    const userData = {
      name,
      phoneNumber,
      password,
      role,
      email: email || undefined,
      aadhaarNumber: role === 'Patient' ? aadhaarNumber : undefined,
      isAadhaarVerified: false,
      age: age || undefined,
      gender: gender || undefined,
      allergies: allergies || [],
    };

    const user = await User.create(userData);

    // If the new user is a Doctor, create the Doctor profile too
    if (role === 'Doctor') {
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General',
        experience: experience || '0 years',
        availability: availability || [],
        bio: bio || '',
        rating: 0,
      });
    }

    const { token, user: userObj } = createTokenResponse(user);

    return created(res, { token, user: userObj }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    // identifier can be email or phone number
    const isEmail = identifier.includes('@');

    const query = isEmail
      ? { email: identifier.toLowerCase(), role }
      : { phoneNumber: identifier, role };

    // Explicitly select password back (it's excluded by default)
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return error(res, 'Invalid credentials. Please check your email/phone, password, and role.', 401);
    }

    if (!user.isActive) {
      return error(res, 'Your account has been deactivated. Contact the administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid credentials. Incorrect password.', 401);
    }

    const { token, user: userObj } = createTokenResponse(user);

    // For doctors, attach their profile data
    if (user.role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        userObj.doctorProfile = doctorProfile;
      }
    }

    return success(res, { token, user: userObj }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 'User not found', 404);

    const userObj = user.toObject();

    if (user.role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) userObj.doctorProfile = doctorProfile;
    }

    return success(res, { user: userObj });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/verify-aadhaar ───────────────────────────────────────
/**
 * Simulates Aadhaar verification.
 * In production this would call UIDAI's API.
 */
const verifyAadhaar = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return error(res, 'Aadhaar must be exactly 12 digits.', 422);
    }

    // Check it doesn't conflict with another user
    const conflict = await User.findOne({
      aadhaarNumber,
      _id: { $ne: req.user._id },
    });
    if (conflict) {
      return error(res, 'This Aadhaar number is already linked to another account.', 409);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { aadhaarNumber, isAadhaarVerified: true },
      { new: true }
    );

    return success(res, { user }, 'Aadhaar verified successfully (simulated)');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, verifyAadhaar };
