/**
 * CareSync — Central API Service
 * All backend communication goes through this file.
 * Base URL is read from VITE_API_URL env var (falls back to localhost:5000).
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  pagination: { page: number; limit: number; total: number; pages: number };
  [key: string]: unknown;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach JWT ────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('caresync_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — normalise errors ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: unknown[] }>) => {
    // Token expired → force logout
    if (error.response?.status === 401) {
      localStorage.removeItem('caresync_token');
      localStorage.removeItem('caresync_user');
      // Only redirect when not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }

    // Surface a friendly message from the backend or a generic fallback
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (!error.response ? 'Network error. Please check your connection.' : null) ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

// ─── Token helpers ────────────────────────────────────────────────────────────

export const setAuthToken = (token: string) => localStorage.setItem('caresync_token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('caresync_token');
  localStorage.removeItem('caresync_user');
};
export const getStoredUser = () => {
  try {
    const s = localStorage.getItem('caresync_user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  signup: (data: {
    name: string;
    email?: string;
    phoneNumber: string;
    password: string;
    role: string;
    aadhaarNumber?: string;
    age?: number;
    gender?: string;
    allergies?: string[];
    specialization?: string;
    experience?: string;
    availability?: string[];
    bio?: string;
  }) => api.post('/auth/signup', data),

  login: (data: { identifier: string; password: string; role: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  verifyAadhaar: (aadhaarNumber: string) =>
    api.post('/auth/verify-aadhaar', { aadhaarNumber }),
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const userAPI = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: FormData | Record<string, unknown>) => {
    if (data instanceof FormData) {
      return api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put('/users/profile', data);
  },

  getDoctors: (params?: { specialization?: string; search?: string }) =>
    api.get('/users/doctors', { params }),

  getPatients: (params?: { search?: string }) =>
    api.get('/users/patients', { params }),

  getAllUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),

  getUserById: (id: string) => api.get(`/users/${id}`),

  deactivateUser: (id: string) => api.put(`/users/${id}/deactivate`),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

export const appointmentAPI = {
  book: (data: {
    doctorId: string;
    date: string;
    time: string;
    symptoms: string;
    patientId?: string; // Receptionist booking on behalf of patient
  }) => api.post('/appointments', data),

  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/appointments', { params }),

  getById: (id: string) => api.get(`/appointments/${id}`),

  updateStatus: (id: string, data: { status: string; prescription?: string; notes?: string }) =>
    api.patch(`/appointments/${id}/status`, data),

  addPrescription: (id: string, prescription: string) =>
    api.patch(`/appointments/${id}/prescription`, { prescription }),

  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// ─── LAB ──────────────────────────────────────────────────────────────────────

export const labAPI = {
  getTests: () => api.get('/lab/tests'),

  book: (data: {
    testName: string;
    date: string;
    time: string;
    paymentMethod: string;
    amount?: number;
  }) => api.post('/lab/book', data),

  pay: (bookingId: string, paymentMethod: string) =>
    api.post(`/lab/bookings/${bookingId}/pay`, { paymentMethod }),

  getBookings: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/lab/bookings', { params }),

  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/lab/bookings/${id}/status`, { status }),

  uploadReport: (formData: FormData) =>
    api.post('/lab/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getReports: (params?: { patientId?: string }) =>
    api.get('/lab/reports', { params }),
};

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────

export const recordAPI = {
  upload: (formData: FormData) =>
    api.post('/records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAll: (params?: { patientId?: string; category?: string }) =>
    api.get('/records', { params }),

  delete: (id: string) => api.delete(`/records/${id}`),

  // Permission system
  requestAccess: (patientId: string, reason?: string) =>
    api.post('/records/permissions/request', { patientId, reason }),

  getPermissions: (params?: { status?: string }) =>
    api.get('/records/permissions', { params }),

  respondToRequest: (permissionId: string, status: 'Approved' | 'Rejected') =>
    api.patch(`/records/permissions/${permissionId}/respond`, { status }),
};

// ─── BEDS ─────────────────────────────────────────────────────────────────────

export const bedAPI = {
  getAll: (params?: { status?: string; type?: string }) =>
    api.get('/beds', { params }),

  create: (data: { number: string; type: string; ward?: string }) =>
    api.post('/beds', data),

  assign: (bedId: string, data: { patientId: string; status?: string }) =>
    api.patch(`/beds/${bedId}/assign`, data),

  discharge: (bedId: string) => api.patch(`/beds/${bedId}/discharge`),

  update: (bedId: string, data: Record<string, unknown>) =>
    api.patch(`/beds/${bedId}`, data),

  delete: (bedId: string) => api.delete(`/beds/${bedId}`),
};

// ─── SOS ─────────────────────────────────────────────────────────────────────

export const sosAPI = {
  trigger: (data: { lat?: number | null; lng?: number | null; address?: string }) =>
    api.post('/sos/trigger', data),

  getAlerts: (params?: { status?: string }) =>
    api.get('/sos', { params }),

  resolve: (alertId: string) => api.patch(`/sos/${alertId}/resolve`),
};

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────

export const aiAPI = {
  chat: (message: string, history: Array<{ role: string; content: string }> = []) =>
    api.post('/ai/chat', { message, history }),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
};

export default api;
