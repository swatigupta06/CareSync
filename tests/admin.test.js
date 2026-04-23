// tests/admin.test.js
// ─────────────────────────────────────────────────────────
// Admin analytics tests
// Covers: GET /api/admin/analytics – RBAC + content checks
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;

beforeAll(async () => {
  roles = await seedRoles();
});

describe('GET /api/admin/analytics', () => {
  // ── TC-ADMIN-001 ──────────────────────────────────────
  test('TC-ADMIN-001 | Admin receives analytics payload', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set(authHeader(roles.admin.token));

    expect(res.status).toBe(200);
    // Core metrics must be present
    expect(res.body).toHaveProperty('totalPatients');
    expect(res.body).toHaveProperty('totalDoctors');
    expect(res.body).toHaveProperty('totalAppointments');
  });

  // ── TC-ADMIN-002 ──────────────────────────────────────
  test('TC-ADMIN-002 | Doctor cannot access analytics (403)', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(403);
  });

  test('TC-ADMIN-002 | Receptionist cannot access analytics (403)', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set(authHeader(roles.receptionist.token));

    expect(res.status).toBe(403);
  });

  test('TC-ADMIN-002 | Patient cannot access analytics (403)', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(403);
  });

  // ── TC-ADMIN-003 ──────────────────────────────────────
  test('TC-ADMIN-003 | No token returns 401', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
  });

  test('Analytics values are non-negative numbers', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set(authHeader(roles.admin.token));

    expect(res.status).toBe(200);
    expect(res.body.totalPatients).toBeGreaterThanOrEqual(0);
    expect(res.body.totalDoctors).toBeGreaterThanOrEqual(0);
    expect(res.body.totalAppointments).toBeGreaterThanOrEqual(0);
  });
});
