import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService, categoryService } from '../services/new-api';
import { toast } from 'react-toastify';
import { getCountriesForSelect, getCitiesByCountry, getDefaultCities, getPhoneCodeByCountry } from '../data/countries';
import { useLanguage } from '../hooks/useLanguage';
import { 
    User, 
    UserPlus, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    MapPin, 
    Globe, 
    Briefcase, 
    Tag, 
    Users, 
    BookOpen, 
    TrendingUp, 
    Loader2, 
    ChevronDown,
    ChevronLeft,
    GraduationCap,
    ArrowRight,
    Award,
    Check
} from 'lucide-react';
import i18n from '../i18n';

const Register = () => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Step state: 1 = Role selection, 2 = Account registration form
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: 'student', // 'student' or 'instructor'
        firstName: '',
        lastName: '',
        phone: '',
        phoneCode: '+1',
        country: '',
        city: '',
        category: '',
        subCategory: '',
        gender: 'Male',
        email: '',
        password: '',
        acceptedTerms: false,
    });
    const [categories, setCategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
    const [availableCities, setAvailableCities] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const countries = getCountriesForSelect();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const roleParam = queryParams.get('role');
        if (roleParam === 'instructor' || roleParam === 'student') {
            setFormData(prev => ({ ...prev, role: roleParam }));
        }
    }, [location.search]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                if (response?.success && response?.data) {
                    const formattedCategories = response.data.map(category => ({
                        value: category.slug,
                        label: language === 'ar' ? (category.nameAr || category.nameEn) : category.nameEn,
                        id: category._id
                    }));
                    setCategories(formattedCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error(t('auth.toast.categoriesLoadFailed'));
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [language, t]);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (formData.category) {
                setSubcategoriesLoading(true);
                try {
                    const selectedCategory = categories.find(cat => cat.value === formData.category);
                    if (selectedCategory) {
                        const response = await categoryService.getSubcategories(selectedCategory.id);
                        if (response?.success && response?.data) {
                            const formattedSubcategories = response.data.map(subcategory => ({
                                value: subcategory.slug,
                                label: language === 'ar' ? (subcategory.nameAr || subcategory.nameEn) : subcategory.nameEn
                            }));
                            setAvailableSubcategories(formattedSubcategories);
                            
                            if (formData.subCategory && !formattedSubcategories.find(sub => sub.value === formData.subCategory)) {
                                setFormData(prev => ({ ...prev, subCategory: '' }));
                            }
                        } else {
                            setAvailableSubcategories([]);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching subcategories:', error);
                    setAvailableSubcategories([]);
                } finally {
                    setSubcategoriesLoading(false);
                }
            } else {
                setAvailableSubcategories([]);
                if (formData.subCategory) {
                    setFormData(prev => ({ ...prev, subCategory: '' }));
                }
            }
        };

        if (categories.length > 0) {
            fetchSubcategories();
        }
    }, [formData.category, categories]);

    useEffect(() => {
        if (formData.country) {
            const cities = getCitiesByCountry(formData.country);
            const defaultCities = getDefaultCities();
            setAvailableCities([...cities, ...defaultCities]);
            
            const phoneCode = getPhoneCodeByCountry(formData.country);
            setFormData(prev => ({ 
                ...prev, 
                phoneCode,
                city: '' 
            }));
        } else {
            setAvailableCities([]);
            setFormData(prev => ({ ...prev, city: '', phoneCode: '+1' }));
        }
    }, [formData.country]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({
            ...prev,
            phone: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast.error(t('auth.validation.firstLastNameRequired'));
            return;
        }
        if (!formData.email.trim()) {
            toast.error(t('auth.validation.emailRequired'));
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            toast.error(t('auth.validation.passwordMinLength'));
            return;
        }
        if (!formData.country.trim()) {
            toast.error(t('auth.validation.countryRequired'));
            return;
        }
        if (!formData.city.trim()) {
            toast.error(t('auth.validation.cityRequired'));
            return;
        }
        if (!formData.phone.trim()) {
            toast.error(t('auth.validation.phoneRequired'));
            return;
        }
        if (!formData.category.trim()) {
            toast.error(t('auth.register.selectCategory', 'يرجى اختيار التصنيف'));
            return;
        }
        if (!formData.subCategory.trim()) {
            toast.error(t('auth.register.selectSubCategory', 'يرجى اختيار التصنيف الفرعي'));
            return;
        }
        if (!formData.acceptedTerms) {
            toast.error(t('auth.validation.termsRequired'));
            return;
        }

        setIsLoading(true);
        try {
            await authService.register(formData);
            toast.success(t('auth.toast.registerSuccess'));
            navigate('/login');
        } catch (error) {
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .map(err => err.message || err)
                    .join(', ');
                toast.error(errorMessages);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(t('auth.toast.registerFailed'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isInstructor = formData.role === 'instructor';

    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] font-arabic overflow-x-hidden relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background Decorative Accent */}
            <div className="absolute bottom-0 end-0 w-36 sm:w-52 h-36 sm:h-52 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    <path d="M200,50 C120,50 50,120 50,200 L200,200 Z" fill="#ef4444" opacity="0.8" />
                    <path d="M200,100 C150,100 100,150 100,200 L200,200 Z" fill="#2563eb" />
                </svg>
            </div>

            {/* Left Hero Section (Banner) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40 relative flex-col justify-between p-6 xl:p-8 overflow-hidden border-e border-slate-200/70">
                <div className="absolute top-0 start-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Header Logo */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-8 object-contain" />
                    </Link>
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                        {isInstructor ? t('auth.register.instructorPortal', 'بوابة المحاضرين') : t('auth.register.studentPortal', 'بوابة الطلاب')}
                    </div>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 my-auto py-4 max-w-md mx-auto w-full">
                    {isInstructor ? (
                        <>
                            <h2 className="text-2xl xl:text-3xl font-black text-slate-900 leading-snug mb-2">
                                {t('auth.register.joinElite', 'انضم إلى نخبة المحاضرين')} <br />
                                <span className="text-blue-600">{t('auth.register.shareExperience', 'وشارك خبراتك مع آلاف المتدربين')}</span>
                            </h2>
                            <p className="text-slate-600 text-xs xl:text-sm mb-5 leading-relaxed">
                                {t('auth.register.instructorDesc', 'تمنحك منصة AEC بيئة احترافية لإدارة دوراتك، تقييم الطلاب، وبناء مسيرتك التدريبية بأعلى المعايير.')}
                            </p>

                            <div className="space-y-2.5 mb-5">
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.courseManagement', 'إدارة متكاملة للدورات والمحتوى')}</h4>
                                </div>
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.interactiveDashboard', 'لوحة تحكم وتحليلات تفاعلية')}</h4>
                                </div>
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.officialCertificates', 'شهادات واعتمادات رسمية لطلابك')}</h4>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl xl:text-3xl font-black text-slate-900 leading-snug mb-2">
                                {t('auth.register.startJourney', 'ابدأ رحلتك نحو')} <br />
                                <span className="text-blue-600">{t('auth.register.masterFields', 'الاحتراف في كافة المجالات')}</span>
                            </h2>
                            <p className="text-slate-600 text-xs xl:text-sm mb-5 leading-relaxed">
                                {t('auth.register.studentDesc', 'مع خبرة AEC في التدريب والتأهيل المهني، نمنحك المهارات والشهادات المعتمدة لتحقيق طموحاتك.')}
                            </p>

                            <div className="space-y-2.5 mb-5">
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.certifiedTeachers', 'مدرسين معتمدين وخبرة عالمية')}</h4>
                                </div>
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.advancedCurriculums', 'مناهج متقدمة تواكب أحدث الأساليب')}</h4>
                                </div>
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-800">{t('auth.register.motivatingEnv', 'بيئة تعليمية محفزة ومتابعة مستمرة')}</h4>
                                </div>
                            </div>
                        </>
                    )}

                    {/* AEC Campus Card */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
                        <img 
                            src="/assets/aec-building.jpg" 
                            alt="AEC Building" 
                            className="w-full h-36 object-cover object-center"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-md border border-white/60">
                            <img src="/assets/logo.png" alt="AEC" className="h-6 object-contain" />
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 pt-3 border-t border-slate-200/70 text-start font-sans text-xs text-slate-500 font-medium">
                    Master Skills &bull; <span className="text-blue-600 font-bold">Build Your Future</span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="w-full lg:w-[55%] xl:w-[58%] min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8 relative z-10">
                <div className="w-full max-w-[620px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(15,82,186,0.06)] border border-slate-100 my-auto">
                    
                    {/* Mobile Centered Logo */}
                    <div className="flex lg:hidden justify-center mb-5">
                        <Link to="/" className="hover:opacity-80 transition-opacity" title="العودة للرئيسية">
                            <img src="/assets/logo.png" alt="AEC American English Center" className="h-9 sm:h-10 object-contain" />
                        </Link>
                    </div>
                    {/* ======================================================== */}
                    {/* STEP 1: CHOICE OF ACCOUNT TYPE */}
                    {/* ======================================================== */}
                    {step === 1 && (
                        <div className="animate-in fade-in duration-200">
                            {/* Progress Pill */}
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                                    <span>{t('auth.register.step1Title', 'اختيار نوع الحساب')}</span>
                                </div>
                                <span className="text-slate-300 text-xs">&larr;</span>
                                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs font-medium">
                                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">2</span>
                                    <span>{t('auth.register.step2Title', 'بيانات التسجيل')}</span>
                                </div>
                            </div>

                            {/* Header Icon & Titles */}
                            <div className="text-center mb-5">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                                    {t('auth.register.chooseAccountType', 'اختر نوع الحساب')}
                                </h1>
                                <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                                    {t('auth.register.chooseAccountTypeSubtitle', 'حدد صفتك في المنصة للبدء في رحلتك التعليمية')}
                                </p>
                            </div>

                            {/* Role Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                                {/* Student Card */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-150 text-start group ${
                                        formData.role === 'student'
                                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                            formData.role === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            formData.role === 'student' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {formData.role === 'student' && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{t('auth.register.studentTitle', 'أنا طالب')}</h3>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">متدرب</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed min-h-[30px] mb-2.5">
                                        {t('auth.register.studentSubtitle', 'أرغب في التعلم والتسجيل في الدورات وتطوير مهاراتي المهنية.')}
                                    </p>
                                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        <span>شهادات معتمدة وتدريب تطبيقي</span>
                                    </div>
                                </div>

                                {/* Instructor Card */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'instructor' }))}
                                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-150 text-start group ${
                                        formData.role === 'instructor'
                                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                            formData.role === 'instructor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            formData.role === 'instructor' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {formData.role === 'instructor' && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{t('auth.register.instructorTitle', 'أنا محاضر')}</h3>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">مدرب</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed min-h-[30px] mb-2.5">
                                        {t('auth.register.instructorSubtitle', 'أرغب في تقديم وشرح الدورات وإدارة ومتابعة المتدربين.')}
                                    </p>
                                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        <span>لوحة تحكم خاصة وإدارة شاملة</span>
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm group"
                            >
                                <span>
                                    {formData.role === 'instructor' 
                                        ? t('auth.register.continueAsInstructor', 'المتابعة كمحاضر') 
                                        : t('auth.register.continueAsStudent', 'المتابعة كطالب')}
                                </span>
                                <ChevronLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
                            </button>

                            <div className="mt-4 text-center text-xs text-slate-500">
                                <span>{t('auth.register.hasAccount')} </span>
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                    {t('auth.register.loginHere')}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* STEP 2: REGISTRATION FORM */}
                    {/* ======================================================== */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-200">
                            {/* Step Indicator Header */}
                            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold"
                                        title={t('auth.register.backToStep1', 'الرجوع للخطوة 1')}
                                    >
                                        ✓
                                    </button>
                                    <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                        2
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 ps-1">
                                        {t('auth.register.step2Title', 'بيانات الحساب')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-bold">
                                        {isInstructor ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                                        <span>{isInstructor ? 'حساب محاضر' : 'حساب طالب'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold underline px-1"
                                    >
                                        تغيير
                                    </button>
                                </div>
                            </div>

                            {/* Form Header */}
                            <div className="text-center mb-4">
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 mb-0.5">
                                    {isInstructor ? t('auth.register.createInstructorAccount', 'إنشاء حساب محاضر جديد') : t('auth.register.createStudentAccount', 'إنشاء حساب طالب جديد')}
                                </h1>
                                <p className="text-slate-500 text-xs">
                                    {isInstructor 
                                        ? 'أدخل بياناتك للانضمام كمدرب في منصة AEC' 
                                        : 'أدخل بياناتك للانضمام إلى منصة AEC والبدء بالتعلم'}
                                </p>
                            </div>

                            {/* Form Grid */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                    {/* First Name */}
                                    <div className="space-y-1">
                                        <label htmlFor="firstName" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.firstName')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full ps-9 pe-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                                placeholder={t('auth.register.firstNamePlaceholder', 'أحمد')}
                                            />
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1">
                                        <label htmlFor="lastName" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.lastName')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full ps-9 pe-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                                placeholder={t('auth.register.lastNamePlaceholder', 'محمد')}
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1">
                                        <label htmlFor="country" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.country')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Globe className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                                className="w-full ps-9 pe-7 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="">{t('auth.register.selectCountry')}</option>
                                                {countries.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1">
                                        <label htmlFor="city" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.city')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.country}
                                                className="w-full ps-9 pe-7 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                                            >
                                                <option value="">{t('auth.register.selectCity')}</option>
                                                {availableCities.map((cty, idx) => (
                                                    <option key={idx} value={cty}>{cty}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <label htmlFor="phone" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.phoneNumber')}
                                        </label>
                                        <div className="relative flex items-center" dir="ltr">
                                            <span className="bg-slate-100 border border-slate-200 border-e-0 rounded-s-lg px-2.5 py-2 text-xs text-slate-600 font-semibold select-none">
                                                {formData.phoneCode}
                                            </span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-e-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                                placeholder="501234567"
                                                pattern="[0-9]+"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1">
                                        <label htmlFor="gender" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.gender')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Users className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full ps-9 pe-7 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium appearance-none cursor-pointer transition-all"
                                            >
                                                <option value="Male">{t('auth.register.genderMale')}</option>
                                                <option value="Female">{t('auth.register.genderFemale')}</option>
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label htmlFor="category" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {isInstructor ? t('auth.register.categoryInstructor', 'مجال التخصص') : t('auth.register.categoryStudent', 'التصنيف والمجال')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Briefcase className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full ps-9 pe-7 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                                            >
                                                <option value="">
                                                    {loading ? t('auth.register.loadingCategories') : t('auth.register.selectCategory')}
                                                </option>
                                                {categories.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Sub Category */}
                                    <div className="space-y-1">
                                        <label htmlFor="subCategory" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {isInstructor ? t('auth.register.subCategoryInstructor', 'التخصص الفرعي') : t('auth.register.subCategoryStudent', 'التخصص الفرعي')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Tag className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="subCategory"
                                                name="subCategory"
                                                value={formData.subCategory}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.category || subcategoriesLoading}
                                                className="w-full ps-9 pe-7 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                                            >
                                                <option value="">
                                                    {subcategoriesLoading 
                                                        ? t('auth.register.loadingSubcategories')
                                                        : availableSubcategories.length === 0 && formData.category
                                                        ? t('auth.register.noSubcategories')
                                                        : t('auth.register.selectSubCategory')
                                                    }
                                                </option>
                                                {!subcategoriesLoading && availableSubcategories.map((sub) => (
                                                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1">
                                        <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.email')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full ps-9 pe-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                                placeholder="you@example.com"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1">
                                        <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 text-start">
                                            {t('auth.register.password')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full ps-9 pe-9 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                                placeholder={t('auth.register.passwordPlaceholder', 'كلمة المرور')}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start gap-2 pt-1 text-start">
                                    <input
                                        id="acceptedTerms"
                                        name="acceptedTerms"
                                        type="checkbox"
                                        checked={formData.acceptedTerms}
                                        onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                                        className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                                    />
                                    <label htmlFor="acceptedTerms" className="text-[11px] text-slate-600 leading-normal cursor-pointer select-none">
                                        {t('auth.register.acceptTermsLabel')}{' '}
                                        <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-semibold">
                                            {t('auth.register.termsLink')}
                                        </Link>{' '}
                                        {t('auth.register.and')}{' '}
                                        <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline font-semibold">
                                            {t('auth.register.privacyLink')}
                                        </Link>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm mt-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{t('auth.register.submitting')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>{isInstructor ? t('auth.register.createInstructorSubmit', 'إنشاء حساب محاضر') : t('auth.register.submit', 'إنشاء حساب طالب')}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back and Login Links */}
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold"
                                >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    <span>{t('auth.register.backToRoleSelection', 'تغيير نوع الحساب')}</span>
                                </button>
                                <div>
                                    <span>{t('auth.register.hasAccount')} </span>
                                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                        {t('auth.register.loginHere')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Register;