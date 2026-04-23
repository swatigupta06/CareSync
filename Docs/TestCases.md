# CareSync – Manual Test Cases

**Project:** CareSync Healthcare Web Application  
**Version:** 1.0  
**Date:** 2026-04-23  
**Prepared By:** QA Team  
**Tech Stack:** React + TypeScript + Tailwind (Frontend) | Node.js + Express + MongoDB Atlas (Backend)  
**Auth:** JWT + Role-Based Access Control (Patient, Doctor, Receptionist, Admin)

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [User Profile Management](#3-user-profile-management)
4. [Appointments](#4-appointments)
5. [Lab Tests & Bookings](#5-lab-tests--bookings)
6. [Medical Records](#6-medical-records)
7. [Bed Management](#7-bed-management)
8. [SOS / Emergency](#8-sos--emergency)
9. [AI Chat](#9-ai-chat)
10. [Admin Analytics](#10-admin-analytics)
11. [Edge Cases & Security](#11-edge-cases--security)

---

## 1. Test Environment Setup

| Item | Value |
|---|---|
| Base URL | `http://localhost:5000` |
| Test DB | MongoDB Atlas (test cluster) |
| Auth Header | `Authorization: Bearer <JWT_TOKEN>` |
| Content-Type | `application/json` |
| Tools | Postman / Thunder Client / curl |

**Seed Accounts (to be created before testing):**

| Role | Email | Password |
|---|---|---|
| Admin | admin@caresync.com | Admin@1234 |
| Doctor | doctor@caresync.com | Doctor@1234 |
| Receptionist | recep@caresync.com | Recep@1234 |
| Patient | patient@caresync.com | Patient@1234 |

---

## 2. Authentication & Authorization

### TC-AUTH-001 — Patient Signup (Valid)

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-001 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/signup |
| **Priority** | High |
| **Type** | Positive |

**Preconditions:** Email not already registered.

**Steps:**
1. Send `POST /api/auth/signup`
2. Body: `{ "name": "John Doe", "email": "john@test.com", "password": "John@1234", "role": "patient", "phone": "9876543210" }`

**Expected Output:**
- HTTP 201 Created
- Response body contains `token` (JWT string) and `user` object with `id`, `name`, `email`, `role: "patient"`
- Password is NOT returned in response

**Pass Criteria:** Status 201, token present, password absent from response.

---

### TC-AUTH-002 — Signup with Duplicate Email

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-002 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/signup |
| **Priority** | High |
| **Type** | Negative |

**Preconditions:** `john@test.com` already exists in DB.

**Steps:**
1. Send `POST /api/auth/signup` with same email as TC-AUTH-001.

**Expected Output:**
- HTTP 409 Conflict
- Body: `{ "error": "Email already in use" }` or equivalent message

**Pass Criteria:** Status 409, error message indicating duplicate email.

---

### TC-AUTH-003 — Signup with Invalid Email Format

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-003 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/signup |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Send POST with body: `{ "name": "Test", "email": "not-an-email", "password": "Test@1234", "role": "patient" }`

**Expected Output:**
- HTTP 400 Bad Request
- Body contains validation error for `email`

**Pass Criteria:** Status 400.

---

### TC-AUTH-004 — Signup with Weak Password

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-004 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/signup |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Send POST with body: `{ "name": "Test", "email": "weak@test.com", "password": "123", "role": "patient" }`

**Expected Output:**
- HTTP 400 Bad Request
- Validation error for password (minimum length or complexity)

**Pass Criteria:** Status 400.

---

### TC-AUTH-005 — Login with Valid Credentials

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-005 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/login |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Send `POST /api/auth/login`
2. Body: `{ "email": "patient@caresync.com", "password": "Patient@1234" }`

**Expected Output:**
- HTTP 200 OK
- Response contains `token` and `user` object

**Pass Criteria:** Status 200, JWT token present.

---

### TC-AUTH-006 — Login with Wrong Password

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-006 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/login |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Send `POST /api/auth/login` with correct email, wrong password.

**Expected Output:**
- HTTP 401 Unauthorized
- Body: `{ "error": "Invalid credentials" }` or equivalent

**Pass Criteria:** Status 401.

---

### TC-AUTH-007 — Login with Non-Existent Email

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-007 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/login |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Send POST with `email: "nobody@test.com"` and any password.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401. Error message must NOT reveal whether email exists.

---

### TC-AUTH-008 — Get Current User (Authenticated)

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-008 |
| **Module** | Authentication |
| **Feature** | GET /api/auth/me |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login to get a valid JWT.
2. Send `GET /api/auth/me` with `Authorization: Bearer <token>`.

**Expected Output:**
- HTTP 200 OK
- Body: user object including `id`, `name`, `email`, `role`

**Pass Criteria:** Status 200, correct user returned.

---

### TC-AUTH-009 — Get Current User without Token

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-009 |
| **Module** | Authentication |
| **Feature** | GET /api/auth/me |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Send `GET /api/auth/me` with no Authorization header.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

### TC-AUTH-010 — Aadhaar Verification (Valid)

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-010 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/verify-aadhaar |
| **Priority** | Medium |
| **Type** | Positive |

**Steps:**
1. Authenticate as Patient.
2. Send `POST /api/auth/verify-aadhaar` with body: `{ "aadhaarNumber": "123456789012" }`

**Expected Output:**
- HTTP 200 OK
- Body indicates verification success or OTP sent

**Pass Criteria:** Status 200.

---

### TC-AUTH-011 — Aadhaar Verification with Invalid Number

| Field | Detail |
|---|---|
| **Test ID** | TC-AUTH-011 |
| **Module** | Authentication |
| **Feature** | POST /api/auth/verify-aadhaar |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Send `POST /api/auth/verify-aadhaar` with `{ "aadhaarNumber": "123" }` (too short).

**Expected Output:**
- HTTP 400 Bad Request with validation error

**Pass Criteria:** Status 400.

---

## 3. User Profile Management

### TC-PROF-001 — Get Own Profile

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-001 |
| **Module** | User Profile |
| **Feature** | GET /api/users/profile |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as any role.
2. Send `GET /api/users/profile` with valid token.

**Expected Output:**
- HTTP 200 OK
- Body: full user profile (name, email, role, phone, etc.)

**Pass Criteria:** Status 200, data matches logged-in user.

---

### TC-PROF-002 — Update Own Profile

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-002 |
| **Module** | User Profile |
| **Feature** | PUT /api/users/profile |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `PUT /api/users/profile` with body: `{ "name": "John Updated", "phone": "9000000001" }`

**Expected Output:**
- HTTP 200 OK
- Response body contains updated fields

**Pass Criteria:** Status 200, name and phone updated in response.

---

### TC-PROF-003 — Update Profile with Invalid Phone

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-003 |
| **Module** | User Profile |
| **Feature** | PUT /api/users/profile |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Login as Patient.
2. Send PUT with `{ "phone": "abc" }` (non-numeric).

**Expected Output:**
- HTTP 400 Bad Request

**Pass Criteria:** Status 400.

---

### TC-PROF-004 — Get Doctors List (Patient can view)

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-004 |
| **Module** | User Profile |
| **Feature** | GET /api/users/doctors |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `GET /api/users/doctors`.

**Expected Output:**
- HTTP 200 OK
- Array of doctor objects with name, specialty, etc.
- No sensitive data (no password hashes)

**Pass Criteria:** Status 200, array returned.

---

### TC-PROF-005 — Get Patients List (Receptionist / Doctor only)

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-005 |
| **Module** | User Profile |
| **Feature** | GET /api/users/patients |
| **Priority** | High |
| **Type** | Positive + RBAC |

**Steps:**
1. Login as Receptionist.
2. Send `GET /api/users/patients`.

**Expected Output:**
- HTTP 200 OK
- Array of patient objects

**Pass Criteria:** Status 200, array returned.

---

### TC-PROF-006 — Patient Cannot Access Patients List

| Field | Detail |
|---|---|
| **Test ID** | TC-PROF-006 |
| **Module** | User Profile |
| **Feature** | GET /api/users/patients |
| **Priority** | High |
| **Type** | Negative / RBAC |

**Steps:**
1. Login as Patient.
2. Send `GET /api/users/patients`.

**Expected Output:**
- HTTP 403 Forbidden

**Pass Criteria:** Status 403.

---

## 4. Appointments

### TC-APPT-001 — Book Appointment (Patient)

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-001 |
| **Module** | Appointments |
| **Feature** | POST /api/appointments |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `POST /api/appointments` with body:
```json
{
  "doctorId": "<valid_doctor_id>",
  "date": "2026-05-10",
  "time": "10:00",
  "reason": "Routine checkup"
}
```

**Expected Output:**
- HTTP 201 Created
- Appointment object with `status: "pending"`

**Pass Criteria:** Status 201, appointment created.

---

### TC-APPT-002 — Book Appointment with Invalid Doctor ID

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-002 |
| **Module** | Appointments |
| **Feature** | POST /api/appointments |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Login as Patient.
2. Send POST with `doctorId: "000000000000000000000000"` (non-existent).

**Expected Output:**
- HTTP 404 Not Found — Doctor not found

**Pass Criteria:** Status 404.

---

### TC-APPT-003 — Book Appointment in the Past

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-003 |
| **Module** | Appointments |
| **Feature** | POST /api/appointments |
| **Priority** | Medium |
| **Type** | Negative / Edge Case |

**Steps:**
1. Login as Patient.
2. Send POST with `date: "2020-01-01"`.

**Expected Output:**
- HTTP 400 Bad Request — Date must be in the future

**Pass Criteria:** Status 400.

---

### TC-APPT-004 — Get Appointments (Patient sees own only)

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-004 |
| **Module** | Appointments |
| **Feature** | GET /api/appointments |
| **Priority** | High |
| **Type** | Positive + RBAC |

**Steps:**
1. Login as Patient.
2. Send `GET /api/appointments`.

**Expected Output:**
- HTTP 200 OK
- Array contains only appointments belonging to this patient

**Pass Criteria:** Status 200, no other patients' data returned.

---

### TC-APPT-005 — Doctor Views Own Appointments

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-005 |
| **Module** | Appointments |
| **Feature** | GET /api/appointments |
| **Priority** | High |
| **Type** | Positive + RBAC |

**Steps:**
1. Login as Doctor.
2. Send `GET /api/appointments`.

**Expected Output:**
- HTTP 200 OK
- Array contains appointments assigned to this doctor only

**Pass Criteria:** Status 200, filtered by doctor.

---

### TC-APPT-006 — Update Appointment Status (Doctor)

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-006 |
| **Module** | Appointments |
| **Feature** | PATCH /api/appointments/:id/status |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Doctor.
2. Send `PATCH /api/appointments/<id>/status` with body: `{ "status": "confirmed" }`

**Expected Output:**
- HTTP 200 OK
- Appointment `status` updated to `confirmed`

**Pass Criteria:** Status 200, status field matches.

---

### TC-APPT-007 — Patient Cannot Update Appointment Status

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-007 |
| **Module** | Appointments |
| **Feature** | PATCH /api/appointments/:id/status |
| **Priority** | High |
| **Type** | Negative / RBAC |

**Steps:**
1. Login as Patient.
2. Attempt PATCH on any appointment's status.

**Expected Output:**
- HTTP 403 Forbidden

**Pass Criteria:** Status 403.

---

### TC-APPT-008 — Add Prescription (Doctor)

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-008 |
| **Module** | Appointments |
| **Feature** | PATCH /api/appointments/:id/prescription |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Doctor.
2. Send `PATCH /api/appointments/<id>/prescription` with body:
```json
{
  "prescription": "Tab. Paracetamol 500mg twice daily for 5 days"
}
```

**Expected Output:**
- HTTP 200 OK
- Appointment updated with prescription text

**Pass Criteria:** Status 200, prescription saved.

---

### TC-APPT-009 — Update Appointment Status with Invalid Value

| Field | Detail |
|---|---|
| **Test ID** | TC-APPT-009 |
| **Module** | Appointments |
| **Feature** | PATCH /api/appointments/:id/status |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Login as Doctor.
2. Send PATCH with body: `{ "status": "hacked" }` (invalid enum value).

**Expected Output:**
- HTTP 400 Bad Request

**Pass Criteria:** Status 400.

---

## 5. Lab Tests & Bookings

### TC-LAB-001 — Get Available Lab Tests

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-001 |
| **Module** | Lab |
| **Feature** | GET /api/lab/tests |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `GET /api/lab/tests`.

**Expected Output:**
- HTTP 200 OK
- Array of lab tests with name, price, turnaroundTime, etc.

**Pass Criteria:** Status 200, non-empty array.

---

### TC-LAB-002 — Book a Lab Test (Patient)

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-002 |
| **Module** | Lab |
| **Feature** | POST /api/lab/book |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `POST /api/lab/book` with body: `{ "testId": "<valid_test_id>", "scheduledDate": "2026-05-15" }`

**Expected Output:**
- HTTP 201 Created
- Booking object with `status: "booked"` and `paymentStatus: "pending"`

**Pass Criteria:** Status 201.

---

### TC-LAB-003 — Pay for Lab Booking

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-003 |
| **Module** | Lab |
| **Feature** | POST /api/lab/bookings/:id/pay |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Create a lab booking (TC-LAB-002).
2. Send `POST /api/lab/bookings/<booking_id>/pay` with body: `{ "paymentMethod": "card", "amount": 500 }`

**Expected Output:**
- HTTP 200 OK
- Booking `paymentStatus` updated to `paid`

**Pass Criteria:** Status 200, payment recorded.

---

### TC-LAB-004 — Pay for Already Paid Booking

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-004 |
| **Module** | Lab |
| **Feature** | POST /api/lab/bookings/:id/pay |
| **Priority** | Medium |
| **Type** | Negative / Edge Case |

**Steps:**
1. Use a booking already in `paid` status.
2. Attempt another payment POST.

**Expected Output:**
- HTTP 400 Bad Request — Already paid

**Pass Criteria:** Status 400.

---

### TC-LAB-005 — Get Patient Lab Bookings

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-005 |
| **Module** | Lab |
| **Feature** | GET /api/lab/bookings |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `GET /api/lab/bookings`.

**Expected Output:**
- HTTP 200 OK
- Array of bookings for this patient

**Pass Criteria:** Status 200, only own bookings returned.

---

### TC-LAB-006 — Upload Lab Report (Doctor / Lab Staff)

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-006 |
| **Module** | Lab |
| **Feature** | POST /api/lab/reports |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Doctor.
2. Send `POST /api/lab/reports` with body: `{ "bookingId": "<booking_id>", "reportUrl": "https://cdn.caresync.com/reports/rpt1.pdf", "remarks": "Normal" }`

**Expected Output:**
- HTTP 201 Created
- Report object saved

**Pass Criteria:** Status 201.

---

### TC-LAB-007 — Get Lab Reports (Patient sees own)

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-007 |
| **Module** | Lab |
| **Feature** | GET /api/lab/reports |
| **Priority** | High |
| **Type** | Positive + RBAC |

**Steps:**
1. Login as Patient.
2. Send `GET /api/lab/reports`.

**Expected Output:**
- HTTP 200 OK
- Array of own lab reports

**Pass Criteria:** Status 200, no other patients' reports.

---

### TC-LAB-008 — Book Lab Test Without Auth

| Field | Detail |
|---|---|
| **Test ID** | TC-LAB-008 |
| **Module** | Lab |
| **Feature** | POST /api/lab/book |
| **Priority** | High |
| **Type** | Negative / Security |

**Steps:**
1. Send POST to `/api/lab/book` with no token.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

## 6. Medical Records

### TC-REC-001 — Upload Medical Record (Patient)

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-001 |
| **Module** | Medical Records |
| **Feature** | POST /api/records |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `POST /api/records` with body:
```json
{
  "title": "Blood Test Report",
  "fileUrl": "https://cdn.caresync.com/rec/blood.pdf",
  "type": "lab_report"
}
```

**Expected Output:**
- HTTP 201 Created
- Record object with `ownerId` = current patient

**Pass Criteria:** Status 201.

---

### TC-REC-002 — Get Own Medical Records

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-002 |
| **Module** | Medical Records |
| **Feature** | GET /api/records |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `GET /api/records`.

**Expected Output:**
- HTTP 200 OK
- Only own records returned

**Pass Criteria:** Status 200, own records only.

---

### TC-REC-003 — Delete Own Medical Record

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-003 |
| **Module** | Medical Records |
| **Feature** | DELETE /api/records/:id |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Create a record (TC-REC-001).
2. Send `DELETE /api/records/<record_id>`.

**Expected Output:**
- HTTP 200 OK or 204 No Content

**Pass Criteria:** Status 200/204, record deleted from DB.

---

### TC-REC-004 — Delete Another User's Record

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-004 |
| **Module** | Medical Records |
| **Feature** | DELETE /api/records/:id |
| **Priority** | High |
| **Type** | Negative / Security |

**Steps:**
1. Login as Patient A.
2. Obtain `record_id` belonging to Patient B.
3. Send DELETE on that record_id.

**Expected Output:**
- HTTP 403 Forbidden or 404 Not Found

**Pass Criteria:** Status 403 or 404, record NOT deleted.

---

### TC-REC-005 — Request Permission to View Record

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-005 |
| **Module** | Medical Records |
| **Feature** | POST /api/records/permissions/request |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Doctor.
2. Send `POST /api/records/permissions/request` with body: `{ "patientId": "<patient_id>", "reason": "Pre-surgery review" }`

**Expected Output:**
- HTTP 201 Created
- Permission request with `status: "pending"`

**Pass Criteria:** Status 201.

---

### TC-REC-006 — Patient Responds to Permission Request

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-006 |
| **Module** | Medical Records |
| **Feature** | PATCH /api/records/permissions/:id/respond |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `PATCH /api/records/permissions/<request_id>/respond` with body: `{ "status": "approved" }`

**Expected Output:**
- HTTP 200 OK
- Permission status updated to `approved`

**Pass Criteria:** Status 200.

---

### TC-REC-007 — Patient Denies Permission Request

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-007 |
| **Module** | Medical Records |
| **Feature** | PATCH /api/records/permissions/:id/respond |
| **Priority** | Medium |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send PATCH with `{ "status": "denied" }`.

**Expected Output:**
- HTTP 200 OK
- Permission status updated to `denied`

**Pass Criteria:** Status 200.

---

### TC-REC-008 — Doctor Cannot Access Records Without Permission

| Field | Detail |
|---|---|
| **Test ID** | TC-REC-008 |
| **Module** | Medical Records |
| **Feature** | GET /api/records |
| **Priority** | High |
| **Type** | Negative / Security |

**Steps:**
1. Login as Doctor (no approved permissions for a patient).
2. Send `GET /api/records?patientId=<patient_id>`.

**Expected Output:**
- HTTP 403 Forbidden

**Pass Criteria:** Status 403.

---

## 7. Bed Management

### TC-BED-001 — Get All Beds (Admin/Receptionist)

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-001 |
| **Module** | Bed Management |
| **Feature** | GET /api/beds |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Receptionist.
2. Send `GET /api/beds`.

**Expected Output:**
- HTTP 200 OK
- Array of bed objects with `bedNumber`, `ward`, `status: "available"/"occupied"`

**Pass Criteria:** Status 200, bed list returned.

---

### TC-BED-002 — Patient Cannot View Beds

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-002 |
| **Module** | Bed Management |
| **Feature** | GET /api/beds |
| **Priority** | Medium |
| **Type** | Negative / RBAC |

**Steps:**
1. Login as Patient.
2. Send `GET /api/beds`.

**Expected Output:**
- HTTP 403 Forbidden

**Pass Criteria:** Status 403.

---

### TC-BED-003 — Assign Bed to Patient

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-003 |
| **Module** | Bed Management |
| **Feature** | PATCH /api/beds/:id/assign |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Receptionist.
2. Send `PATCH /api/beds/<bed_id>/assign` with body: `{ "patientId": "<patient_id>", "admissionDate": "2026-04-23" }`

**Expected Output:**
- HTTP 200 OK
- Bed status changes to `occupied`, patientId set

**Pass Criteria:** Status 200, bed.status = "occupied".

---

### TC-BED-004 — Assign Already Occupied Bed

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-004 |
| **Module** | Bed Management |
| **Feature** | PATCH /api/beds/:id/assign |
| **Priority** | High |
| **Type** | Negative / Edge Case |

**Steps:**
1. Use a bed that is already occupied.
2. Attempt PATCH assign with another patientId.

**Expected Output:**
- HTTP 409 Conflict — Bed already occupied

**Pass Criteria:** Status 409.

---

### TC-BED-005 — Discharge Patient from Bed

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-005 |
| **Module** | Bed Management |
| **Feature** | PATCH /api/beds/:id/discharge |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Receptionist.
2. Send `PATCH /api/beds/<bed_id>/discharge`.

**Expected Output:**
- HTTP 200 OK
- Bed status = `available`, patientId cleared

**Pass Criteria:** Status 200, bed freed.

---

### TC-BED-006 — Discharge from Already Available Bed

| Field | Detail |
|---|---|
| **Test ID** | TC-BED-006 |
| **Module** | Bed Management |
| **Feature** | PATCH /api/beds/:id/discharge |
| **Priority** | Medium |
| **Type** | Negative / Edge Case |

**Steps:**
1. Attempt to discharge a bed that is already available.

**Expected Output:**
- HTTP 400 Bad Request — Bed is not occupied

**Pass Criteria:** Status 400.

---

## 8. SOS / Emergency

### TC-SOS-001 — Trigger SOS Alert (Patient)

| Field | Detail |
|---|---|
| **Test ID** | TC-SOS-001 |
| **Module** | SOS |
| **Feature** | POST /api/sos/trigger |
| **Priority** | Critical |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `POST /api/sos/trigger` with body: `{ "location": { "lat": 26.9124, "lng": 75.7873 }, "message": "Chest pain" }`

**Expected Output:**
- HTTP 200 OK or 201 Created
- SOS alert created, notification dispatched to on-call staff
- Response includes `alertId` and `status: "active"`

**Pass Criteria:** Status 200/201, alertId present.

---

### TC-SOS-002 — SOS Without Auth

| Field | Detail |
|---|---|
| **Test ID** | TC-SOS-002 |
| **Module** | SOS |
| **Feature** | POST /api/sos/trigger |
| **Priority** | Critical |
| **Type** | Negative |

**Steps:**
1. Send SOS POST without any Authorization header.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

### TC-SOS-003 — SOS With Missing Location

| Field | Detail |
|---|---|
| **Test ID** | TC-SOS-003 |
| **Module** | SOS |
| **Feature** | POST /api/sos/trigger |
| **Priority** | Medium |
| **Type** | Negative |

**Steps:**
1. Login as Patient.
2. Send POST with empty body `{}`.

**Expected Output:**
- HTTP 400 Bad Request (location required)

**Pass Criteria:** Status 400.

---

## 9. AI Chat

### TC-AI-001 — Send Chat Message (Authenticated)

| Field | Detail |
|---|---|
| **Test ID** | TC-AI-001 |
| **Module** | AI Chat |
| **Feature** | POST /api/ai/chat |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Patient.
2. Send `POST /api/ai/chat` with body: `{ "message": "What are symptoms of diabetes?" }`

**Expected Output:**
- HTTP 200 OK
- Body: `{ "reply": "<AI generated text>" }`
- Reply is relevant and non-empty

**Pass Criteria:** Status 200, reply field present and non-empty.

---

### TC-AI-002 — Chat Without Auth

| Field | Detail |
|---|---|
| **Test ID** | TC-AI-002 |
| **Module** | AI Chat |
| **Feature** | POST /api/ai/chat |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Send POST without Authorization header.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

### TC-AI-003 — Chat With Empty Message

| Field | Detail |
|---|---|
| **Test ID** | TC-AI-003 |
| **Module** | AI Chat |
| **Feature** | POST /api/ai/chat |
| **Priority** | Medium |
| **Type** | Negative / Edge Case |

**Steps:**
1. Login as Patient.
2. Send POST with body: `{ "message": "" }`

**Expected Output:**
- HTTP 400 Bad Request

**Pass Criteria:** Status 400.

---

### TC-AI-004 — Chat With Very Long Message

| Field | Detail |
|---|---|
| **Test ID** | TC-AI-004 |
| **Module** | AI Chat |
| **Feature** | POST /api/ai/chat |
| **Priority** | Low |
| **Type** | Edge Case |

**Steps:**
1. Login as Patient.
2. Send POST with `message` field containing 10,000 characters.

**Expected Output:**
- Either HTTP 200 with a valid reply, OR HTTP 400/413 (payload too large / validation error)

**Pass Criteria:** No 500 Internal Server Error.

---

## 10. Admin Analytics

### TC-ADMIN-001 — Admin Gets Analytics

| Field | Detail |
|---|---|
| **Test ID** | TC-ADMIN-001 |
| **Module** | Admin |
| **Feature** | GET /api/admin/analytics |
| **Priority** | High |
| **Type** | Positive |

**Steps:**
1. Login as Admin.
2. Send `GET /api/admin/analytics`.

**Expected Output:**
- HTTP 200 OK
- Body includes counts: totalPatients, totalDoctors, totalAppointments, bedsOccupied, revenueTotal, etc.

**Pass Criteria:** Status 200, all key metrics present.

---

### TC-ADMIN-002 — Non-Admin Cannot Access Analytics

| Field | Detail |
|---|---|
| **Test ID** | TC-ADMIN-002 |
| **Module** | Admin |
| **Feature** | GET /api/admin/analytics |
| **Priority** | High |
| **Type** | Negative / RBAC |

**Steps:**
1. Login as Patient, Doctor, or Receptionist.
2. Send `GET /api/admin/analytics`.

**Expected Output:**
- HTTP 403 Forbidden

**Pass Criteria:** Status 403 for all non-admin roles.

---

### TC-ADMIN-003 — Analytics Without Auth

| Field | Detail |
|---|---|
| **Test ID** | TC-ADMIN-003 |
| **Module** | Admin |
| **Feature** | GET /api/admin/analytics |
| **Priority** | High |
| **Type** | Negative |

**Steps:**
1. Send GET with no Authorization header.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

## 11. Edge Cases & Security

### TC-SEC-001 — Expired JWT Token

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-001 |
| **Module** | Security |
| **Priority** | High |
| **Type** | Security / Edge Case |

**Steps:**
1. Use a JWT token that is expired.
2. Send `GET /api/auth/me`.

**Expected Output:**
- HTTP 401 Unauthorized
- Body: `{ "error": "Token expired" }` or equivalent

**Pass Criteria:** Status 401.

---

### TC-SEC-002 — Malformed JWT Token

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-002 |
| **Module** | Security |
| **Priority** | High |
| **Type** | Security |

**Steps:**
1. Send request with `Authorization: Bearer thisisnotavalidtoken`.

**Expected Output:**
- HTTP 401 Unauthorized

**Pass Criteria:** Status 401.

---

### TC-SEC-003 — SQL/NoSQL Injection in Login

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-003 |
| **Module** | Security |
| **Priority** | Critical |
| **Type** | Security |

**Steps:**
1. Send `POST /api/auth/login` with body: `{ "email": { "$gt": "" }, "password": "anything" }`

**Expected Output:**
- HTTP 400 Bad Request or 401 Unauthorized
- Must NOT return a valid token

**Pass Criteria:** No token issued. Status 400 or 401.

---

### TC-SEC-004 — XSS Payload in Profile Name

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-004 |
| **Module** | Security |
| **Priority** | High |
| **Type** | Security |

**Steps:**
1. Login as Patient.
2. Send `PUT /api/users/profile` with body: `{ "name": "<script>alert('xss')</script>" }`

**Expected Output:**
- Either HTTP 400 (rejected), or name is stored safely as plain text (escaped when rendered)
- Script tag must NOT execute on retrieval

**Pass Criteria:** No script execution risk. Response sanitized.

---

### TC-SEC-005 — Rate Limiting on Login

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-005 |
| **Module** | Security |
| **Priority** | Medium |
| **Type** | Security / Edge Case |

**Steps:**
1. Send 20+ failed login requests within 1 minute for the same IP.

**Expected Output:**
- HTTP 429 Too Many Requests after threshold is exceeded

**Pass Criteria:** Status 429 returned.

---

### TC-SEC-006 — Missing Required Fields (Generic)

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-006 |
| **Module** | Security / Validation |
| **Priority** | Medium |
| **Type** | Edge Case |

**Steps:**
1. Send POST to `/api/appointments` with an empty body `{}`.

**Expected Output:**
- HTTP 400 Bad Request with field-level validation errors

**Pass Criteria:** Status 400, specific errors returned.

---

### TC-SEC-007 — Large Payload Attack

| Field | Detail |
|---|---|
| **Test ID** | TC-SEC-007 |
| **Module** | Security |
| **Priority** | Medium |
| **Type** | Security / Edge Case |

**Steps:**
1. Send a POST request with a body > 10MB.

**Expected Output:**
- HTTP 413 Payload Too Large

**Pass Criteria:** Status 413 or 400, no crash.

---

## Summary Table

| Test ID | Module | Type | Priority | Expected Status |
|---|---|---|---|---|
| TC-AUTH-001 | Auth | Positive | High | 201 |
| TC-AUTH-002 | Auth | Negative | High | 409 |
| TC-AUTH-003 | Auth | Negative | Medium | 400 |
| TC-AUTH-004 | Auth | Negative | Medium | 400 |
| TC-AUTH-005 | Auth | Positive | High | 200 |
| TC-AUTH-006 | Auth | Negative | High | 401 |
| TC-AUTH-007 | Auth | Negative | High | 401 |
| TC-AUTH-008 | Auth | Positive | High | 200 |
| TC-AUTH-009 | Auth | Negative | High | 401 |
| TC-AUTH-010 | Auth | Positive | Medium | 200 |
| TC-AUTH-011 | Auth | Negative | Medium | 400 |
| TC-PROF-001 | Profile | Positive | High | 200 |
| TC-PROF-002 | Profile | Positive | High | 200 |
| TC-PROF-003 | Profile | Negative | Medium | 400 |
| TC-PROF-004 | Profile | Positive | High | 200 |
| TC-PROF-005 | Profile | Positive+RBAC | High | 200 |
| TC-PROF-006 | Profile | Negative/RBAC | High | 403 |
| TC-APPT-001 | Appointments | Positive | High | 201 |
| TC-APPT-002 | Appointments | Negative | High | 404 |
| TC-APPT-003 | Appointments | Edge Case | Medium | 400 |
| TC-APPT-004 | Appointments | Positive+RBAC | High | 200 |
| TC-APPT-005 | Appointments | Positive+RBAC | High | 200 |
| TC-APPT-006 | Appointments | Positive | High | 200 |
| TC-APPT-007 | Appointments | Negative/RBAC | High | 403 |
| TC-APPT-008 | Appointments | Positive | High | 200 |
| TC-APPT-009 | Appointments | Negative | Medium | 400 |
| TC-LAB-001 | Lab | Positive | High | 200 |
| TC-LAB-002 | Lab | Positive | High | 201 |
| TC-LAB-003 | Lab | Positive | High | 200 |
| TC-LAB-004 | Lab | Edge Case | Medium | 400 |
| TC-LAB-005 | Lab | Positive | High | 200 |
| TC-LAB-006 | Lab | Positive | High | 201 |
| TC-LAB-007 | Lab | Positive+RBAC | High | 200 |
| TC-LAB-008 | Lab | Negative | High | 401 |
| TC-REC-001 | Records | Positive | High | 201 |
| TC-REC-002 | Records | Positive | High | 200 |
| TC-REC-003 | Records | Positive | High | 200/204 |
| TC-REC-004 | Records | Negative | High | 403/404 |
| TC-REC-005 | Records | Positive | High | 201 |
| TC-REC-006 | Records | Positive | High | 200 |
| TC-REC-007 | Records | Positive | Medium | 200 |
| TC-REC-008 | Records | Negative | High | 403 |
| TC-BED-001 | Beds | Positive | High | 200 |
| TC-BED-002 | Beds | Negative | Medium | 403 |
| TC-BED-003 | Beds | Positive | High | 200 |
| TC-BED-004 | Beds | Edge Case | High | 409 |
| TC-BED-005 | Beds | Positive | High | 200 |
| TC-BED-006 | Beds | Edge Case | Medium | 400 |
| TC-SOS-001 | SOS | Positive | Critical | 200/201 |
| TC-SOS-002 | SOS | Negative | Critical | 401 |
| TC-SOS-003 | SOS | Negative | Medium | 400 |
| TC-AI-001 | AI Chat | Positive | High | 200 |
| TC-AI-002 | AI Chat | Negative | High | 401 |
| TC-AI-003 | AI Chat | Edge Case | Medium | 400 |
| TC-AI-004 | AI Chat | Edge Case | Low | Not 500 |
| TC-ADMIN-001 | Admin | Positive | High | 200 |
| TC-ADMIN-002 | Admin | Negative/RBAC | High | 403 |
| TC-ADMIN-003 | Admin | Negative | High | 401 |
| TC-SEC-001 | Security | Security | High | 401 |
| TC-SEC-002 | Security | Security | High | 401 |
| TC-SEC-003 | Security | Security | Critical | 400/401 |
| TC-SEC-004 | Security | Security | High | 400/Sanitized |
| TC-SEC-005 | Security | Security | Medium | 429 |
| TC-SEC-006 | Security | Edge Case | Medium | 400 |
| TC-SEC-007 | Security | Security | Medium | 413/400 |

---

*Total Test Cases: 64 | High Priority: 42 | Medium: 17 | Low: 1 | Critical: 4*
