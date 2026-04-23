# 🏥 CareSync — Healthcare Management Platform

> A complete full-stack multi-role healthcare web application 
> built with React, Node.js, Express, and MongoDB.

---

## 🔴 Live Demo

| | Link |
|---|---|
| 🌐 Live Application | https://caresync-frontend.vercel.app |
| 🔧 Backend API | https://caresync-backend.up.railway.app/health |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🔴 Admin | admin@caresync.com | Admin@123 |
| 🔵 Doctor | sarah.wilson@caresync.com | Doctor@123 |
| 🟢 Receptionist | mary.thomas@caresync.com | Recept@123 |
| 🟡 Patient | amit.patel@caresync.com | Patient@123 |

---

## ✨ Features

### Patient
- Book appointments with specialist doctors
- View and manage appointments
- Book lab tests with payment simulation
- Upload and manage medical records
- Control doctor access to records
- AI symptom checker chatbot
- Emergency SOS with nearest hospital

### Doctor
- Manage appointment schedule
- Add prescriptions
- Request patient record access
- View approved patient records

### Receptionist
- Book appointments for patients
- Manage bed allocation and discharge
- Upload lab reports

### Admin
- Live analytics dashboard
- User directory management
- System-wide monitoring

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI Framework |
| Tailwind CSS v4 | Styling |
| Vite | Build Tool |
| Axios | API Communication |
| Framer Motion | Animations |
| Recharts | Analytics Charts |
| React Router v7 | Navigation |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server Framework |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Multer | File Uploads |
| OpenAI API | AI Chatbot |
| Helmet + CORS | Security |

---

## 📁 Project Structure
caresync/
├── frontend/                  # React + TypeScript Frontend
│   ├── src/
│   │   ├── services/api.ts    # Central Axios API client
│   │   ├── AppContext.tsx     # Global state management
│   │   ├── pages/            # All dashboard pages
│   │   └── components/       # Reusable UI components
│   ├── .env.example
│   └── package.json
│
├── backend/                   # Node.js + Express Backend
│   ├── controllers/          # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, upload, validation
│   ├── utils/                # Helpers and seeder
│   ├── .env.example
│   └── package.json
│
├── docs/                      # Documentation
│   ├── SRS.md                # Software Requirements Spec
│   ├── DesignDocument.md     # System Design Document
│   └── TestCases.md          # Manual Test Cases
│
├── tests/                     # Automated Test Files
│   ├── auth.test.js
│   ├── appointments.test.js
│   ├── lab.test.js
│   ├── records.test.js
│   ├── beds.test.js
│   └── admin.test.js
│
└── README.md                  # This file

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
node utils/seeder.js
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file:
# VITE_API_URL=http://localhost:5000
npm run dev
```

### Open in Browser
http://localhost:3000

---

## 🌐 Deployment

| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | Static hosting |
| Backend | Railway | Node.js hosting |
| Database | MongoDB Atlas | Cloud database |

### Environment Variables

**Backend (Railway)**

MONGO_URI        = mongodb+srv://...
JWT_SECRET       = your_secret_key
NODE_ENV         = production
PORT             = 5000
BCRYPT_ROUNDS    = 12
JWT_EXPIRES_IN   = 7d
MAX_FILE_SIZE_MB = 10
ALLOWED_ORIGINS  = [https://your-vercel-url.vercel.app](https://caresync-iota.vercel.app/)

**Frontend (Vercel)**

VITE_API_URL = [https://your-railway-url.up.railway.app](https://caresync-backend-production-38b2.up.railway.app/)

---

## 📄 Documentation

| Document | Description |
|---|---|
| [SRS](./docs/SRS.md) | Software Requirements Specification |
| [Design Document](./docs/DesignDocument.md) | System architecture and design |
| [Test Cases](./docs/TestCases.md) | Manual test cases for all features |
| [Automated Tests](./tests/) | Jest + Supertest test files |

---

## 🔒 Security Features

- JWT tokens with 7 day expiry
- bcrypt password hashing (12 rounds)
- Role-based access control on every endpoint
- Rate limiting (200 req/15 min)
- CORS restricted to allowed origins
- File upload validation (PDF and images only)
- Aadhaar 12-digit validation for patients

---

## 👥 Role Based Access Control

| Feature | Patient | Doctor | Receptionist | Admin |
|---|---|---|---|---|
| Book Appointment | ✅ | ❌ | ✅ | ✅ |
| Confirm Appointment | ❌ | ✅ | ✅ | ✅ |
| Write Prescription | ❌ | ✅ | ❌ | ❌ |
| Upload Records | ✅ | ❌ | ✅ | ✅ |
| View Patient Records | Own | If approved | ✅ | ✅ |
| Request Record Access | ❌ | ✅ | ❌ | ❌ |
| Approve Record Access | ✅ | ❌ | ❌ | ❌ |
| Manage Beds | ❌ | ❌ | ✅ | ✅ |
| Book Lab Tests | ✅ | ❌ | ❌ | ❌ |
| Upload Lab Reports | ❌ | ✅ | ✅ | ✅ |
| Trigger SOS | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

---

## 📄 License
This project is for educational purposes.
