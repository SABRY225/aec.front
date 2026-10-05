import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useFileUpload } from '../../hooks/useFileUpload';
import { userService } from '../../services/new-api';
import {
    User,
    Mail,
    Phone,
    Globe,
    Lock,
    Shield,
    ShieldCheck,
    Eye,
    EyeOff,
    Camera,
    Trash2,
    Upload,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Save,
    KeyRound,
    Bell,
    Sliders,
    Check,
    Loader2,
    MapPin,
    Briefcase,
    Share2,
    RefreshCw,
    Languages,
    FileText,
    ExternalLink,
    HelpCircle
} from 'lucide-react';

const StudentSettings = ({ initialTab }) => {
    const { t, i18n } = useTranslation();
    const { isRTL } = useLanguage();
    const { user, updateUser } = useAuth();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const fileInputRef = useRef(null);

    // Determine active tab based on prop, query param, or current route
    const currentTabFromUrl = useMemo(() => {
        const queryTab = searchParams.get('tab');
        if (queryTab && ['profile', 'security', 'preferences'].includes(queryTab)) {
            return queryTab;
        }
        if (location.pathname.includes('account-settings')) {
            return 'security';
        }
        if (location.pathname.includes('profile-settings')) {
            return 'profile';
        }
        return initialTab || 'profile';
    }, [searchParams, initialTab, location.pathname]);

    const [activeTab, setActiveTab] = useState(currentTabFromUrl);

    // Synchronize activeTab when URL or prop changes
    useEffect(() => {
        setActiveTab(currentTabFromUrl);
    }, [currentTabFromUrl]);

    // Handle tab change and update route/search params cleanly
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'profile') {
            navigate('/student/profile-settings', { replace: true });
        } else if (tabId === 'security') {
            navigate('/student/account-settings', { replace: true });
        } else {
            navigate('/student/account-settings?tab=preferences', { replace: true });
        }
    };

    // Main loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // Profile Form Data
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        jobTitle: '',
        phone: '',
        country: '',
        city: '',
        website: '',
        bio: '',
        photo: null,
        socials: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: '',
            youtube: '',
            whatsapp: ''
        }
    });

    // Account / Security Form Data
    const [securityData, setSecurityData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Preferences & Notifications Form Data
    const [preferencesData, setPreferencesData] = useState({
        language: 'ar',
        emailNotifications: true,
        assignmentAlerts: true,
        promotionalEmails: false
    });

    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Load full user profile & settings on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setInitialLoading(true);
            const profile = await userService.getProfile();

            // Populate Profile Data
            setProfileData({
                firstName: profile.firstName || user?.firstName || '',
                lastName: profile.lastName || user?.lastName || '',
                jobTitle: profile.jobTitle || '',
                phone: profile.phone || profile.phoneNumber || user?.phone || '',
                country: profile.country || '',
                city: profile.city || '',
                website: profile.website || '',
                bio: profile.bio || '',
                photo: profile.photo || user?.photo || null,
                socials: {
                    facebook: profile.socials?.facebook || '',
                    twitter: profile.socials?.twitter || '',
                    linkedin: profile.socials?.linkedin || '',
                    instagram: profile.socials?.instagram || '',
                    youtube: profile.socials?.youtube || '',
                    whatsapp: profile.socials?.whatsapp || ''
                }
            });

            // Populate Security Data
            setSecurityData(prev => ({
                ...prev,
                email: profile.email || user?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Populate Preferences Data
            const lang = profile.settings?.language || profile.language || (i18n.language === 'en' ? 'en' : 'ar');
            setPreferencesData({
                language: lang,
                emailNotifications: profile.settings?.notifications?.emailNotifications !== false,
                assignmentAlerts: profile.settings?.notifications?.messageNotifications !== false,
                promotionalEmails: profile.promotionalEmails === true || profile.settings?.notifications?.promotionalEmails === true
            });
        } catch (error) {
            console.error('Error loading settings data:', error);
            toast.error(t('student.settings.account.loadFailed', 'تعذّر تحميل بيانات الإعدادات'));
        } finally {
            setInitialLoading(false);
        }
    };

    // Profile input change handler
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('socials.')) {
            const socialKey = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                socials: {
                    ...prev.socials,
                    [socialKey]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Security input change handler
    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurityData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Preferences input change handler
    const handlePreferencesChange = (name, value) => {
        setPreferencesData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Photo Upload Handler
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('student.settings.profile.photoTooLarge', 'يجب ألا يتجاوز حجم الصورة 5 ميجابايت'));
            return;
        }

        // Type check
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error(t('student.settings.profile.invalidImage', 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP'));
            return;
        }

        const toastId = toast.loading(t('student.settings.profile.uploadingPhoto', 'جاري رفع الصورة...'));
        try {
            const result = await uploadFile(file, 'profile-photos');
            const newPhotoUrl = result.url || result.result;

            if (newPhotoUrl) {
                setProfileData(prev => ({ ...prev, photo: newPhotoUrl }));
                
                // Immediately save photo to backend profile and update auth state
                await userService.updateProfile({ photo: newPhotoUrl });
                updateUser({ photo: newPhotoUrl });

                toast.update(toastId, {
                    render: t('student.settings.profile.photoUploaded', 'تم رفع وتحديث الصورة بنجاح!'),
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
            } else {
                throw new Error('No URL returned');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.update(toastId, {
                render: t('student.settings.profile.photoUploadFailed', 'تعذّر رفع الصورة، يرجى المحاولة لاحقاً'),
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Photo Removal Handler
    const handleRemovePhoto = async () => {
        if (!profileData.photo) return;
        try {
            setSavingProfile(true);
            setProfileData(prev => ({ ...prev, photo: null }));
            await userService.updateProfile({ photo: '' });
            updateUser({ photo: null });
            toast.success(t('student.settings.profile.photoRemoved', 'تم إزالة الصورة بنجاح'));
        } catch (error) {
            console.error('Error removing photo:', error);
            toast.error(t('student.settings.profile.updateFailed', 'تعذّر إزالة الصورة'));
        } finally {
            setSavingProfile(false);
        }
    };

    // Save Profile Information
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSavingProfile(true);

            // Send payload to backend
            await userService.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                jobTitle: profileData.jobTitle,
                phone: profileData.phone,
                country: profileData.country,
                city: profileData.city,
                website: profileData.website,
                bio: profileData.bio,
                photo: profileData.photo,
                socials: profileData.socials
            });

            // Sync with AuthContext to reflect in header & global user object
            updateUser({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                jobTitle: profileData.jobTitle,
                phone: profileData.phone,
                photo: profileData.photo
            });

            toast.success(t('student.settings.profile.updated', 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح!'));
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.message || t('student.settings.profile.updateFailed', 'تعذّر حفظ التغييرات'));
        } finally {
            setSavingProfile(false);
        }
    };

    // Password strength evaluator
    const passwordStrength = useMemo(() => {
        const pass = securityData.newPassword;
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };

        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 10) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { score: 1, label: t('student.settings.security.weak', 'ضعيفة'), color: 'bg-rose-500' };
        if (score <= 3) return { score: 2, label: t('student.settings.security.medium', 'متوسطة'), color: 'bg-amber-500' };
        return { score: 3, label: t('student.settings.security.strong', 'قوية وممتازة'), color: 'bg-emerald-500' };
    }, [securityData.newPassword, t]);

    // Save Password & Security
    const handleSavePassword = async (e) => {
        e.preventDefault();

        if (!securityData.currentPassword) {
            toast.error(t('student.settings.account.currentPasswordRequired', 'يرجى إدخال كلمة المرور الحالية'));
            return;
        }

        if (!securityData.newPassword || securityData.newPassword.length < 6) {
            toast.error(t('student.settings.account.passwordMinLength', 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'));
            return;
        }

        if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error(t('student.settings.account.passwordMismatch', 'كلمتا المرور غير متطابقتين'));
            return;
        }

        try {
            setSavingPassword(true);
            await userService.changePassword({
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            });

            toast.success(t('student.settings.account.passwordUpdated', 'تم تحديث كلمة المرور بنجاح!'));
            setSecurityData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || t('student.settings.account.updateFailed', 'تعذّر تحديث كلمة المرور'));
        } finally {
            setSavingPassword(false);
        }
    };

    // Save Preferences & Notifications
    const handleSavePreferences = async (e) => {
        e.preventDefault();
        try {
            setSavingSettings(true);

            // Update on backend
            await userService.updateSettings({
                phone: profileData.phone,
                language: preferencesData.language,
                notifications: {
                    emailNotifications: preferencesData.emailNotifications,
                    messageNotifications: preferencesData.assignmentAlerts,
                    promotionalEmails: preferencesData.promotionalEmails
                }
            });

            // Update app language if changed
            if (preferencesData.language && preferencesData.language !== i18n.language) {
                i18n.changeLanguage(preferencesData.language);
                document.documentElement.dir = preferencesData.language === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = preferencesData.language;
            }

            toast.success(t('student.settings.account.updated', 'تم حفظ التفضيلات والإشعارات بنجاح!'));
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(error.response?.data?.message || t('student.settings.account.updateFailed', 'تعذّر حفظ التفضيلات'));
        } finally {
            setSavingSettings(false);
        }
    };

    const isArabic = i18n.language === 'ar';

    if (initialLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                    <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="md:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8" dir={t('autoGenerated.ltr', `ltr`)}>

            {/* HERO PROFILE CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white shadow-xl shadow-blue-900/10">
                {/* Decorative background glow & shapes */}
                <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 start-1/4 -mb-10 w-60 h-60 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    
                    {/* Avatar with Camera Trigger */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/30 dark:ring-white/10 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center text-white text-3xl font-extrabold transition-transform duration-300 group-hover:scale-105">
                            {profileData.photo ? (
                                <img
                                    src={profileData.photo}
                                    alt={profileData.firstName || 'Student Avatar'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="tracking-wider">
                                    {(profileData.firstName?.[0] || user?.firstName?.[0] || 'S').toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Camera Floating Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-2 -end-2 p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg ring-2 ring-white dark:ring-slate-900 transition-all transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                            title={t('student.settings.profile.uploadPhoto', 'تغيير الصورة')}
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Student Identity Information */}
                    <div className="flex-1 text-center md:text-start space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-blue-100 border border-white/10">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                {t('student.settings.hero.verifiedStudent', 'طالب الأكاديمية')}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                {t('student.settings.hero.activeAccount', 'حساب نشط')}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {profileData.firstName || profileData.lastName 
                                ? `${profileData.firstName} ${profileData.lastName}`
                                : (user?.name || user?.email?.split('@')[0] || t('student.settings.hero.defaultName', 'طالب متميز'))
                            }
                        </h1>

                        <p className="text-blue-100/90 text-sm max-w-xl line-clamp-2">
                            {profileData.jobTitle || profileData.bio || t('student.settings.hero.defaultBio', 'تخصيص ملفك الشخصي يساعد المدربين والزملاء على معرفتك بشكل أفضل ومتابعة تقدمك التعليمي.')}
                        </p>

                        <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-blue-200/80">
                            {securityData.email && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    {securityData.email}
                                </span>
                            )}
                            {profileData.phone && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span dir="ltr">{profileData.phone}</span>
                                </span>
                            )}
                            {(profileData.country || profileData.city) && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {[profileData.city, profileData.country].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Profile Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                        {profileData.photo && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                disabled={savingProfile}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/20 transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('student.settings.profile.removePhoto', 'إزالة الصورة')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload Progress Bar */}
                {uploading && (
                    <div className="w-full bg-black/20 h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-400 h-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto custom-scrollbar pb-px">
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span>{t('student.settings.profile.title', 'الملف الشخصي')}</span>
                </button>

                <button
                    onClick={() => handleTabChange('security')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap ${
                        activeTab === 'security'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('student.settings.account.security', 'الأمان وكلمة المرور')}</span>
                </button>

                <button
                    onClick={() => handleTabChange('preferences')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap ${
                        activeTab === 'preferences'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <Sliders className="w-4 h-4" />
                    <span>{t('student.settings.account.generalSettings', 'التفضيلات والإشعارات')}</span>
                </button>
            </div>

            {/* TAB 1: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.profile.basicInfo', 'المعلومات الأساسية')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.profile.basicInfoSubtitle', 'اسمك وتفاصيلك المهنية تظهر للمدربين والشهادات الصادرة')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.firstName', 'الاسم الأول')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        placeholder="مثال: أحمد"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.lastName', 'اسم العائلة')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        placeholder="مثال: المنصوري"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Job Title / Field of Study */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.jobTitle', 'المسمى الوظيفي / التخصص الأكاديمي')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={profileData.jobTitle}
                                        onChange={handleProfileChange}
                                        placeholder="مثال: مهندس برمجيات / طالب علوم حاسب"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.phone', 'رقم الهاتف')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        placeholder="+966 50 123 4567"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.country', 'الدولة')}
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={profileData.country}
                                    onChange={handleProfileChange}
                                    placeholder="مثال: المملكة العربية السعودية"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.city', 'المدينة')}
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profileData.city}
                                    onChange={handleProfileChange}
                                    placeholder="مثال: الرياض"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Website */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.website', 'الموقع الشخصي أو معرض الأعمال')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        name="website"
                                        value={profileData.website}
                                        onChange={handleProfileChange}
                                        placeholder="https://example.com"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.profile.bio', 'نبذة تعريفية عنك')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.profile.bioSubtitle', 'شارك اهتماماتك العلمية وطموحاتك المهنية')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <textarea
                                name="bio"
                                rows="4"
                                value={profileData.bio}
                                onChange={handleProfileChange}
                                maxLength={600}
                                placeholder={t('student.settings.profile.bioPlaceholder', 'أخبرنا عن مسارك التعليمي، خبراتك، والمهارات التي تسعى لتطويرها...')}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                                <span>{t('student.settings.profile.bioMax', 'الحد الأقصى 600 حرف')}</span>
                                <span>{profileData.bio?.length || 0} / 600</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.profile.socialMediaLinks', 'روابط التواصل الاجتماعي')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.profile.socialSubtitle', 'أضف حساباتك المهنية لتسهيل التواصل المهني')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LinkedIn */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.linkedin', 'لينكد إن (LinkedIn)')}
                                </label>
                                <input
                                    type="url"
                                    name="socials.linkedin"
                                    value={profileData.socials.linkedin}
                                    onChange={handleProfileChange}
                                    placeholder="https://linkedin.com/in/username"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Twitter / X */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.twitter', 'إكس / تويتر (Twitter / X)')}
                                </label>
                                <input
                                    type="url"
                                    name="socials.twitter"
                                    value={profileData.socials.twitter}
                                    onChange={handleProfileChange}
                                    placeholder="https://x.com/username"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Facebook */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.facebook', 'فيسبوك (Facebook)')}
                                </label>
                                <input
                                    type="url"
                                    name="socials.facebook"
                                    value={profileData.socials.facebook}
                                    onChange={handleProfileChange}
                                    placeholder="https://facebook.com/username"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.instagram', 'إنستغرام (Instagram)')}
                                </label>
                                <input
                                    type="url"
                                    name="socials.instagram"
                                    value={profileData.socials.instagram}
                                    onChange={handleProfileChange}
                                    placeholder="https://instagram.com/username"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.whatsapp', 'واتساب (WhatsApp)')}
                                </label>
                                <input
                                    type="text"
                                    name="socials.whatsapp"
                                    value={profileData.socials.whatsapp}
                                    onChange={handleProfileChange}
                                    placeholder="https://wa.me/966..."
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* YouTube */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.profile.youtube', 'يوتيوب (YouTube)')}
                                </label>
                                <input
                                    type="url"
                                    name="socials.youtube"
                                    value={profileData.socials.youtube}
                                    onChange={handleProfileChange}
                                    placeholder="https://youtube.com/@channel"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Save Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={loadData}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {t('common.cancel', 'إلغاء التغييرات')}
                        </button>

                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                            {savingProfile ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t('student.settings.profile.saving', 'جاري الحفظ...')}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{t('student.settings.profile.saveChanges', 'حفظ بيانات الملف')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 2: SECURITY & PASSWORD SETTINGS */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Account Email Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {t('student.settings.account.emailAddress', 'البريد الإلكتروني الأساسي')}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('student.settings.account.emailSubtitle', 'يستخدم لتسجيل الدخول، استلام الإشعارات وتأكيد الشهادات')}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('student.settings.account.verified', 'مفعّل')}
                            </span>
                        </div>

                        <div className="max-w-xl">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('student.settings.account.currentEmail', 'عنوان البريد الحالي')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                disabled
                                value={securityData.email}
                                dir="ltr"
                                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-slate-400 mt-2">
                                {t('student.settings.account.emailChangeNotice', 'لتغيير بريدك الإلكتروني المسجل، يرجى التواصل مع فريق الدعم الفني حرصاً على أمان حسابك.')}
                            </p>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <form onSubmit={handleSavePassword} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.account.changePassword', 'تغيير كلمة المرور')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.account.passwordSubtitle', 'احرص على استخدام كلمة مرور معقدة لحماية حسابك')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xl">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.account.currentPassword', 'كلمة المرور الحالية')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        required
                                        value={securityData.currentPassword}
                                        onChange={handleSecurityChange}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.account.newPassword', 'كلمة المرور الجديدة')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        required
                                        minLength={6}
                                        value={securityData.newPassword}
                                        onChange={handleSecurityChange}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {securityData.newPassword && (
                                    <div className="mt-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {t('student.settings.security.strength', 'قوة كلمة المرور:')}
                                            </span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.account.confirmPassword', 'تأكيد كلمة المرور الجديدة')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        required
                                        minLength={6}
                                        value={securityData.confirmPassword}
                                        onChange={handleSecurityChange}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {securityData.confirmPassword && (
                                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                        {securityData.newPassword === securityData.confirmPassword ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" />
                                                {t('student.settings.security.matched', 'كلمتا المرور متطابقتان')}
                                            </span>
                                        ) : (
                                            <span className="text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {t('student.settings.account.passwordMismatch', 'كلمتا المرور غير متطابقتين')}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Password Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingPassword || (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword)}
                                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                            >
                                {savingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t('student.settings.account.savingPassword', 'جاري التحديث...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>{t('student.settings.account.updatePasswordBtn', 'تحديث كلمة المرور')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Recommendations Banner */}
                    <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-5 flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                {t('student.settings.security.tipsTitle', 'نصائح لأمان حسابك الأكاديمي')}
                            </h4>
                            <p>
                                {t('student.settings.security.tipsDesc', 'لا تشارك بيانات الدخول مع أي شخص. احرص على تسجيل الخروج دائماً عند استخدام أجهزة مشتركة أو عامة.')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PREFERENCES & NOTIFICATIONS */}
            {activeTab === 'preferences' && (
                <form onSubmit={handleSavePreferences} className="space-y-6">
                    {/* Interface Language Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <Languages className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.account.language', 'لغة واجهة المنصة')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.account.languageSubtitle', 'اختر اللغة المفضلة لتصفح المنصة والدورات')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'ar', label: 'العربية (Arabic)', desc: 'اللغة الأساسية والافتراضية للمنصة', flag: '🇸🇦' },
                                { id: 'en', label: 'English', desc: 'International English Interface', flag: '🇬🇧' },
                                { id: 'fr', label: 'Français', desc: 'Interface en Français', flag: '🇫🇷' },
                            ].map((lang) => (
                                <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => handlePreferencesChange('language', lang.id)}
                                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                                        preferencesData.language === lang.id
                                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl">{lang.flag}</span>
                                        {preferencesData.language === lang.id && (
                                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang.label}</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{lang.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications Settings Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('student.settings.account.notifications', 'إعدادات الإشعارات والتنبيهات')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('student.settings.account.notificationsSubtitle', 'تحكم في طريقة ومواعيد استلام التنبيهات')}
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-4">
                            {/* Course & Lecture Announcements */}
                            <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                        {t('student.settings.notifications.courseUpdates', 'تحديثات الدورات والمحاضرات الجديدة')}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('student.settings.notifications.courseUpdatesDesc', 'استلم إشعارات فور إضافة محاضرات جديدة أو بدء الجلسات التفاعلية')}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={preferencesData.emailNotifications}
                                        onChange={(e) => handlePreferencesChange('emailNotifications', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>

                            {/* Assignments & Grading Alerts */}
                            <div className="pt-4 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                        {t('student.settings.notifications.assignmentAlerts', 'تنبيهات الواجبات والتقييمات')}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('student.settings.notifications.assignmentAlertsDesc', 'تنبيهك بمواعيد تسليم التكليفات ونتائج تصحيح الاختبارات')}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={preferencesData.assignmentAlerts}
                                        onChange={(e) => handlePreferencesChange('assignmentAlerts', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>

                            {/* Promotional / Resource Emails */}
                            <div className="pt-4 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                        {t('student.settings.account.promotions', 'العروض وتوصيات الدورات المفيدة')}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('student.settings.notifications.promoDesc', 'استلم كوبونات خصم خاصة ودورات مقترحة تناسب مسارك التعليمي')}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={preferencesData.promotionalEmails}
                                        onChange={(e) => handlePreferencesChange('promotionalEmails', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Save Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={loadData}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {t('common.cancel', 'إلغاء التغييرات')}
                        </button>

                        <button
                            type="submit"
                            disabled={savingSettings}
                            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                            {savingSettings ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t('student.settings.account.savingSettings', 'جاري الحفظ...')}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{t('student.settings.account.saveChanges', 'حفظ التفضيلات')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default StudentSettings;
