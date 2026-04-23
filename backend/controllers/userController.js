const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { success, error, notFound } = require('../utils/apiResponse');
const { getFileUrl } = require('../middleware/upload');

// ─── GET /api/users/profile ───────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return notFound(res, 'User');

    const userObj = user.toObject();

    if (user.role === 'Doctor') {
      userObj.doctorProfile = await Doctor.findOne({ user: user._id });
    }

    return success(res, { user: userObj });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, allergies, email } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (age !== undefined) updates.age = age;
    if (gender) updates.gender = gender;
    if (allergies) updates.allergies = allergies;
    if (email) updates.email = email.toLowerCase();

    // Handle avatar upload
    if (req.file) {
      updates.avatar = getFileUrl(req, req.file.path);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    // If doctor, also update doctor-specific fields
    if (req.user.role === 'Doctor') {
      const { specialization, experience, availability, bio, consultationFee } = req.body;
      const doctorUpdates = {};
      if (specialization) doctorUpdates.specialization = specialization;
      if (experience) doctorUpdates.experience = experience;
      if (availability) doctorUpdates.availability = availability;
      if (bio) doctorUpdates.bio = bio;
      if (consultationFee !== undefined) doctorUpdates.consultationFee = consultationFee;

      if (Object.keys(doctorUpdates).length) {
        await Doctor.findOneAndUpdate({ user: user._id }, doctorUpdates, {
          new: true,
          upsert: true,
        });
      }
    }

    return success(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users — Admin: list all users ───────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;

    const query = { isActive: true };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return success(res, {
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/:id — Admin/Doctor: get single user ──────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User');
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/users/:id/deactivate — Admin ───────────────────────────────
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return notFound(res, 'User');
    return success(res, { user }, 'User deactivated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/doctors — public doctor listing ──────────────────────
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    const userQuery = { role: 'Doctor', isActive: true };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const doctorQuery = {};
    if (specialization) doctorQuery.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await Doctor.find(doctorQuery)
      .populate({ path: 'user', match: userQuery, select: '-password' })
      .sort({ rating: -1 });

    // Filter out entries where the populate match returned null
    const filtered = doctors.filter((d) => d.user !== null);

    return success(res, { doctors: filtered });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/patients — Receptionist/Doctor/Admin ─────────────────
const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'Patient', isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { aadhaarNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(query).select('-password').sort({ name: 1 });
    return success(res, { patients });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deactivateUser,
  getDoctors,
  getPatients,
};
