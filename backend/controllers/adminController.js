const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { LabBooking } = require('../models/Lab');
const Bed = require('../models/Bed');
const SOSAlert = require('../models/SOSAlert');
const MedicalRecord = require('../models/MedicalRecord');
const { success } = require('../utils/apiResponse');

// ─── GET /api/admin/analytics ─────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalReceptionists,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalLabBookings,
      paidLabBookings,
      totalBeds,
      availableBeds,
      occupiedBeds,
      activeSOSAlerts,
      totalRecords,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'Patient', isActive: true }),
      User.countDocuments({ role: 'Doctor', isActive: true }),
      User.countDocuments({ role: 'Receptionist', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Confirmed' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      LabBooking.countDocuments(),
      LabBooking.countDocuments({ paymentStatus: 'Paid' }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'Available' }),
      Bed.countDocuments({ status: 'Occupied' }),
      SOSAlert.countDocuments({ status: 'Active' }),
      MedicalRecord.countDocuments(),
    ]);

    // Recent appointments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Revenue from paid lab bookings
    const revenueResult = await LabBooking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Appointments by status breakdown
    const appointmentsByStatus = {
      Pending: pendingAppointments,
      Confirmed: confirmedAppointments,
      Completed: completedAppointments,
      Cancelled: cancelledAppointments,
    };

    // Bed occupancy percentage
    const bedOccupancyRate = totalBeds > 0
      ? Math.round((occupiedBeds / totalBeds) * 100)
      : 0;

    return success(res, {
      analytics: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          receptionists: totalReceptionists,
        },
        appointments: {
          total: totalAppointments,
          recent7Days: recentAppointments,
          byStatus: appointmentsByStatus,
        },
        lab: {
          totalBookings: totalLabBookings,
          paidBookings: paidLabBookings,
          revenue: totalRevenue,
        },
        beds: {
          total: totalBeds,
          available: availableBeds,
          occupied: occupiedBeds,
          occupancyRate: bedOccupancyRate,
        },
        emergency: {
          activeSOS: activeSOSAlerts,
        },
        records: {
          total: totalRecords,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/recent-activity ──────────────────────────────────────
const getRecentActivity = async (req, res, next) => {
  try {
    const [recentAppointments, recentUsers, recentBookings, recentAlerts] = await Promise.all([
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name')
        .populate('doctor', 'name'),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name role createdAt'),
      LabBooking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name'),
      SOSAlert.find({ status: 'Active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name phoneNumber'),
    ]);

    return success(res, {
      recentActivity: {
        appointments: recentAppointments,
        newUsers: recentUsers,
        labBookings: recentBookings,
        sosAlerts: recentAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getRecentActivity };
