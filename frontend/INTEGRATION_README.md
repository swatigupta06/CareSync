# 🏥 CareSync — Full-Stack Integration Guide

Complete guide to running the integrated CareSync healthcare platform (React frontend + Node.js/Express/MongoDB backend).

---

## 📁 Project Structure

```
caresync/
├── caresync-backend/          ← Node.js + Express + MongoDB API
│   ├── config/db.js
│   ├── controllers/           (9 controllers)
│   ├── middleware/            (auth, upload, validate, errorHandler)
│   ├── models/                (9 Mongoose models)
│   ├── routes/                (9 route files)
│   ├── utils/                 (jwt, apiResponse, seeder)
│   ├── uploads/               (local file storage)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── caresync-frontend/         ← React + Vite + TailwindCSS
    ├── src/
    │   ├── services/
    │   │   └── api.ts         ← Central Axios API service (all endpoints)
    │   ├── hooks/
    │   │   └── useApi.ts      ← Reusable loading/error hook
    │   ├── AppContext.tsx      ← Full API-driven state management
    │   ├── components/
    │   │   ├── ui/Toast.tsx   ← Global toast notifications
    │   │   └── SymptomChatbot.tsx  ← Backend AI chatbot integration
    │   └── pages/dashboards/  ← All pages connected to real APIs
    ├── .env
    └── vite.config.ts         ← Dev proxy configured
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **npm** ≥ 9

---

### Step 1 — Set up the Backend

```bash
cd caresync-backend
npm install
```

Create `.env`:
```bash
cp .env.example .env
```

Edit `.env` with minimum required values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/caresync
JWT_SECRET=caresync_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
BCRYPT_ROUNDS=10
MAX_FILE_SIZE_MB=10
UPLOAD_PATH=./uploads

# Optional — AI chatbot uses smart mock if not set
OPENAI_API_KEY=sk-your-key-here
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev    # development with auto-reload
# or
npm start      # production
```

✅ Backend running at: **http://localhost:5000**

---

### Step 2 — Set up the Frontend

```bash
cd caresync-frontend
npm install
```

Create `.env`:
```bash
cp .env.example .env
```

The default `.env` content:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

### Step 3 — Login with Demo Credentials

| Role         | Email                         | Password     |
|--------------|-------------------------------|--------------|
| **Admin**    | admin@caresync.com            | Admin@123    |
| **Doctor**   | sarah.wilson@caresync.com     | Doctor@123   |
| **Doctor**   | rajesh.kumar@caresync.com     | Doctor@123   |
| **Receptionist** | mary.thomas@caresync.com | Recept@123   |
| **Patient**  | amit.patel@caresync.com       | Patient@123  |
| **Patient**  | sunita.rao@caresync.com       | Patient@123  |

---

## 🔌 Integration Architecture

### How the Frontend talks to the Backend

```
src/services/api.ts
    ↓ (Axios instance with JWT interceptor)
    ↓
AppContext.tsx
    ↓ (calls API services, normalises responses)
    ↓
React Components
    ↓ (read from context state, dispatch context actions)
```

### Token Flow

```
Login → POST /api/auth/login
     ← { token, user }
     → localStorage.setItem('caresync_token', token)
     → All subsequent requests: Authorization: Bearer <token>
     → On 401: auto-redirect to /login
```

### File Upload Flow

```
Component (FormData)
    → multipart/form-data POST
    → Multer (backend) stores to ./uploads/<subfolder>/
    → Returns { fileUrl: "http://localhost:5000/uploads/..." }
    → Frontend renders <img src={fileUrl} />
```

---

## 🌐 Complete API Reference

All endpoints are prefixed with `/api`. Token required unless marked public.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register new account |
| POST | `/auth/login` | Login (email/phone + password + role) |
| GET | `/auth/me` | Get current user 🔒 |
| POST | `/auth/verify-aadhaar` | Verify Aadhaar number 🔒 |

### Users
| Method | Path | Access |
|--------|------|--------|
| GET | `/users/profile` | Any 🔒 |
| PUT | `/users/profile` | Any (multipart) 🔒 |
| GET | `/users/doctors` | Any 🔒 |
| GET | `/users/patients` | Doctor/Recept/Admin 🔒 |
| GET | `/users` | Admin only 🔒 |
| PUT | `/users/:id/deactivate` | Admin only 🔒 |

### Appointments
| Method | Path | Access |
|--------|------|--------|
| POST | `/appointments` | Patient/Recept/Admin 🔒 |
| GET | `/appointments` | All (role-scoped) 🔒 |
| GET | `/appointments/:id` | Owner/Staff 🔒 |
| PATCH | `/appointments/:id/status` | Doctor/Recept/Admin/Patient 🔒 |
| PATCH | `/appointments/:id/prescription` | Doctor only 🔒 |
| DELETE | `/appointments/:id` | Admin only 🔒 |

### Lab
| Method | Path | Access |
|--------|------|--------|
| GET | `/lab/tests` | Any 🔒 |
| POST | `/lab/book` | Patient 🔒 |
| POST | `/lab/bookings/:id/pay` | Patient 🔒 |
| GET | `/lab/bookings` | Patient(own)/Staff 🔒 |
| PATCH | `/lab/bookings/:id/status` | Recept/Admin/Doctor 🔒 |
| POST | `/lab/reports` | Recept/Admin/Doctor (multipart) 🔒 |
| GET | `/lab/reports` | Patient(own)/Staff 🔒 |

### Medical Records
| Method | Path | Access |
|--------|------|--------|
| POST | `/records` | Patient/Recept/Admin (multipart) 🔒 |
| GET | `/records` | Role-scoped 🔒 |
| DELETE | `/records/:id` | Patient(own)/Admin 🔒 |
| POST | `/records/permissions/request` | Doctor 🔒 |
| GET | `/records/permissions` | Patient/Doctor 🔒 |
| PATCH | `/records/permissions/:id/respond` | Patient 🔒 |

### Beds
| Method | Path | Access |
|--------|------|--------|
| GET | `/beds` | Any 🔒 |
| POST | `/beds` | Admin 🔒 |
| PATCH | `/beds/:id/assign` | Recept/Admin 🔒 |
| PATCH | `/beds/:id/discharge` | Recept/Admin 🔒 |

### Emergency SOS
| Method | Path | Access |
|--------|------|--------|
| POST | `/sos/trigger` | Any 🔒 |
| GET | `/sos` | Any (role-scoped) 🔒 |
| PATCH | `/sos/:id/resolve` | Recept/Admin 🔒 |

### AI Chatbot
| Method | Path | Access |
|--------|------|--------|
| POST | `/ai/chat` | Any 🔒 |

### Admin
| Method | Path | Access |
|--------|------|--------|
| GET | `/admin/analytics` | Admin 🔒 |
| GET | `/admin/recent-activity` | Admin 🔒 |

---

## 🔑 Key Files Changed in Frontend

| File | What Changed |
|------|-------------|
| `src/services/api.ts` | **NEW** — Central Axios client with JWT interceptor + all API methods |
| `src/hooks/useApi.ts` | **NEW** — Reusable loading/error state hook |
| `src/AppContext.tsx` | **REPLACED** — All localStorage dummy data → real API calls |
| `src/App.tsx` | Added `<Toast />` global notification component |
| `src/components/ui/Toast.tsx` | **NEW** — Animated toast notification |
| `src/components/SymptomChatbot.tsx` | **REPLACED** — Gemini API → backend `/api/ai/chat` |
| `src/pages/Login.tsx` | **REPLACED** — Real `login()` API call with role + credentials |
| `src/pages/Signup.tsx` | **REPLACED** — Real `signup()` API call with validation |
| `src/pages/dashboards/Profile.tsx` | **REPLACED** — Real `updateProfile()`, `verifyAadhaar()` |
| `src/pages/dashboards/DoctorsList.tsx` | **REPLACED** — Real doctor listing, real appointment booking |
| `src/pages/dashboards/MyAppointments.tsx` | **REPLACED** — Real appointments, real cancel action |
| `src/pages/dashboards/BedManagement.tsx` | **REPLACED** — Real bed data, assign/discharge via API |
| `src/pages/dashboards/LabServices.tsx` | **REPLACED** — Real test catalogue, booking, payment simulation |
| `src/pages/dashboards/EmergencySOS.tsx` | **REPLACED** — Real SOS trigger with location + hospital response |
| `src/pages/dashboards/AdminOverview.tsx` | **REPLACED** — Real analytics from `/api/admin/analytics` |
| `src/pages/dashboards/UserDirectory.tsx` | **REPLACED** — Real user listing with search + deactivation |
| `vite.config.ts` | Added dev proxy `/api → http://localhost:5000` |
| `.env` | Added `VITE_API_URL=http://localhost:5000` |
| `package.json` | Added `axios` dependency |

---

## 🚨 Error Handling

All API errors bubble through the Axios interceptor → `AppContext` → `showToast()`.

Users see friendly messages like:
- ✅ "Appointment booked successfully!"
- ❌ "Invalid credentials. Please check your details and role."
- ❌ "Network error. Please check your connection."
- ⚠️ "Token expired. Please login again." → auto-redirect to `/login`

---

## 📁 File Uploads

Files are uploaded as `multipart/form-data` using the `file` field name.

**Example (medical record):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('reportType', 'Blood Test');
formData.append('category', 'Test');
formData.append('notes', 'Annual checkup');
// For receptionist uploading for a patient:
formData.append('patientId', '664abc...');

await recordAPI.upload(formData);
```

Uploaded files are served at:
```
http://localhost:5000/uploads/records/<filename>
http://localhost:5000/uploads/reports/<filename>
http://localhost:5000/uploads/avatars/<filename>
```

---

## 🤖 AI Chatbot

The chatbot sends conversation history for multi-turn context:

```javascript
// Frontend sends:
{
  "message": "I have a severe headache",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! Describe your symptoms." }
  ]
}

// Backend returns:
{
  "success": true,
  "reply": "I understand you have a severe headache..."
}
```

The backend uses **OpenAI GPT-3.5-turbo** if `OPENAI_API_KEY` is set, or falls back to a smart keyword-based mock automatically — zero crashes in development.

---

## 🛠️ Running Both Servers

**Terminal 1 — Backend:**
```bash
cd caresync-backend
npm run dev
# ✅ http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd caresync-frontend
npm run dev
# ✅ http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error | Check `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:3000` |
| "Invalid credentials" | Run `npm run seed` in backend first |
| Files not loading | Ensure backend is running — files served at `localhost:5000/uploads/` |
| Token expired on refresh | Normal behaviour — re-login; or increase `JWT_EXPIRES_IN=30d` |
| AI chat not working | Set `OPENAI_API_KEY` in backend `.env`, or the mock responses activate automatically |
| MongoDB connection failed | Ensure MongoDB is running: `mongod` or check Atlas URI |
