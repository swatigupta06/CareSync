const { LabTest, LabBooking, LabReport } = require('../models/Lab');
const User = require('../models/User');
const { success, created, error, notFound, forbidden } = require('../utils/apiResponse');
const { getFileUrl } = require('../middleware/upload');

// ─── GET /api/lab/tests — Available catalogue ─────────────────────────────
const getLabTests = async (req, res, next) => {
  try {
    const tests = await LabTest.find({ isActive: true }).sort({ name: 1 });
    return success(res, { tests });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/lab/book — Patient books a test ────────────────────────────
const bookLabTest = async (req, res, next) => {
  try {
    const { testName, date, time, paymentMethod, amount } = req.body;

    // Resolve the test price from catalogue if not provided
    let testAmount = amount;
    if (!testAmount) {
      const catalogue = await LabTest.findOne({ name: testName });
      testAmount = catalogue ? catalogue.price : 0;
    }

    const booking = await LabBooking.create({
      patient: req.user._id,
      patientName: req.user.name,
      testName,
      date,
      time,
      paymentStatus: 'Pending',
      paymentMethod: paymentMethod || null,
      amount: testAmount,
    });

    return created(res, { booking }, 'Lab test booked successfully');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/lab/bookings/:id/pay — Simulate payment ───────────────────
const payForBooking = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    const booking = await LabBooking.findById(req.params.id);
    if (!booking) return notFound(res, 'Lab booking');

    if (booking.patient.toString() !== req.user._id.toString() && req.user.role === 'Patient') {
      return forbidden(res, 'You can only pay for your own bookings');
    }

    if (booking.paymentStatus === 'Paid') {
      return error(res, 'This booking has already been paid', 409);
    }

    // Simulate payment processing (always succeeds)
    booking.paymentStatus = 'Paid';
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    await booking.save();

    return success(res, { booking }, 'Payment successful (simulated)');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/lab/bookings — Patient: own | Staff: all ────────────────────
const getLabBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (req.user.role === 'Patient') query.patient = req.user._id;
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      LabBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('patient', 'name phoneNumber'),
      LabBooking.countDocuments(query),
    ]);

    return success(res, {
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/lab/bookings/:id/status — Lab staff updates status ────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Booked', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return error(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 422);
    }

    const booking = await LabBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return notFound(res, 'Lab booking');

    return success(res, { booking }, 'Booking status updated');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/lab/reports — Upload lab report (Lab staff / Receptionist) ─
const uploadLabReport = async (req, res, next) => {
  try {
    const { patientId, testName, result, bookingId } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) return notFound(res, 'Patient');

    let fileUrl = null;
    if (req.file) {
      fileUrl = getFileUrl(req, req.file.path);
    }

    const report = await LabReport.create({
      patient: patient._id,
      patientName: patient.name,
      testName,
      result: result || 'See attached file',
      status: 'Final',
      fileUrl,
      uploadedBy: req.user._id,
      booking: bookingId || null,
    });

    // Link the report back to the booking
    if (bookingId) {
      await LabBooking.findByIdAndUpdate(bookingId, {
        reportId: report._id,
        status: 'Completed',
      });
    }

    return created(res, { report }, 'Lab report uploaded successfully');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/lab/reports — Patient: own | Staff: all ────────────────────
const getLabReports = async (req, res, next) => {
  try {
    const { patientId } = req.query;

    const query = {};
    if (req.user.role === 'Patient') {
      query.patient = req.user._id;
    } else if (patientId) {
      query.patient = patientId;
    }

    const reports = await LabReport.find(query)
      .sort({ createdAt: -1 })
      .populate('patient', 'name phoneNumber')
      .populate('uploadedBy', 'name role');

    return success(res, { reports });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLabTests,
  bookLabTest,
  payForBooking,
  getLabBookings,
  updateBookingStatus,
  uploadLabReport,
  getLabReports,
};
