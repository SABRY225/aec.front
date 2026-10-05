import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useFileUpload } from '../../hooks/useFileUpload';
import { userService, instructorService } from '../../services/new-api';
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
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Save,
    KeyRound,
    Bell,
    Sliders,
    Check,
    Loader2,
    Building2,
    CreditCard,
    DollarSign,
    Calendar,
    Briefcase,
    FileText,
    Share2,
    Award
} from 'lucide-react';

const InstructorSettings = ({ initialTab }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { user, updateUser } = useAuth();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef(null);

    // Active tab management
    const currentTabFromUrl = useMemo(() => {
        const queryTab = searchParams.get('tab');
        if (queryTab && ['profile', 'security', 'payout', 'availability'].includes(queryTab)) {
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

    useEffect(() => {
        setActiveTab(currentTabFromUrl);
    }, [currentTabFromUrl]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'profile') {
            navigate('/instructor/profile-settings', { replace: true });
        } else if (tabId === 'security') {
            navigate('/instructor/account-settings', { replace: true });
        } else {
            navigate(`/instructor/account-settings?tab=${tabId}`, { replace: true });
        }
    };

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingSecurity, setSavingSecurity] = useState(false);
    const [savingPayout, setSavingPayout] = useState(false);
    const [savingAvailability, setSavingAvailability] = useState(false);

    // Profile form state
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        phone: '',
        website: '',
        bio: '',
        photo: null,
        socials: {
            linkedin: '',
            twitter: '',
            website: ''
        }
    });

    // Security form state
    const [securityData, setSecurityData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Payout / Bank form state
    const [payoutData, setPayoutData] = useState({
        preferredCurrency: 'SAR',
        minimumPayoutAmount: 50,
        paymentMethod: 'bank_transfer',
        bankDetails: {
            accountHolder: '',
            accountNumber: '',
            bankName: '',
            swiftCode: '',
            iban: ''
        }
    });

    // Availability & Notifications state
    const [availabilityData, setAvailabilityData] = useState({
        status: 'available',
        autoReply: '',
        notificationPreferences: {
            email: true,
            newStudentEnrollment: true,
            courseReviews: true,
            courseQuestions: true,
            announcements: true
        }
    });

    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Load instructor profile & settings on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setInitialLoading(true);

            // Fetch profile and account settings in parallel
            const [profile, accountSettings] = await Promise.all([
                userService.getProfile().catch(() => ({})),
                instructorService.getAccountSettings().catch(() => ({}))
            ]);

            // Populate Profile Data
            setProfileData({
                firstName: profile.firstName || user?.firstName || '',
                lastName: profile.lastName || user?.lastName || '',
                specialization: profile.jobTitle || profile.specialization || '',
                phone: profile.phone || profile.phoneNumber || user?.phone || '',
                website: profile.website || '',
                bio: profile.bio || '',
                photo: profile.photo || user?.photo || null,
                socials: {
                    linkedin: profile.socials?.linkedin || '',
                    twitter: profile.socials?.twitter || '',
                    website: profile.socials?.website || ''
                }
            });

            // Populate Security Data
            setSecurityData(prev => ({
                ...prev,
                email: accountSettings.email || profile.email || user?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Populate Payout Data
            if (accountSettings.paymentSettings) {
                setPayoutData({
                    preferredCurrency: accountSettings.paymentSettings.preferredCurrency || 'SAR',
                    minimumPayoutAmount: accountSettings.paymentSettings.minimumPayoutAmount || 50,
                    paymentMethod: accountSettings.paymentSettings.paymentMethod || 'bank_transfer',
                    bankDetails: {
                        accountHolder: accountSettings.paymentSettings.bankDetails?.accountHolder || '',
                        accountNumber: accountSettings.paymentSettings.bankDetails?.accountNumber || '',
                        bankName: accountSettings.paymentSettings.bankDetails?.bankName || '',
                        swiftCode: accountSettings.paymentSettings.bankDetails?.swiftCode || '',
                        iban: accountSettings.paymentSettings.bankDetails?.iban || ''
                    }
                });
            }

            // Populate Availability & Notifications
            setAvailabilityData({
                status: accountSettings.availability?.status || 'available',
                autoReply: accountSettings.availability?.autoReply || '',
                notificationPreferences: {
                    email: accountSettings.notificationPreferences?.email !== false,
                    newStudentEnrollment: accountSettings.notificationPreferences?.newStudentEnrollment !== false,
                    courseReviews: accountSettings.notificationPreferences?.courseReviews !== false,
                    courseQuestions: accountSettings.notificationPreferences?.courseQuestions !== false,
                    announcements: accountSettings.notificationPreferences?.announcements !== false
                }
            });
        } catch (error) {
            console.error('Error loading instructor settings:', error);
            toast.error(t('instructor.settings.loadFailed', 'تعذّر تحميل بيانات الإعدادات'));
        } finally {
            setInitialLoading(false);
        }
    };

    // Photo Upload Handler
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('يجب ألا يتجاوز حجم الصورة 5 ميجابايت');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP');
            return;
        }

        const toastId = toast.loading('جاري رفع الصورة...');
        try {
            const result = await uploadFile(file, 'instructor-profiles');
            const newPhotoUrl = result.url || result.result;

            if (newPhotoUrl) {
                setProfileData(prev => ({ ...prev, photo: newPhotoUrl }));
                await userService.updateProfile({ photo: newPhotoUrl });
                updateUser({ photo: newPhotoUrl });

                toast.update(toastId, {
                    render: 'تم رفع وتحديث صورة المحاضر بنجاح!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.update(toastId, {
                render: 'تعذّر رفع الصورة، يرجى المحاولة لاحقاً',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Remove photo
    const handleRemovePhoto = async () => {
        try {
            setSavingProfile(true);
            setProfileData(prev => ({ ...prev, photo: null }));
            await userService.updateProfile({ photo: '' });
            updateUser({ photo: null });
            toast.success('تمت إزالة الصورة بنجاح');
        } catch (error) {
            toast.error('تعذّر إزالة الصورة');
        } finally {
            setSavingProfile(false);
        }
    };

    // Save Profile Information
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSavingProfile(true);
            await userService.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                jobTitle: profileData.specialization,
                phone: profileData.phone,
                website: profileData.website,
                bio: profileData.bio,
                photo: profileData.photo,
                socials: profileData.socials
            });

            updateUser({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                jobTitle: profileData.specialization,
                photo: profileData.photo
            });

            toast.success('تم حفظ بيانات الملف الأكاديمي بنجاح!');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.message || 'تعذّر حفظ التغييرات');
        } finally {
            setSavingProfile(false);
        }
    };

    // Save Security / Password
    const handleSaveSecurity = async (e) => {
        e.preventDefault();

        if (!securityData.currentPassword) {
            toast.error('يرجى إدخال كلمة المرور الحالية');
            return;
        }

        if (!securityData.newPassword || securityData.newPassword.length < 8) {
            toast.error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error('كلمتا المرور غير متطابقتين');
            return;
        }

        try {
            setSavingSecurity(true);
            await instructorService.updateAccountSettings({
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            });

            toast.success('تم تحديث كلمة المرور بنجاح!');
            setSecurityData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.response?.data?.message || 'تعذّر تحديث كلمة المرور');
        } finally {
            setSavingSecurity(false);
        }
    };

    // Save Payout / Bank Details
    const handleSavePayout = async (e) => {
        e.preventDefault();
        try {
            setSavingPayout(true);
            await instructorService.updateAccountSettings({
                paymentSettings: payoutData
            });

            toast.success('تم حفظ وتحديث البيانات المصرفية بنجاح!');
        } catch (error) {
            console.error('Error saving payout settings:', error);
            toast.error(error.response?.data?.message || 'تعذّر حفظ بيانات الحساب البنكي');
        } finally {
            setSavingPayout(false);
        }
    };

    // Save Availability & Notifications
    const handleSaveAvailability = async (e) => {
        e.preventDefault();
        try {
            setSavingAvailability(true);
            await instructorService.updateAccountSettings({
                availability: {
                    status: availabilityData.status,
                    autoReply: availabilityData.autoReply
                },
                notificationPreferences: availabilityData.notificationPreferences
            });

            toast.success('تم حفظ التفضيلات والتوفر بنجاح!');
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error(error.response?.data?.message || 'تعذّر حفظ التفضيلات');
        } finally {
            setSavingAvailability(false);
        }
    };

    // Password strength evaluator
    const passwordStrength = useMemo(() => {
        const pass = securityData.newPassword;
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };

        let score = 0;
        if (pass.length >= 8) score += 1;
        if (pass.length >= 12) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { score: 1, label: 'ضعيفة', color: 'bg-rose-500' };
        if (score <= 3) return { score: 2, label: 'متوسطة', color: 'bg-amber-500' };
        return { score: 3, label: 'قوية وممتازة', color: 'bg-emerald-500' };
    }, [securityData.newPassword]);

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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20">
                <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 start-1/4 -mb-10 w-60 h-60 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    
                    {/* Avatar with Camera Overlay */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/30 dark:ring-white/10 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center text-white text-3xl font-black transition-transform duration-300 group-hover:scale-105">
                            {profileData.photo ? (
                                <img
                                    src={profileData.photo}
                                    alt={profileData.firstName || 'Instructor Avatar'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{(profileData.firstName?.[0] || user?.firstName?.[0] || 'I').toUpperCase()}</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-2 -end-2 p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg ring-2 ring-white dark:ring-slate-900 transition-all transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                            title="تغيير الصورة"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Identity Details */}
                    <div className="flex-1 text-center md:text-start space-y-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-blue-100 border border-white/10">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>محاضر معتمد بالأكاديمية</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>حساب تدريس نشط</span>
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {profileData.firstName || profileData.lastName 
                                ? `${profileData.firstName} ${profileData.lastName}`
                                : (user?.name || user?.email?.split('@')[0] || 'المحاضر')}
                        </h1>

                        <p className="text-blue-100/90 text-sm max-w-xl line-clamp-2">
                            {profileData.specialization || profileData.bio || 'تخصيص ملفك الأكاديمي والمهني يبرز خبراتك التدريبية للطلاب ويزيد من معدل التسجيل في برامجك.'}
                        </p>

                        <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-blue-200/80">
                            {securityData.email && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{securityData.email}</span>
                                </span>
                            )}
                            {profileData.phone && (
                                <span className="inline-flex items-center gap-1.5" dir="ltr">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{profileData.phone}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick remove photo */}
                    {profileData.photo && (
                        <div className="shrink-0">
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                disabled={savingProfile}
                                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>إزالة الصورة</span>
                            </button>
                        </div>
                    )}
                </div>

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
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span>الملف الأكاديمي والمهني</span>
                </button>

                <button
                    onClick={() => handleTabChange('security')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'security'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>الأمان وكلمة المرور</span>
                </button>

                <button
                    onClick={() => handleTabChange('payout')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'payout'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>الحساب البنكي والتحويلات</span>
                </button>

                <button
                    onClick={() => handleTabChange('availability')}
                    className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm rounded-t-2xl transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                        activeTab === 'availability'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                    <Sliders className="w-4 h-4" />
                    <span>التوفر والإشعارات</span>
                </button>
            </div>

            {/* TAB 1: ACADEMIC PROFILE SETTINGS */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">المعلومات الأكاديمية والمهنية</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">بياناتك تظهر في صفحة تعريف المدرب وبطاقات الدورات</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    الاسم الأول <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    اسم العائلة <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    المسمى والتخصص التدريبي الأكاديمي
                                </label>
                                <input
                                    type="text"
                                    value={profileData.specialization}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                                    placeholder="مثال: استشاري نظم الذكاء الاصطناعي ومطور برمجيات سحابية"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    رقم الهاتف للتواصل
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    الموقع الشخصي أو السيرة الذاتية الرقمية
                                </label>
                                <input
                                    type="url"
                                    value={profileData.website}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                    placeholder="https://..."
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio & Philosophy */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">النبذة المهنية وخبرة التدريس</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">شارك الطلاب خبراتك العملية وإنجازاتك التدريبية</p>
                            </div>
                        </div>

                        <div>
                            <textarea
                                rows="5"
                                value={profileData.bio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="اكتب نبذة تعريفية شاملة عن مسيرتك المهنية ومجالات تميزك..."
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">حسابات التواصل المهني</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">روابط منصاتك لتسهيل وصول الطلاب والمتابعين</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    حساب LinkedIn
                                </label>
                                <input
                                    type="url"
                                    value={profileData.socials.linkedin}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, linkedin: e.target.value }
                                    }))}
                                    placeholder="https://linkedin.com/in/..."
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    حساب Twitter / X
                                </label>
                                <input
                                    type="url"
                                    value={profileData.socials.twitter}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, twitter: e.target.value }
                                    }))}
                                    placeholder="https://x.com/..."
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                            {savingProfile ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>حفظ بيانات الملف الأكاديمي</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 2: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Primary Email */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">البريد الإلكتروني المعتمد</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">يستخدم لتسجيل الدخول واستلام تنبيهات تسجيل الطلاب والمبيعات</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>مفعّل</span>
                            </span>
                        </div>

                        <div className="max-w-xl">
                            <input
                                type="email"
                                disabled
                                value={securityData.email}
                                dir="ltr"
                                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <form onSubmit={handleSaveSecurity} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">تحديث كلمة المرور</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">لحماية حساب التدريس والبيانات المالية</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    كلمة المرور الحالية <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        required
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    كلمة المرور الجديدة (8 أحرف على الأقل) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={securityData.newPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {securityData.newPassword && (
                                    <div className="mt-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">قوة كلمة المرور:</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{passwordStrength.label}</span>
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

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    تأكيد كلمة المرور الجديدة <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={securityData.confirmPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {securityData.confirmPassword && (
                                    <div className="mt-1.5 text-xs">
                                        {securityData.newPassword === securityData.confirmPassword ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" />
                                                <span>كلمتا المرور متطابقتان</span>
                                            </span>
                                        ) : (
                                            <span className="text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>كلمتا المرور غير متطابقتين</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={savingSecurity || (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword)}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                            >
                                {savingSecurity ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>جاري التحديث...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>تحديث كلمة المرور</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: PAYOUT & BANKING DETAILS */}
            {activeTab === 'payout' && (
                <form onSubmit={handleSavePayout} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">تفاصيل الحساب البنكي والتحويلات المالية</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">تستخدم لتحويل مستحقاتك وعوائد مبيعات الدورات مباشرة إلى حسابك المصرفي</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    اسم المستفيد (مطابق تماماً للحساب البنكي) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={payoutData.bankDetails.accountHolder}
                                    onChange={(e) => setPayoutData(prev => ({
                                        ...prev,
                                        bankDetails: { ...prev.bankDetails, accountHolder: e.target.value }
                                    }))}
                                    placeholder="الاسم الكامل كما يظهر في كشف الحساب"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    اسم البنك <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={payoutData.bankDetails.bankName}
                                    onChange={(e) => setPayoutData(prev => ({
                                        ...prev,
                                        bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                                    }))}
                                    placeholder="مثال: مصرف الراجحي / البنك الأهلي السعودي"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    رقم الآيبان الدولي (IBAN) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={payoutData.bankDetails.iban}
                                    onChange={(e) => setPayoutData(prev => ({
                                        ...prev,
                                        bankDetails: { ...prev.bankDetails, iban: e.target.value.toUpperCase() }
                                    }))}
                                    placeholder="SA00 0000 0000 0000 0000 0000"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    رقم الحساب المحلي
                                </label>
                                <input
                                    type="text"
                                    value={payoutData.bankDetails.accountNumber}
                                    onChange={(e) => setPayoutData(prev => ({
                                        ...prev,
                                        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                                    }))}
                                    placeholder="رقم الحساب البنكي"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    رمز السويفت كود (SWIFT/BIC)
                                </label>
                                <input
                                    type="text"
                                    value={payoutData.bankDetails.swiftCode}
                                    onChange={(e) => setPayoutData(prev => ({
                                        ...prev,
                                        bankDetails: { ...prev.bankDetails, swiftCode: e.target.value.toUpperCase() }
                                    }))}
                                    placeholder="RJHI..."
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                يتم تحويل مستحقاتك المالية تلقائياً فور وصول رصيدك للحد الأدنى (50 ر.س) وفق الجدول المالي المعتمد في الأكاديمية.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingPayout}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                            {savingPayout ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>حفظ وتأكيد البيانات المصرفية</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 4: AVAILABILITY & NOTIFICATIONS */}
            {activeTab === 'availability' && (
                <form onSubmit={handleSaveAvailability} className="space-y-6">
                    {/* Availability Status */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">حالة التوفر والرد التلقائي</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">تحديد جاهزيتك لاستقبال استفسارات الطلاب وجلسات التدريس</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    حالة التدريس الحالية
                                </label>
                                <select
                                    value={availabilityData.status}
                                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full sm:w-72 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                                >
                                    <option value="available">🟢 متاح ونشط للتدريس والرد</option>
                                    <option value="busy">🟡 مشغول حالياً (قد يتأخر الرد)</option>
                                    <option value="away">🔴 في إجازة / غير متاح مؤقتاً</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    رسالة الرد التلقائي للطلاب (اختياري)
                                </label>
                                <textarea
                                    rows="3"
                                    value={availabilityData.autoReply}
                                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, autoReply: e.target.value }))}
                                    placeholder="مثال: مرحباً بك، سيتم الرد على استفسارك خلال 24 ساعة..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Toggles */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">تفضيلات إشعارات وتنبيهات التدريس</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">تحكم في التنبيهات التي تصلك على بريدك الإلكتروني</p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-4">
                            {/* New Student Enrollment */}
                            <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">تسجيل طلاب جدد في دوراتك</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">استلم تنبيهاً فورياً عند اشتراك أي طالب في أحد برامجك</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={availabilityData.notificationPreferences.newStudentEnrollment}
                                        onChange={(e) => setAvailabilityData(prev => ({
                                            ...prev,
                                            notificationPreferences: { ...prev.notificationPreferences, newStudentEnrollment: e.target.checked }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>

                            {/* Course Reviews */}
                            <div className="pt-4 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">تقييمات ومراجعات الدورات</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">إشعارك فور إضافة تقييم أو تعليق جديد من الطلاب</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={availabilityData.notificationPreferences.courseReviews}
                                        onChange={(e) => setAvailabilityData(prev => ({
                                            ...prev,
                                            notificationPreferences: { ...prev.notificationPreferences, courseReviews: e.target.checked }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>

                            {/* Course Questions */}
                            <div className="pt-4 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">أسئلة واستفسارات الطلاب</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">تنبيه فوري عند طرح سؤال جديد داخل مجتمع الدورة</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={availabilityData.notificationPreferences.courseQuestions}
                                        onChange={(e) => setAvailabilityData(prev => ({
                                            ...prev,
                                            notificationPreferences: { ...prev.notificationPreferences, courseQuestions: e.target.checked }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingAvailability}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                            {savingAvailability ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>حفظ التفضيلات والتوفر</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default InstructorSettings;
