import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    try {
      const saved = localStorage.getItem('auth');
      if (saved) {
        const auth = JSON.parse(saved);
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      const path = window.location.pathname;
      if (!path.includes('-auth') && path !== '/') {
        window.location.href = path.startsWith('/owner') ? '/owner-auth' : '/user-auth';
      }
    }
    return Promise.reject(error);
  }
);

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getUserOrders: (params) => api.get('/orders/user/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const authAPI = {
  userSignup: (data) => api.post('/auth/user/signup', data),
  userLogin: (data) => api.post('/auth/user/login', data),
  ownerSignup: (data) => api.post('/auth/owner/signup', data),
  ownerLogin: (data) => api.post('/auth/owner/login', data),
  forgotPassword: (data) => api.post('/auth/user/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/user/reset-password/${token}`, data),
};

export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payment/create-payment-intent', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
};

export default api;
