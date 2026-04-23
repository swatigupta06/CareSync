const MedicalRecord = require('../models/MedicalRecord');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { success, created, error, notFound, forbidden } = require('../utils/apiResponse');
const { getFileUrl } = require('../middleware/upload');

// ─── POST /api/records — Upload a medical record ─────────────────────────
const uploadRecord = async (req, res, next) => {
  try {
    const { patientId, reportType, category, notes } = req.body;

    if (!req.file) return error(res, 'A file is required for medical records', 422);

    // Resolve patient
    let patient;
    if (req.user.role === 'Patient') {
      patient = req.user;
    } else {
      patient = await User.findById(patientId);
      if (!patient || patient.role !== 'Patient') return notFound(res, 'Patient');
    }

    const fileUrl = getFileUrl(req, req.file.path);

    // Map role to uploaderRole field
    const roleMap = {
      Patient: 'patient',
      Receptionist: 'receptionist',
      Admin: 'receptionist',
      Doctor: 'doctor',
    };

    const record = await MedicalRecord.create({
      patient: patient._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      reportType,
      category,
      uploadedBy: req.user._id,
      uploaderRole: roleMap[req.user.role] || 'patient',
      fileUrl,
      notes: notes || '',
    });

    return created(res, { record }, 'Medical record uploaded successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/records — Fetch medical records ────────────────────────────
const getRecords = async (req, res, next) => {
  try {
    const { patientId, category } = req.query;

    let targetPatientId;

    if (req.user.role === 'Patient') {
      // Patients only see their own records
      targetPatientId = req.user._id;
    } else if (req.user.role === 'Doctor') {
      if (!patientId) return error(res, 'patientId query parameter is required', 422);

      // Check approved permission
      const permission = await Permission.findOne({
        doctor: req.user._id,
        patient: patientId,
        status: 'Approved',
      });
      if (!permission) {
        return forbidden(res, 'Access denied. You must have approved access to view this patient\'s records.');
      }
      targetPatientId = patientId;
    } else {
      // Receptionist / Admin can view any patient's records
      targetPatientId = patientId || null;
    }

    const query = {};
    if (targetPatientId) query.patient = targetPatientId;
    if (category) query.category = category;

    const records = await MedicalRecord.find(query)
      .sort({ createdAt: -1 })
      .populate('patient', 'name phoneNumber')
      .populate('uploadedBy', 'name role');

    return success(res, { records });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/records/:id ──────────────────────────────────────────────
const deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return notFound(res, 'Medical record');

    // Only the uploading patient or admin can delete
    const isOwner = record.patient.toString() === req.user._id.toString() && req.user.role === 'Patient';
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) return forbidden(res, 'You are not allowed to delete this record');

    await record.deleteOne();
    return success(res, {}, 'Medical record deleted');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/records/permissions/request — Doctor requests access ───────
const requestAccess = async (req, res, next) => {
  try {
    const { patientId, reason } = req.body;
    if (!patientId) return error(res, 'patientId is required', 422);

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'Patient') return notFound(res, 'Patient');

    // Check for existing active (Pending or Approved) permission
    const existing = await Permission.findOne({
      doctor: req.user._id,
      patient: patientId,
    });

    if (existing && existing.status === 'Approved') {
      return error(res, 'You already have approved access to this patient\'s records.', 409);
    }

    if (existing && existing.status === 'Pending') {
      return error(res, 'A request is already pending for this patient.', 409);
    }

    // If previously rejected, allow re-request (upsert)
    const permission = await Permission.findOneAndUpdate(
      { doctor: req.user._id, patient: patientId },
      {
        doctorName: req.user.name,
        status: 'Pending',
        reason: reason || '',
        respondedAt: null,
      },
      { upsert: true, new: true }
    );

    return created(res, { permission }, 'Access request sent to patient');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/records/permissions — Fetch permissions ─────────────────────
const getPermissions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'Patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'Doctor') {
      query.doctor = req.user._id;
    }
    // Admin sees all

    const { status } = req.query;
    if (status) query.status = status;

    const permissions = await Permission.find(query)
      .sort({ createdAt: -1 })
      .populate('doctor', 'name email')
      .populate('patient', 'name email');

    return success(res, { permissions });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/records/permissions/:id/respond — Patient approves/rejects
const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return error(res, 'Status must be Approved or Rejected', 422);
    }

    const permission = await Permission.findById(req.params.id);
    if (!permission) return notFound(res, 'Permission request');

    // Only the target patient can respond
    if (permission.patient.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Only the target patient can respond to this request');
    }

    if (permission.status !== 'Pending') {
      return error(res, 'This request has already been responded to', 409);
    }

    permission.status = status;
    permission.respondedAt = new Date();
    await permission.save();

    return success(res, { permission }, `Access request ${status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadRecord,
  getRecords,
  deleteRecord,
  requestAccess,
  getPermissions,
  respondToRequest,
};
