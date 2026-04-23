/**
 * CareSync — AppContext (API-integrated)
 * All state driven by real backend API calls. No localStorage dummy data.
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from 'react';
import {
  authAPI, userAPI, appointmentAPI, labAPI,
  recordAPI, bedAPI,
  setAuthToken, clearAuthToken, getStoredUser,
} from './services/api';
import type { User, Doctor, Appointment, Bed, LabReport, Role, LabBooking, MedicalRecord, AccessRequest } from './types';

interface Toast { message: string; type: 'success' | 'error' | 'info' }

interface AppContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
  updateProfile: (data: Partial<User> & { file?: File }) => Promise<void>;
  verifyAadhaar: (aadhaarNumber?: string) => Promise<void>;
  doctors: Doctor[];
  appointments: Appointment[];
  beds: Bed[];
  labReports: LabReport[];
  labBookings: LabBooking[];
  medicalRecords: MedicalRecord[];
  accessRequests: AccessRequest[];
  users: User[];
  loading: Record<string, boolean>;
  toast: Toast | null;
  showToast: (msg: string, type?: Toast['type']) => void;
  bookAppointment: (data: BookAppointmentData) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], prescription?: string) => Promise<void>;
  updatePrescription: (id: string, prescription: string) => Promise<void>;
  fetchAppointments: () => Promise<void>;
  assignBed: (bedId: string, patientId: string, patientName: string) => Promise<void>;
  dischargePatient: (bedId: string) => Promise<void>;
  fetchBeds: () => Promise<void>;
  bookLabBooking: (data: BookLabData) => Promise<boolean>;
  payForLabBooking: (bookingId: string, paymentMethod: string) => Promise<void>;
  updateLabBookingStatus: (id: string, status: LabBooking['status']) => Promise<void>;
  uploadLabReport: (data: UploadLabReportData) => Promise<void>;
  fetchLabData: () => Promise<void>;
  uploadMedicalRecord: (data: UploadRecordData) => Promise<void>;
  deleteMedicalRecord: (id: string) => Promise<void>;
  fetchMedicalRecords: (patientId?: string) => Promise<void>;
  requestRecordAccess: (patientId: string, reason?: string) => Promise<void>;
  respondToAccessRequest: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
  fetchPermissions: () => Promise<void>;
  registerUser: (data: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  fetchUsers: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
}

interface SignupData {
  name: string; email?: string; phoneNumber: string; password: string;
  role: Role; aadhaarNumber?: string; age?: number; gender?: string;
  allergies?: string[]; specialization?: string; experience?: string;
  availability?: string[]; bio?: string;
}
interface BookAppointmentData {
  patientId?: string; patientName?: string;
  doctorId: string; doctorName: string; doctorSpecialization: string;
  date: string; time: string; symptoms: string;
}
interface BookLabData {
  testName: string; date: string; time: string; paymentMethod?: string; amount?: number;
}
interface UploadRecordData {
  patientId?: string; reportType: string; category: string; notes?: string; file: File;
}
interface UploadLabReportData {
  patientId: string; testName: string; result: string; bookingId?: string; file?: File;
}

type RawObj = Record<string, unknown>;

const AppContext = createContext<AppContextType | undefined>(undefined);

const str = (v: unknown) => (v as string) || '';
const pick = (o: RawObj, ...keys: string[]): string => {
  for (const k of keys) { if (o[k]) return str(o[k]); }
  return '';
};

const normUser = (r: RawObj): User => ({
  id: pick(r, '_id', 'id'),
  name: str(r.name),
  email: r.email as string | undefined,
  phoneNumber: str(r.phoneNumber),
  aadhaarNumber: r.aadhaarNumber as string | undefined,
  isAadhaarVerified: Boolean(r.isAadhaarVerified),
  role: r.role as Role,
  avatar: r.avatar as string | undefined,
  age: r.age as number | undefined,
  gender: r.gender as string | undefined,
  allergies: (r.allergies as string[]) || [],
});

const normDoctor = (r: RawObj): Doctor => {
  const u = (r.user || r) as RawObj;
  return {
    ...normUser(u),
    specialization: str(r.specialization),
    experience: str(r.experience),
    availability: (r.availability as string[]) || [],
    bio: str(r.bio),
    rating: (r.rating as number) || 0,
  };
};

const objId = (v: unknown): string => {
  if (typeof v === 'object' && v !== null) return pick(v as RawObj, '_id', 'id');
  return str(v);
};

const normAppointment = (r: RawObj): Appointment => ({
  id: pick(r, '_id', 'id'),
  patientId: objId(r.patient),
  patientName: str(r.patientName),
  doctorId: objId(r.doctor),
  doctorName: str(r.doctorName),
  doctorSpecialization: str(r.doctorSpecialization),
  date: str(r.date),
  time: str(r.time),
  symptoms: str(r.symptoms),
  status: r.status as Appointment['status'],
  prescription: r.prescription as string | undefined,
});

const normBed = (r: RawObj): Bed => ({
  id: pick(r, '_id', 'id'),
  number: str(r.number),
  type: r.type as Bed['type'],
  status: r.status as Bed['status'],
  patientId: r.patient ? objId(r.patient) : undefined,
  patientName: r.patientName as string | undefined,
});

const normLabBooking = (r: RawObj): LabBooking => ({
  id: pick(r, '_id', 'id'),
  patientId: objId(r.patient),
  patientName: str(r.patientName),
  testName: str(r.testName),
  date: str(r.date),
  time: str(r.time),
  status: r.status as LabBooking['status'],
  paymentStatus: r.paymentStatus as LabBooking['paymentStatus'],
  paymentMethod: r.paymentMethod as LabBooking['paymentMethod'],
  reportId: r.reportId as string | undefined,
});

const normLabReport = (r: RawObj): LabReport => ({
  id: pick(r, '_id', 'id'),
  patientId: objId(r.patient),
  patientName: str(r.patientName),
  testName: str(r.testName),
  date: str(r.createdAt).split('T')[0],
  result: str(r.result),
  status: r.status as LabReport['status'],
});

const normRecord = (r: RawObj): MedicalRecord => ({
  id: pick(r, '_id', 'id'),
  patientId: objId(r.patient),
  fileName: str(r.fileName),
  fileType: str(r.fileType),
  reportType: str(r.reportType),
  category: r.category as MedicalRecord['category'],
  uploadedBy: r.uploaderRole as MedicalRecord['uploadedBy'],
  uploadDate: str(r.createdAt),
  fileUrl: str(r.fileUrl),
  notes: r.notes as string | undefined,
});

const normPermission = (r: RawObj): AccessRequest => ({
  id: pick(r, '_id', 'id'),
  doctorId: objId(r.doctor),
  doctorName: str(r.doctorName),
  patientId: objId(r.patient),
  status: r.status as AccessRequest['status'],
  requestDate: str(r.createdAt),
});

const arr = <T,>(v: unknown, fn: (r: RawObj) => T): T[] =>
  Array.isArray(v) ? (v as RawObj[]).map(fn) : [];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('caresync_token'));
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((msg: string, type: Toast['type'] = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const setLoad = (k: string, v: boolean) => setLoading(p => ({ ...p, [k]: v }));

  const d = (res: { data: unknown }) => res.data as RawObj;

  const fetchDoctors = useCallback(async () => {
    setLoad('doctors', true);
    try { setDoctors(arr(d(await userAPI.getDoctors()).doctors, normDoctor)); }
    catch { /* non-fatal */ } finally { setLoad('doctors', false); }
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoad('appointments', true);
    try { setAppointments(arr(d(await appointmentAPI.getAll()).appointments, normAppointment)); }
    catch { /* non-fatal */ } finally { setLoad('appointments', false); }
  }, [token]);

  const fetchBeds = useCallback(async () => {
    if (!token) return;
    setLoad('beds', true);
    try { setBeds(arr(d(await bedAPI.getAll()).beds, normBed)); }
    catch { /* non-fatal */ } finally { setLoad('beds', false); }
  }, [token]);

  const fetchLabData = useCallback(async () => {
    if (!token) return;
    setLoad('lab', true);
    try {
      const [b, r] = await Promise.all([labAPI.getBookings(), labAPI.getReports()]);
      setLabBookings(arr(d(b).bookings, normLabBooking));
      setLabReports(arr(d(r).reports, normLabReport));
    } catch { /* non-fatal */ } finally { setLoad('lab', false); }
  }, [token]);

  const fetchMedicalRecords = useCallback(async (patientId?: string) => {
    if (!token) return;
    setLoad('records', true);
    try { setMedicalRecords(arr(d(await recordAPI.getAll(patientId ? { patientId } : undefined)).records, normRecord)); }
    catch { /* non-fatal */ } finally { setLoad('records', false); }
  }, [token]);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    try { setAccessRequests(arr(d(await recordAPI.getPermissions()).permissions, normPermission)); }
    catch { /* non-fatal */ }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoad('users', true);
    try { setUsers(arr(d(await userAPI.getAllUsers()).users, normUser)); }
    catch { /* non-fatal */ } finally { setLoad('users', false); }
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;
    fetchDoctors();
    fetchAppointments();
    fetchBeds();
    fetchLabData();
    fetchMedicalRecords();
    fetchPermissions();
    if (['Admin', 'Receptionist', 'Doctor'].includes(user.role)) fetchUsers();
  }, [token, user?.id]);

  const login = async (identifier: string, password: string, role: Role): Promise<boolean> => {
    setLoad('login', true);
    try {
      const res = d(await authAPI.login({ identifier, password, role }));
      setAuthToken(res.token as string);
      setToken(res.token as string);
      const u = normUser(res.user as RawObj);
      setUser(u);
      localStorage.setItem('caresync_user', JSON.stringify(u));
      showToast('Login successful! Welcome back.', 'success');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Login failed', 'error');
      return false;
    } finally { setLoad('login', false); }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null); setToken(null);
    setAppointments([]); setBeds([]); setLabBookings([]);
    setLabReports([]); setMedicalRecords([]); setAccessRequests([]); setUsers([]);
    showToast('You have been logged out.', 'info');
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setLoad('signup', true);
    try {
      const res = d(await authAPI.signup(data));
      setAuthToken(res.token as string);
      setToken(res.token as string);
      const u = normUser(res.user as RawObj);
      setUser(u);
      localStorage.setItem('caresync_user', JSON.stringify(u));
      showToast('Account created! Welcome to CareSync.', 'success');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Signup failed', 'error');
      return false;
    } finally { setLoad('signup', false); }
  };

  const updateProfile = async (data: Partial<User> & { file?: File }) => {
    setLoad('profile', true);
    try {
      let res;
      if (data.file) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (k === 'file') fd.append('file', v as File);
          else if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
          else if (v !== undefined) fd.append(k, String(v));
        });
        res = await userAPI.updateProfile(fd);
      } else {
        res = await userAPI.updateProfile(data as Record<string, unknown>);
      }
      const u = normUser(d(res).user as RawObj);
      setUser(u);
      localStorage.setItem('caresync_user', JSON.stringify(u));
      showToast('Profile updated successfully.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally { setLoad('profile', false); }
  };

  const verifyAadhaar = async (aadhaarNumber?: string) => {
    try {
      const num = aadhaarNumber || user?.aadhaarNumber || '';
      const res = d(await authAPI.verifyAadhaar(num));
      const u = normUser(res.user as RawObj);
      setUser(u);
      localStorage.setItem('caresync_user', JSON.stringify(u));
      showToast('Aadhaar verified successfully.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Verification failed', 'error');
    }
  };

  const bookAppointment = async (data: BookAppointmentData): Promise<boolean> => {
    setLoad('bookAppointment', true);
    try {
      await appointmentAPI.book({ doctorId: data.doctorId, date: data.date, time: data.time, symptoms: data.symptoms, patientId: data.patientId });
      await fetchAppointments();
      showToast('Appointment booked successfully!', 'success');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Booking failed', 'error');
      return false;
    } finally { setLoad('bookAppointment', false); }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status'], prescription?: string) => {
    try {
      await appointmentAPI.updateStatus(id, { status, prescription });
      setAppointments(p => p.map(a => a.id === id ? { ...a, status, ...(prescription ? { prescription } : {}) } : a));
      showToast(`Appointment ${status.toLowerCase()}.`, 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Update failed', 'error'); }
  };

  const updatePrescription = async (id: string, prescription: string) => {
    try {
      await appointmentAPI.addPrescription(id, prescription);
      setAppointments(p => p.map(a => a.id === id ? { ...a, prescription, status: 'Completed' } : a));
      showToast('Prescription saved.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const assignBed = async (bedId: string, patientId: string, patientName: string) => {
    try {
      await bedAPI.assign(bedId, { patientId });
      setBeds(p => p.map(b => b.id === bedId ? { ...b, status: 'Occupied', patientId, patientName } : b));
      showToast('Bed assigned successfully.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const dischargePatient = async (bedId: string) => {
    try {
      await bedAPI.discharge(bedId);
      setBeds(p => p.map(b => b.id === bedId ? { ...b, status: 'Available', patientId: undefined, patientName: undefined } : b));
      showToast('Patient discharged.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const bookLabBooking = async (data: BookLabData): Promise<boolean> => {
    setLoad('bookLab', true);
    try {
      await labAPI.book({ testName: data.testName, date: data.date, time: data.time, paymentMethod: data.paymentMethod || 'UPI', amount: data.amount });
      await fetchLabData();
      showToast('Lab test booked!', 'success');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lab booking failed', 'error');
      return false;
    } finally { setLoad('bookLab', false); }
  };

  const payForLabBooking = async (bookingId: string, paymentMethod: string) => {
    try {
      await labAPI.pay(bookingId, paymentMethod);
      setLabBookings(p => p.map(b => b.id === bookingId ? { ...b, paymentStatus: 'Paid', paymentMethod: paymentMethod as LabBooking['paymentMethod'] } : b));
      showToast('Payment successful!', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Payment failed', 'error'); }
  };

  const updateLabBookingStatus = async (id: string, status: LabBooking['status']) => {
    try {
      await labAPI.updateBookingStatus(id, status);
      setLabBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
      showToast(`Booking marked as ${status}.`, 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const uploadLabReport = async (data: UploadLabReportData) => {
    try {
      const fd = new FormData();
      fd.append('patientId', data.patientId);
      fd.append('testName', data.testName);
      fd.append('result', data.result);
      if (data.bookingId) fd.append('bookingId', data.bookingId);
      if (data.file) fd.append('file', data.file);
      await labAPI.uploadReport(fd);
      await fetchLabData();
      showToast('Lab report uploaded.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Upload failed', 'error'); }
  };

  const uploadMedicalRecord = async (data: UploadRecordData) => {
    setLoad('uploadRecord', true);
    try {
      const fd = new FormData();
      fd.append('file', data.file);
      fd.append('reportType', data.reportType);
      fd.append('category', data.category);
      if (data.notes) fd.append('notes', data.notes);
      if (data.patientId) fd.append('patientId', data.patientId);
      await recordAPI.upload(fd);
      await fetchMedicalRecords();
      showToast('Record uploaded successfully.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally { setLoad('uploadRecord', false); }
  };

  const deleteMedicalRecord = async (id: string) => {
    try {
      await recordAPI.delete(id);
      setMedicalRecords(p => p.filter(r => r.id !== id));
      showToast('Record deleted.', 'info');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Delete failed', 'error'); }
  };

  const requestRecordAccess = async (patientId: string, reason?: string) => {
    try {
      await recordAPI.requestAccess(patientId, reason);
      await fetchPermissions();
      showToast('Access request sent.', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Request failed', 'error'); }
  };

  const respondToAccessRequest = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await recordAPI.respondToRequest(id, status);
      setAccessRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Access ${status.toLowerCase()}.`, 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const registerUser = async (data: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      await authAPI.signup({ name: data.name, email: data.email, phoneNumber: data.phoneNumber, password: data.password, role: data.role, aadhaarNumber: data.aadhaarNumber, allergies: data.allergies });
      await fetchUsers();
      showToast('User registered.', 'success');
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Registration failed', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      user, token,
      login, logout, signup, updateProfile, verifyAadhaar,
      doctors, appointments, beds, labReports, labBookings,
      medicalRecords, accessRequests, users,
      loading, toast, showToast,
      bookAppointment, updateAppointmentStatus, updatePrescription, fetchAppointments,
      assignBed, dischargePatient, fetchBeds,
      bookLabBooking, payForLabBooking, updateLabBookingStatus, uploadLabReport, fetchLabData,
      uploadMedicalRecord, deleteMedicalRecord, fetchMedicalRecords,
      requestRecordAccess, respondToAccessRequest, fetchPermissions,
      registerUser, fetchUsers, fetchDoctors,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
