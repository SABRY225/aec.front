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
        <div className="min-h-screen w-full flex bg-[#f8fafc] font-arabic overflow-x-hidden relative selection:bg-blue-500 selection:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-0" />

            {/* Decorative Geometric Corner */}
            <div className="absolute bottom-0 end-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none z-0 opacity-80">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    <path d="M200,40 C110,40 40,110 40,200 L200,200 Z" fill="#ef4444" opacity="0.85" />
                    <path d="M200,90 C140,90 90,140 90,200 L200,200 Z" fill="#2563eb" />
                </svg>
            </div>

            {/* Left Hero Section (Banner) */}
            <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-e border-slate-800 shadow-2xl">
                {/* Background Patterns & Glows */}
                <div className="absolute -top-32 -start-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -end-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#60a5fa_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                
                {/* Header Logo */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3 hover:bg-white/15 transition-all shadow-lg hover:scale-105 duration-200">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                    </Link>
                    <div className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide flex items-center gap-2 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        {isInstructor ? t('auth.register.instructorPortal', 'بوابة المحاضرين') : t('auth.register.studentPortal', 'بوابة الطلاب')}
                    </div>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 my-auto py-6 max-w-lg mx-auto w-full">
                    {isInstructor ? (
                        <>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200 text-xs font-semibold mb-4">
                                <Briefcase className="w-4 h-4 text-amber-400" />
                                <span>{t('auth.register.instructorBadge', 'برنامج انضمام المحاضرين')}</span>
                            </div>

                            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                                {t('auth.register.joinElite', 'انضم إلى نخبة المحاضرين')} <br />
                                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                                    {t('auth.register.shareExperience', 'وشارك خبراتك مع آلاف المتدربين')}
                                </span>
                            </h2>
                            <p className="text-slate-300 text-sm xl:text-base mb-7 leading-relaxed">
                                {t('auth.register.instructorDesc', 'تمنحك منصة AEC بيئة احترافية متكاملة لإدارة دوراتك، تقييم الطلاب، وبناء مسيرتك التدريبية بأعلى المعايير.')}
                            </p>

                            <div className="space-y-3 mb-7">
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.courseManagement', 'إدارة متكاملة للدورات والمحتوى')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.courseManagementDesc', 'أدوات متطورة لرفع المحاضرات والاختبارات التفاعلية')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.interactiveDashboard', 'لوحة تحكم وتحليلات تفاعلية')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.interactiveDashboardDesc', 'تقارير وإحصائيات دقيقة حول تقدم الطلاب ومشاركاتهم')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.officialCertificates', 'شهادات واعتمادات رسمية لطلابك')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.officialCertificatesDesc', 'إصدار وتوثيق الشهادات المعتمدة تلقائياً للمجتازين')}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-200 text-xs font-semibold mb-4">
                                <GraduationCap className="w-4 h-4 text-blue-400" />
                                <span>{t('auth.register.studentBadgeBanner', 'رحلتك التعليمية تبدأ هنا')}</span>
                            </div>

                            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                                {t('auth.register.startJourney', 'ابدأ رحلتك نحو')} <br />
                                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                                    {t('auth.register.masterFields', 'الاحتراف في كافة المجالات')}
                                </span>
                            </h2>
                            <p className="text-slate-300 text-sm xl:text-base mb-7 leading-relaxed">
                                {t('auth.register.studentDesc', 'مع خبرة AEC في التدريب والتأهيل المهني، نمنحك المهارات والشهادات المعتمدة لتحقيق طموحاتك وبناء مستقبلك.')}
                            </p>

                            <div className="space-y-3 mb-7">
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.certifiedTeachers', 'مدرسين معتمدين وخبرة عالمية')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.certifiedTeachersDesc', 'تدريب مباشر مع نخبة من الخبراء والمتخصصين')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.advancedCurriculums', 'مناهج متقدمة تواكب أحدث الأساليب')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.advancedCurriculumsDesc', 'محتوى تطبيقي مصمم لسوق العمل الفعلي')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.register.motivatingEnv', 'بيئة تعليمية محفزة ومتابعة مستمرة')}</h4>
                                        <p className="text-[11px] text-slate-300">{t('auth.register.motivatingEnvDesc', 'تقييمات دورية ودعم أكاديمي على مدار الساعة')}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* AEC Campus Card */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-800/80 group">
                        <img 
                            src="/assets/aec-building.jpg" 
                            alt="AEC Campus" 
                            className="w-full h-44 xl:h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                        <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/60">
                                    <img src="/assets/logo.png" alt="AEC" className="h-6 object-contain" />
                                </div>
                                <span className="text-white text-xs font-bold drop-shadow">{t('auth.register.campusMain', 'AEC Campus • المقر الرئيسي')}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/80 text-white text-[11px] font-bold backdrop-blur-xs">
                                {t('auth.register.accreditedBadge', 'معتمد دولياً')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 pt-4 border-t border-white/10 text-start flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>American English Center &copy; {new Date().getFullYear()}</span>
                    <span className="text-blue-300 font-bold tracking-wider">{t('auth.register.buildFuture', 'Build Your Future')}</span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="w-full lg:w-[56%] xl:w-[58%] min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
                <div className="w-full max-w-[760px] xl:max-w-[840px] bg-white rounded-3xl p-6 sm:p-10 xl:p-12 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100 my-auto transition-all">
                    
                    {/* Centered Logo (Mobile) */}
                    <div className="flex lg:hidden justify-center mb-6">
                        <Link to="/" className="hover:scale-105 transition-transform duration-200" title={t('common.backToHome', 'العودة للرئيسية')}>
                            <img src="/assets/logo.png" alt="AEC American English Center" className="h-11 sm:h-12 object-contain" />
                        </Link>
                    </div>

                    {/* ======================================================== */}
                    {/* STEP 1: CHOICE OF ACCOUNT TYPE */}
                    {/* ======================================================== */}
                    {step === 1 && (
                        <div className="animate-in fade-in duration-200">
                            {/* Progress Pills */}
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold shadow-2xs">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                                    <span>{t('auth.register.step1Title', 'اختيار نوع الحساب')}</span>
                                </div>
                                <span className="text-slate-300 text-sm font-bold">&larr;</span>
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs sm:text-sm font-medium">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-bold">2</span>
                                    <span>{t('auth.register.step2Title', 'بيانات التسجيل')}</span>
                                </div>
                            </div>

                            {/* Header Icon & Titles */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-inner">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                    {t('auth.register.chooseAccountType', 'اختر نوع الحساب')}
                                </h1>
                                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                                    {t('auth.register.chooseAccountTypeSubtitle', 'حدد صفتك في المنصة للبدء في رحلتك التعليمية أو التدريبية')}
                                </p>
                            </div>

                            {/* Role Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                {/* Student Card */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                    className={`relative cursor-pointer p-6 sm:p-7 rounded-2xl border-2 transition-all duration-200 text-start group ${
                                        formData.role === 'student'
                                            ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-indigo-50/30 shadow-lg ring-4 ring-blue-500/10 -translate-y-0.5'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                            formData.role === 'student' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                        }`}>
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            formData.role === 'student' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {formData.role === 'student' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">{t('auth.register.studentTitle', 'أنا طالب')}</h3>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t('auth.register.traineeBadge', 'متدرب')}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[38px] mb-4">
                                        {t('auth.register.studentSubtitle', 'أرغب في التعلم والتسجيل في الدورات واكتساب مهارات مهنية متقدمة.')}
                                    </p>
                                    <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                                        <span>{t('auth.register.studentPerks', 'شهادات معتمدة • تدريب تطبيقي • متابعة مستمرة')}</span>
                                    </div>
                                </div>

                                {/* Instructor Card */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'instructor' }))}
                                    className={`relative cursor-pointer p-6 sm:p-7 rounded-2xl border-2 transition-all duration-200 text-start group ${
                                        formData.role === 'instructor'
                                            ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-indigo-50/30 shadow-lg ring-4 ring-blue-500/10 -translate-y-0.5'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                            formData.role === 'instructor' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                        }`}>
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            formData.role === 'instructor' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {formData.role === 'instructor' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">{t('auth.register.instructorTitle', 'أنا محاضر')}</h3>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{t('auth.register.trainerBadge', 'مدرب')}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[38px] mb-4">
                                        {t('auth.register.instructorSubtitle', 'أرغب في تقديم وشرح الدورات وبناء محتوى تدريبي وإدارة المتدربين.')}
                                    </p>
                                    <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                                        <span>{t('auth.register.instructorPerks', 'لوحة تحكم خاصة • نسب أرباح • توثيق حساب')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 text-sm sm:text-base group cursor-pointer"
                            >
                                <span>
                                    {formData.role === 'instructor' 
                                        ? t('auth.register.continueAsInstructor', 'المتابعة كمحاضر') 
                                        : t('auth.register.continueAsStudent', 'المتابعة كطالب')}
                                </span>
                                <ChevronLeft className={`w-5 h-5 transform transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'rotate-180 group-hover:translate-x-1'}`} />
                            </button>

                            <div className="mt-6 text-center text-sm sm:text-base text-slate-600 border-t border-slate-150 pt-5">
                                <span>{t('auth.register.hasAccount', 'لديك حساب بالفعل؟')} </span>
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline ms-1">
                                    {t('auth.register.loginHere', 'تسجيل الدخول')}
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
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-150">
                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                                        title={t('auth.register.backToStep1', 'الرجوع للخطوة 1')}
                                    >
                                        ✓
                                    </button>
                                    <div className="w-8 h-0.5 bg-emerald-500 rounded-full" />
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-600/30">
                                        2
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 ps-1">
                                        {t('auth.register.step2Title', 'بيانات الحساب')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 text-xs sm:text-sm font-bold">
                                        {isInstructor ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                                        <span>{isInstructor ? t('auth.register.instructorAccount', 'حساب محاضر') : t('auth.register.studentAccount', 'حساب طالب')}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-xs sm:text-sm text-slate-500 hover:text-blue-600 font-bold underline px-1 cursor-pointer transition-colors"
                                    >
                                        {t('auth.register.change', 'تغيير')}
                                    </button>
                                </div>
                            </div>

                            {/* Form Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                                    {isInstructor ? t('auth.register.createInstructorAccount', 'إنشاء حساب محاضر جديد') : t('auth.register.createStudentAccount', 'إنشاء حساب طالب جديد')}
                                </h1>
                                <p className="text-slate-500 text-xs sm:text-sm">
                                    {isInstructor 
                                        ? t('auth.register.createInstructorDesc', 'أدخل بياناتك للانضمام كمدرب معتمد في منصة AEC') 
                                        : t('auth.register.createStudentDesc', 'أدخل بياناتك للانضمام إلى منصة AEC والبدء في رحلتك التعليمية')}
                                </p>
                            </div>

                            {/* Form Grid */}
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    {/* First Name */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="firstName" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.firstName', 'الاسم الأول')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full ps-11 pe-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                                placeholder={t('auth.register.firstNamePlaceholder', 'أحمد')}
                                            />
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="lastName" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.lastName', 'اسم العائلة')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full ps-11 pe-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                                placeholder={t('auth.register.lastNamePlaceholder', 'محمد')}
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="country" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.country', 'الدولة')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                                className="w-full ps-11 pe-10 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium appearance-none cursor-pointer transition-all shadow-2xs"
                                            >
                                                <option value="">{t('auth.register.selectCountry', 'اختر الدولة')}</option>
                                                {countries.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-slate-400 absolute end-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="city" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.city', 'المدينة')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.country}
                                                className="w-full ps-11 pe-10 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all shadow-2xs"
                                            >
                                                <option value="">{t('auth.register.selectCity', 'اختر المدينة')}</option>
                                                {availableCities.map((cty, idx) => (
                                                    <option key={idx} value={cty}>{cty}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-slate-400 absolute end-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.phoneNumber', 'رقم الهاتف')}
                                        </label>
                                        <div className="relative flex items-center" dir="ltr">
                                            <span className="bg-slate-100 border border-slate-200 border-e-0 rounded-s-2xl px-3.5 py-3.5 text-sm font-bold text-slate-700 select-none">
                                                {formData.phoneCode}
                                            </span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-e-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                                placeholder={t('auth.register.phonePlaceholder', '501234567')}
                                                pattern="[0-9]+"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="gender" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.gender', 'الجنس')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full ps-11 pe-10 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium appearance-none cursor-pointer transition-all shadow-2xs"
                                            >
                                                <option value="Male">{t('auth.register.genderMale', 'ذكر')}</option>
                                                <option value="Female">{t('auth.register.genderFemale', 'أنثى')}</option>
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-slate-400 absolute end-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="category" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {isInstructor ? t('auth.register.categoryInstructor', 'مجال التخصص') : t('auth.register.categoryStudent', 'التصنيف والمجال')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full ps-11 pe-10 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all shadow-2xs"
                                            >
                                                <option value="">
                                                    {loading ? t('auth.register.loadingCategories', 'جاري تحميل التصنيفات...') : t('auth.register.selectCategory', 'اختر التصنيف')}
                                                </option>
                                                {categories.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-slate-400 absolute end-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Sub Category */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="subCategory" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {isInstructor ? t('auth.register.subCategoryInstructor', 'التخصص الفرعي') : t('auth.register.subCategoryStudent', 'التخصص الفرعي')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <select
                                                id="subCategory"
                                                name="subCategory"
                                                value={formData.subCategory}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.category || subcategoriesLoading}
                                                className="w-full ps-11 pe-10 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed transition-all shadow-2xs"
                                            >
                                                <option value="">
                                                    {subcategoriesLoading 
                                                        ? t('auth.register.loadingSubcategories', 'جاري تحميل التخصصات الفرعية...')
                                                        : availableSubcategories.length === 0 && formData.category
                                                        ? t('auth.register.noSubcategories', 'لا توجد تصنيفات فرعية متاحة')
                                                        : t('auth.register.selectSubCategory', 'اختر التصنيف الفرعي')
                                                    }
                                                </option>
                                                {!subcategoriesLoading && availableSubcategories.map((sub) => (
                                                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-slate-400 absolute end-3.5 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.email', 'البريد الإلكتروني')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full ps-11 pe-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                                placeholder={t('auth.register.emailPlaceholder', 'you@example.com')}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                            {t('auth.register.password', 'كلمة المرور')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full ps-11 pe-12 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                                placeholder={t('auth.register.passwordPlaceholder', 'كلمة المرور (6 أحرف على الأقل)')}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 end-0 pe-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                                title={showPassword ? t('auth.register.hidePassword', 'إخفاء كلمة المرور') : t('auth.register.showPassword', 'إظهار كلمة المرور')}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start gap-2.5 pt-2 text-start">
                                    <input
                                        id="acceptedTerms"
                                        name="acceptedTerms"
                                        type="checkbox"
                                        checked={formData.acceptedTerms}
                                        onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600 transition-all"
                                    />
                                    <label htmlFor="acceptedTerms" className="text-xs sm:text-sm text-slate-600 leading-normal cursor-pointer select-none">
                                        {t('auth.register.acceptTermsLabel', 'أوافق على')}{' '}
                                        <Link to="/terms" target="_blank" className="text-blue-600 hover:underline font-bold">
                                            {t('auth.register.termsLink', 'الشروط والأحكام')}
                                        </Link>{' '}
                                        {t('auth.register.and', 'و')}{' '}
                                        <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline font-bold">
                                            {t('auth.register.privacyLink', 'سياسة الخصوصية')}
                                        </Link>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-4 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('auth.register.submitting', 'جاري إنشاء الحساب...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>{isInstructor ? t('auth.register.createInstructorSubmit', 'إنشاء حساب محاضر') : t('auth.register.submit', 'إنشاء حساب طالب')}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back and Login Links */}
                            <div className="mt-6 flex items-center justify-between text-xs sm:text-sm text-slate-600 border-t border-slate-150 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors font-bold cursor-pointer"
                                >
                                    <ArrowRight className={`w-4 h-4 transform ${isRTL ? '' : 'rotate-180'}`} />
                                    <span>{t('auth.register.backToRoleSelection', 'تغيير نوع الحساب')}</span>
                                </button>
                                <div>
                                    <span>{t('auth.register.hasAccount', 'لديك حساب بالفعل؟')} </span>
                                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline ms-1">
                                        {t('auth.register.loginHere', 'تسجيل الدخول')}
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