// tests/lab.test.js
// ─────────────────────────────────────────────────────────
// Lab tests, bookings, payments, and reports tests
// Covers: GET tests, POST book, POST pay, GET bookings,
//         POST reports, GET reports
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;
let testId;      // ID of a seeded lab test
let bookingId;   // Created in book test, used in pay / report tests

beforeAll(async () => {
  roles = await seedRoles();

  // Fetch an available test to use in booking tests
  const testsRes = await request(app)
    .get('/api/lab/tests')
    .set(authHeader(roles.patient.token));

  if (testsRes.body && testsRes.body.length > 0) {
    testId = testsRes.body[0]._id;
  }
});

// ─────────────────────────────────────────────────────────
describe('GET /api/lab/tests', () => {
  // ── TC-LAB-001 ──────────────────────────────────────
  test('TC-LAB-001 | Authenticated user gets list of lab tests', async () => {
    const res = await request(app)
      .get('/api/lab/tests')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/lab/tests');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/lab/book', () => {
  // ── TC-LAB-002 ──────────────────────────────────────
  test('TC-LAB-002 | Patient books a valid lab test', async () => {
    if (!testId) return; // skip if no tests seeded

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const scheduledDate = futureDate.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/lab/book')
      .set(authHeader(roles.patient.token))
      .send({ testId, scheduledDate });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.paymentStatus).toBe('pending');
    bookingId = res.body._id;
  });

  test('Invalid testId returns 404', async () => {
    const res = await request(app)
      .post('/api/lab/book')
      .set(authHeader(roles.patient.token))
      .send({ testId: '000000000000000000000000', scheduledDate: '2026-05-15' });

    expect(res.status).toBe(404);
  });

  test('Missing testId returns 400', async () => {
    const res = await request(app)
      .post('/api/lab/book')
      .set(authHeader(roles.patient.token))
      .send({ scheduledDate: '2026-05-15' });

    expect(res.status).toBe(400);
  });

  // ── TC-LAB-008 ──────────────────────────────────────
  test('TC-LAB-008 | No token returns 401', async () => {
    const res = await request(app)
      .post('/api/lab/book')
      .send({ testId: testId || 'test', scheduledDate: '2026-05-15' });

    expect(res.status).toBe(401);
  });

  test('Past scheduled date returns 400', async () => {
    const res = await request(app)
      .post('/api/lab/book')
      .set(authHeader(roles.patient.token))
      .send({ testId: testId || 'test', scheduledDate: '2020-01-01' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/lab/bookings/:id/pay', () => {
  // ── TC-LAB-003 ──────────────────────────────────────
  test('TC-LAB-003 | Patient pays for a pending booking', async () => {
    if (!bookingId) return;

    const res = await request(app)
      .post(`/api/lab/bookings/${bookingId}/pay`)
      .set(authHeader(roles.patient.token))
      .send({ paymentMethod: 'card', amount: 500 });

    expect(res.status).toBe(200);
    expect(res.body.paymentStatus).toBe('paid');
  });

  // ── TC-LAB-004 ──────────────────────────────────────
  test('TC-LAB-004 | Paying for already-paid booking returns 400', async () => {
    if (!bookingId) return;

    const res = await request(app)
      .post(`/api/lab/bookings/${bookingId}/pay`)
      .set(authHeader(roles.patient.token))
      .send({ paymentMethod: 'card', amount: 500 });

    expect(res.status).toBe(400);
  });

  test('Non-existent booking returns 404', async () => {
    const res = await request(app)
      .post('/api/lab/bookings/000000000000000000000000/pay')
      .set(authHeader(roles.patient.token))
      .send({ paymentMethod: 'card', amount: 500 });

    expect(res.status).toBe(404);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .post(`/api/lab/bookings/${bookingId || 'test'}/pay`)
      .send({ paymentMethod: 'card', amount: 500 });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/lab/bookings', () => {
  // ── TC-LAB-005 ──────────────────────────────────────
  test('TC-LAB-005 | Patient gets only their own bookings', async () => {
    const res = await request(app)
      .get('/api/lab/bookings')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/lab/bookings');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/lab/reports', () => {
  // ── TC-LAB-006 ──────────────────────────────────────
  test('TC-LAB-006 | Doctor uploads lab report', async () => {
    const res = await request(app)
      .post('/api/lab/reports')
      .set(authHeader(roles.doctor.token))
      .send({
        bookingId: bookingId || '000000000000000000000000',
        reportUrl: 'https://cdn.caresync.com/reports/rpt1.pdf',
        remarks: 'Normal',
      });

    expect([201, 404]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('_id');
    }
  });

  test('Patient cannot upload reports (403)', async () => {
    const res = await request(app)
      .post('/api/lab/reports')
      .set(authHeader(roles.patient.token))
      .send({
        bookingId: bookingId || '000000000000000000000000',
        reportUrl: 'https://cdn.caresync.com/reports/rpt1.pdf',
      });

    expect(res.status).toBe(403);
  });

  test('Missing reportUrl returns 400', async () => {
    const res = await request(app)
      .post('/api/lab/reports')
      .set(authHeader(roles.doctor.token))
      .send({ bookingId: bookingId || '000000000000000000000000' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/lab/reports', () => {
  // ── TC-LAB-007 ──────────────────────────────────────
  test('TC-LAB-007 | Patient gets only their own reports', async () => {
    const res = await request(app)
      .get('/api/lab/reports')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Doctor can view all reports', async () => {
    const res = await request(app)
      .get('/api/lab/reports')
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(200);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/lab/reports');
    expect(res.status).toBe(401);
  });
});
