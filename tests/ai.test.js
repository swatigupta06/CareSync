// tests/ai.test.js
// ─────────────────────────────────────────────────────────
// AI Chat endpoint tests
// Covers: POST /api/ai/chat
// ─────────────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');
const { authHeader, seedRoles } = require('./helpers');

let roles;

beforeAll(async () => {
  roles = await seedRoles();
});

describe('POST /api/ai/chat', () => {
  // ── TC-AI-001 ──────────────────────────────────────
  test('TC-AI-001 | Authenticated patient receives AI reply', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.patient.token))
      .send({ message: 'What are symptoms of diabetes?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(0);
  }, 30000); // AI calls may be slow; allow 30s

  // ── TC-AI-002 ──────────────────────────────────────
  test('TC-AI-002 | No token returns 401', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Hello' });

    expect(res.status).toBe(401);
  });

  // ── TC-AI-003 ──────────────────────────────────────
  test('TC-AI-003 | Empty message returns 400', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.patient.token))
      .send({ message: '' });

    expect(res.status).toBe(400);
  });

  test('Missing message field returns 400', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.patient.token))
      .send({});

    expect(res.status).toBe(400);
  });

  // ── TC-AI-004 ──────────────────────────────────────
  test('TC-AI-004 | Very long message does not cause 500', async () => {
    const longMsg = 'a'.repeat(10000);
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.patient.token))
      .send({ message: longMsg });

    // Should return 200 with reply, or 400/413 — never 500
    expect(res.status).not.toBe(500);
  }, 30000);

  test('Doctor can use AI chat', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.doctor.token))
      .send({ message: 'List common drug interactions for Metformin' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
  }, 30000);

  test('Whitespace-only message returns 400', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(authHeader(roles.patient.token))
      .send({ message: '   ' });

    expect(res.status).toBe(400);
  });
});
