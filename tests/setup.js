// tests/setup.js
// ─────────────────────────────────────────────────────────
// Global Jest + Supertest setup for CareSync API tests
// ─────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ── Connect to in-memory / test DB before all suites ──
beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/caresync_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

// ── Drop test DB and close connection after all suites ──
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
