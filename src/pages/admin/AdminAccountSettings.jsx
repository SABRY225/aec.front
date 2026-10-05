import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { userService } from '../../services/new-api';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const AdminAccountSettings = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        language: 'en',
        notifications: {
            email: true,
            push: true,
        },
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadAdminSettings();
    }, []);

    const loadAdminSettings = async () => {
        try {
            setLoading(true);
            const profile = await userService.getProfile();
            const settings = await userService.getSettings();
            setFormData(prev => ({
                ...prev,
                email: profile.email || '',
                phone: profile.phone || '',
                language: settings?.language || 'en',
                notifications: {
                    email: settings?.notifications?.email ?? true,
                    push: settings?.notifications?.push ?? true,
                },
            }));
        } catch (error) {
            toast.error(t('student.adminSettings.account.loadFailed'));
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('notification-')) {
            const notificationType = name.replace('notification-', '');
            setFormData(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [notificationType]: checked,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userService.updateSettings(formData);
            toast.success(t('student.adminSettings.account.updated'));
        } catch (error) {
            toast.error(t('student.adminSettings.account.updateFailed'));
            console.error('Error updating settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('student.adminSettings.account.passwordMismatch'));
            return;
        }
        setLoading(true);
        try {
            await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success(t('student.adminSettings.account.passwordChanged'));
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error(t('student.adminSettings.account.passwordChangeFailed'));
            console.error('Error changing password:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingNew />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">{t('student.adminSettings.account.pageTitle')}</h1>

            {/* Account Settings Form */}
            <form onSubmit={handleSettingsSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('student.settings.account.generalSettings')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('student.settings.account.emailAddress')}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('student.settings.account.phoneNumber')}</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('student.settings.account.language')}</label>
                        <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="en">{t('student.settings.account.languages.english')}</option>
                            <option value="ar">{t('student.settings.account.languages.arabic')}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">{t('student.settings.account.notifications')}</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notification-email"
                                    name="notification-email"
                                    checked={formData.notifications.email}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="notification-email" className="ml-2 block text-sm text-gray-700">
                                    Email Notifications
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notification-push"
                                    name="notification-push"
                                    checked={formData.notifications.push}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="notification-push" className="ml-2 block text-sm text-gray-700">
                                    Push Notifications
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        Save Settings
                    </button>
                </div>
            </form>

            {/* Password Change Form */}
            <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">{t('student.settings.account.changePassword')}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">{t('student.settings.account.currentPassword')}</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('student.settings.account.confirmNewPassword')}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAccountSettings;
