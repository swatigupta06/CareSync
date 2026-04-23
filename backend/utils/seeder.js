/**
 * CareSync Database Seeder
 * Run with: node utils/seeder.js
 * Add --reset flag to wipe all collections first: node utils/seeder.js --reset
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');
const { LabTest } = require('../models/Lab');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/caresync';

// ─── Seed data ────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    name: 'Admin User',
    email: 'admin@caresync.com',
    phoneNumber: '9000000001',
    password: 'Admin@123',
    role: 'Admin',
    age: 35,
    gender: 'Male',
  },
  {
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@caresync.com',
    phoneNumber: '9000000002',
    password: 'Doctor@123',
    role: 'Doctor',
    age: 42,
    gender: 'Female',
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@caresync.com',
    phoneNumber: '9000000003',
    password: 'Doctor@123',
    role: 'Doctor',
    age: 51,
    gender: 'Male',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@caresync.com',
    phoneNumber: '9000000004',
    password: 'Doctor@123',
    role: 'Doctor',
    age: 38,
    gender: 'Female',
  },
  {
    name: 'Dr. Anand Mehta',
    email: 'anand.mehta@caresync.com',
    phoneNumber: '9000000005',
    password: 'Doctor@123',
    role: 'Doctor',
    age: 46,
    gender: 'Male',
  },
  {
    name: 'Mary Thomas',
    email: 'mary.thomas@caresync.com',
    phoneNumber: '9000000006',
    password: 'Recept@123',
    role: 'Receptionist',
    age: 29,
    gender: 'Female',
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@caresync.com',
    phoneNumber: '9000000007',
    password: 'Patient@123',
    role: 'Patient',
    age: 34,
    gender: 'Male',
    aadhaarNumber: '123456789012',
    isAadhaarVerified: true,
    allergies: ['Penicillin', 'Pollen'],
  },
  {
    name: 'Sunita Rao',
    email: 'sunita.rao@caresync.com',
    phoneNumber: '9000000008',
    password: 'Patient@123',
    role: 'Patient',
    age: 28,
    gender: 'Female',
    aadhaarNumber: '987654321098',
    isAadhaarVerified: true,
    allergies: [],
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@caresync.com',
    phoneNumber: '9000000009',
    password: 'Patient@123',
    role: 'Patient',
    age: 45,
    gender: 'Male',
    aadhaarNumber: '456789012345',
    isAadhaarVerified: false,
    allergies: ['Aspirin'],
  },
];

const DOCTOR_PROFILES = [
  {
    email: 'sarah.wilson@caresync.com',
    specialization: 'Cardiology',
    experience: '15 years',
    availability: ['Mon', 'Wed', 'Fri'],
    bio: 'Dr. Sarah Wilson is a senior cardiologist with 15 years of experience in interventional cardiology and heart failure management.',
    rating: 4.9,
    consultationFee: 1500,
  },
  {
    email: 'rajesh.kumar@caresync.com',
    specialization: 'Neurology',
    experience: '20 years',
    availability: ['Tue', 'Thu', 'Sat'],
    bio: 'Dr. Rajesh Kumar specialises in stroke management, epilepsy, and neurodegenerative disorders with over two decades of experience.',
    rating: 4.8,
    consultationFee: 1800,
  },
  {
    email: 'priya.sharma@caresync.com',
    specialization: 'Orthopedics',
    experience: '12 years',
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    bio: 'Dr. Priya Sharma is a consultant orthopaedic surgeon specialising in joint replacement and sports injuries.',
    rating: 4.7,
    consultationFee: 1200,
  },
  {
    email: 'anand.mehta@caresync.com',
    specialization: 'General Medicine',
    experience: '18 years',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bio: 'Dr. Anand Mehta provides comprehensive primary care and specialises in chronic disease management and preventive medicine.',
    rating: 4.6,
    consultationFee: 800,
  },
];

const BEDS = [
  // General Ward
  ...Array.from({ length: 10 }, (_, i) => ({
    number: `G-${String(i + 1).padStart(2, '0')}`,
    type: 'General',
    status: 'Available',
    ward: 'General Ward',
  })),
  // Semi-Private
  ...Array.from({ length: 6 }, (_, i) => ({
    number: `SP-${String(i + 1).padStart(2, '0')}`,
    type: 'Semi-Private',
    status: 'Available',
    ward: 'Semi-Private Ward',
  })),
  // Private
  ...Array.from({ length: 4 }, (_, i) => ({
    number: `PV-${String(i + 1).padStart(2, '0')}`,
    type: 'Private',
    status: 'Available',
    ward: 'Private Wing',
  })),
  // ICU
  ...Array.from({ length: 4 }, (_, i) => ({
    number: `ICU-${String(i + 1).padStart(2, '0')}`,
    type: 'ICU',
    status: 'Available',
    ward: 'Intensive Care Unit',
  })),
];

const LAB_TESTS = [
  { name: 'Blood Glucose Test', price: 499, duration: '30 mins', instructions: 'Fast for 8–12 hours before the test.', category: 'Blood' },
  { name: 'MRI Scan', price: 5500, duration: '45 mins', instructions: 'Remove all metal objects. Wear comfortable clothes.', category: 'Radiology' },
  { name: 'X-Ray (Chest)', price: 800, duration: '15 mins', instructions: 'Inform if you are pregnant.', category: 'Radiology' },
  { name: 'ECG / EKG', price: 1200, duration: '20 mins', instructions: 'No special preparation needed.', category: 'Cardiology' },
  { name: 'Lipid Profile', price: 999, duration: '30 mins', instructions: 'Fast for 9–12 hours before the test.', category: 'Blood' },
  { name: 'Full Body Checkup', price: 2999, duration: '2 hours', instructions: 'Fast for 10 hours. Early morning preferred.', category: 'General' },
  { name: 'Complete Blood Count (CBC)', price: 399, duration: '20 mins', instructions: 'No special preparation needed.', category: 'Blood' },
  { name: 'Thyroid Function Test (TFT)', price: 799, duration: '30 mins', instructions: 'Best done in the morning. No fasting required.', category: 'Blood' },
  { name: 'CT Scan (Abdomen)', price: 4500, duration: '30 mins', instructions: 'You may need to drink a contrast liquid beforehand.', category: 'Radiology' },
  { name: 'Urine Culture', price: 550, duration: '24-48 hours', instructions: 'Collect midstream urine in a sterile container.', category: 'Pathology' },
  { name: 'HbA1c (Glycated Haemoglobin)', price: 699, duration: '30 mins', instructions: 'No fasting required.', category: 'Blood' },
  { name: 'Liver Function Test (LFT)', price: 899, duration: '30 mins', instructions: 'Fast for 8 hours before the test.', category: 'Blood' },
];

// ─── Seeder logic ─────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const shouldReset = process.argv.includes('--reset');

    if (shouldReset) {
      console.log('🗑️  Resetting all collections...');
      await Promise.all([
        User.deleteMany({}),
        Doctor.deleteMany({}),
        Bed.deleteMany({}),
        LabTest.deleteMany({}),
        Appointment.deleteMany({}),
      ]);
      console.log('✅ Collections cleared');
    }

    // ── Users ──────────────────────────────────────────────────────────────
    //const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const createdUsers = [];

    for (const userData of DEMO_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭️  User already exists: ${userData.email}`);
        createdUsers.push(existing);
        continue;
      }

      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }

    // ── Doctor Profiles ────────────────────────────────────────────────────
    for (const profile of DOCTOR_PROFILES) {
      const user = createdUsers.find((u) => u.email === profile.email);
      if (!user) continue;

      const existing = await Doctor.findOne({ user: user._id });
      if (existing) {
        console.log(`⏭️  Doctor profile already exists: ${user.name}`);
        continue;
      }

      await Doctor.create({
        user: user._id,
        specialization: profile.specialization,
        experience: profile.experience,
        availability: profile.availability,
        bio: profile.bio,
        rating: profile.rating,
        consultationFee: profile.consultationFee,
      });
      console.log(`✅ Created doctor profile: ${user.name} — ${profile.specialization}`);
    }

    // ── Beds ───────────────────────────────────────────────────────────────
    const bedCount = await Bed.countDocuments();
    if (bedCount === 0) {
      await Bed.insertMany(BEDS);
      console.log(`✅ Created ${BEDS.length} beds`);
    } else {
      console.log(`⏭️  Beds already seeded (${bedCount} exist)`);
    }

    // ── Lab Tests ──────────────────────────────────────────────────────────
    const labCount = await LabTest.countDocuments();
    if (labCount === 0) {
      await LabTest.insertMany(LAB_TESTS);
      console.log(`✅ Created ${LAB_TESTS.length} lab test catalogue entries`);
    } else {
      console.log(`⏭️  Lab tests already seeded (${labCount} exist)`);
    }

    // ── Sample Appointments ────────────────────────────────────────────────
    const aptCount = await Appointment.countDocuments();
    if (aptCount === 0) {
      const patient = createdUsers.find((u) => u.email === 'amit.patel@caresync.com');
      const doctor = createdUsers.find((u) => u.email === 'sarah.wilson@caresync.com');
      const doctorProfile = await Doctor.findOne({ user: doctor._id });

      if (patient && doctor) {
        await Appointment.insertMany([
          {
            patient: patient._id,
            patientName: patient.name,
            doctor: doctor._id,
            doctorName: doctor.name,
            doctorSpecialization: doctorProfile?.specialization || 'Cardiology',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '10:00',
            symptoms: 'Chest pain and shortness of breath during exercise.',
            status: 'Confirmed',
            bookedBy: 'patient',
          },
          {
            patient: patient._id,
            patientName: patient.name,
            doctor: doctor._id,
            doctorName: doctor.name,
            doctorSpecialization: doctorProfile?.specialization || 'Cardiology',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '14:30',
            symptoms: 'Routine checkup — palpitations for 3 days.',
            status: 'Completed',
            prescription: 'Take Metoprolol 25mg once daily. Avoid caffeine. Follow up in 2 weeks.',
            bookedBy: 'patient',
          },
        ]);
        console.log('✅ Created sample appointments');
      }
    } else {
      console.log(`⏭️  Appointments already seeded (${aptCount} exist)`);
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('Demo credentials:');
    console.log('  Admin       → admin@caresync.com        / Admin@123');
    console.log('  Doctor      → sarah.wilson@caresync.com / Doctor@123');
    console.log('  Receptionist→ mary.thomas@caresync.com  / Recept@123');
    console.log('  Patient     → amit.patel@caresync.com   / Patient@123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  }
};

seed();
