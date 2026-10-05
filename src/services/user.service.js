import api from './new-api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update profile settings
    updateProfile: async (profileData) => {
        try {
            const formData = new FormData();
            
            // Log the data being sent for debugging
            console.log('Profile data being sent:', profileData);
            
            // Handle basic fields
            const basicFields = ['firstName', 'lastName', 'jobTitle', 'website', 'bio'];
            basicFields.forEach(field => {
                if (profileData[field] !== undefined) {
                    formData.append(field, profileData[field]);
                }
            });

            // Handle social media links
            if (profileData.socials) {
                Object.keys(profileData.socials).forEach(social => {
                    if (profileData.socials[social]) {
                        formData.append(`socials[${social}]`, profileData.socials[social]);
                    }
                });
            }

            // Handle photo URL
            if (profileData.photo) {
                formData.append('photoUrl', profileData.photo);
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

    // Update account settings
    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/user/settings', settingsData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
