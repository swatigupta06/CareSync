// tests/beds.test.js
// ─────────────────────────────────────────────────────────
// Bed management tests
// Covers: GET beds, PATCH assign, PATCH discharge
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;
let availableBedId; // ID of a bed that is available

beforeAll(async () => {
  roles = await seedRoles();

  // Get an available bed to use in tests
  const res = await request(app)
    .get('/api/beds')
    .set(authHeader(roles.receptionist.token));

  if (res.body && Array.isArray(res.body)) {
    const available = res.body.find((b) => b.status === 'available');
    if (available) availableBedId = available._id;
  }
});

// ─────────────────────────────────────────────────────────
describe('GET /api/beds', () => {
  // ── TC-BED-001 ──────────────────────────────────────
  test('TC-BED-001 | Receptionist gets full bed list', async () => {
    const res = await request(app)
      .get('/api/beds')
      .set(authHeader(roles.receptionist.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('bedNumber');
      expect(res.body[0]).toHaveProperty('status');
    }
  });

  test('Admin gets full bed list', async () => {
    const res = await request(app)
      .get('/api/beds')
      .set(authHeader(roles.admin.token));

    expect(res.status).toBe(200);
  });

  test('Doctor gets full bed list', async () => {
    const res = await request(app)
      .get('/api/beds')
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(200);
  });

  // ── TC-BED-002 ──────────────────────────────────────
  test('TC-BED-002 | Patient cannot view beds (403)', async () => {
    const res = await request(app)
      .get('/api/beds')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(403);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/beds');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('PATCH /api/beds/:id/assign', () => {
  // ── TC-BED-003 ──────────────────────────────────────
  test('TC-BED-003 | Receptionist assigns an available bed to a patient', async () => {
    if (!availableBedId) return;

    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/assign`)
      .set(authHeader(roles.receptionist.token))
      .send({
        patientId: roles.patient.user.id,
        admissionDate: new Date().toISOString().split('T')[0],
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('occupied');
    expect(res.body.patientId?.toString()).toBe(roles.patient.user.id?.toString());
  });

  // ── TC-BED-004 ──────────────────────────────────────
  test('TC-BED-004 | Assigning an already occupied bed returns 409', async () => {
    if (!availableBedId) return;

    // Create a second patient
    const { token: pt2Token, user: pt2 } = await require('./helpers').registerUser({
      name: 'Patient 2', email: `pt2_${Date.now()}@test.com`, role: 'patient',
    });

    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/assign`)
      .set(authHeader(roles.receptionist.token))
      .send({
        patientId: pt2.id,
        admissionDate: new Date().toISOString().split('T')[0],
      });

    expect(res.status).toBe(409);
  });

  test('Patient cannot assign beds (403)', async () => {
    if (!availableBedId) return;

    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/assign`)
      .set(authHeader(roles.patient.token))
      .send({ patientId: roles.patient.user.id });

    expect(res.status).toBe(403);
  });

  test('Non-existent bed returns 404', async () => {
    const res = await request(app)
      .patch('/api/beds/000000000000000000000000/assign')
      .set(authHeader(roles.receptionist.token))
      .send({ patientId: roles.patient.user.id });

    expect(res.status).toBe(404);
  });

  test('Missing patientId returns 400', async () => {
    if (!availableBedId) return;

    // Find another available bed (first may be occupied now)
    const allBeds = await request(app)
      .get('/api/beds')
      .set(authHeader(roles.receptionist.token));
    const freeBed = allBeds.body?.find((b) => b.status === 'available');
    if (!freeBed) return;

    const res = await request(app)
      .patch(`/api/beds/${freeBed._id}/assign`)
      .set(authHeader(roles.receptionist.token))
      .send({});

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
describe('PATCH /api/beds/:id/discharge', () => {
  // ── TC-BED-005 ──────────────────────────────────────
  test('TC-BED-005 | Receptionist discharges an occupied bed', async () => {
    if (!availableBedId) return;

    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/discharge`)
      .set(authHeader(roles.receptionist.token));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('available');
    expect(res.body.patientId).toBeFalsy();
  });

  // ── TC-BED-006 ──────────────────────────────────────
  test('TC-BED-006 | Discharging an available bed returns 400', async () => {
    if (!availableBedId) return;

    // Bed is now available (just discharged above)
    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/discharge`)
      .set(authHeader(roles.receptionist.token));

    expect(res.status).toBe(400);
  });

  test('Patient cannot discharge beds (403)', async () => {
    if (!availableBedId) return;

    const res = await request(app)
      .patch(`/api/beds/${availableBedId}/discharge`)
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(403);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .patch(`/api/beds/${availableBedId || 'test'}/discharge`);

    expect(res.status).toBe(401);
  });
});
