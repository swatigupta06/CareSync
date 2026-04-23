// tests/records.test.js
// ─────────────────────────────────────────────────────────
// Medical records tests
// Covers: POST, GET, DELETE records and permission flow
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;
let recordId;         // created by patient A
let permissionReqId;  // created by doctor

beforeAll(async () => {
  roles = await seedRoles();
});

// ─────────────────────────────────────────────────────────
describe('POST /api/records', () => {
  // ── TC-REC-001 ──────────────────────────────────────
  test('TC-REC-001 | Patient uploads a medical record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set(authHeader(roles.patient.token))
      .send({
        title: 'Blood Test Report',
        fileUrl: 'https://cdn.caresync.com/rec/blood.pdf',
        type: 'lab_report',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    recordId = res.body._id;
  });

  test('Missing title returns 400', async () => {
    const res = await request(app)
      .post('/api/records')
      .set(authHeader(roles.patient.token))
      .send({ fileUrl: 'https://cdn.caresync.com/rec/test.pdf' });

    expect(res.status).toBe(400);
  });

  test('Missing fileUrl returns 400', async () => {
    const res = await request(app)
      .post('/api/records')
      .set(authHeader(roles.patient.token))
      .send({ title: 'No URL record' });

    expect(res.status).toBe(400);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ title: 'Test', fileUrl: 'https://example.com/f.pdf' });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/records', () => {
  // ── TC-REC-002 ──────────────────────────────────────
  test('TC-REC-002 | Patient gets only their own records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // All records should belong to this patient
    res.body.forEach((rec) => {
      const ownerId = rec.ownerId?._id || rec.ownerId;
      expect(ownerId?.toString()).toBe(roles.patient.user.id?.toString());
    });
  });

  // ── TC-REC-008 ──────────────────────────────────────
  test('TC-REC-008 | Doctor without permission cannot access patient records', async () => {
    const res = await request(app)
      .get(`/api/records?patientId=${roles.patient.user.id}`)
      .set(authHeader(roles.doctor.token));

    expect(res.status).toBe(403);
  });

  test('No token returns 401', async () => {
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('DELETE /api/records/:id', () => {
  // ── TC-REC-003 ──────────────────────────────────────
  test('TC-REC-003 | Patient deletes their own record', async () => {
    expect(recordId).toBeDefined();

    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set(authHeader(roles.patient.token));

    expect([200, 204]).toContain(res.status);
  });

  // ── TC-REC-004 ──────────────────────────────────────
  test('TC-REC-004 | Patient A cannot delete Patient B record', async () => {
    // Create a new record as patient (already deleted above, re-create)
    const create = await request(app)
      .post('/api/records')
      .set(authHeader(roles.patient.token))
      .send({ title: 'Private', fileUrl: 'https://cdn.cs.com/p.pdf', type: 'other' });
    const newId = create.body._id;

    // Create a second patient
    const { token: token2 } = await require('./helpers').registerUser({
      name: 'Patient B',
      email: `patb_${Date.now()}@test.com`,
      role: 'patient',
    });

    const res = await request(app)
      .delete(`/api/records/${newId}`)
      .set(authHeader(token2));

    expect([403, 404]).toContain(res.status);
  });

  test('Non-existent record returns 404', async () => {
    const res = await request(app)
      .delete('/api/records/000000000000000000000000')
      .set(authHeader(roles.patient.token));

    expect(res.status).toBe(404);
  });

  test('No token returns 401', async () => {
    const res = await request(app).delete(`/api/records/${recordId || 'test'}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/records/permissions/request', () => {
  // ── TC-REC-005 ──────────────────────────────────────
  test('TC-REC-005 | Doctor requests access to patient records', async () => {
    const res = await request(app)
      .post('/api/records/permissions/request')
      .set(authHeader(roles.doctor.token))
      .send({
        patientId: roles.patient.user.id,
        reason: 'Pre-surgery review',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('pending');
    permissionReqId = res.body._id;
  });

  test('Patient cannot request permission on own records', async () => {
    const res = await request(app)
      .post('/api/records/permissions/request')
      .set(authHeader(roles.patient.token))
      .send({
        patientId: roles.patient.user.id,
        reason: 'Self access',
      });

    // Depends on implementation: 403 or 400 are both valid
    expect([400, 403]).toContain(res.status);
  });

  test('Missing patientId returns 400', async () => {
    const res = await request(app)
      .post('/api/records/permissions/request')
      .set(authHeader(roles.doctor.token))
      .send({ reason: 'Review' });

    expect(res.status).toBe(400);
  });

  test('No token returns 401', async () => {
    const res = await request(app)
      .post('/api/records/permissions/request')
      .send({ patientId: roles.patient.user.id });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('PATCH /api/records/permissions/:id/respond', () => {
  // ── TC-REC-006 ──────────────────────────────────────
  test('TC-REC-006 | Patient approves a permission request', async () => {
    if (!permissionReqId) return;

    const res = await request(app)
      .patch(`/api/records/permissions/${permissionReqId}/respond`)
      .set(authHeader(roles.patient.token))
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  // ── TC-REC-007 ──────────────────────────────────────
  test('TC-REC-007 | Patient denies a permission request', async () => {
    // Create a new request
    const reqRes = await request(app)
      .post('/api/records/permissions/request')
      .set(authHeader(roles.doctor.token))
      .send({ patientId: roles.patient.user.id, reason: 'Another review' });

    const newReqId = reqRes.body._id;
    if (!newReqId) return;

    const res = await request(app)
      .patch(`/api/records/permissions/${newReqId}/respond`)
      .set(authHeader(roles.patient.token))
      .send({ status: 'denied' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('denied');
  });

  test('Doctor cannot respond to permission request', async () => {
    if (!permissionReqId) return;

    const res = await request(app)
      .patch(`/api/records/permissions/${permissionReqId}/respond`)
      .set(authHeader(roles.doctor.token))
      .send({ status: 'approved' });

    expect(res.status).toBe(403);
  });

  test('Invalid status value returns 400', async () => {
    if (!permissionReqId) return;

    const res = await request(app)
      .patch(`/api/records/permissions/${permissionReqId}/respond`)
      .set(authHeader(roles.patient.token))
      .send({ status: 'maybe' });

    expect(res.status).toBe(400);
  });

  test('Non-existent permission request returns 404', async () => {
    const res = await request(app)
      .patch('/api/records/permissions/000000000000000000000000/respond')
      .set(authHeader(roles.patient.token))
      .send({ status: 'approved' });

    expect(res.status).toBe(404);
  });
});
