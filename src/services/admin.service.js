import api from './api';

export const adminService = {
    // Get admin profile
    getProfile: async () => {
        try {
            const response = await api.get('/admin/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update admin profile
    updateProfile: async (profileData) => {
        try {
            const formData = new FormData();
            
            Object.keys(profileData).forEach(key => {
                if (key === 'adminSettings') {
                    // Handle admin specific settings
                    Object.keys(profileData.adminSettings).forEach(setting => {
                        formData.append(`adminSettings[${setting}]`, profileData.adminSettings[setting]);
                    });
                } else if (key === 'socials') {
                    // Handle socials object
                    Object.keys(profileData.socials).forEach(social => {
                        formData.append(`socials[${social}]`, profileData.socials[social] || '');
                    });
                } else if (key !== 'photo') {
                    // Handle other fields, converting null to empty string
                    formData.append(key, profileData[key] || '');
                }
            });

            // Append photo if exists
            if (profileData.photo instanceof File) {
                formData.append('photo', profileData.photo);
            }

            // Debug: Log the form data
            console.log('Profile Data received:', profileData);
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.put('/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update admin settings
    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/admin/settings', settingsData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Change admin password
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/admin/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Contact Messages Management
    getContactMessages: async (params = {}) => {
        try {
            const response = await api.get('/contact/messages', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getContactMessage: async (id) => {
        try {
            const response = await api.get(`/contact/messages/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateMessageStatus: async (id, status, adminNotes = '') => {
        try {
            const response = await api.put(`/contact/messages/${id}/status`, {
                status,
                adminNotes
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteContactMessage: async (id) => {
        try {
            const response = await api.delete(`/contact/messages/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getContactStats: async () => {
        try {
            const response = await api.get('/contact/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
