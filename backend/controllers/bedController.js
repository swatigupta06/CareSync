const Bed = require('../models/Bed');
const User = require('../models/User');
const { success, created, error, notFound, forbidden } = require('../utils/apiResponse');

// ─── GET /api/beds ────────────────────────────────────────────────────────
const getBeds = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const beds = await Bed.find(query)
      .sort({ number: 1 })
      .populate('patient', 'name phoneNumber');

    // Summary counts
    const summary = {
      total: beds.length,
      available: beds.filter((b) => b.status === 'Available').length,
      occupied: beds.filter((b) => b.status === 'Occupied').length,
      emergency: beds.filter((b) => b.status === 'Emergency').length,
    };

    return success(res, { beds, summary });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/beds — Admin: create a new bed ─────────────────────────────
const createBed = async (req, res, next) => {
  try {
    const { number, type, ward } = req.body;

    const existing = await Bed.findOne({ number });
    if (existing) return error(res, `Bed number '${number}' already exists`, 409);

    const bed = await Bed.create({ number, type, ward });
    return created(res, { bed }, 'Bed created successfully');
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/beds/:id/assign ───────────────────────────────────────────
const assignBed = async (req, res, next) => {
  try {
    const { patientId, status } = req.body;

    const bed = await Bed.findById(req.params.id);
    if (!bed) return notFound(res, 'Bed');

    if (bed.status === 'Occupied') {
      return error(res, 'This bed is already occupied', 409);
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'Patient') return notFound(res, 'Patient');

    bed.patient = patient._id;
    bed.patientName = patient.name;
    bed.status = status || 'Occupied';
    bed.assignedBy = req.user._id;
    bed.assignedAt = new Date();
    await bed.save();

    return success(res, { bed: await bed.populate('patient', 'name phoneNumber') }, 'Bed assigned successfully');
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/beds/:id/discharge ───────────────────────────────────────
const dischargeBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return notFound(res, 'Bed');

    if (bed.status === 'Available') {
      return error(res, 'This bed is already available (no patient assigned)', 409);
    }

    bed.patient = null;
    bed.patientName = null;
    bed.status = 'Available';
    bed.assignedBy = null;
    bed.assignedAt = null;
    await bed.save();

    return success(res, { bed }, 'Patient discharged. Bed is now available.');
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/beds/:id — General update (type, ward, status) ───────────
const updateBed = async (req, res, next) => {
  try {
    const updates = {};
    const { type, ward, status, number } = req.body;
    if (type) updates.type = type;
    if (ward) updates.ward = ward;
    if (status) updates.status = status;
    if (number) updates.number = number;

    const bed = await Bed.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!bed) return notFound(res, 'Bed');

    return success(res, { bed }, 'Bed updated');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/beds/:id — Admin only ───────────────────────────────────
const deleteBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return notFound(res, 'Bed');

    if (bed.status === 'Occupied') {
      return error(res, 'Cannot delete an occupied bed. Discharge the patient first.', 409);
    }

    await bed.deleteOne();
    return success(res, {}, 'Bed deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getBeds, createBed, assignBed, dischargeBed, updateBed, deleteBed };
