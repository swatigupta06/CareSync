# 🏥 CareSync — Project Portfolio

> A full-stack, multi-role healthcare management web application designed to digitize and streamline hospital workflows for Patients, Doctors, Receptionists, and Administrators.

---

## 🔴 Live Demo

| | Link |
|---|---|
| 🌐 **Live Application** | [https://caresync-frontend.vercel.app](https://caresync-iota.vercel.app/) |
| 🔧 **Backend API** | [https://caresync-backend.up.railway.app/health](https://caresync-backend-production-38b2.up.railway.app/health) |
| 💻 **Source Code** | https://github.com/swatigupta06/caresync |

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| 🔴 Admin | admin@caresync.com | Admin@123 |
| 🔵 Doctor | sarah.wilson@caresync.com | Doctor@123 |
| 🟢 Receptionist | mary.thomas@caresync.com | Recept@123 |
| 🟡 Patient | amit.patel@caresync.com | Patient@123 |

---

## 📌 Project Objective

### Real-World Problem

Healthcare management in most hospitals and clinics still relies heavily on manual processes — paper-based appointment books, physical medical record files, verbal bed availability checks, and delayed communication between doctors, receptionists, and patients. This creates several critical pain points:

| Pain Point | Impact |
|---|---|
| Patients cannot book appointments online | Long queues and wasted travel time |
| Medical records stored physically | Risk of loss, damage, or unauthorised access |
| No structured doctor-patient access control | Privacy violations for sensitive health data |
| Bed availability managed manually | Delays in patient admission during emergencies |
| No centralised lab booking system | Patients visit labs without prior confirmation |
| Emergency situations have no digital protocol | Delayed response in life-threatening situations |
| Doctors have no digital prescription system | Handwritten prescriptions get lost or misread |
| Admins have no real-time analytics | Decisions made without data visibility |

### Design Thinking — Pain Points Identified

Through a structured Design Thinking process, the following user pain points were identified per role:

**Patient Perspective:**
- "I have to call the hospital every time to check if a doctor is available"
- "My medical reports are all physical files I have to carry everywhere"
- "I don't know if my lab test is ready or not"
- "In an emergency I don't know which hospital is nearest"

**Doctor Perspective:**
- "I have no digital view of my daily appointment schedule"
- "Accessing a patient's past medical history requires going to the records room"
- "I write prescriptions on paper which patients often misplace"

**Receptionist Perspective:**
- "I maintain a physical register for bed availability"
- "Booking appointments for walk-in patients takes too long"
- "Lab report handover to patients is manual and error-prone"

**Admin Perspective:**
- "I have no dashboard to see how many appointments are happening daily"
- "User management is done through spreadsheets"
- "There is no way to track system activity in real time"

### Solution

CareSync addresses all of the above by providing a **unified digital platform** where all four roles can perform their tasks through dedicated dashboards, with data stored securely in the cloud and all communication happening through a structured REST API.

---

## ✅ Features Implemented

All features are mapped to their Functional Requirements (FRs):

### Authentication and Identity Management

| FR | Feature | Status |
|---|---|---|
| FR-01 | Multi-role user registration (Patient, Doctor, Receptionist, Admin) | ✅ Implemented |
| FR-02 | Login with email or phone number + role selection | ✅ Implemented |
| FR-03 | JWT-based session management with auto-expiry | ✅ Implemented |
| FR-04 | Aadhaar number validation (12-digit) for patient identity | ✅ Implemented |
| FR-05 | bcrypt password hashing for secure storage | ✅ Implemented |
| FR-06 | Role-Based Access Control on every API endpoint | ✅ Implemented |

### Patient Features

| FR | Feature | Status |
|---|---|---|
| FR-07 | Browse specialist doctors with filters | ✅ Implemented |
| FR-08 | Book appointment with date, time, and symptom description | ✅ Implemented |
| FR-09 | View upcoming and past appointments | ✅ Implemented |
| FR-10 | Cancel appointments | ✅ Implemented |
| FR-11 | Book lab tests from catalogue with date and time selection | ✅ Implemented |
| FR-12 | Simulate payment via UPI, Card, or Net Banking | ✅ Implemented |
| FR-13 | Upload personal medical records (PDF and images) | ✅ Implemented |
| FR-14 | View own medical records by category (Test, Surgery, Report) | ✅ Implemented |
| FR-15 | Approve or reject doctor requests to access records | ✅ Implemented |
| FR-16 | Trigger Emergency SOS with GPS location capture | ✅ Implemented |
| FR-17 | View nearest hospital with route guidance after SOS | ✅ Implemented |
| FR-18 | Access AI-powered symptom checker chatbot | ✅ Implemented |
| FR-19 | Manage allergies in personal health profile | ✅ Implemented |
| FR-20 | Aadhaar verification from profile page | ✅ Implemented |

### Doctor Features

| FR | Feature | Status |
|---|---|---|
| FR-21 | View all assigned appointments (pending and confirmed) | ✅ Implemented |
| FR-22 | Confirm or cancel patient appointment requests | ✅ Implemented |
| FR-23 | Write and save digital prescriptions | ✅ Implemented |
| FR-24 | Mark appointments as completed | ✅ Implemented |
| FR-25 | Request access to a patient's medical records with reason | ✅ Implemented |
| FR-26 | View approved patient medical records (read-only) | ✅ Implemented |

### Receptionist Features

| FR | Feature | Status |
|---|---|---|
| FR-27 | Book appointments on behalf of any patient | ✅ Implemented |
| FR-28 | Register new patients in the system | ✅ Implemented |
| FR-29 | View real-time bed availability grid | ✅ Implemented |
| FR-30 | Assign available bed to a patient | ✅ Implemented |
| FR-31 | Discharge patient and mark bed as available | ✅ Implemented |
| FR-32 | Upload lab reports linked to patient and booking | ✅ Implemented |

### Admin Features

| FR | Feature | Status |
|---|---|---|
| FR-33 | View live analytics dashboard (users, appointments, beds, revenue) | ✅ Implemented |
| FR-34 | Browse and search full user directory | ✅ Implemented |
| FR-35 | Register new users for any role | ✅ Implemented |
| FR-36 | Monitor active Emergency SOS alerts | ✅ Implemented |
| FR-37 | View appointment status breakdown with charts | ✅ Implemented |
| FR-38 | View bed occupancy rate with pie chart | ✅ Implemented |

---

## 🛠️ Tech Stack

### Programming Languages

| Language | Usage |
|---|---|
| **JavaScript (ES2023)** | Backend — Node.js server, controllers, models, middleware |
| **TypeScript** | Frontend — all React components, services, types |
| **HTML5** | Frontend markup via JSX |
| **CSS3** | Styling via Tailwind CSS utility classes |

### Frameworks and Libraries

| Framework / Library | Category | Usage |
|---|---|---|
| React 19 | Frontend Framework | UI components and state management |
| Node.js 22 | Runtime | Backend server execution |
| Express.js 4 | Backend Framework | REST API routing and middleware |
| Mongoose 8 | ODM | MongoDB schema definition and queries |
| Tailwind CSS v4 | CSS Framework | Utility-based responsive styling |
| Axios 1.7 | HTTP Client | Frontend API communication |
| React Router v7 | Routing | Frontend navigation and protected routes |
| Framer Motion | Animation | Page transitions and UI animations |
| Recharts | Data Visualisation | Admin analytics charts |
| JWT (jsonwebtoken) | Authentication | Stateless token-based auth |
| bcryptjs | Security | Password hashing |
| Multer | File Upload | PDF and image handling |
| Helmet | Security | HTTP security headers |
| express-validator | Validation | API input validation |
| Vite 6 | Build Tool | Frontend bundling and dev server |

### Database

| Technology | Usage |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose ODM** | Schema modeling, validation, relationships |

### CASE Tools

| Tool | Purpose |
|---|---|
| **Draw.io** | System architecture diagram, ER diagram, data flow diagrams |
| **Postman** | API testing and endpoint documentation |
| **GitHub** | Version control and source code management |
| **VS Code** | Primary code editor |
| **MongoDB Compass** | Database visualisation and query testing |

### AI Tools Used During Development

| AI Tool | How It Was Used |
|---|---|
| **Claude (Anthropic)** | Primary development assistant — backend architecture, frontend integration, bug fixing, code generation |
| **Google AI Studio** | Initial prototype and UI concept generation |
| **OpenAI GPT-3.5** | Integrated into the app as the AI symptom checker chatbot |
| **GitHub Copilot** | In-editor code suggestions and boilerplate generation |

### Deployment Platforms

| Platform | Usage |
|---|---|
| **Vercel** | Frontend static hosting with automatic CI/CD from GitHub |
| **Railway** | Backend Node.js hosting with environment variable management |
| **MongoDB Atlas** | Cloud database with network access control |

---

## 🏗️ System Architecture

### Architecture Type

CareSync follows a **3-Tier Architecture** (Presentation → Business Logic → Data):

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                        │
│                                                             │
│   React + TypeScript (Vite)                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │ Patient  │ │  Doctor  │ │Recept.   │ │  Admin   │    │
│   │Dashboard │ │Dashboard │ │Dashboard │ │Dashboard │    │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
│   Deployed on: Vercel                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS REST API (Axios + JWT)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   BUSINESS LOGIC TIER                        │
│                                                             │
│   Node.js + Express.js                                      │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │   Auth   │ │Appoint.  │ │   Lab    │ │ Records  │    │
│   │Controller│ │Controller│ │Controller│ │Controller│    │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │   Bed    │ │   SOS    │ │    AI    │ │  Admin   │    │
│   │Controller│ │Controller│ │Controller│ │Controller│    │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
│   Middleware: JWT Auth │ RBAC │ Multer │ Rate Limiting     │
│   Deployed on: Railway                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose ODM
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      DATA TIER                               │
│                                                             │
│   MongoDB Atlas (Cloud)                                     │
│   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │
│   │ User  │ │Doctor │ │Appt.  │ │  Lab  │ │Record │     │
│   └───────┘ └───────┘ └───────┘ └───────┘ └───────┘     │
│   ┌───────┐ ┌───────┐ ┌───────┐                           │
│   │Permis.│ │  Bed  │ │  SOS  │                           │
│   └───────┘ └───────┘ └───────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Explanation

**Presentation Tier (Frontend — Vercel)**
The React + TypeScript frontend is a Single Page Application (SPA) built with Vite. It communicates with the backend exclusively through RESTful HTTP calls made via Axios. JWT tokens are stored in localStorage and automatically attached to every request through an Axios interceptor. The UI is fully role-aware — different dashboards and navigation options are shown based on the logged-in user's role.

**Business Logic Tier (Backend — Railway)**
The Node.js + Express.js backend handles all application logic. Every incoming request passes through middleware layers: CORS validation, JWT authentication, role-based authorization, input validation, and rate limiting. Controllers process the business logic and interact with the database through Mongoose models. File uploads are handled by Multer and stored in the uploads directory.

**Data Tier (Database — MongoDB Atlas)**
MongoDB Atlas stores all application data as documents in collections. Mongoose provides schema-level validation, type enforcement, and relationship management (via ObjectId references between collections). The database is hosted on MongoDB Atlas with IP whitelisting and connection string authentication.

### Request Flow

```
User Action (Browser)
       ↓
React Component calls API service function
       ↓
Axios attaches JWT token → sends HTTPS request to Railway
       ↓
Express receives request → CORS check → Rate limit check
       ↓
auth.js middleware → verifies JWT → attaches user to req
       ↓
authorize() middleware → checks user.role against allowed roles
       ↓
validate.js → runs express-validator rules → returns 422 if invalid
       ↓
Controller function → business logic → queries MongoDB via Mongoose
       ↓
JSON response → Axios receives it → React state updated → UI re-renders
```

---

## 👤 Individual Contribution Summary

### Developer: [Swati Gupta]

| Module | Description | Files Owned | Effort % |
|---|---|---|---|
| **Authentication System** | Complete signup, login, JWT token management, Aadhaar verification, role detection | `backend/controllers/authController.js` `backend/models/User.js` `backend/routes/auth.js` `frontend/src/pages/Login.tsx` `frontend/src/pages/Signup.tsx` | 12% |
| **API Service Layer** | Central Axios client, all API method definitions, JWT interceptors, error handling, auto-logout | `frontend/src/services/api.ts` `frontend/src/hooks/useApi.ts` | 8% |
| **Global State Management** | AppContext with full API integration, all data fetching, all action functions, loading states, toast system | `frontend/src/AppContext.tsx` `frontend/src/components/ui/Toast.tsx` | 10% |
| **Appointment System** | Book, view, confirm, cancel, complete appointments, prescription writing | `backend/controllers/appointmentController.js` `backend/models/Appointment.js` `backend/routes/appointments.js` `frontend/src/pages/dashboards/MyAppointments.tsx` `frontend/src/pages/dashboards/DoctorOverview.tsx` `frontend/src/pages/dashboards/DoctorsList.tsx` | 12% |
| **Lab Services** | Test catalogue, booking flow, payment simulation, lab report upload and viewing | `backend/controllers/labController.js` `backend/models/Lab.js` `backend/routes/lab.js` `frontend/src/pages/dashboards/LabServices.tsx` `frontend/src/pages/dashboards/LabReports.tsx` | 10% |
| **Medical Records + Permission System** | File upload, category management, doctor access request and approval flow | `backend/controllers/recordController.js` `backend/models/MedicalRecord.js` `backend/models/Permission.js` `backend/routes/records.js` `frontend/src/pages/dashboards/MedicalRecords.tsx` | 10% |
| **Bed Management** | Real-time bed grid, assign bed to patient, discharge, bed status tracking | `backend/controllers/bedController.js` `backend/models/Bed.js` `backend/routes/beds.js` `frontend/src/pages/dashboards/BedManagement.tsx` | 8% |
| **Emergency SOS** | GPS location capture, SOS trigger, nearest hospital routing, alert management | `backend/controllers/sosController.js` `backend/models/SOSAlert.js` `backend/routes/sos.js` `frontend/src/pages/dashboards/EmergencySOS.tsx` | 7% |
| **AI Symptom Chatbot** | OpenAI GPT-3.5 integration, multi-turn conversation history, mock fallback system | `backend/controllers/aiController.js` `backend/routes/ai.js` `frontend/src/components/SymptomChatbot.tsx` | 6% |
| **Admin Analytics** | Live aggregated statistics, bar chart, pie chart, recent activity feed | `backend/controllers/adminController.js` `backend/routes/admin.js` `frontend/src/pages/dashboards/AdminOverview.tsx` | 6% |
| **User Management** | User directory, user registration, profile editing, avatar upload, doctor listing | `backend/controllers/userController.js` `backend/routes/users.js` `frontend/src/pages/dashboards/UserDirectory.tsx` `frontend/src/pages/dashboards/Profile.tsx` | 6% |
| **Backend Infrastructure** | Express server setup, CORS, rate limiting, error handling, middleware, seeder, database models | `backend/server.js` `backend/config/db.js` `backend/middleware/auth.js` `backend/middleware/errorHandler.js` `backend/middleware/upload.js` `backend/middleware/validate.js` `backend/utils/seeder.js` `backend/utils/jwt.js` `backend/utils/apiResponse.js` | 5% |

**Total: 100%**

---

## 📄 Documentation

| Document | Description | Link |
|---|---|---|
| SRS | Software Requirements Specification | [docs/SRS.md](./docs/SRS.md) |
| Design Document | System architecture, ER diagram, data flow, sequence diagrams | [docs/Design_docs.md](./docs/Design_docs.md) |
| Manual Test Cases | Test case IDs, inputs, expected outputs, pass/fail criteria | [docs/TestCases.md](./docs/TestCases.md) |
| Automated Tests | Jest + Supertest backend API tests | [tests/](./tests/) |
| Backend README | API reference and backend setup | [backend/README.md](./backend/README.md) |
| Frontend README | Component architecture and frontend setup | [frontend/README.md](./frontend/README.md) |

---

## 📄 License

This project is developed for educational purposes as part of a college project submission.
