import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8001/api');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const authApi = {
  loginWithTelegram: (initData: string) => 
    api.post('/auth/telegram', { initData }),
  
  mockLogin: (telegramId: string, firstName: string, lastName?: string) => 
    api.post('/auth/mock', { telegramId, firstName, lastName }),
};

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  getDashboard: () => api.get('/users/me/dashboard'),
};

// Children
export const childrenApi = {
  getMine: () => api.get('/children'),
  getOne: (id: string) => api.get(`/children/${id}`),
  create: (data: { firstName: string; lastName?: string; birthDate?: string; groupId?: string }) => 
    api.post('/children', data),
};

// Groups
export const groupsApi = {
  getAll: () => api.get('/groups'),
  getOne: (id: string) => api.get(`/groups/${id}`),
};

// Locations
export const locationsApi = {
  getAll: () => api.get('/locations'),
  getOne: (id: string) => api.get(`/locations/${id}`),
};

// Schedule
export const scheduleApi = {
  get: (params?: { groupId?: string; from?: string; to?: string }) => 
    api.get('/schedule', { params }),
};

// Attendance
export const attendanceApi = {
  getChildAttendance: (childId: string) => api.get(`/attendance/child/${childId}`),
  reportAbsence: (data: { childId: string; scheduleId: string; date: string; reason?: string }) =>
    api.post('/attendance/report-absence', data),
  mark: (data: { childId: string; scheduleId: string; date: string; status: string; comment?: string }) =>
    api.post('/attendance/mark', data),
};

// Content
export const contentApi = {
  getFeed: () => api.get('/content/feed'),
  create: (data: { title: string; body?: string; type: string; visibility: string }) =>
    api.post('/content', data),
};

// Payments
export const paymentsApi = {
  list: () => api.get('/payments'),
  confirm: (data: { paymentId: string; proofUrl?: string }) =>
    api.post('/payments/confirm', data),
};

// Notifications
export const notificationsApi = {
  getMine: () => api.get('/notifications'),
  markRead: (notificationId: string) =>
    api.post('/notifications/read', { notificationId }),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getPayments: () => api.get('/admin/payments'),
};
