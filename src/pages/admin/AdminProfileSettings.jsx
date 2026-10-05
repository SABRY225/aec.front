import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/admin.service';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { useAuth } from '../../../context/AuthContext';

const AdminProfileSettings = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { updateUser } = useAuth();
    const { uploadFile, uploading } = useFileUpload();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        photo: null,
        adminSettings: {
            dashboardLayout: 'default',
            defaultView: 'overview',
            notificationPreferences: {
                newInstructors: true,
                newCourses: true,
                reports: true,
                systemAlerts: true
            }
        },
        bio: '',
        phoneNumber: '',
        socials: {
            linkedin: '',
            twitter: ''
        }
    });

    useEffect(() => {
        loadAdminProfile();
    }, []);

    const loadAdminProfile = async () => {
        try {
            setLoading(true);
            const profile = await adminService.getProfile();
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                photo: profile.photo || null,
                adminSettings: {
                    dashboardLayout: profile.adminSettings?.dashboardLayout || 'default',
                    defaultView: profile.adminSettings?.defaultView || 'overview',
                    notificationPreferences: {
                        newInstructors: profile.adminSettings?.notificationPreferences?.newInstructors ?? true,
                        newCourses: profile.adminSettings?.notificationPreferences?.newCourses ?? true,
                        reports: profile.adminSettings?.notificationPreferences?.reports ?? true,
                        systemAlerts: profile.adminSettings?.notificationPreferences?.systemAlerts ?? true
                    }
                },
                bio: profile.bio || '',
                phoneNumber: profile.phoneNumber || '',
                socials: {
                    linkedin: profile.socials?.linkedin || '',
                    twitter: profile.socials?.twitter || ''
                }
            });
        } catch (error) {
            toast.error(t('student.adminSettings.profile.loadFailed'));
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('notificationPreferences.')) {
            const prefName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                adminSettings: {
                    ...prev.adminSettings,
                    notificationPreferences: {
                        ...prev.adminSettings.notificationPreferences,
                        [prefName]: checked
                    }
                }
            }));
        } else if (name.startsWith('socials.')) {
            const socialKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socials: {
                    ...prev.socials,
                    [socialKey]: value
                }
            }));
        } else if (name.startsWith('adminSettings.')) {
            const settingKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                adminSettings: {
                    ...prev.adminSettings,
                    [settingKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Validate file size (max 5MB for profile photos)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('student.settings.profile.photoTooLarge'));
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                toast.error(t('student.settings.profile.invalidImage'));
                return;
            }

            // Show uploading toast
            const uploadingToast = toast.loading('Uploading photo...');
            
            try {
                // Upload file to server
                const result = await uploadFile(file, 'admin-photos');
                
                // Update form data with file URL
                setFormData(prev => ({
                    ...prev,
                    photo: result.url
                }));

                toast.dismiss(uploadingToast);
                toast.success(t('student.settings.profile.photoUploaded'));
            } catch (uploadError) {
                toast.dismiss(uploadingToast);
                toast.error(t('student.settings.profile.photoUploadFailed'));
                console.error('Photo upload error:', uploadError);
            }
        } catch (error) {
            toast.error(t('student.settings.profile.photoError'));
            console.error('Error handling photo:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminService.updateProfile(formData);
            
            // Update user data in AuthContext to reflect changes in header and other components
            updateUser(formData);
            
            toast.success(t('student.adminSettings.profile.updated'));
        } catch (error) {
            toast.error(error.response?.data?.message || t('student.settings.profile.updateFailed'));
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">{t('student.adminSettings.profile.loading')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-2">{t('student.adminSettings.profile.pageTitle')}</h1>
            <p className="text-gray-600 mb-8">{t('student.adminSettings.profile.pageSubtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">{t('student.adminSettings.profile.basicInfo')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Admin Preferences */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">{t('student.adminSettings.profile.adminPreferences')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('student.adminSettings.profile.dashboardLayout')}
                            </label>
                            <select
                                name="adminSettings.dashboardLayout"
                                value={formData.adminSettings.dashboardLayout}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="default">{t('student.adminSettings.profile.layoutDefault')}</option>
                                <option value="compact">{t('student.adminSettings.profile.layoutCompact')}</option>
                                <option value="expanded">{t('student.adminSettings.profile.layoutExpanded')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('student.adminSettings.profile.defaultView')}
                            </label>
                            <select
                                name="adminSettings.defaultView"
                                value={formData.adminSettings.defaultView}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="overview">{t('student.adminSettings.profile.viewOverview')}</option>
                                <option value="instructors">{t('student.adminSettings.profile.viewInstructors')}</option>
                                <option value="courses">{t('student.adminSettings.profile.viewCourses')}</option>
                                <option value="students">{t('student.adminSettings.profile.viewStudents')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">{t('student.adminSettings.profile.notificationPreferences')}</h2>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="newInstructors"
                                name="notificationPreferences.newInstructors"
                                checked={formData.adminSettings.notificationPreferences.newInstructors}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="newInstructors" className="ml-2 block text-sm text-gray-700">
                                New Instructor Applications
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="newCourses"
                                name="notificationPreferences.newCourses"
                                checked={formData.adminSettings.notificationPreferences.newCourses}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="newCourses" className="ml-2 block text-sm text-gray-700">
                                New Course Submissions
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="reports"
                                name="notificationPreferences.reports"
                                checked={formData.adminSettings.notificationPreferences.reports}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="reports" className="ml-2 block text-sm text-gray-700">
                                Daily Reports
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="systemAlerts"
                                name="notificationPreferences.systemAlerts"
                                checked={formData.adminSettings.notificationPreferences.systemAlerts}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-700">
                                System Alerts
                            </label>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">{t('student.adminSettings.profile.professionalLinks')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                name="socials.linkedin"
                                value={formData.socials.linkedin}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter
                            </label>
                            <input
                                type="url"
                                name="socials.twitter"
                                value={formData.socials.twitter}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfileSettings;
