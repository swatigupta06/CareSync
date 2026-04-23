// tests/users.test.js
// ─────────────────────────────────────────────────────────
// User profile management tests
// Covers: GET/PUT /api/users/profile, /doctors, /patients
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { registerUser, authHeader, seedRoles } = require('./helpers');

let roles; // { admin, doctor, receptionist, patient }

beforeAll(async () => {
  roles = await seedRoles();
});

// ─────────────────────────────────────────────────────────
describe('GET /api/users/profile', () => {
  // ── TC-PROF-001 ──────────────────────────────────────
  test('TC-PROF-001 | Authenticated user gets own profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('role', 'patient');
    expect(res.body).not.toHaveProperty('password');
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('PUT /api/users/profile', () => {
  // ── TC-PROF-002 ──────────────────────────────────────
  test('TC-PROF-002 | Patient updates name and phone', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set(authHeader(roles.patient.token))
      .send({ name: 'Updated Name', phone: '9000000001' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.phone).toBe('9000000001');
  });

  // ── TC-PROF-003 ──────────────────────────────────────
  test('TC-PROF-003 | Invalid phone format returns 400', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set(authHeader(roles.patient.token))
      .send({ phone: 'not-a-phone' });

    expect(res.status).toBe(400);
  });

  // ── TC-SEC-004 ──────────────────────────────────────
  test('TC-SEC-004 | XSS payload in name is stored safely', async () => {
    const xssPayload = "<script>alert('xss')</script>";
    const res = await request(app)
      .put('/api/users/profile')
      .set(authHeader(roles.patient.token))
      .send({ name: xssPayload });

    // Either rejected (400) or sanitised (200 without raw script tag)
    if (res.status === 200) {
      expect(res.body.name).not.toContain('<script>');
    } else {
      expect(res.status).toBe(400);
    }
  });

  test('No token returns 401', async () => {
    const res = await request(app).put('/api/users/profile').send({ name: 'Fail' });
    expect(res.status).toBe(401);
  });

  test('Attempting to change role is ignored or rejected', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set(authHeader(roles.patient.token))
      .send({ role: 'admin' });

    // Should not elevate role
    if (res.status === 200) {
      expect(res.body.role).toBe('patient');
    } else {
      expect([400, 403]).toContain(res.status);
    }
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/users/doctors', () => {
  // ── TC-PROF-004 ──────────────────────────────────────
  test('TC-PROF-004 | Patient can view doctors list', async () => {
    const res = await request(app)
      .get('/api/users/doctors')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // No passwords in response
    res.body.forEach((doc) => {
      expect(doc).not.toHaveProperty('password');
    });
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/users/doctors');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/users/patients', () => {
  // ── TC-PROF-005 ──────────────────────────────────────
  test('TC-PROF-005 | Receptionist can view patients list', async () => {
    const res = await request(app)
      .get('/api/users/patients')
      .set(authHeader(roles.receptionist.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Doctor can view patients list', async () => {
    const res = await request(app)
      .get('/api/users/patients')
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(200);
  });

  // ── TC-PROF-006 ──────────────────────────────────────
  test('TC-PROF-006 | Patient cannot view patients list (403)', async () => {
    const res = await request(app)
      .get('/api/users/patients')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(403);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/users/patients');
    expect(res.status).toBe(401);
  });
});
