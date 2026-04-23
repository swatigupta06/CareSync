export type Role = 'Admin' | 'Doctor' | 'Patient' | 'Receptionist';

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string; // Mandatory
  aadhaarNumber?: string;
  isAadhaarVerified: boolean;
  role: Role;
  avatar?: string;
  password?: string; // For simulation
  age?: number;
  gender?: string;
  allergies?: string[];
}

export interface Doctor extends User {
  specialization: string;
  experience: string;
  availability: string[]; // e.g. ["Mon", "Wed", "Fri"]
  bio: string;
  rating: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  symptoms: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  prescription?: string;
}

export interface Bed {
  id: string;
  number: string;
  type: 'General' | 'ICU' | 'Semi-Private' | 'Private';
  status: 'Available' | 'Occupied' | 'Emergency';
  patientId?: string;
  patientName?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  date: string;
  result: string;
  status: 'Pending' | 'Final';
}

export interface LabBooking {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  date: string;
  time: string;
  status: 'Booked' | 'Completed';
  paymentStatus: 'Pending' | 'Paid';
  paymentMethod?: 'UPI' | 'Card' | 'Net Banking';
  reportId?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  reportType: string;
  category: 'Test' | 'Surgery' | 'Report';
  uploadedBy: 'patient' | 'receptionist' | 'lab';
  uploadDate: string;
  fileUrl: string;
  notes?: string;
}

export interface AccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}
