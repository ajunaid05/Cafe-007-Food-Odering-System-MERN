import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getUserOrders: (params) => api.get('/orders/user/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Auth API
export const authAPI = {
  userSignup: (data) => api.post('/auth/user/signup', data),
  userLogin: (data) => api.post('/auth/user/login', data),
  ownerSignup: (data) => api.post('/auth/owner/signup', data),
  ownerLogin: (data) => api.post('/auth/owner/login', data),
  forgotPassword: (data) => api.post('/auth/user/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/user/reset-password/${token}`, data),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payment/create-payment-intent', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
};

export default api;

