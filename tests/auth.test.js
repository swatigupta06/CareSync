// tests/auth.test.js
// ─────────────────────────────────────────────────────────
// Authentication & Aadhaar verification tests
// Covers: signup, login, /me, verify-aadhaar
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { registerUser, authHeader } = require('./helpers');

describe('POST /api/auth/signup', () => {
  // ── TC-AUTH-001 ──────────────────────────────────────
  test('TC-AUTH-001 | Valid patient signup returns 201 with token', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'John Doe',
      email: `john_${Date.now()}@test.com`,
      password: 'John@1234',
      role: 'patient',
      phone: '9876543210',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.role).toBe('patient');
    expect(res.body.user).not.toHaveProperty('password');
  });

  // ── TC-AUTH-002 ──────────────────────────────────────
  test('TC-AUTH-002 | Duplicate email returns 409', async () => {
    const email = `dup_${Date.now()}@test.com`;
    await request(app).post('/api/auth/signup').send({
      name: 'First', email, password: 'First@1234', role: 'patient',
    });

    const res = await request(app).post('/api/auth/signup').send({
      name: 'Second', email, password: 'Second@1234', role: 'patient',
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  // ── TC-AUTH-003 ──────────────────────────────────────
  test('TC-AUTH-003 | Invalid email format returns 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test',
      email: 'not-an-email',
      password: 'Test@1234',
      role: 'patient',
    });

    expect(res.status).toBe(400);
  });

  // ── TC-AUTH-004 ──────────────────────────────────────
  test('TC-AUTH-004 | Weak password returns 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Weak',
      email: `weak_${Date.now()}@test.com`,
      password: '123',
      role: 'patient',
    });

    expect(res.status).toBe(400);
  });

  test('Missing required fields returns 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({});
    expect(res.status).toBe(400);
  });

  test('Invalid role value returns 400', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Bad Role',
      email: `badrole_${Date.now()}@test.com`,
      password: 'Bad@1234',
      role: 'superuser', // invalid
    });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  let testEmail;

  beforeAll(async () => {
    testEmail = `login_${Date.now()}@test.com`;
    await request(app).post('/api/auth/signup').send({
      name: 'Login User', email: testEmail, password: 'Login@1234', role: 'patient',
    });
  });

  // ── TC-AUTH-005 ──────────────────────────────────────
  test('TC-AUTH-005 | Valid credentials return 200 with token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Login@1234',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  // ── TC-AUTH-006 ──────────────────────────────────────
  test('TC-AUTH-006 | Wrong password returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPass@999',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // ── TC-AUTH-007 ──────────────────────────────────────
  test('TC-AUTH-007 | Non-existent email returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@caresync.com',
      password: 'Test@1234',
    });

    expect(res.status).toBe(401);
    // Must not reveal whether email exists
    expect(res.body.error).not.toMatch(/email not found/i);
  });

  test('Missing email returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'Test@1234' });
    expect(res.status).toBe(400);
  });

  test('Empty body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let token;
  let signedUpUser;

  beforeAll(async () => {
    const { token: t, user } = await registerUser({
      name: 'Me User',
      email: `me_${Date.now()}@test.com`,
      role: 'patient',
    });
    token = t;
    signedUpUser = user;
  });

  // ── TC-AUTH-008 ──────────────────────────────────────
  test('TC-AUTH-008 | Authenticated request returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', signedUpUser.email);
    expect(res.body).toHaveProperty('role', 'patient');
    expect(res.body).not.toHaveProperty('password');
  });

  // ── TC-AUTH-009 ──────────────────────────────────────
  test('TC-AUTH-009 | No token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  // ── TC-SEC-001 ──────────────────────────────────────
  test('TC-SEC-001 | Expired token returns 401', async () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJpZCI6IjY2MDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.' +
      'INVALIDSIG';

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  // ── TC-SEC-002 ──────────────────────────────────────
  test('TC-SEC-002 | Malformed token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer thisisnotavalidtoken');

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('POST /api/auth/verify-aadhaar', () => {
  let token;

  beforeAll(async () => {
    const { token: t } = await registerUser({ role: 'patient' });
    token = t;
  });

  // ── TC-AUTH-010 ──────────────────────────────────────
  test('TC-AUTH-010 | Valid 12-digit Aadhaar returns 200', async () => {
    const res = await request(app)
      .post('/api/auth/verify-aadhaar')
      .set(authHeader(token))
      .send({ aadhaarNumber: '123456789012' });

    expect([200, 201]).toContain(res.status);
  });

  // ── TC-AUTH-011 ──────────────────────────────────────
  test('TC-AUTH-011 | Short Aadhaar number returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-aadhaar')
      .set(authHeader(token))
      .send({ aadhaarNumber: '123' });

    expect(res.status).toBe(400);
  });

  test('Missing Aadhaar number returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-aadhaar')
      .set(authHeader(token))
      .send({});

    expect(res.status).toBe(400);
  });

  test('Aadhaar verify without auth returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/verify-aadhaar')
      .send({ aadhaarNumber: '123456789012' });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
describe('Security – NoSQL injection', () => {
  // ── TC-SEC-003 ──────────────────────────────────────
  test('TC-SEC-003 | NoSQL injection in login does not return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'anything' });

    expect(res.status).not.toBe(200);
    expect(res.body).not.toHaveProperty('token');
  });
});
