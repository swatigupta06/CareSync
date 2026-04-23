<<<<<<< HEAD
# 🏥 CareSync Backend API

Production-ready Node.js + Express + MongoDB backend for the **CareSync** multi-role healthcare platform.

---

## 📁 Project Structure

```
caresync-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # signup, login, verify Aadhaar
│   ├── userController.js      # profile, user CRUD, doctors, patients
│   ├── appointmentController.js
│   ├── labController.js       # tests, bookings, payment, reports
│   ├── recordController.js    # medical records + permission system
│   ├── bedController.js       # bed management
│   ├── sosController.js       # emergency SOS
│   ├── aiController.js        # AI chatbot (OpenAI / mock fallback)
│   └── adminController.js     # analytics, recent activity
├── middleware/
│   ├── auth.js                # JWT protect + RBAC authorize
│   ├── errorHandler.js        # global error + 404 handlers
│   ├── upload.js              # multer (PDF + image)
│   └── validate.js            # express-validator rules
├── models/
│   ├── User.js                # multi-role user with Aadhaar
│   ├── Doctor.js              # doctor profile (linked to User)
│   ├── Appointment.js
│   ├── Lab.js                 # LabTest + LabBooking + LabReport
│   ├── MedicalRecord.js
│   ├── Permission.js          # doctor ↔ patient record access
│   ├── Bed.js
│   └── SOSAlert.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── appointments.js
│   ├── lab.js
│   ├── records.js
│   ├── beds.js
│   ├── sos.js
│   ├── ai.js
│   └── admin.js
├── uploads/                   # local file storage (gitignored)
│   ├── records/
│   ├── reports/
│   └── avatars/
├── utils/
│   ├── jwt.js                 # token signing helpers
│   ├── apiResponse.js         # standardised response helpers
│   └── seeder.js              # database seeder
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # Express app entry point
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm

### 1. Clone / unzip the project

```bash
cd caresync-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — **minimum required fields**:

```env
MONGO_URI=mongodb://localhost:27017/caresync
JWT_SECRET=change_this_to_a_long_random_secret_min_32_chars
PORT=5000
NODE_ENV=development

# Optional — AI chatbot uses mock responses if not set
OPENAI_API_KEY=sk-...

# CORS — add your frontend URL
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Seed the database

```bash
npm run seed
```

This creates demo users, 4 doctor profiles, 24 beds, and 12 lab test catalogue entries.

To reset everything first:
```bash
node utils/seeder.js --reset
```

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 🔑 Demo Credentials (after seeding)

| Role         | Email                         | Password     |
|--------------|-------------------------------|--------------|
| Admin        | admin@caresync.com            | Admin@123    |
| Doctor       | sarah.wilson@caresync.com     | Doctor@123   |
| Doctor       | rajesh.kumar@caresync.com     | Doctor@123   |
| Receptionist | mary.thomas@caresync.com      | Recept@123   |
| Patient      | amit.patel@caresync.com       | Patient@123  |
| Patient      | sunita.rao@caresync.com       | Patient@123  |

---

## 🌐 API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <token>
```

---

### 🔐 Auth — `/api/auth`

#### POST `/api/auth/signup`
Create a new account.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "password": "Secret@123",
  "role": "Patient",
  "aadhaarNumber": "123456789012",
  "age": 30,
  "gender": "Male",
  "allergies": ["Penicillin"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGci...",
  "user": {
    "_id": "664...",
    "name": "John Doe",
    "role": "Patient",
    "isAadhaarVerified": false
  }
}
```

---

#### POST `/api/auth/login`
Login with email or phone number.

**Request body:**
```json
{
  "identifier": "john@example.com",
  "password": "Secret@123",
  "role": "Patient"
}
```
> `identifier` can be an email address or a phone number.

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "_id": "664...", "name": "John Doe", "role": "Patient" }
}
```

---

#### GET `/api/auth/me` 🔒
Returns the currently authenticated user.

---

#### POST `/api/auth/verify-aadhaar` 🔒
Simulates Aadhaar verification (for patients).

**Request body:**
```json
{ "aadhaarNumber": "123456789012" }
```

---

### 👤 Users — `/api/users`

| Method | Endpoint                | Roles            | Description              |
|--------|-------------------------|------------------|--------------------------|
| GET    | `/profile`              | Any              | Get own profile          |
| PUT    | `/profile`              | Any              | Update profile + avatar  |
| GET    | `/doctors`              | Any              | List all doctors         |
| GET    | `/patients`             | Doctor/Recept/Admin | List patients          |
| GET    | `/`                     | Admin            | List all users           |
| GET    | `/:id`                  | Admin/Doctor     | Get user by ID           |
| PUT    | `/:id/deactivate`       | Admin            | Deactivate a user        |

**Query params for `/doctors`:** `?specialization=Cardiology&search=wilson`

**Profile update** — send as `multipart/form-data` if uploading an avatar:
```
PUT /api/users/profile
Content-Type: multipart/form-data

name=John Doe
age=31
file=<avatar image file>
```

---

### 📅 Appointments — `/api/appointments`

| Method | Endpoint            | Roles                        | Description              |
|--------|---------------------|------------------------------|--------------------------|
| POST   | `/`                 | Patient/Receptionist/Admin   | Book appointment         |
| GET    | `/`                 | All (role-scoped)            | List appointments        |
| GET    | `/:id`              | Owner / Staff                | Get appointment detail   |
| PATCH  | `/:id/status`       | Doctor/Receptionist/Admin/Patient | Update status      |
| PATCH  | `/:id/prescription` | Doctor                       | Add prescription         |
| DELETE | `/:id`              | Admin                        | Delete appointment       |

**Book appointment:**
```json
{
  "doctorId": "664abc...",
  "date": "2025-08-15",
  "time": "10:00",
  "symptoms": "Persistent headache for 3 days with mild fever."
}
```
> Receptionists must include `"patientId": "664..."` to book on behalf of a patient.

**Update status:**
```json
{ "status": "Confirmed" }
```
Valid statuses: `Pending | Confirmed | Cancelled | Completed`

**Add prescription (Doctor):**
```json
{ "prescription": "Paracetamol 500mg twice daily for 5 days. Rest advised." }
```

---

### 🔬 Lab — `/api/lab`

| Method | Endpoint                    | Roles                   | Description                |
|--------|-----------------------------|-------------------------|----------------------------|
| GET    | `/tests`                    | Any                     | Available test catalogue   |
| POST   | `/book`                     | Patient                 | Book a lab test            |
| GET    | `/bookings`                 | Patient (own) / Staff   | List bookings              |
| POST   | `/bookings/:id/pay`         | Patient                 | Simulate payment           |
| PATCH  | `/bookings/:id/status`      | Receptionist/Admin/Doctor| Update booking status     |
| POST   | `/reports`                  | Receptionist/Admin/Doctor| Upload lab report          |
| GET    | `/reports`                  | Patient (own) / Staff   | List reports               |

**Book a lab test:**
```json
{
  "testName": "Blood Glucose Test",
  "date": "2025-08-20",
  "time": "08:00",
  "paymentMethod": "UPI"
}
```

**Pay for booking (simulated — always succeeds):**
```json
{ "paymentMethod": "Card" }
```

**Upload lab report** — `multipart/form-data`:
```
POST /api/lab/reports
patientId=664...
testName=Blood Glucose Test
result=Glucose: 95 mg/dL (Normal)
bookingId=664...  (optional, links to booking)
file=<PDF or image>
```

---

### 📁 Medical Records — `/api/records`

| Method | Endpoint                          | Roles             | Description                    |
|--------|-----------------------------------|-------------------|--------------------------------|
| POST   | `/`                               | Patient/Recept/Admin| Upload record (multipart)    |
| GET    | `/`                               | Role-scoped       | List records                   |
| DELETE | `/:id`                            | Patient(own)/Admin| Delete record                  |
| POST   | `/permissions/request`            | Doctor            | Request patient record access  |
| GET    | `/permissions`                    | Patient/Doctor    | View access requests           |
| PATCH  | `/permissions/:id/respond`        | Patient           | Approve or reject request      |

**Upload record** — `multipart/form-data`:
```
reportType=MRI Brain
category=Test       (Test | Surgery | Report)
notes=Annual checkup MRI
file=<PDF or image>
```
> Receptionists/Admin must include `patientId=664...`

**Doctor requests access:**
```json
{
  "patientId": "664...",
  "reason": "Reviewing history before scheduled consultation."
}
```

**Patient responds:**
```json
{ "status": "Approved" }
```
or
```json
{ "status": "Rejected" }
```

---

### 🛏️ Beds — `/api/beds`

| Method | Endpoint          | Roles               | Description          |
|--------|-------------------|---------------------|----------------------|
| GET    | `/`               | Any authenticated   | List all beds        |
| POST   | `/`               | Admin               | Create a bed         |
| PATCH  | `/:id/assign`     | Receptionist/Admin  | Assign bed to patient|
| PATCH  | `/:id/discharge`  | Receptionist/Admin  | Discharge patient    |
| PATCH  | `/:id`            | Admin               | Update bed details   |
| DELETE | `/:id`            | Admin               | Delete bed           |

**Query params:** `?status=Available&type=ICU`

**Assign bed:**
```json
{
  "patientId": "664...",
  "status": "Occupied"
}
```
> `status` can be `Occupied` or `Emergency`

---

### 🆘 Emergency SOS — `/api/sos`

| Method | Endpoint         | Roles               | Description           |
|--------|------------------|---------------------|-----------------------|
| POST   | `/trigger`       | Any authenticated   | Trigger SOS alert     |
| GET    | `/`              | All (role-scoped)   | List SOS alerts       |
| PATCH  | `/:id/resolve`   | Receptionist/Admin  | Resolve alert         |

**Trigger SOS:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "address": "Connaught Place, New Delhi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS alert triggered. Emergency services notified (simulated).",
  "alert": { "_id": "664...", "status": "Active" },
  "nearestHospital": {
    "name": "Apollo Hospitals",
    "address": "21, Greams Lane, Chennai",
    "phone": "+91-44-2829-3333",
    "distance": "1.2 km"
  },
  "route": {
    "from": "Connaught Place, New Delhi",
    "steps": ["Head north on current street", "..."],
    "estimatedTime": "5-10 minutes"
  },
  "emergencyNumbers": {
    "national": "112",
    "ambulance": "108",
    "hospital": "+91-44-2829-3333"
  }
}
```

---

### 🤖 AI Chatbot — `/api/ai`

#### POST `/api/ai/chat` 🔒

**Request body:**
```json
{
  "message": "I have a sharp headache on one side and sensitivity to light.",
  "history": [
    { "role": "user",      "content": "I have a headache." },
    { "role": "assistant", "content": "I'm sorry to hear that..." }
  ]
}
```
> `history` is optional — include it for multi-turn conversations.

**Response:**
```json
{
  "success": true,
  "reply": "Based on what you've described — a sharp, one-sided headache with light sensitivity — this sounds consistent with a **migraine** or possibly a tension headache...",
  "timestamp": "2025-08-15T09:30:00.000Z"
}
```

The chatbot uses **OpenAI GPT-3.5-turbo** if `OPENAI_API_KEY` is configured, or falls back to a smart **mock response system** for development.

---

### 📊 Admin — `/api/admin` (Admin only)

| Method | Endpoint            | Description                            |
|--------|---------------------|----------------------------------------|
| GET    | `/analytics`        | Full system analytics dashboard data   |
| GET    | `/recent-activity`  | Latest appointments, users, alerts     |

**Analytics response:**
```json
{
  "analytics": {
    "users":        { "total": 12, "patients": 8, "doctors": 3, "receptionists": 1 },
    "appointments": { "total": 45, "recent7Days": 12, "byStatus": { "Pending": 5, "Confirmed": 8, "Completed": 30, "Cancelled": 2 } },
    "lab":          { "totalBookings": 22, "paidBookings": 20, "revenue": 38500 },
    "beds":         { "total": 24, "available": 18, "occupied": 6, "occupancyRate": 25 },
    "emergency":    { "activeSOS": 1 },
    "records":      { "total": 34 }
  }
}
```

---

## 🔒 Role-Based Access Control (RBAC) Summary

| Feature                          | Patient | Doctor | Receptionist | Admin |
|----------------------------------|---------|--------|--------------|-------|
| Book own appointment             | ✅      | ❌     | ❌           | ❌    |
| Book appointment for patient     | ❌      | ❌     | ✅           | ✅    |
| Confirm / cancel appointment     | Cancel  | ✅     | ✅           | ✅    |
| Write prescription               | ❌      | ✅     | ❌           | ❌    |
| Upload own medical records       | ✅      | ❌     | ❌           | ❌    |
| Upload records for any patient   | ❌      | ❌     | ✅           | ✅    |
| Request patient record access    | ❌      | ✅     | ❌           | ❌    |
| Approve / reject access requests | ✅      | ❌     | ❌           | ❌    |
| View patient records (approved)  | Own     | ✅     | ✅           | ✅    |
| Book lab test                    | ✅      | ❌     | ❌           | ❌    |
| Upload lab report                | ❌      | ✅     | ✅           | ✅    |
| Assign / discharge beds          | ❌      | ❌     | ✅           | ✅    |
| Create / delete beds             | ❌      | ❌     | ❌           | ✅    |
| Trigger SOS                      | ✅      | ✅     | ✅           | ✅    |
| View admin analytics             | ❌      | ❌     | ❌           | ✅    |
| Deactivate users                 | ❌      | ❌     | ❌           | ✅    |

---

## 🏗️ Architecture Notes

### Aadhaar Identity
- 12-digit validation enforced at model level
- Unique constraint on `aadhaarNumber` (patients only)
- Multiple users **can** share the same phone number (as required)
- Aadhaar verification is simulated; replace with UIDAI API in production

### Payment Simulation
- `POST /api/lab/bookings/:id/pay` always succeeds (simulation)
- `paymentStatus` flips from `Pending` → `Paid`
- Replace with Razorpay / Stripe integration in production

### File Storage
- Files are stored locally under `uploads/`
- Served statically at `GET /uploads/<folder>/<filename>`
- Replace with AWS S3 / Cloudinary in production (swap `multer.diskStorage` for `multer-s3`)

### AI Chatbot
- Uses **OpenAI GPT-3.5-turbo** with full conversation history support
- Falls back to a keyword-based mock if no API key is configured
- Rate-limited to 20 requests/minute per IP

---

## 🐛 Error Response Format

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

HTTP codes used:
- `200` — OK
- `201` — Created
- `401` — Unauthenticated
- `403` — Forbidden (wrong role)
- `404` — Not found
- `409` — Conflict (duplicate)
- `413` — File too large
- `422` — Validation error
- `429` — Rate limited
- `500` — Server error
=======
# caresync-backend
Production-ready REST API for CareSync healthcare platform — Node.js, Express, MongoDB
>>>>>>> a36f7504f6e62cffbbc3af30a49e3924c72bd008
