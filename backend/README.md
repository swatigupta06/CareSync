<<<<<<< Head
# 🔧 CareSync — Backend API

> Production-ready REST API for the CareSync healthcare platform built with Node.js, Express.js, and MongoDB Atlas.

---

## 🔴 Live API

```
https://caresync-backend.up.railway.app
```

Health check:
```
https://caresync-backend.up.railway.app/health
```

---

## 📁 Folder Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB Atlas connection
├── controllers/
│   ├── authController.js         # Signup, login, Aadhaar verification
│   ├── userController.js         # Profile, doctors, patients, users
│   ├── appointmentController.js  # Book, confirm, cancel, prescribe
│   ├── labController.js          # Tests, bookings, payment, reports
│   ├── recordController.js       # Medical records + permission system
│   ├── bedController.js          # Bed allocation and discharge
│   ├── sosController.js          # Emergency SOS alerts
│   ├── aiController.js           # AI chatbot (OpenAI + mock fallback)
│   └── adminController.js        # Analytics and recent activity
├── middleware/
│   ├── auth.js                   # JWT verification + RBAC authorization
│   ├── errorHandler.js           # Global error and 404 handlers
│   ├── upload.js                 # Multer file upload configuration
│   └── validate.js               # express-validator input rules
├── models/
│   ├── User.js                   # Multi-role user with Aadhaar support
│   ├── Doctor.js                 # Doctor profile linked to User
│   ├── Appointment.js            # Appointment with status tracking
│   ├── Lab.js                    # LabTest, LabBooking, LabReport
│   ├── MedicalRecord.js          # Patient health records
│   ├── Permission.js             # Doctor-patient record access control
│   ├── Bed.js                    # Hospital bed management
│   └── SOSAlert.js               # Emergency SOS with location
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
├── utils/
│   ├── jwt.js                    # Token signing helpers
│   ├── apiResponse.js            # Standardised response format
│   └── seeder.js                 # Database seeder with demo data
├── uploads/                      # Local file storage
├── .env.example                  # Environment variable template
├── package.json
└── server.js                     # Express app entry point
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Fill in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/caresync
JWT_SECRET=your_long_random_secret_key_min_32_characters
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...              # Optional — mock AI used if not set
ALLOWED_ORIGINS=http://localhost:3000
BCRYPT_ROUNDS=12
MAX_FILE_SIZE_MB=10
```

### 3. Seed the database
```bash
node utils/seeder.js
```

To reset and re-seed:
```bash
node utils/seeder.js --reset
```

### 4. Start the server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@caresync.com | Admin@123 |
| Doctor | sarah.wilson@caresync.com | Doctor@123 |
| Doctor | rajesh.kumar@caresync.com | Doctor@123 |
| Receptionist | mary.thomas@caresync.com | Recept@123 |
| Patient | amit.patel@caresync.com | Patient@123 |
| Patient | sunita.rao@caresync.com | Patient@123 |

---

## 📡 API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | ❌ | Create new account |
| POST | `/login` | ❌ | Login and get JWT token |
| GET | `/me` | ✅ | Get current user |
| POST | `/verify-aadhaar` | ✅ | Verify 12-digit Aadhaar |

**Login Request:**
```json
{
  "identifier": "amit.patel@caresync.com",
  "password": "Patient@123",
  "role": "Patient"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "_id": "664...",
    "name": "Amit Patel",
    "role": "Patient"
  }
}
```

---

### 👤 Users — `/api/users`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/profile` | ✅ | All | Get own profile |
| PUT | `/profile` | ✅ | All | Update profile and avatar |
| GET | `/doctors` | ✅ | All | List all doctors |
| GET | `/patients` | ✅ | Doctor, Receptionist, Admin | List patients |
| GET | `/` | ✅ | Admin | List all users |
| PUT | `/:id/deactivate` | ✅ | Admin | Deactivate a user |

---

### 📅 Appointments — `/api/appointments`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/` | ✅ | Patient, Receptionist, Admin | Book appointment |
| GET | `/` | ✅ | All (role-scoped) | List appointments |
| GET | `/:id` | ✅ | Owner or Staff | Get single appointment |
| PATCH | `/:id/status` | ✅ | Doctor, Receptionist, Admin, Patient | Update status |
| PATCH | `/:id/prescription` | ✅ | Doctor | Add prescription |
| DELETE | `/:id` | ✅ | Admin | Delete appointment |

**Book Appointment:**
```json
{
  "doctorId": "664abc...",
  "date": "2025-08-15",
  "time": "10:00",
  "symptoms": "Chest pain and shortness of breath"
}
```

---

### 🔬 Lab — `/api/lab`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/tests` | ✅ | All | Available test catalogue |
| POST | `/book` | ✅ | Patient | Book a lab test |
| GET | `/bookings` | ✅ | Role-scoped | List bookings |
| POST | `/bookings/:id/pay` | ✅ | Patient | Simulate payment |
| PATCH | `/bookings/:id/status` | ✅ | Receptionist, Admin | Update status |
| POST | `/reports` | ✅ | Receptionist, Admin, Doctor | Upload report |
| GET | `/reports` | ✅ | Role-scoped | List reports |

---

### 📁 Medical Records — `/api/records`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/` | ✅ | Patient, Receptionist, Admin | Upload record |
| GET | `/` | ✅ | Role-scoped | List records |
| DELETE | `/:id` | ✅ | Patient (own), Admin | Delete record |
| POST | `/permissions/request` | ✅ | Doctor | Request patient access |
| GET | `/permissions` | ✅ | Patient, Doctor | View access requests |
| PATCH | `/permissions/:id/respond` | ✅ | Patient | Approve or reject |

---

### 🛏️ Beds — `/api/beds`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | ✅ | All | List all beds with summary |
| POST | `/` | ✅ | Admin | Create new bed |
| PATCH | `/:id/assign` | ✅ | Receptionist, Admin | Assign to patient |
| PATCH | `/:id/discharge` | ✅ | Receptionist, Admin | Discharge patient |
| PATCH | `/:id` | ✅ | Admin | Update bed details |
| DELETE | `/:id` | ✅ | Admin | Delete bed |

---

### 🆘 SOS — `/api/sos`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/trigger` | ✅ | All | Trigger emergency alert |
| GET | `/` | ✅ | Role-scoped | List SOS alerts |
| PATCH | `/:id/resolve` | ✅ | Receptionist, Admin | Resolve alert |

**Trigger SOS:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "address": "Connaught Place, New Delhi"
}
```

---

### 🤖 AI Chatbot — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat` | ✅ | AI symptom checker with history |

**Request:**
```json
{
  "message": "I have a sharp headache on one side",
  "history": [
    { "role": "user", "content": "I have a headache" },
    { "role": "assistant", "content": "I see, can you describe it?" }
  ]
}
```

---

### 📊 Admin — `/api/admin`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/analytics` | ✅ | Admin | Full system analytics |
| GET | `/recent-activity` | ✅ | Admin | Latest activity feed |

---

## 🔒 Security Architecture

| Feature | Implementation |
|---|---|
| Authentication | JWT Bearer tokens — 7 day expiry |
| Password Storage | bcrypt with 12 salt rounds |
| Authorization | Role-Based Access Control on every route |
| Rate Limiting | 200 req/15 min global, 30 req/15 min auth |
| CORS | Restricted to configured origins |
| File Validation | PDF and images only, 10MB max |
| Input Validation | express-validator on all POST/PATCH routes |
| Error Handling | Global error handler with environment-aware stack traces |

---

## 🗄️ Database Models

| Model | Key Fields |
|---|---|
| User | name, email, phoneNumber, aadhaarNumber, password, role |
| Doctor | user (ref), specialization, experience, availability, rating |
| Appointment | patient, doctor, date, time, symptoms, status, prescription |
| LabTest | name, price, duration, category |
| LabBooking | patient, testName, date, paymentStatus, paymentMethod |
| LabReport | patient, testName, result, fileUrl |
| MedicalRecord | patient, fileName, reportType, category, fileUrl |
| Permission | doctor, patient, status, reason |
| Bed | number, type, status, patient |
| SOSAlert | user, location, nearestHospital, status |

---

## 🌐 Deployment on Railway

1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set root directory to `backend/`
4. Add all environment variables
5. Generate domain in Settings → Networking
6. Run seeder via Railway terminal: `node utils/seeder.js`

---

## 🔗 Related

- Frontend → [../frontend](../frontend/README.md)
- Documentation → [../docs](../docs/)
- Live App → https://caresync-frontend.vercel.app
