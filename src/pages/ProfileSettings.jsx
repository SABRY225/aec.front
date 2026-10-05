import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/new-api';
import { useAuth } from '../context/AuthContext';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';
import BunnyMedia from '../components/common/BunnyMedia';
import FileUpload from '../components/shared/FileUpload';

const ProfileSettings = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        jobTitle: '',
        website: '',
        bio: '',
        socials: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        },
        photo: null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const profileData = await userService.getProfile();
            setFormData({
                firstName: profileData.firstName || '',
                lastName: profileData.lastName || '',
                jobTitle: profileData.jobTitle || '',
                website: profileData.website || '',
                bio: profileData.bio || '',
                socials: {
                    facebook: profileData.socials?.facebook || '',
                    twitter: profileData.socials?.twitter || '',
                    linkedin: profileData.socials?.linkedin || '',
                    instagram: profileData.socials?.instagram || ''
                },
                photo: profileData.photo || null
            });
        } catch (error) {
            toast.error(t('student.settings.profile.loadFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social-')) {
            const socialNetwork = name.replace('social-', '');
            setFormData(prev => ({
                ...prev,
                socials: {
                    ...prev.socials,
                    [socialNetwork]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePhotoUploadComplete = (result, file) => {
        setFormData(prev => ({
            ...prev,
            photo: result.url
        }));
        toast.success(t('student.settings.profile.photoUploaded'));
    };
    
    const handlePhotoUploadError = (error) => {
        toast.error(t('student.settings.profile.photoUploadFailed'));
        console.error('Photo upload error:', error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userService.updateProfile(formData);
            
            // Update user data in AuthContext to reflect changes in header and other components
            updateUser(formData);
            
            toast.success(t('student.settings.profile.updated'));
        } catch (error) {
            toast.error(t('student.settings.profile.updateFailed'));
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingNew />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">{t('student.settings.profile.title')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{t('student.settings.profile.photo')}</label>
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                            {formData.photo ? (
                                <BunnyMedia 
                                    url={formData.photo} 
                                    alt={t('student.settings.profile.photo')} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">{t('student.settings.profile.noPhoto')}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <FileUpload
                                accept="image/jpeg,image/png"
                                maxSize={5 * 1024 * 1024}
                                folder="profile-photos"
                                onUploadSuccess={handlePhotoUploadComplete}
                                onUploadError={handlePhotoUploadError}
                                label={t('student.settings.profile.uploadPhotoLabel')}
                                helperText={t('student.settings.profile.uploadPhotoHelper')}
                                showPreview={true}
                                previewType="image"
                            />
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t('student.settings.profile.firstName')}</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t('student.settings.profile.lastName')}</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Professional Info */}
                <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">{t('student.settings.profile.jobTitle')}</label>
                    <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">{t('student.settings.profile.website')}</label>
                    <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">{t('student.settings.profile.bio')}</label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">{t('student.settings.profile.socialMediaLinks')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {Object.entries(formData.socials).map(([platform, value]) => (
                            <div key={platform}>
                                <label htmlFor={`social-${platform}`} className="block text-sm font-medium text-gray-700 capitalize">
                                    {platform}
                                </label>
                                <input
                                    type="url"
                                    id={`social-${platform}`}
                                    name={`social-${platform}`}
                                    value={value}
                                    onChange={handleInputChange}
                                    placeholder={`https://${platform}.com/username`}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {saving ? t('student.settings.profile.saving') : t('student.settings.profile.saveChanges')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
