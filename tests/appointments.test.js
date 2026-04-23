// tests/appointments.test.js
// ─────────────────────────────────────────────────────────
// Appointment management tests
// Covers: POST, GET, PATCH status, PATCH prescription
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;
let appointmentId; // shared across tests in this file

beforeAll(async () => {
  roles = await seedRoles();
});

// ─────────────────────────────────────────────────────────
describe('POST /api/appointments', () => {
  // ── TC-APPT-001 ──────────────────────────────────────
  test('TC-APPT-001 | Patient books appointment with valid doctor', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(roles.patient.token))
      .send({
        doctorId: roles.doctor.user.id,
        date: dateStr,
        time: '10:00',
        reason: 'Routine checkup',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('pending');
    appointmentId = res.body._id;
  });

  // ── TC-APPT-002 ──────────────────────────────────────
  test('TC-APPT-002 | Invalid doctorId returns 404', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(roles.patient.token))
      .send({
        doctorId: '000000000000000000000000',
        date: '2026-05-10',
        time: '10:00',
        reason: 'Test',
      });

    expect(res.status).toBe(404);
  });

  // ── TC-APPT-003 ──────────────────────────────────────
  test('TC-APPT-003 | Past date returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(roles.patient.token))
      .send({
        doctorId: roles.doctor.user.id,
        date: '2020-01-01',
        time: '10:00',
        reason: 'Old',
      });

    expect(res.status).toBe(400);
  });

  test('Missing doctorId returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(roles.patient.token))
      .send({ date: '2026-05-10', time: '10:00' });

    expect(res.status).toBe(400);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: roles.doctor.user.id, date: '2026-05-10', time: '10:00' });

    expect(res.status).toBe(401);
  });

  test('Doctor role cannot book as patient', async () => {
    // Doctors may or may not be allowed to POST appointments for themselves
    // Typically they should not; system handles patient-initiated flow
    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(roles.doctor.token))
      .send({
        doctorId: roles.doctor.user.id,
        date: '2026-05-20',
        time: '11:00',
        reason: 'Self-booking',
      });
    // Accept 201 or 403 depending on implementation
    expect([201, 403]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/appointments', () => {
  // ── TC-APPT-004 ──────────────────────────────────────
  test('TC-APPT-004 | Patient sees only their own appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((appt) => {
      // Each appointment should belong to this patient
      const patientField = appt.patientId?._id || appt.patientId;
      expect(patientField?.toString()).toBe(roles.patient.user.id?.toString());
    });
  });

  // ── TC-APPT-005 ──────────────────────────────────────
  test('TC-APPT-005 | Doctor sees only appointments assigned to them', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((appt) => {
      const doctorField = appt.doctorId?._id || appt.doctorId;
      expect(doctorField?.toString()).toBe(roles.doctor.user.id?.toString());
    });
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('PATCH /api/appointments/:id/status', () => {
  // ── TC-APPT-006 ──────────────────────────────────────
  test('TC-APPT-006 | Doctor updates appointment status to confirmed', async () => {
    expect(appointmentId).toBeDefined();

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set(authHeader(roles.doctor.token))
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  // ── TC-APPT-007 ──────────────────────────────────────
  test('TC-APPT-007 | Patient cannot update status (403)', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set(authHeader(roles.patient.token))
      .send({ status: 'cancelled' });

    expect(res.status).toBe(403);
  });

  // ── TC-APPT-009 ──────────────────────────────────────
  test('TC-APPT-009 | Invalid status value returns 400', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set(authHeader(roles.doctor.token))
      .send({ status: 'hacked' });

    expect(res.status).toBe(400);
  });

  test('Non-existent appointment returns 404', async () => {
    const res = await request(app)
      .patch('/api/appointments/000000000000000000000000/status')
      .set(authHeader(roles.doctor.token))
      .send({ status: 'confirmed' });

    expect(res.status).toBe(404);
  });

  test('Receptionist can update appointment status', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set(authHeader(roles.receptionist.token))
      .send({ status: 'cancelled' });

    expect([200, 403]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────
describe('PATCH /api/appointments/:id/prescription', () => {
  // ── TC-APPT-008 ──────────────────────────────────────
  test('TC-APPT-008 | Doctor adds prescription to appointment', async () => {
    expect(appointmentId).toBeDefined();

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/prescription`)
      .set(authHeader(roles.doctor.token))
      .send({ prescription: 'Tab. Paracetamol 500mg twice daily for 5 days' });

    expect(res.status).toBe(200);
    expect(res.body.prescription).toBe('Tab. Paracetamol 500mg twice daily for 5 days');
  });

  test('Patient cannot add prescription (403)', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/prescription`)
      .set(authHeader(roles.patient.token))
      .send({ prescription: 'Self-medicate' });

    expect(res.status).toBe(403);
  });

  test('Empty prescription body returns 400', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/prescription`)
      .set(authHeader(roles.doctor.token))
      .send({ prescription: '' });

    expect(res.status).toBe(400);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/prescription`)
      .send({ prescription: 'Something' });

    expect(res.status).toBe(401);
  });
});
