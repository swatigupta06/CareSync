const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { success, created, error, notFound, forbidden } = require('../utils/apiResponse');

// ─── POST /api/appointments ───────────────────────────────────────────────
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, symptoms, patientId } = req.body;

    // Determine patient: Receptionist can book on behalf of a patient
    let patient;
    if (req.user.role === 'Receptionist' || req.user.role === 'Admin') {
      if (!patientId) return error(res, 'patientId is required when booking as receptionist', 422);
      patient = await User.findById(patientId);
      if (!patient || patient.role !== 'Patient') return notFound(res, 'Patient');
    } else {
      patient = req.user;
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') return notFound(res, 'Doctor');

    const doctorProfile = await Doctor.findOne({ user: doctorId });

    const appointment = await Appointment.create({
      patient: patient._id,
      patientName: patient.name,
      doctor: doctor._id,
      doctorName: doctor.name,
      doctorSpecialization: doctorProfile?.specialization || '',
      date,
      time,
      symptoms,
      status: 'Pending',
      bookedBy: req.user.role.toLowerCase(),
    });

    return created(res, { appointment }, 'Appointment booked successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/appointments ────────────────────────────────────────────────
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    switch (req.user.role) {
      case 'Patient':
        query.patient = req.user._id;
        break;
      case 'Doctor':
        query.doctor = req.user._id;
        break;
      case 'Receptionist':
      case 'Admin':
        break; // see all
    }

    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('patient', 'name email phoneNumber')
        .populate('doctor', 'name email'),
      Appointment.countDocuments(query),
    ]);

    return success(res, {
      appointments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/appointments/:id ────────────────────────────────────────────
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phoneNumber aadhaarNumber')
      .populate('doctor', 'name email');

    if (!appointment) return notFound(res, 'Appointment');

    // Access control
    const uid = req.user._id.toString();
    const isOwner =
      appointment.patient._id.toString() === uid ||
      appointment.doctor._id.toString() === uid;
    const isStaff = ['Receptionist', 'Admin'].includes(req.user.role);

    if (!isOwner && !isStaff) return forbidden(res);

    return success(res, { appointment });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/appointments/:id/status ───────────────────────────────────
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, prescription, notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 422);
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return notFound(res, 'Appointment');

    const uid = req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === uid && req.user.role === 'Doctor';
    const isStaff = ['Receptionist', 'Admin'].includes(req.user.role);
    const isPatient = appointment.patient.toString() === uid && req.user.role === 'Patient';

    // Patients can only cancel their own appointments
    if (isPatient && status !== 'Cancelled') {
      return forbidden(res, 'Patients can only cancel appointments');
    }
    if (!isDoctor && !isStaff && !isPatient) {
      return forbidden(res);
    }

    appointment.status = status;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    await appointment.save();

    return success(res, { appointment }, 'Appointment status updated');
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/appointments/:id/prescription ────────────────────────────
const updatePrescription = async (req, res, next) => {
  try {
    const { prescription } = req.body;
    if (!prescription) return error(res, 'Prescription text is required', 422);

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return notFound(res, 'Appointment');

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Only the assigned doctor can update prescription');
    }

    appointment.prescription = prescription;
    appointment.status = 'Completed';
    await appointment.save();

    return success(res, { appointment }, 'Prescription updated');
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/appointments/:id — Admin only ────────────────────────────
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return notFound(res, 'Appointment');
    return success(res, {}, 'Appointment deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updatePrescription,
  deleteAppointment,
};
