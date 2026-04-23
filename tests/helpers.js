// tests/helpers.js
// ─────────────────────────────────────────────────────────
// Shared helpers: register users, obtain tokens, seed data
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app'); // adjust path if needed

/**
 * Register a user and return { token, user }
 * @param {object} overrides – partial user fields
 */
async function registerUser(overrides = {}) {
  const defaults = {
    name: 'Test User',
    email: `user_${Date.now()}@test.com`,
    password: 'Test@1234',
    role: 'patient',
    phone: '9876543210',
  };
  const payload = { ...defaults, ...overrides };

  const res = await request(app).post('/api/auth/signup').send(payload);
  return { token: res.body.token, user: res.body.user, status: res.status };
}

/**
 * Login and return { token, user }
 */
async function loginUser(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return { token: res.body.token, user: res.body.user, status: res.status };
}

/**
 * Auth header helper
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create a full set of seeded roles and return their tokens
 */
async function seedRoles() {
  const ts = Date.now();

  const admin = await registerUser({ name: 'Admin', email: `admin_${ts}@cs.com`, role: 'admin', password: 'Admin@1234' });
  const doctor = await registerUser({ name: 'Dr. Smith', email: `doc_${ts}@cs.com`, role: 'doctor', password: 'Doctor@1234', specialization: 'General' });
  const receptionist = await registerUser({ name: 'Recep', email: `recep_${ts}@cs.com`, role: 'receptionist', password: 'Recep@1234' });
  const patient = await registerUser({ name: 'Patient Joe', email: `patient_${ts}@cs.com`, role: 'patient', password: 'Patient@1234' });

  return { admin, doctor, receptionist, patient };
}

module.exports = { registerUser, loginUser, authHeader, seedRoles };
