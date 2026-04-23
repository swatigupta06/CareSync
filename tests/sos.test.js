// tests/sos.test.js
// ─────────────────────────────────────────────────────────
// SOS / Emergency trigger tests
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;

beforeAll(async () => {
  roles = await seedRoles();
});

describe('POST /api/sos/trigger', () => {
  // ── TC-SOS-001 ──────────────────────────────────────
  test('TC-SOS-001 | Patient triggers SOS with valid location', async () => {
    const res = await request(app)
      .post('/api/sos/trigger')
      .set(authHeader(roles.patient.token))
      .send({
        location: { lat: 26.9124, lng: 75.7873 },
        message: 'Chest pain',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('alertId');
    expect(res.body.status).toBe('active');
  });

  // ── TC-SOS-002 ──────────────────────────────────────
  test('TC-SOS-002 | SOS without auth returns 401', async () => {
    const res = await request(app)
      .post('/api/sos/trigger')
      .send({ location: { lat: 26.9124, lng: 75.7873 } });

    expect(res.status).toBe(401);
  });

  // ── TC-SOS-003 ──────────────────────────────────────
  test('TC-SOS-003 | SOS with missing location returns 400', async () => {
    const res = await request(app)
      .post('/api/sos/trigger')
      .set(authHeader(roles.patient.token))
      .send({});

    expect(res.status).toBe(400);
  });

  test('SOS with invalid coordinates returns 400', async () => {
    const res = await request(app)
      .post('/api/sos/trigger')
      .set(authHeader(roles.patient.token))
      .send({ location: { lat: 'abc', lng: 'xyz' } });

    expect(res.status).toBe(400);
  });

  test('Doctor can also trigger SOS', async () => {
    const res = await request(app)
      .post('/api/sos/trigger')
      .set(authHeader(roles.doctor.token))
      .send({ location: { lat: 26.9, lng: 75.8 }, message: 'Emergency in ward' });

    expect([200, 201]).toContain(res.status);
  });
});
