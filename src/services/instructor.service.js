import api from './api';

export const instructorService = {
    // Get instructor profile
    getProfile: async () => {
        try {
            const response = await api.get('/instructor/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update instructor profile
    updateProfile: async (profileData) => {
        try {
            const formData = new FormData();
            
            Object.keys(profileData).forEach(key => {
                if (key === 'teachingSettings') {
                    // Handle instructor specific settings
                    Object.keys(profileData.teachingSettings).forEach(setting => {
                        formData.append(`teachingSettings[${setting}]`, profileData.teachingSettings[setting]);
                    });
                } else if (key !== 'photo') {
                    formData.append(key, profileData[key]);
                }
            });

            // Append photo if exists
            if (profileData.photo instanceof File) {
                formData.append('photo', profileData.photo);
            }

            const response = await api.put('/instructor/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update instructor settings
    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/instructor/settings', settingsData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Change instructor password
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/instructor/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
