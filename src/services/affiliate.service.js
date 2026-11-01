import axios from 'axios';
import api from './new-api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ==========================================
// AFFILIATE PORTAL CLIENT (Marketer Login)
// ==========================================
const affiliateApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

affiliateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('affiliateToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const affiliatePortalService = {
  login: async (email, password) => {
    const response = await affiliateApi.post('/affiliates/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('affiliateToken', response.data.token);
      localStorage.setItem('affiliateData', JSON.stringify(response.data.affiliate));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('affiliateToken');
    localStorage.removeItem('affiliateData');
  },

  getStoredAffiliate: () => {
    try {
      const data = localStorage.getItem('affiliateData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getProfile: async () => {
    const response = await affiliateApi.get('/affiliates/portal/me');
    if (response.data?.data) {
      localStorage.setItem('affiliateData', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  updateProfile: async (payload) => {
    const response = await affiliateApi.put('/affiliates/portal/me', payload);
    if (response.data?.data) {
      localStorage.setItem('affiliateData', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  getMyConversions: async (page = 1, limit = 20) => {
    const response = await affiliateApi.get(`/affiliates/portal/conversions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getMyPayouts: async () => {
    const response = await affiliateApi.get('/affiliates/portal/payouts');
    return response.data;
  },

  requestPayout: async ({ amount, requestNotes, bankDetails }) => {
    const response = await affiliateApi.post('/affiliates/portal/payouts', {
      amount,
      requestNotes,
      bankDetails,
    });
    return response.data;
  },
};

// ==========================================
// ADMIN AFFILIATE SERVICE (Admin Dashboard)
// ==========================================
export const adminAffiliateService = {
  getStats: async () => {
    const response = await api.get('/admin/affiliates/stats');
    return response.data;
  },

  getAllAffiliates: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/affiliates?${query}`);
    return response.data;
  },

  getAffiliateById: async (id) => {
    const response = await api.get(`/admin/affiliates/${id}`);
    return response.data;
  },

  createAffiliate: async (payload) => {
    const response = await api.post('/admin/affiliates', payload);
    return response.data;
  },

  updateAffiliate: async (id, payload) => {
    const response = await api.put(`/admin/affiliates/${id}`, payload);
    return response.data;
  },

  deleteAffiliate: async (id) => {
    const response = await api.delete(`/admin/affiliates/${id}`);
    return response.data;
  },

  getAllConversions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/affiliates/conversions/all?${query}`);
    return response.data;
  },

  getAllPayouts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/affiliates/payouts/all?${query}`);
    return response.data;
  },

  processPayout: async (id, { action, adminNotes, transactionRef }) => {
    const response = await api.post(`/admin/affiliates/payouts/${id}/process`, {
      action,
      adminNotes,
      transactionRef,
    });
    return response.data;
  },
};
