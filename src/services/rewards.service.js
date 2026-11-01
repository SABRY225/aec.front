import api from './new-api';

// ==========================================
// USER REWARDS SERVICE (Student & Instructor)
// ==========================================
export const userRewardsService = {
  getMyRewards: async () => {
    const response = await api.get('/rewards/my-rewards');
    return response.data;
  },

  getMyTransactions: async (page = 1, limit = 20) => {
    const response = await api.get(`/rewards/my-transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  previewDiscount: async (points, subtotal = 0) => {
    const response = await api.get(`/rewards/preview-discount?points=${points}&subtotal=${subtotal}`);
    return response.data;
  },
};

// ==========================================
// ADMIN REWARDS SERVICE (Dashboard Management)
// ==========================================
export const adminRewardsService = {
  getSettings: async () => {
    const response = await api.get('/admin/rewards/settings');
    return response.data;
  },

  updateSettings: async (payload) => {
    const response = await api.put('/admin/rewards/settings', payload);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/rewards/stats');
    return response.data;
  },

  getAllTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/rewards/transactions?${query}`);
    return response.data;
  },

  adjustPointsManually: async ({ userId, points, reason, type = 'credit' }) => {
    const response = await api.post('/admin/rewards/manual-adjust', {
      userId,
      points,
      reason,
      type,
    });
    return response.data;
  },
};
