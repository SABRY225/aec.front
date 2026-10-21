import axios from 'axios';
// Cache bust: 1
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },                                              
    withCredentials: true 
});

// Token management
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

// Export function to get current token (for debugging)
export const getCurrentToken = () => accessToken;

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

const refreshAccessToken = async (skipRedirect = false) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            withCredentials: true
        });
        const { accessToken: newToken } = response.data;
        accessToken = newToken;
        return newToken;
    } catch (error) {
        accessToken = null;
        // Only redirect if not in initialization phase
        // Don't use window.location.href as it causes full page reload
        // The React Router will handle redirects through the auth context
        throw error;
    }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            // If no token and this is a protected route, show a helpful error
            const protectedRoutes = ['/advertisements', '/admin', '/instructor', '/user/profile'];
            const isProtectedRoute = protectedRoutes.some(route => config.url.includes(route));
            if (isProtectedRoute) {
                console.warn('No access token available for protected route:', config.url);
                console.warn('User may need to log in again');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        
        if (response.data.requires2FA) {
            return response.data;
        }

        const { accessToken: newAccessToken, user } = response.data;
        
        // Store access token in memory
        accessToken = newAccessToken;
        
        // Store user data in localStorage (non-sensitive data only)
        localStorage.setItem('userData', JSON.stringify(user));
        
        return { accessToken: newAccessToken, user };
    },

    verifyAdminLogin: async (credentials) => {
        const response = await api.post('/auth/verify-admin-login', credentials);
        const { accessToken: newAccessToken, user } = response.data;
        
        accessToken = newAccessToken;
        localStorage.setItem('userData', JSON.stringify(user));
        
        return { accessToken: newAccessToken, user };
    },

    logout: async () => {
        try {
            // Call logout endpoint to invalidate refresh token
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local data regardless of API call success
            accessToken = null;
            localStorage.removeItem('userData');
        }
    },

    refreshToken: async () => {
        return await refreshAccessToken();
    },

    verifyToken: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    },

    // Initialize token from refresh token on app start
    initializeAuth: async () => {
        try {
            const newToken = await refreshAccessToken(true); // Skip redirect during initialization
            return newToken;
        } catch (error) {
            console.log('No valid refresh token found');
            return null;
        }
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyCode: async (email, code) => {
        const response = await api.post('/auth/verify-code', { email, code });
        return response.data;
    },

    resetPassword: async (email, newPassword, confirmPassword) => {
        const response = await api.post('/auth/reset-password', {
            email,
            newPassword,
            confirmPassword
        });
        return response.data;
    }
};

// Course services
export const courseService = {
    getAllCourses: async (params = {}) => {
        const response = await api.get('/courses', { params });
        return response.data;
    },

    getCourseById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    getCourseStudyData: async (id) => {
        const response = await api.get(`/courses/${id}/study`);
        return response.data;
    },

    createCourse: async (courseData) => {
        const formData = new FormData();

        // Append basic fields
        const basicFields = ['title', 'description', 'price', 'category'];
        basicFields.forEach(field => {
            if (courseData[field] !== undefined) {
                formData.append(field, courseData[field]);
            }
        });

        // Append files
        if (courseData.thumbnail instanceof File) {
            formData.append('thumbnail', courseData.thumbnail);
        }
        
        if (courseData.resources) {
            courseData.resources.forEach(file => {
                formData.append('resources', file);
            });
        }

        const response = await api.post('/courses', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCourse: async (id, courseData) => {
        const formData = new FormData();
        Object.keys(courseData).forEach(key => {
            if (key === 'resources' && Array.isArray(courseData[key])) {
                courseData[key].forEach(file => {
                    formData.append('resources', file);
                });
            } else if (key === 'thumbnail' && courseData[key] instanceof File) {
                formData.append('thumbnail', courseData[key]);
            } else {
                formData.append(key, courseData[key]);
            }
        });

        const response = await api.put(`/courses/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteCourse: async (id) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },

    getTopRunningCourses: async (params = {}) => {
        const response = await api.get('/courses/top/running', { params });
        return response.data;
    },

    getFeaturedCourses: async (params = {}) => {
        const response = await api.get('/courses/featured', { params });
        return response.data;
    },

    rateCourse: async (courseId, rating, review) => {
        const response = await api.post(`/courses/${courseId}/rate`, {
            rating,
            review
        });
        return response.data;
    }
};

// Instructor services
export const instructorService = {
    getInstructorCourses: async (params = {}) => {
        const response = await api.get('/instructor/course/courses', { params });
        return response.data;
    },

    getAccountSettings: async () => {
        const response = await api.get('/instructor/course/account-settings');
        return response.data;
    },

    updateAccountSettings: async (settingsData) => {
        const response = await api.put('/instructor/course/account-settings', settingsData);
        return response.data;
    },

    getMyApplication: async () => {
        const response = await api.get('/instructor/my-application');
        return response.data;
    },

    applyToBeInstructor: async (applicationData) => {
        const formData = new FormData();

        // Handle basic fields
        const basicFields = [
            'firstName', 'middleName', 'lastName', 'age', 'gender',
            'maritalStatus', 'email', 'phone', 'nationality',
            'universityDegree', 'place', 'category', 'subCategory'
        ];

        basicFields.forEach(field => {
            if (applicationData[field] !== undefined) {
                formData.append(field, applicationData[field]);
            }
        });

        // Handle files and URLs
        const files = ['cv', 'certificate', 'video', 'photo'];
        files.forEach(file => {
            if (applicationData[file]) {
                if (applicationData[file] instanceof File) {
                    formData.append(file, applicationData[file]);
                } else if (typeof applicationData[file] === 'string') {
                    formData.append(file, applicationData[file]); // Append URL directly
                }
            }
        });
        console.log('Submitting instructor application with data:', applicationData);
        const response = await api.post('/instructor/apply', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    createCourse: async (courseData) => {
        const formData = new FormData();

        // Handle basic fields
        const basicFields = [
            'title', 'description', 'category', 'subCategory',
            'topic', 'language', 'subtitleLanguage', 'courseLevel', 'courseType', 
            'location', 'address', 'duration', 'price', 'originalPrice', 'brochure',
            'governorate', 'mapsUrl', 'maxCapacity', 'sessionStartTime', 'sessionEndTime',
            'additionalInstructions', 'onlinePlatform', 'meetingLink', 'meetingJoinInfo',
        ];

        basicFields.forEach(field => {
            // Special handling for brochure - always send it if defined (even if empty string to allow clearing)
            if (field === 'brochure') {
                if (courseData[field] !== undefined) {
                    formData.append(field, courseData[field] || '');
                    console.log('Appending brochure to FormData (createCourse):', courseData[field], 'Type:', typeof courseData[field]);
                }
            } else if (courseData[field] !== undefined && courseData[field] !== null && courseData[field] !== '') {
                formData.append(field, courseData[field]);
            }
        });

        if (Array.isArray(courseData.scheduleDays) && courseData.scheduleDays.length > 0) {
            formData.append('scheduleDays', JSON.stringify(courseData.scheduleDays));
        }

        // Handle topics array separately (FormData needs special handling for arrays)
        if (courseData.topics && Array.isArray(courseData.topics) && courseData.topics.length > 0) {
            // Send as JSON string to ensure proper parsing on backend
            formData.append('topics', JSON.stringify(courseData.topics));
        }

        // Only include startDate and endDate if courseType is not 'recorded'
        if (courseData.courseType !== 'recorded') {
            if (courseData.startDate !== undefined && courseData.startDate !== null && courseData.startDate !== '') {
                formData.append('startDate', courseData.startDate);
            }
            if (courseData.endDate !== undefined && courseData.endDate !== null && courseData.endDate !== '') {
                formData.append('endDate', courseData.endDate);
            }
        }

        // Handle files
        if (courseData.thumbnail instanceof File) {
            formData.append('thumbnail', courseData.thumbnail);
        }
        if (courseData.trailer instanceof File) {
            formData.append('trailer', courseData.trailer);
        }

        const response = await api.post('/instructor/course/courses', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCourseBasic: async (courseId, basicData) => {
        const formData = new FormData();
        
        // Handle basic fields - ONLY basic info, DO NOT include advanced fields
        const basicFields = [
            'title', 'description', 'category', 'subCategory',
            'topic', 'language', 'subtitleLanguage', 'courseLevel', 'courseType',
            'location', 'address', 'duration', 'price', 'originalPrice', 'brochure',
            'governorate', 'mapsUrl', 'maxCapacity', 'sessionStartTime', 'sessionEndTime',
            'additionalInstructions', 'onlinePlatform', 'meetingLink', 'meetingJoinInfo',
        ];
        
        basicFields.forEach(field => {
            // Skip brochure - it will be handled separately below
            if (field === 'brochure') {
                return;
            }
            if (basicData[field] !== undefined && basicData[field] !== null && basicData[field] !== '') {
                formData.append(field, basicData[field]);
            }
        });

        if (Array.isArray(basicData.scheduleDays)) {
            formData.append('scheduleDays', JSON.stringify(basicData.scheduleDays));
        }

        // Handle topics array separately (FormData needs special handling for arrays)
        if (basicData.topics && Array.isArray(basicData.topics) && basicData.topics.length > 0) {
            // Send as JSON string to ensure proper parsing on backend
            formData.append('topics', JSON.stringify(basicData.topics));
        }

        // Only include startDate and endDate if courseType is not 'recorded'
        if (basicData.courseType !== 'recorded') {
            if (basicData.startDate !== undefined && basicData.startDate !== null && basicData.startDate !== '') {
                // Ensure date is in YYYY-MM-DD format
                let startDateValue = basicData.startDate;
                if (startDateValue instanceof Date) {
                    startDateValue = startDateValue.toISOString().split('T')[0];
                } else if (typeof startDateValue === 'string') {
                    // If it's not already in YYYY-MM-DD format, try to convert it
                    const dateMatch = startDateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (!dateMatch) {
                        // Try to parse other formats
                        const parsedDate = new Date(startDateValue);
                        if (!isNaN(parsedDate.getTime())) {
                            startDateValue = parsedDate.toISOString().split('T')[0];
                        }
                    }
                }
                console.log('Sending startDate:', startDateValue);
                formData.append('startDate', startDateValue);
            }
            if (basicData.endDate !== undefined && basicData.endDate !== null && basicData.endDate !== '') {
                // Ensure date is in YYYY-MM-DD format
                let endDateValue = basicData.endDate;
                if (endDateValue instanceof Date) {
                    endDateValue = endDateValue.toISOString().split('T')[0];
                } else if (typeof endDateValue === 'string') {
                    // If it's not already in YYYY-MM-DD format, try to convert it
                    const dateMatch = endDateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (!dateMatch) {
                        // Try to parse other formats
                        const parsedDate = new Date(endDateValue);
                        if (!isNaN(parsedDate.getTime())) {
                            endDateValue = parsedDate.toISOString().split('T')[0];
                        }
                    }
                }
                console.log('Sending endDate:', endDateValue);
                formData.append('endDate', endDateValue);
            }
        } else {
            // For recorded courses, explicitly set dates to empty/null to clear them
            formData.append('startDate', '');
            formData.append('endDate', '');
        }
        
        // Handle brochure file upload (if it's a File object) or URL string
        // Note: FileUpload component already uploads and returns URL, so brochure will be a string
        if (basicData.brochure) {
            if (basicData.brochure instanceof File) {
                formData.append('brochure', basicData.brochure);
                console.log('Sending brochure as file');
            } else if (typeof basicData.brochure === 'string' && basicData.brochure.trim()) {
                formData.append('brochure', basicData.brochure.trim());
                console.log('Sending brochure as URL:', basicData.brochure.trim());
            }
        }
        
        // DO NOT send thumbnail or trailer when updating basic info
        // They should only be sent when updating advanced info
        // This prevents accidentally clearing advanced info fields
        
        const response = await api.put(`/instructor/course/courses/${courseId}/advanced`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCourseAdvanced: async (courseId, advancedData) => {
        const formData = new FormData();
        
        // Handle advanced fields
        if (advancedData.whatYouWillLearn) {
            formData.append('whatYouWillLearn', JSON.stringify(advancedData.whatYouWillLearn));
        }
        
        // Handle files - can be File objects or URL strings
        if (advancedData.thumbnail instanceof File) {
            formData.append('thumbnail', advancedData.thumbnail);
        } else if (advancedData.thumbnail && typeof advancedData.thumbnail === 'string') {
            formData.append('thumbnail', advancedData.thumbnail);
        }
        
        if (advancedData.trailer instanceof File) {
            formData.append('trailer', advancedData.trailer);
        } else if (advancedData.trailer && typeof advancedData.trailer === 'string') {
            formData.append('trailer', advancedData.trailer);
        }
        
        const response = await api.put(`/instructor/course/courses/${courseId}/advanced`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCourseSections: async (courseId, sectionData) => {
        const formData = new FormData();

        // Handle sections array - convert to JSON string for complex nested structure
        formData.append('sections', JSON.stringify(sectionData.sections));

        // Handle files
        if (sectionData.video instanceof File) {
            formData.append('video', sectionData.video);
        }
        if (sectionData.files) {
            sectionData.files.forEach(file => {
                formData.append('files', file);
            });
        }

        const response = await api.put(`/instructor/course/courses/${courseId}/sections`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCourseAdditionalFiles: async (courseId, filesData) => {
        // Send as JSON since we're not uploading files, just updating the file metadata
        const response = await api.put(`/instructor/course/courses/${courseId}/additional-files`, {
            additionalFiles: filesData.additionalFiles || []
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    submitCourseForReview: async (courseId) => {
        const response = await api.post(`/instructor/course/courses/${courseId}/submit`);
        return response.data;
    },

    getCourseById: async (courseId) => {
        const response = await api.get(`/instructor/course/courses/${courseId}`);
        return response.data;
    },

    deleteCourse: async (courseId) => {
        const response = await api.delete(`/instructor/course/courses/${courseId}`);
        return response.data;
    }
};

// Course Content services
export const courseContentService = {
    watchCourse: async (courseId) => {
        const response = await api.get(`/course-content/${courseId}/watch`);
        return response.data;
    },

    getQuiz: async (courseId, sectionId, assignmentId) => {
        const response = await api.get(`/course-content/${courseId}/quiz`, {
            params: { sectionId, assignmentId }
        });
        return response.data;
    },

    submitQuiz: async (courseId, quizData) => {
        const response = await api.post(`/course-content/${courseId}/quiz`, quizData);
        return response.data;
    },

    getFinalExam: async (courseId) => {
        const response = await api.get(`/course-content/${courseId}/final-exam`);
        return response.data;
    },

    submitFinalExam: async (courseId, examData) => {
        const response = await api.post(`/course-content/${courseId}/final-exam`, examData);
        return response.data;
    },

    markLectureComplete: async (courseId, lectureId) => {
        const response = await api.post(`/course-content/${courseId}/lecture/complete`, { lectureId });
        return response.data;
    },

    submitAssignment: async (courseId, assignmentId, answers) => {
        const response = await api.post(`/course-content/${courseId}/assignment/submit`, { assignmentId, answers });
        return response.data;
    }
};

// Enrollment services
export const enrollmentService = {
    getMyCourses: async () => {
        const response = await api.get('/enrollment/my-courses');
        return response.data;
    },

    getEnrollmentStatus: async (courseId) => {
        const response = await api.get(`/enrollment/status/${courseId}`);
        return response.data;
    },

    createEnrollment: async (courseId) => {
        const response = await api.post('/enrollment/create', { courseId });
        return response.data;
    },

    generateQRCode: async (courseId) => {
        const response = await api.get(`/enrollment/qr-code/${courseId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    downloadEnrollmentPDF: async (courseId) => {
        const response = await api.get(`/enrollment/pdf/${courseId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    verifyBySerial: async (serial) => {
        const response = await api.get(`/enrollment/verify/${encodeURIComponent(serial)}`);
        return response.data;
    },

    checkInStudent: async (courseId, checkInCode) => {
        const response = await api.post(`/enrollment/check-in/${courseId}`, { checkInCode });
        return response.data;
    },

    checkInBySerial: async (serial) => {
        const response = await api.post('/enrollment/checkin-by-serial', { serial });
        return response.data;
    },

    getCheckInStatus: async (courseId) => {
        const response = await api.get(`/enrollment/check-in-status/${courseId}`);
        return response.data;
    }
};

// Dashboard services
let _instructorDashboardCache = null;
let _instructorDashboardCacheTime = 0;
const DASHBOARD_CACHE_TTL = 30 * 1000; // 30 seconds

export const dashboardService = {
    getStudentDashboard: async (params = {}) => {
        const response = await api.get('/student/dashboard', { params });
        return response.data;
    },

    getInstructorDashboard: async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && _instructorDashboardCache && (now - _instructorDashboardCacheTime < DASHBOARD_CACHE_TTL)) {
            return _instructorDashboardCache;
        }
        const response = await api.get('/instructor/dashboard');
        _instructorDashboardCache = response.data;
        _instructorDashboardCacheTime = now;
        return response.data;
    }
};

// File Upload service
export const uploadService = {
    uploadFile: async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
            formData.append('folder', folder);
        }

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

// Certificate service
export const certificateService = {
    generateCertificate: async (courseId) => {
        const response = await api.get(`/certificate/${courseId}`);
        return response.data;
    }
};

// Admin services
export const adminService = {
    getDashboardStats: async (params = {}) => {
        const response = await api.get('/admin/dashboard', { params });
        return response.data;
    },

    getPageAnalytics: async (params = {}) => {
        const response = await api.get('/admin/page-analytics', { params });
        return response.data;
    },

    getActiveSessions: async (params = {}) => {
        const response = await api.get('/admin/active-sessions', { params });
        return response.data;
    },

    updateAdminSettings: async (settingsData) => {
        const response = await api.put('/admin/settings', settingsData);
        return response.data;
    },

    getBackups: async () => {
        const response = await api.get('/admin/backups');
        return response.data;
    },

    createBackup: async () => {
        const response = await api.post('/admin/backups');
        return response.data;
    },

    deleteBackup: async (id) => {
        const response = await api.delete(`/admin/backups/${id}`);
        return response.data;
    },

    getSystemLogs: async (params = {}) => {
        const response = await api.get('/admin/system-logs', { params });
        return response.data;
    },

    getReports: async () => {
        const response = await api.get('/admin/reports');
        return response.data;
    },

    getPendingInstructorApplications: async () => {
        const response = await api.get('/instructor/admin/pending');
        return {
            applications: response.data || [],
            ...response
        };
    },

    reviewInstructorApplication: async (applicationId, reviewData) => {
        const response = await api.put(`/instructor/admin/${applicationId}`, reviewData);
        return response.data;
    },

    getPendingCourses: async (params = {}) => {
        const response = await api.get('/admin/courses/pending', { params });
        return response.data;
    },

    getAllCourses: async (params = {}) => {
        const response = await api.get('/admin/courses', { params });
        return response.data;
    },

    deleteCourse: async (courseId) => {
        const response = await api.delete(`/admin/courses/${courseId}`);
        return response.data;
    },

    updateCourseStatus: async (courseId, statusData) => {
        const response = await api.put(`/admin/courses/${courseId}/status`, statusData);
        return response.data;
    },

    reviewCourse: async (courseId, reviewData) => {
        const response = await api.put(`/instructor/course/admin/courses/${courseId}`, reviewData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/admin/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/admin/profile', profileData);
        return response.data;
    },

    toggleCourseFeatured: async (courseId) => {
        const response = await api.put(`/admin/courses/${courseId}/featured`);
        return response.data;
    },

    getCourseDetails: async (courseId) => {
        const response = await api.get(`/admin/courses/${courseId}/details`);
        return response.data;
    },

    updateCourseDetails: async (courseId, courseData) => {
        const response = await api.put(`/admin/courses/${courseId}/details`, courseData);
        return response.data;
    },

    searchUsers: async (q, limit = 10) => {
        const response = await api.get('/admin/search/users', { params: { q, limit } });
        return response.data;
    },

    searchCourses: async (q, limit = 10) => {
        const response = await api.get('/admin/search/courses', { params: { q, limit } });
        return response.data;
    },

    manualEnrollUserToCourse: async ({ userId, courseId, reason } = {}) => {
        const response = await api.post('/admin/enrollments/manual', { userId, courseId, reason });
        return response.data;
    },

    getManualEnrollmentLogs: async () => {
        const response = await api.get('/admin/enrollments/manual/logs');
        return response.data;
    },

    getEnrollmentLogs: async (params = {}) => {
        const response = await api.get('/admin/enrollments/logs', { params });
        return response.data;
    },

    getManagedEnrollments: async (params = {}) => {
        const response = await api.get('/admin/enrollments/managed', { params });
        return response.data;
    },

    updateEnrollmentManagement: async (id, data) => {
        const response = await api.patch(`/admin/enrollments/${id}/management`, data);
        return response.data;
    },

    // Student management services
    getStudents: async (params = {}) => {
        const response = await api.get('/admin/students', { params });
        return response.data;
    },

    getStudentDetails: async (studentId) => {
        const response = await api.get(`/admin/students/${studentId}`);
        return response.data;
    },

    deleteStudent: async (studentId) => {
        const response = await api.delete(`/admin/students/${studentId}`);
        return response.data;
    },

    changeStudentPassword: async (studentId, newPassword) => {
        const response = await api.put(`/admin/students/${studentId}/password`, { newPassword });
        return response.data;
    },

    getCourseEnrollmentCount: async (courseId) => {
        const response = await api.get(`/courses/${courseId}/enrollment-count`);
        return response.data;
    },

    // Payment management services
    getPayments: async (params = {}) => {
        const response = await api.get('/admin/payments', { params });
        return response.data;
    },

    getPaymentDetails: async (paymentId) => {
        const response = await api.get(`/admin/payments/${paymentId}`);
        return response.data;
    },

    updatePayment: async (paymentId, updateData) => {
        const response = await api.put(`/admin/payments/${paymentId}`, updateData);
        return response.data;
    },

    deletePayment: async (paymentId) => {
        const response = await api.delete(`/admin/payments/${paymentId}`);
        return response.data;
    },

    deleteEnrollment: async (enrollmentId) => {
        const response = await api.delete(`/admin/enrollments/${enrollmentId}`);
        return response.data;
    },

    // Staff & Roles Management
    getAllStaff: async (params = {}) => {
        const response = await api.get('/admin/staff', { params });
        return response.data;
    },

    createStaff: async (staffData) => {
        const response = await api.post('/admin/staff', staffData);
        return response.data;
    },

    updateStaff: async (staffId, staffData) => {
        const response = await api.put(`/admin/staff/${staffId}`, staffData);
        return response.data;
    },

    toggleStaffStatus: async (staffId) => {
        const response = await api.patch(`/admin/staff/${staffId}/status`);
        return response.data;
    },

    deleteStaff: async (staffId) => {
        const response = await api.delete(`/admin/staff/${staffId}`);
        return response.data;
    },

    toggleInstructorVerification: async (instructorId) => {
        const response = await api.patch(`/admin/instructors/${instructorId}/verification`);
        return response.data;
    },

    updateInstructor: async (instructorId, instructorData) => {
        const response = await api.put(`/admin/instructors/${instructorId}`, instructorData);
        return response.data;
    },

    deleteInstructor: async (instructorId) => {
        const response = await api.delete(`/admin/instructors/${instructorId}`);
        return response.data;
    },

    sendBroadcastNotification: async (data) => {
        const response = await api.post('/admin/notifications/broadcast', data);
        return response.data;
    }
};

// User services & notifications
export const userService = {
    getUsers: async (params = {}) => {
        const response = await api.get('/user', { params });
        return {
            users: response.data || [],
            ...response
        };
    },
    
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    getInstructorPublicProfile: async (id, params = {}) => {
        const response = await api.get(`/user/instructor/${id}`, { params });
        return response.data;
    },

    addInstructorReview: async (id, reviewData) => {
        const response = await api.post(`/user/instructor/${id}/reviews`, reviewData);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const formData = new FormData();
        
        // Handle basic fields - only send non-empty values
        const basicFields = ['firstName', 'lastName', 'jobTitle', 'phone', 'website', 'bio', 'country', 'city'];
        basicFields.forEach(field => {
            if (profileData[field] !== undefined && profileData[field] !== null && profileData[field] !== '') {
                formData.append(field, profileData[field]);
            }
        });

        // Handle social media links - only send non-empty values
        if (profileData.socials) {
            const filteredSocials = {};
            Object.keys(profileData.socials).forEach(key => {
                if (profileData.socials[key] && profileData.socials[key].trim() !== '') {
                    filteredSocials[key] = profileData.socials[key];
                }
            });
            
            // Only send socials if there are non-empty values
            if (Object.keys(filteredSocials).length > 0) {
                formData.append('socials', JSON.stringify(filteredSocials));
            }
        }

        // Handle photo
        if (profileData.photo instanceof File) {
            formData.append('photo', profileData.photo);
        } else if (typeof profileData.photo === 'string') {
            formData.append('photoUrl', profileData.photo);
        }

        try {
            const response = await api.put('/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    updateSettings: async (settingsData) => {
        const response = await api.put('/user/settings', settingsData);
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const payload = (typeof currentPassword === 'object' && currentPassword !== null)
            ? currentPassword
            : { currentPassword, newPassword };
        const response = await api.put('/user/change-password', payload);
        return response.data;
    },

    // Notifications
    getMyNotifications: async () => {
        const response = await api.get('/user/notifications');
        return response.data;
    },
    markNotificationAsRead: async (id) => {
        const response = await api.put(`/user/notifications/${id}/read`);
        return response.data;
    },
    deleteNotification: async (id) => {
        const response = await api.delete(`/user/notifications/${id}`);
        return response.data;
    }
};

// Payment services
export const paymentService = {
    createCheckoutSession: async (courseIds, couponCode = null, paymentMethod = 'paymob', lang ) => {
        const payload = { courseIds, paymentMethod, lang };
        if (couponCode) {   
            payload.couponCode = couponCode;
        }
        
        let endpoint = '/payment/create-checkout-session';
        if (paymentMethod === 'tabby') {
            endpoint = '/payment/create-tabby-checkout-session';
        } else if (paymentMethod === 'tamara') {
            endpoint = '/payment/create-tamara-checkout-session';
        }
        
        const response = await api.post(endpoint, payload);
        return response.data;
    },

    verifyPayment: async (orderId) => {
        const response = await api.get(`/payment/verify/${orderId}`);
        return response.data;
    },
    
    verifyTabbyPayment: async (paymentId) => {
        const response = await api.get(`/payment/verify-tabby/${paymentId}`);
        return response.data;
    },

    verifyTamaraPayment: async (orderId) => {
        const response = await api.get(`/payment/verify-tamara/${orderId}`);
        return response.data;
    }
};

// Cart services (DB-persisted, no localStorage)
export const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
    addToCart: async (courseId) => {
        const response = await api.post('/cart/add', { courseId });
        return response.data;
    },
    removeFromCart: async (courseId) => {
        const response = await api.delete(`/cart/remove/${courseId}`);
        return response.data;
    },
    clearCart: async () => {
        const response = await api.delete('/cart/clear');
        return response.data;
    },
    syncCart: async (courseIds) => {
        const response = await api.post('/cart/sync', { courseIds });
        return response.data;
    }
};

// Admin Cart & Sales Recovery Service
export const adminCartService = {
    getCarts: async (params = {}) => {
        const response = await api.get('/admin/carts', { params });
        return response.data;
    },
    deleteCart: async (id) => {
        const response = await api.delete(`/admin/carts/${id}`);
        return response.data;
    },
    sendCartReminder: async (id, data = {}) => {
        const response = await api.post(`/admin/carts/${id}/send-reminder`, data);
        return response.data;
    }
};

// Contact service for admin contact message management and form submission
export const contactService = {
    // Public contact form submission
    submitContactForm: async (formData) => {
        const response = await api.post('/contact/submit', formData);
        return response.data;
    },

    // Admin functions
    getMessages: async (params = {}) => {
        const response = await api.get('/contact/messages', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/contact/stats');
        return response.data;
    },

    updateMessageStatus: async (messageId, status) => {
        const response = await api.patch(`/contact/messages/${messageId}/status`, { status });
        return response.data;
    },

    deleteMessage: async (messageId) => {
        const response = await api.delete(`/contact/messages/${messageId}`);
        return response.data;
    },

    replyToMessage: async (messageId, replyData) => {
        const response = await api.post(`/contact/messages/${messageId}/reply`, replyData);
        return response.data;
    }
};

// Advertisement Services
export const advertisementService = {
    // Get all advertisements (admin)
    getAdvertisements: async () => {
        const response = await api.get('/advertisements');
        return response.data;
    },

    // Get active advertisements (public)
    getActiveAdvertisements: async () => {
        const response = await api.get('/advertisements/active');
        return response.data;
    },

    // Create advertisement
    createAdvertisement: async (data) => {
        const response = await api.post('/advertisements', data);
        return response.data;
    },

    // Update advertisement
    updateAdvertisement: async (id, data) => {
        const response = await api.put(`/advertisements/${id}`, data);
        return response.data;
    },

    // Delete advertisement
    deleteAdvertisement: async (id) => {
        const response = await api.delete(`/advertisements/${id}`);
        return response.data;
    },

    // Toggle advertisement visibility
    toggleVisibility: async (id) => {
        const response = await api.patch(`/advertisements/${id}/toggle-visibility`);
        return response.data;
    }
};

// Coupon Services
export const couponService = {
    getCoupons: async (params = {}) => {
        const response = await api.get('/admin/coupons', { params });
        return response.data;
    },

    getCouponById: async (id) => {
        const response = await api.get(`/admin/coupons/${id}`);
        return response.data;
    },

    createCoupon: async (data) => {
        const response = await api.post('/admin/coupons', data);
        return response.data;
    },

    updateCoupon: async (id, data) => {
        const response = await api.put(`/admin/coupons/${id}`, data);
        return response.data;
    },

    deleteCoupon: async (id) => {
        const response = await api.delete(`/admin/coupons/${id}`);
        return response.data;
    },

    updateCouponStatus: async (id, status) => {
        const response = await api.patch(`/admin/coupons/${id}/status`, status ? { status } : {});
        return response.data;
    },

    validateCoupon: async (code, courseIds) => {
        const response = await api.post('/coupons/validate', { code, courseIds });
        return response.data;
    },
};

// Category and Subcategory Services with in-memory caching
let _categoriesCache = null;
let _categoriesCacheTime = 0;
const _subcategoriesCache = new Map();
const CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const categoryService = {
    // Get all categories with subcategories (cached)
    getCategories: async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && _categoriesCache && (now - _categoriesCacheTime < CATEGORY_CACHE_TTL)) {
            return _categoriesCache;
        }
        const response = await api.get('/categories');
        _categoriesCache = response.data;
        _categoriesCacheTime = now;
        return response.data;
    },

    // Get subcategories for a specific category (cached)
    getSubcategories: async (categoryId, forceRefresh = false) => {
        const now = Date.now();
        const cached = _subcategoriesCache.get(categoryId);
        if (!forceRefresh && cached && (now - cached.time < CATEGORY_CACHE_TTL)) {
            return cached.data;
        }
        const response = await api.get(`/subcategories/category/${categoryId}`);
        _subcategoriesCache.set(categoryId, { data: response.data, time: now });
        return response.data;
    },

    // Get all subcategories
    getAllSubcategories: async () => {
        const response = await api.get('/subcategories');
        return response.data;
    }
};

// Subcategory Services
export const subcategoryService = {
    // Get all subcategories
    getAllSubcategories: async () => {
        const response = await api.get('/subcategories');
        return response.data;
    },

    // Get subcategories by category
    getSubcategoriesByCategory: async (categoryId) => {
        const response = await api.get(`/subcategories/category/${categoryId}`);
        return response.data;
    },

    // Get subcategory by ID
    getSubcategoryById: async (id) => {
        const response = await api.get(`/subcategories/${id}`);
        return response.data;
    },

    // Get subcategory by slug
    getSubcategoryBySlug: async (slug) => {
        const response = await api.get(`/subcategories/slug/${slug}`);
        return response.data;
    },

    // Create subcategory (admin only)
    createSubcategory: async (subcategoryData) => {
        const response = await api.post('/subcategories', subcategoryData);
        return response.data;
    },

    // Update subcategory (admin only)
    updateSubcategory: async (id, subcategoryData) => {
        const response = await api.put(`/subcategories/${id}`, subcategoryData);
        return response.data;
    },

    // Delete subcategory (admin only)
    deleteSubcategory: async (id) => {
        const response = await api.delete(`/subcategories/${id}`);
        return response.data;
    }
};

export const analyticsService = {
    recordPageView: async (pageData) => {
        try {
            await api.post('/analytics/pageview', pageData);
        } catch (err) {
            // Silently ignore to not interrupt user navigation
        }
    }
};

export default api;
