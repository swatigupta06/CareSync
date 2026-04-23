# CareSync – Test Suite Setup & Running Guide

## Directory Structure

```
tests/
├── setup.js              # Global Jest setup (DB connect/teardown)
├── helpers.js            # Shared: registerUser, loginUser, seedRoles
├── auth.test.js          # Authentication & Aadhaar (11 TC-AUTH + security)
├── users.test.js         # Profile, doctors list, patients list
├── appointments.test.js  # Appointments CRUD + RBAC
├── lab.test.js           # Lab tests, bookings, payments, reports
├── records.test.js       # Medical records + permissions
├── beds.test.js          # Bed assignment & discharge
├── sos.test.js           # SOS / emergency trigger
├── ai.test.js            # AI Chat endpoint
├── admin.test.js         # Admin analytics + RBAC
├── package.json          # Jest config + npm scripts
└── README.md             # This file
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MongoDB | Atlas or local (≥ 6.x) |
| CareSync API | Running or importable as `src/app.js` |

---

## Step 1 – Install Dependencies

From your project root (where `src/` lives):

```bash
npm install --save-dev jest supertest
```

Or if you're using the standalone `tests/` package:

```bash
cd tests
npm install
```

---

## Step 2 – Environment Variables

Create a `.env.test` in the project root:

```env
# Test database (SEPARATE from production!)
MONGO_URI_TEST=mongodb://localhost:27017/caresync_test

# JWT
JWT_SECRET=supersecrettestkey
JWT_EXPIRES_IN=1h

# AI (mock or sandbox key)
OPENAI_API_KEY=sk-test-...

# Optional: disable real Aadhaar verification in tests
AADHAAR_MOCK=true
```

Load it in your app entry point or via `jest --env`:

```bash
NODE_ENV=test jest
```

---

## Step 3 – App Export

The tests import your Express app as:

```js
const app = require('../src/app');
```

Make sure `src/app.js` exports the Express app **without** calling `.listen()`:

```js
// src/app.js
const express = require('express');
const app = express();
// ... middleware and routes ...
module.exports = app;      // ← export only

// src/server.js (separate file)
const app = require('./app');
app.listen(5000, () => console.log('Server running'));
```

---

## Step 4 – Seed Beds (if required)

Some bed tests require pre-seeded bed records. Run your seed script before tests:

```bash
node scripts/seedBeds.js   # adjust path to your seed file
```

Or use an `afterAll` / `beforeAll` in `tests/setup.js` to seed beds programmatically.

---

## Step 5 – Run Tests

### Run all tests

```bash
npm test
# or
npx jest --runInBand --forceExit
```

`--runInBand` runs tests serially (important for shared DB state).

### Run a specific module

```bash
npm run test:auth
npm run test:appointments
npm run test:records
# etc.
```

### Run with coverage report

```bash
npm run test:coverage
# Opens coverage/index.html in browser
```

### Watch mode (development)

```bash
npm run test:watch
```

---

## Step 6 – Interpreting Results

```
PASS  tests/auth.test.js
  POST /api/auth/signup
    ✓ TC-AUTH-001 | Valid patient signup returns 201 with token (123ms)
    ✓ TC-AUTH-002 | Duplicate email returns 409 (45ms)
    ...
  POST /api/auth/login
    ✓ TC-AUTH-005 | Valid credentials return 200 with token (88ms)
    ...

Test Suites: 9 passed, 9 total
Tests:       72 passed, 72 total
Snapshots:   0 total
Time:        18.432s
```

Each test ID (e.g., `TC-AUTH-001`) maps directly to the **TestCases.md** manual test document.

---

## Troubleshooting

### "Cannot find module '../src/app'"

Adjust the path in `tests/helpers.js` and each test file to match your project structure:

```js
const app = require('../../src/app');  // if tests/ is nested deeper
```

### Tests hang / don't exit

Make sure `--forceExit` is in your Jest command, and that Mongoose is closed in `setup.js` `afterAll`.

### 401 on every request

Check that `JWT_SECRET` in `.env.test` matches the one your middleware uses.

### MongoDB connection errors

Ensure your test MongoDB URI is accessible and the DB user has read/write access.  
For CI environments, use `mongodb-memory-server`:

```bash
npm install --save-dev mongodb-memory-server
```

Update `tests/setup.js`:

```js
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});
```

---

## CI/CD Integration (GitHub Actions example)

```yaml
name: CareSync API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        ports: ['27017:27017']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
        env:
          MONGO_URI_TEST: mongodb://localhost:27017/caresync_test
          JWT_SECRET: ci-test-secret
          NODE_ENV: test
```

---

## Test Count Summary

| File | Test Cases |
|---|---|
| auth.test.js | 17 |
| users.test.js | 10 |
| appointments.test.js | 14 |
| lab.test.js | 15 |
| records.test.js | 16 |
| beds.test.js | 13 |
| sos.test.js | 5 |
| ai.test.js | 6 |
| admin.test.js | 6 |
| **Total** | **~102** |
