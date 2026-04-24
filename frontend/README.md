# 🌐 CareSync — Frontend

> Modern, responsive React + TypeScript frontend for the CareSync healthcare platform with role-based dashboards, real-time API integration, and AI-powered features.

---

## 🔴 Live Application

[https://caresync-frontend.vercel.app](https://caresync-iota.vercel.app/)


---

## 🔑 Demo Credentials

> Select the correct **role button** on the login page before clicking Login

| Role | Email | Password |
|---|---|---|
| 🔴 Admin | admin@caresync.com | Admin@123 |
| 🔵 Doctor | sarah.wilson@caresync.com | Doctor@123 |
| 🟢 Receptionist | mary.thomas@caresync.com | Recept@123 |
| 🟡 Patient | amit.patel@caresync.com | Patient@123 |

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── api.ts               # Central Axios client — all API calls
│   ├── hooks/
│   │   └── useApi.ts            # Reusable loading and error hook
│   ├── AppContext.tsx            # Global state — fully API driven
│   ├── App.tsx                  # Routes and protected route guard
│   ├── types.ts                 # TypeScript interfaces for all models
│   ├── data.ts                  # Static fallback data
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Role-based navigation sidebar
│   │   │   └── Topbar.tsx       # Top navigation bar
│   │   ├── ui/
│   │   │   ├── Toast.tsx        # Global toast notifications
│   │   │   └── DashboardUI.tsx  # Shared stat cards and headers
│   │   └── SymptomChatbot.tsx   # AI chatbot component
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── Login.tsx            # Multi-role login
│   │   ├── Signup.tsx           # Registration with Aadhaar
│   │   ├── Dashboard.tsx        # Dashboard shell with routing
│   │   └── dashboards/
│   │       ├── PatientOverview.tsx      # Patient home dashboard
│   │       ├── DoctorOverview.tsx       # Doctor home dashboard
│   │       ├── ReceptionistOverview.tsx # Receptionist dashboard
│   │       ├── AdminOverview.tsx        # Admin analytics dashboard
│   │       ├── DoctorsList.tsx          # Browse and book doctors
│   │       ├── MyAppointments.tsx       # Patient appointments + chat
│   │       ├── BedManagement.tsx        # Bed allocation grid
│   │       ├── LabServices.tsx          # Lab tests and bookings
│   │       ├── LabReports.tsx           # Lab report viewer
│   │       ├── MedicalRecords.tsx       # Records + permission system
│   │       ├── EmergencySOS.tsx         # Emergency SOS trigger
│   │       ├── UserDirectory.tsx        # Admin user management
│   │       └── Profile.tsx              # Profile and Aadhaar verify
│   ├── lib/
│   │   └── utils.ts             # Utility helpers (cn, etc.)
│   └── index.css                # Global styles
├── .env.example                 # Environment variable template
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000
```

For production point this to your Railway backend URL:
```env
VITE_API_URL=https://caresync-backend.up.railway.app
```

### 3. Start development server
```bash
npm run dev
```

Frontend runs at → **http://localhost:3000**

> Make sure the backend is running first

### 4. Build for production
```bash
npm run build
```

---

## 🔌 API Integration Architecture

All backend communication is centralised in `src/services/api.ts`:

```typescript
import { authAPI, appointmentAPI, labAPI, recordAPI } from './services/api';

// Authentication
const res = await authAPI.login({ identifier, password, role });
const { token, user } = res.data;

// Booking an appointment
await appointmentAPI.book({ doctorId, date, time, symptoms });

// Uploading a file
const formData = new FormData();
formData.append('file', file);
formData.append('reportType', 'Blood Test');
formData.append('category', 'Test');
await recordAPI.upload(formData);
```

### JWT Auto-Attachment

Every API request automatically includes the JWT token:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('caresync_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Auto-Logout on Token Expiry

```typescript
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('caresync_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

---

## 🧩 Key Components

### AppContext (`src/AppContext.tsx`)
Global state management. All data fetched from real API — no localStorage dummy data. Provides:
- Auth state (user, token, login, logout, signup)
- All data arrays (doctors, appointments, beds, lab bookings, records)
- All action functions (bookAppointment, assignBed, uploadRecord, etc.)
- Loading states per action
- Global toast notification system

### Central API Service (`src/services/api.ts`)
Single Axios instance with:
- Base URL from `VITE_API_URL` environment variable
- JWT Bearer token attached automatically on every request
- Global error handling and user-friendly error messages
- Auto-redirect to login on 401 responses
- Separate method groups: `authAPI`, `userAPI`, `appointmentAPI`, `labAPI`, `recordAPI`, `bedAPI`, `sosAPI`, `aiAPI`, `adminAPI`

### Toast System (`src/components/ui/Toast.tsx`)
Global animated toast notifications for every API success and error. Uses Framer Motion for smooth slide-up animation.

---

## 🎨 Design System

| Element | Choice |
|---|---|
| Primary Font | System font stack |
| Color Scheme | Slate + Blue accent |
| Border Radius | Rounded corners (2rem to 4rem) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Styling | Tailwind CSS v4 utility classes |

---

## 🔐 Route Protection

Routes are protected based on authentication and role:

```tsx
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" />;
  return children;
}
```

---

## 📱 Dashboards by Role

### Patient Dashboard Pages
| Page | API Call |
|---|---|
| Overview | GET /appointments + GET /lab/bookings |
| Find Doctors | GET /users/doctors |
| My Appointments | GET /appointments |
| Lab Services | GET /lab/tests + POST /lab/book |
| Medical Records | GET /records + POST /records |
| Emergency SOS | POST /sos/trigger |
| Profile | GET /users/profile |

### Doctor Dashboard Pages
| Page | API Call |
|---|---|
| Overview | GET /appointments + record permissions |
| Appointments | PATCH /appointments/:id/status |
| Patient Records | GET /records + POST /records/permissions/request |

### Receptionist Dashboard Pages
| Page | API Call |
|---|---|
| Overview | GET /appointments + GET /beds |
| Book Appointment | POST /appointments |
| Bed Management | GET /beds + PATCH /beds/:id/assign |
| Lab Reports | POST /lab/reports |

### Admin Dashboard Pages
| Page | API Call |
|---|---|
| Analytics | GET /admin/analytics |
| User Directory | GET /users + POST /auth/signup |
| All Appointments | GET /appointments |

---

## 🌐 Deployment on Vercel

1. Push code to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Set root directory to `frontend/`
4. Add environment variable:
   ```
   VITE_API_URL = [https://your-railway-backend.up.railway.app](https://caresync-backend-production-38b2.up.railway.app/)
   ```
5. Click Deploy
6. After deploy copy your Vercel URL and update `ALLOWED_ORIGINS` in Railway backend

---

## 🔗 Related

- Backend API → [../backend](../backend/README.md)
- Documentation → [../docs](../docs/)
- Live API Health → https://caresync-backend.up.railway.app/health
