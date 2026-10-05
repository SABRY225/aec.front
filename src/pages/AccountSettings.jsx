import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/new-api';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';

const AccountSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        email: '',
        phone: '',
        language: 'en',
        notifications: {
            email: true,
            push: true
        }
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('notification-')) {
            const notificationType = name.replace('notification-', '');
            setSettings(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [notificationType]: checked
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userService.updateSettings(settings);
            toast.success(t('student.settings.account.updated'));
        } catch (error) {
            toast.error(t('student.settings.account.updateFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error(t('student.settings.account.passwordMismatch'));
            return;
        }

        setLoading(true);
        try {
            await userService.changePassword(passwords.currentPassword, passwords.newPassword);
            toast.success(t('student.settings.account.passwordUpdated'));
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(t('student.settings.account.updateFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingNew />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">{t('student.settings.account.title')}</h1>

            <div className="space-y-8">
                {/* Account Settings Form */}
                <form onSubmit={handleSettingsSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">{t('student.settings.account.generalSettings')}</h2>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('student.settings.account.emailAddress')}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={settings.email}
                            onChange={handleSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('student.settings.account.phoneNumber')}</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={settings.phone}
                            onChange={handleSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Language */}
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('student.settings.account.language')}</label>
                        <select
                            id="language"
                            name="language"
                            value={settings.language}
                            onChange={handleSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="en">{t('student.settings.account.languages.english')}</option>
                            <option value="ar">{t('student.settings.account.languages.arabic')}</option>
                        </select>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">{t('student.settings.account.notifications')}</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notification-email"
                                    name="notification-email"
                                    checked={settings.notifications.email}
                                    onChange={handleSettingsChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="notification-email" className="ml-2 block text-sm text-gray-700">
                                    {t('student.settings.account.emailNotifications')}
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="notification-push"
                                    name="notification-push"
                                    checked={settings.notifications.push}
                                    onChange={handleSettingsChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="notification-push" className="ml-2 block text-sm text-gray-700">
                                    {t('student.settings.account.pushNotifications')}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {t('student.settings.account.saveChanges')}
                        </button>
                    </div>
                </form>

                {/* Password Change Form */}
                <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">{t('student.settings.account.changePassword')}</h2>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">{t('student.settings.account.currentPassword')}</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">{t('student.settings.account.newPassword')}</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwords.newPassword}
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
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {t('student.settings.account.changePassword')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
