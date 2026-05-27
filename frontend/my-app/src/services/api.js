import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:5000/api',
  timeout: 15000
});

// Automatically inject JWT token from localStorage into headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Attach token for all authenticated routes
    // Skip only login and register routes
    if (token && 
        !config.url.includes('/auth/login') && 
        !config.url.includes('/auth/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging (remove in production)
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      url: config.url,
      willAttachToken: token && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling 401 errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Clearing session...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },
  getNotifications: async () => {
    const response = await API.get('/auth/notifications');
    return response.data;
  },
  markNotificationsAsRead: async () => {
    const response = await API.put('/auth/notifications/read');
    return response.data;
  }
};

// Admin Services
export const adminService = {
  uploadStudents: async (formData) => {
    const response = await API.post('/admin/upload-students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  uploadTGs: async (formData) => {
    const response = await API.post('/admin/upload-tgs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },
  searchStudents: async (query = '') => {
    const response = await API.get(`/admin/students?query=${query}`);
    return response.data;
  },
  getAllGatePasses: async () => {
    const response = await API.get('/admin/gatepasses');
    return response.data;
  },
  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },
  // Assign TG to Student
  assignTG: async (studentId, tgId) => {
    const response = await API.post('/admin/assign-tg', { studentId, tgId });
    return response.data;
  },
  // Get all TG users
  getAllTGs: async () => {
    const response = await API.get('/admin/tgs');
    return response.data;
  },
  // Get student by ID
  getStudentById: async (studentId) => {
    const response = await API.get(`/admin/students/${studentId}`);
    return response.data;
  }
};

// Student Services
export const studentService = {
  applyGatePass: async (passData) => {
    const response = await API.post('/student/gatepass', passData);
    return response.data;
  },
  getHistory: async () => {
    const response = await API.get('/student/gatepasses');
    return response.data;
  },
  getActivePass: async () => {
    const response = await API.get('/student/active-pass');
    return response.data;
  },
  getDashboard: async () => {
    const response = await API.get('/student/dashboard');
    return response.data;
  }
};

// TG Services
export const tgService = {
  getAssignedStudents: async () => {
    const response = await API.get('/tg/students');
    return response.data;
  },
  getGatePassRequests: async () => {
    const response = await API.get('/tg/gatepasses');
    return response.data;
  },
  approveRequest: async (id, remarks) => {
    const response = await API.put(`/tg/gatepasses/${id}/approve`, { remarks });
    return response.data;
  },
  rejectRequest: async (id, remarks) => {
    const response = await API.put(`/tg/gatepasses/${id}/reject`, { remarks });
    return response.data;
  },
  getDashboard: async () => {
    const response = await API.get('/tg/dashboard');
    return response.data;
  }
};

// Warden Services
export const wardenService = {
  getGatePassRequests: async () => {
    const response = await API.get('/warden/gatepasses');
    return response.data;
  },
  finalApprove: async (id, remarks) => {
    const response = await API.put(`/warden/gatepasses/${id}/approve`, { remarks });
    return response.data;
  },
  rejectRequest: async (id, remarks) => {
    const response = await API.put(`/warden/gatepasses/${id}/reject`, { remarks });
    return response.data;
  },
  getAllApproved: async () => {
    const response = await API.get('/warden/approved');
    return response.data;
  },
  getDashboard: async () => {
    const response = await API.get('/warden/dashboard');
    return response.data;
  }
};

// Security Services
export const securityService = {
  scanQR: async (qrData) => {
    const response = await API.post('/security/scan', { qrData });
    return response.data;
  },
  logAction: async (gatePassId, action) => {
    const response = await API.post('/security/log-action', { gatePassId, action });
    return response.data;
  },
  getTodayPasses: async () => {
    const response = await API.get('/security/today-passes');
    return response.data;
  }
};

// HOD Services
export const hodService = {
  getAnalytics: async () => {
    const response = await API.get('/hod/analytics');
    return response.data;
  },
  getDashboard: async () => {
    const response = await API.get('/hod/dashboard');
    return response.data;
  }
};

export default API;