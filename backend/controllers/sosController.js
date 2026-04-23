const SOSAlert = require('../models/SOSAlert');
const { success, created, notFound } = require('../utils/apiResponse');

// Mock hospital data pool (simulates nearest hospital lookup)
const MOCK_HOSPITALS = [
  {
    name: 'Apollo Hospitals',
    address: '21, Greams Lane, Off Greams Road, Chennai',
    phone: '+91-44-2829-3333',
    distance: '1.2 km',
  },
  {
    name: 'AIIMS Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    phone: '+91-11-2658-8500',
    distance: '2.4 km',
  },
  {
    name: 'Fortis Healthcare',
    address: 'Sector B, Pocket 1, Vasant Kunj, New Delhi',
    phone: '+91-11-4277-6222',
    distance: '3.1 km',
  },
  {
    name: 'Manipal Hospital',
    address: '98, HAL Airport Road, Bangalore',
    phone: '+91-80-2502-4444',
    distance: '0.8 km',
  },
  {
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    address: 'Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Mumbai',
    phone: '+91-22-4269-6969',
    distance: '1.7 km',
  },
];

// ─── POST /api/sos/trigger ────────────────────────────────────────────────
const triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng, address } = req.body;

    // Pick a "nearest" hospital pseudo-randomly (seeded by userId for consistency)
    const seed = parseInt(req.user._id.toString().slice(-4), 16) % MOCK_HOSPITALS.length;
    const nearestHospital = MOCK_HOSPITALS[seed];

    const alert = await SOSAlert.create({
      user: req.user._id,
      userName: req.user.name,
      location: {
        lat: lat || null,
        lng: lng || null,
        address: address || 'Unknown location',
      },
      status: 'Active',
      nearestHospital,
    });

    return created(
      res,
      {
        alert,
        nearestHospital,
        // Mock route steps
        route: {
          from: address || 'Your location',
          to: nearestHospital.address,
          steps: [
            'Head north on current street',
            `Turn right towards ${nearestHospital.name}`,
            'Continue for 500 meters',
            `Arrive at ${nearestHospital.name}`,
          ],
          estimatedTime: '5-10 minutes',
        },
        emergencyNumbers: {
          national: '112',
          ambulance: '108',
          hospital: nearestHospital.phone,
        },
      },
      'SOS alert triggered. Emergency services notified (simulated).'
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/sos — List SOS alerts ──────────────────────────────────────
const getAlerts = async (req, res, next) => {
  try {
    const query = {};

    // Patients see only their own; staff see all
    if (req.user.role === 'Patient') {
      query.user = req.user._id;
    }

    const { status } = req.query;
    if (status) query.status = status;

    const alerts = await SOSAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name phoneNumber');

    return success(res, { alerts });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/sos/:id/resolve — Admin/Receptionist resolves an alert ───
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) return notFound(res, 'SOS alert');

    alert.status = 'Resolved';
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();
    await alert.save();

    return success(res, { alert }, 'SOS alert resolved');
  } catch (err) {
    next(err);
  }
};

module.exports = { triggerSOS, getAlerts, resolveAlert };
