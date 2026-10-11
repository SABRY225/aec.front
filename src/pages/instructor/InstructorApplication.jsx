import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { instructorService, categoryService } from '../../services/new-api';
import { getCountriesForSelect } from '../../data/countries';
import FileUpload from '../../components/shared/FileUpload/FileUpload';
import PhoneCodeSelector from '../../components/shared/PhoneCodeSelector/PhoneCodeSelector';
import { toast } from 'react-toastify';
import { 
    Briefcase, 
    User, 
    Mail, 
    Phone, 
    GraduationCap, 
    FileText, 
    Video, 
    Image as ImageIcon, 
    CheckCircle2, 
    ShieldCheck, 
    Sparkles, 
    Loader2, 
    ArrowLeft,
    LogOut, 
    Award, 
    MapPin, 
    Calendar, 
    Users,
    Check,
    AlertCircle,
    Compass,
    Lock,
    Globe,
    ExternalLink,
    HelpCircle,
    UserCheck,
    FileCheck2,
    Clock,
    Home,
    Layers,
    ChevronDown
} from 'lucide-react';

const InstructorApplication = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, updateUser, logout } = useAuth();
    const { isRTL, language } = useLanguage();
    const navigate = useNavigate();

    // Check if user should be here
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/instructor/apply');
            return;
        }

        // If verified, go to dashboard
        if (user?.role === 'instructor' && user?.isVerified) {
            navigate('/instructor/dashboard', { replace: true });
            return;
        }

        // If already applied and pending, go to pending approval
        if (user?.hasInstructorApplication || user?.instructorApplicationStatus === 'pending') {
            navigate('/instructor/pending-approval', { replace: true });
            return;
        }
    }, [isAuthenticated, user, navigate]);

    // Initial form state with prefilled user data
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        middleName: '',
        lastName: user?.lastName || '',
        age: '',
        gender: user?.gender ? (user.gender.toLowerCase() === 'female' ? 'female' : 'male') : 'male',
        maritalStatus: 'single',
        nationality: user?.country || 'Saudi Arabia',
        phone: user?.phone || '',
        email: user?.email || '',
        universityDegree: '',
        place: user?.country || '',
        category: user?.category || '',
        subCategory: user?.subCategory || '',
        cv: null,
        certificate: null,
        photo: user?.photo || null,
        video: null
    });

    const [phoneCode, setPhoneCode] = useState(user?.phoneCode || '+966');
    const [categories, setCategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const countries = getCountriesForSelect();

    // Section completeness tracking
    const section1Fields = ['firstName', 'middleName', 'lastName', 'age', 'gender', 'maritalStatus', 'nationality', 'place', 'phone', 'email'];
    const section2Fields = ['universityDegree', 'category', 'subCategory'];
    const section3Fields = ['cv', 'certificate', 'photo', 'video'];

    const isFieldFilled = (field) => {
        const val = formData[field];
        return val !== null && val !== undefined && String(val).trim() !== '';
    };

    const s1FilledCount = section1Fields.filter(isFieldFilled).length;
    const s2FilledCount = section2Fields.filter(isFieldFilled).length;
    const s3FilledCount = section3Fields.filter(isFieldFilled).length;

    const totalFilled = s1FilledCount + s2FilledCount + s3FilledCount;
    const totalFields = section1Fields.length + section2Fields.length + section3Fields.length;
    const progressPercent = Math.round((totalFilled / totalFields) * 100);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const triggerBoxUpload = (e, folderName) => {
        // Prevent re-triggering if the click is on an active interactive element
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('video') || e.target.closest('a') || e.target.closest('.file-upload-area')) {
            return;
        }
        const input = document.getElementById(`file-upload-input-${folderName}`);
        if (input) {
            input.click();
        }
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                if (response.success && response.data) {
                    const formatted = response.data.map(cat => ({
                        value: cat.slug,
                        label: language === 'ar' ? (cat.nameAr || cat.nameEn) : cat.nameEn,
                        id: cat._id
                    }));
                    setCategories(formatted);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, [language]);

    // Fetch subcategories when category changes
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (formData.category) {
                setSubcategoriesLoading(true);
                try {
                    const selected = categories.find(c => c.value === formData.category);
                    if (selected && selected.id) {
                        const response = await categoryService.getSubcategories(selected.id);
                        if (response.success && response.data) {
                            const formatted = response.data.map(sub => ({
                                value: sub.slug,
                                label: language === 'ar' ? (sub.nameAr || sub.nameEn) : sub.nameEn
                            }));
                            setAvailableSubcategories(formatted);
                        } else {
                            setAvailableSubcategories([]);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching subcategories:', err);
                    setAvailableSubcategories([]);
                } finally {
                    setSubcategoriesLoading(false);
                }
            } else {
                setAvailableSubcategories([]);
            }
        };

        if (categories.length > 0) {
            fetchSubcategories();
        }
    }, [formData.category, categories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const requiredText = [
            'firstName', 'middleName', 'lastName', 'age',
            'gender', 'maritalStatus', 'nationality', 'phone',
            'email', 'universityDegree', 'place', 'category', 'subCategory'
        ];

        for (const field of requiredText) {
            if (!formData[field] || String(formData[field]).trim() === '') {
                toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة للمتابعة.' : 'Please fill all required text fields.');
                if (section1Fields.includes(field)) scrollToSection('section-personal');
                else if (section2Fields.includes(field)) scrollToSection('section-academic');
                return;
            }
        }

        if (isNaN(formData.age) || Number(formData.age) < 18 || Number(formData.age) > 90) {
            toast.error(isRTL ? 'يرجى إدخال عمر صحيح بين 18 و 90 سنة.' : 'Please enter a valid age between 18 and 90.');
            scrollToSection('section-personal');
            return;
        }

        // Check required files
        if (!formData.cv) {
            toast.error(isRTL ? 'يرجى رفع ملف السيرة الذاتية (CV).' : 'Please upload your CV.');
            scrollToSection('section-documents');
            return;
        }
        if (!formData.certificate) {
            toast.error(isRTL ? 'يرجى رفع المؤهل أو الشهادة الأكاديمية.' : 'Please upload your academic certificates.');
            scrollToSection('section-documents');
            return;
        }
        if (!formData.photo) {
            toast.error(isRTL ? 'يرجى رفع الصورة الشخصية الرسمية للمحاضر.' : 'Please upload your official profile photo.');
            scrollToSection('section-documents');
            return;
        }
        if (!formData.video) {
            toast.error(isRTL ? 'يرجى رفع فيديو تعريفي أو مقطع شرح تجريبي.' : 'Please upload an intro or demo lecture video.');
            scrollToSection('section-documents');
            return;
        }

        setIsSubmitting(true);
        try {
            const fullPhone = formData.phone.startsWith('+') 
                ? formData.phone 
                : `${phoneCode}${formData.phone.replace(/^0+/, '')}`;

            const submitData = {
                ...formData,
                phone: fullPhone
            };

            await instructorService.applyToBeInstructor(submitData);

            // Update auth state so user has application
            updateUser({
                hasInstructorApplication: true,
                instructorApplicationStatus: 'pending'
            });

            toast.success(isRTL ? 'تم تقديم طلب الاعتماد بنجاح! جاري تحويلك لمتابعة حالة المراجعة...' : 'Application submitted successfully! Redirecting...');
            navigate('/instructor/pending-approval', { replace: true });
        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || (isRTL ? 'تعذر إرسال الطلب. يرجى التأكد من رفع جميع الملفات والمحاولة مجدداً.' : 'Failed to submit application. Please verify all files and try again.');
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-arabic pb-20 transition-colors duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* ========================================================================= */}
            {/* 3. FLOATING PROGRESS & STEPPER BAR                                        */}
            {/* ========================================================================= */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
                    
                    {/* Completion Percentage */}
                    <div className="w-full md:w-auto flex items-center gap-3 shrink-0">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-100 dark:text-slate-800"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={`${progressPercent === 100 ? 'text-emerald-500' : 'text-blue-600'} transition-all duration-700 ease-out`}
                                    strokeDasharray={`${progressPercent}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span className="absolute text-xs font-black text-slate-800 dark:text-slate-100">
                                {progressPercent}%
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {isRTL ? 'اكتمال بيانات الطلب' : 'Application Progress'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {isRTL ? `${totalFilled} من أصل ${totalFields} عنصراً مكتملاً` : `${totalFilled} of ${totalFields} fields completed`}
                            </p>
                        </div>
                    </div>

                    {/* Section Navigators */}
                    <div className="w-full md:flex-1 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => scrollToSection('section-personal')}
                            className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2 ${
                                s1FilledCount === section1Fields.length
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                s1FilledCount === section1Fields.length
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-blue-600 text-white'
                            }`}>
                                {s1FilledCount === section1Fields.length ? <Check className="w-3.5 h-3.5" /> : '1'}
                            </div>
                            <div className="min-w-0 hidden sm:block">
                                <p className="text-xs font-bold truncate">{isRTL ? 'البيانات الشخصية' : 'Personal'}</p>
                                <p className="text-[10px] text-slate-400">{s1FilledCount}/{section1Fields.length}</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('section-academic')}
                            className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2 ${
                                s2FilledCount === section2Fields.length
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                s2FilledCount === section2Fields.length
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-blue-600 text-white'
                            }`}>
                                {s2FilledCount === section2Fields.length ? <Check className="w-3.5 h-3.5" /> : '2'}
                            </div>
                            <div className="min-w-0 hidden sm:block">
                                <p className="text-xs font-bold truncate">{isRTL ? 'المؤهل والتخصص' : 'Academic'}</p>
                                <p className="text-[10px] text-slate-400">{s2FilledCount}/{section2Fields.length}</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('section-documents')}
                            className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2 ${
                                s3FilledCount === section3Fields.length
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                s3FilledCount === section3Fields.length
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-blue-600 text-white'
                            }`}>
                                {s3FilledCount === section3Fields.length ? <Check className="w-3.5 h-3.5" /> : '3'}
                            </div>
                            <div className="min-w-0 hidden sm:block">
                                <p className="text-xs font-bold truncate">{isRTL ? 'المستندات والفيديو' : 'Documents'}</p>
                                <p className="text-[10px] text-slate-400">{s3FilledCount}/{section3Fields.length}</p>
                            </div>
                        </button>
                    </div>

                </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. MAIN APPLICATION FORM                                                  */}
            {/* ========================================================================= */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* ----------------------------------------------------------------- */}
                    {/* SECTION 1: PERSONAL INFORMATION & CONTACT                         */}
                    {/* ----------------------------------------------------------------- */}
                    <section id="section-personal" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                        
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-base">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{isRTL ? '1. البيانات الشخصية ومعلومات الاتصال' : '1. Personal Information & Contact'}</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {isRTL ? 'يرجى إدخال البيانات الشخصية الرسمية كما تظهر في الهوية الوطنية أو جواز السفر.' : 'Enter official personal data as on your ID or Passport.'}
                                    </p>
                                </div>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                s1FilledCount === section1Fields.length
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {isRTL ? `${s1FilledCount} من ${section1Fields.length} مكتمل` : `${s1FilledCount}/${section1Fields.length} completed`}
                            </span>
                        </div>

                        {/* Full Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* First Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الاسم الأول' : 'First Name'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={isRTL ? 'محمد' : 'Mohammed'}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الاسم الأوسط / اسم الأب' : 'Middle Name / Father Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={isRTL ? 'عبدالله أو اللقب' : 'Abdullah'}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'اسم العائلة / اللقب' : 'Last Name / Family Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={isRTL ? 'الغامدي' : 'Al-Ghamdi'}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Demographics: Age, Gender, Marital Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {/* Age */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'العمر (بالسنوات)' : 'Age (Years)'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="age"
                                        min="18"
                                        max="90"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="34"
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                                >
                                    <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                                    <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                                </select>
                            </div>

                            {/* Marital Status */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الحالة الاجتماعية' : 'Marital Status'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="maritalStatus"
                                    value={formData.maritalStatus}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                                >
                                    <option value="single">{isRTL ? 'أعزب / عزباء' : 'Single'}</option>
                                    <option value="married">{isRTL ? 'متزوج / متزوجة' : 'Married'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Location: Nationality & Residence */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Nationality */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الجنسية' : 'Nationality'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                                >
                                    <option value="">{isRTL ? '-- اختر الجنسية --' : '-- Select Nationality --'}</option>
                                    {countries.map((c) => (
                                        <option key={c.value} value={c.label}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Place of Residence */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'دولة ومكان الإقامة الحالي' : 'Country of Residence'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="place"
                                    value={formData.place}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                                >
                                    <option value="">{isRTL ? '-- اختر مكان الإقامة --' : '-- Select Country of Residence --'}</option>
                                    {countries.map((c) => (
                                        <option key={c.value} value={c.label}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Contact: Phone & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'رقم الجوال للاتصال والتواصل' : 'Contact Mobile Number'} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all bg-slate-50/50 dark:bg-slate-800/60" dir="ltr">
                                    <PhoneCodeSelector
                                        value={phoneCode}
                                        onChange={(code) => setPhoneCode(code)}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="501234567"
                                        className="w-full px-4 py-3 text-xs sm:text-sm focus:outline-none font-medium bg-transparent text-slate-900 dark:text-white"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isRTL ? 'سيتم استخدام الرقم لإرسال إشعارات اعتماد الحساب والتواصل الرسمي.' : 'Used for official SMS and verification.'}
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'البريد الإلكتروني الرسمي' : 'Official Email Address'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    dir="ltr"
                                    placeholder="doctor@example.com"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {isRTL ? 'بريد استلام تقارير الدورات ومراسلات الإدارة الأكاديمية.' : 'Used for course reports and administration notices.'}
                                </p>
                            </div>
                        </div>

                    </section>

                    {/* ----------------------------------------------------------------- */}
                    {/* SECTION 2: ACADEMIC QUALIFICATIONS & SPECIALIZATION               */}
                    {/* ----------------------------------------------------------------- */}
                    <section id="section-academic" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                        
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-base">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{isRTL ? '2. المؤهلات الأكاديمية والتخصص التدريبي' : '2. Academic Qualifications & Specialization'}</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {isRTL ? 'حدد شهاداتك العلمية والتصنيف التدريبي الذي ترغب بتقديم دورات تحته في الأكاديمية.' : 'Specify your academic degrees and preferred training discipline.'}
                                    </p>
                                </div>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                s2FilledCount === section2Fields.length
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {isRTL ? `${s2FilledCount} من ${section2Fields.length} مكتمل` : `${s2FilledCount}/${section2Fields.length} completed`}
                            </span>
                        </div>

                        {/* University Degree Input */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                {isRTL ? 'المؤهل الأكاديمي والشهادة الجامعية' : 'Academic Degree & Field of Study'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="universityDegree"
                                value={formData.universityDegree}
                                onChange={handleInputChange}
                                required
                                placeholder={isRTL ? 'مثال: دكتوراه في إدارة الأعمال والمشاريع • ماجستير علوم الحاسب • بكالوريوس صيدلة...' : 'e.g., Ph.D. in Business Administration, M.Sc. in Computer Science...'}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                            />
                        </div>

                        {/* Category & Subcategory Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Main Category */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'مجال التخصص التدريبي الرئيسي' : 'Primary Training Category'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    disabled={categoriesLoading}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                                >
                                    <option value="">{isRTL ? '-- اختر مجال التخصص الرئيسي --' : '-- Select Category --'}</option>
                                    {categories.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'التخصص الفرعي الدقيق' : 'Sub-Category Specialization'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!formData.category || subcategoriesLoading}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">
                                        {subcategoriesLoading 
                                            ? (isRTL ? 'جاري تحميل التخصصات الفرعية...' : 'Loading subcategories...')
                                            : (isRTL ? '-- اختر التخصص الفرعي --' : '-- Select Subcategory --')}
                                    </option>
                                    {availableSubcategories.map((sub) => (
                                        <option key={sub.value} value={sub.value}>
                                            {sub.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Specialization Tip Box */}
                        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                                {isRTL 
                                    ? 'يساعد تحديد تخصصك بدقة طلاب الأكاديمية على الوصول المباشر لدوراتك في محركات البحث والتصنيفات، كما يمكنك إضافة مجالات إضافية لاحقاً بعد تفعيل الحساب.'
                                    : 'Choosing your exact discipline ensures students find your courses accurately in catalogs. You can request more categories after approval.'}
                            </p>
                        </div>

                    </section>

                    {/* ----------------------------------------------------------------- */}
                    {/* SECTION 3: OFFICIAL DOCUMENTS & VERIFICATION ASSETS               */}
                    {/* ----------------------------------------------------------------- */}
                    <section id="section-documents" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                        
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-[#F7931E] text-white flex items-center justify-center shadow-md shadow-amber-500/20 font-black text-base">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{isRTL ? '3. المستندات الرسمية وملفات الاعتماد' : '3. Official Documents & Accreditation Assets'}</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {isRTL ? 'المستندات المطلوبة لاعتماد الهوية الأكاديمية وتفعيل صلاحيات نشر الدورات.' : 'Required documents to verify your instructor profile.'}
                                    </p>
                                </div>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                                s3FilledCount === section3Fields.length
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {isRTL ? `${s3FilledCount} من ${section3Fields.length} مكتمل` : `${s3FilledCount}/${section3Fields.length} completed`}
                            </span>
                        </div>

                        {/* Uploads Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            {/* CV Upload */}
                            <div 
                                onClick={(e) => triggerBoxUpload(e, 'instructor-applications/cvs')}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-blue-500 hover:shadow-lg ${
                                    formData.cv
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                                title={isRTL ? 'انقر هنا لرفع السيرة الذاتية (CV)' : 'Click here to upload CV'}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'السيرة الذاتية (CV)' : 'Curriculum Vitae (CV)'} <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">{isRTL ? 'ملف PDF حديث لا يتجاوز 50MB (انقر لفتح واختيار الملف)' : 'PDF up to 50MB (click to select file)'}</p>
                                        </div>
                                    </div>
                                    {formData.cv && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                                            <Check className="w-3 h-3" />
                                            <span>{isRTL ? 'تم الرفع' : 'Uploaded'}</span>
                                        </span>
                                    )}
                                </div>
                                <FileUpload
                                    accept="application/pdf"
                                    maxSize={50 * 1024 * 1024}
                                    folder="instructor-applications/cvs"
                                    onUploadSuccess={(res) => {
                                        setFormData(prev => ({ ...prev, cv: res.url }));
                                        toast.success(isRTL ? 'تم رفع ملف السيرة الذاتية بنجاح ✨' : 'CV uploaded successfully ✨');
                                    }}
                                    onUploadError={() => toast.error(isRTL ? 'تعذر رفع ملف السيرة الذاتية.' : 'Failed to upload CV.')}
                                    label={isRTL ? 'رفع ملف السيرة الذاتية (PDF)' : 'Upload CV File (PDF)'}
                                    helperText={isRTL ? 'اضغط في أي مكان في الصندوق أو اسحب الملف هنا' : 'Click anywhere in this box or drag file here'}
                                    value={formData.cv}
                                />
                            </div>

                            {/* Certificates Upload */}
                            <div 
                                onClick={(e) => triggerBoxUpload(e, 'instructor-applications/certificates')}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-blue-500 hover:shadow-lg ${
                                    formData.certificate
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                                title={isRTL ? 'انقر هنا لرفع الشهادات والمؤهلات' : 'Click here to upload certificates'}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'الشهادات والمؤهلات الأكاديمية' : 'Academic Certificates'} <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">{isRTL ? 'صورة واضحة أو ملف PDF (انقر لفتح واختيار الملف)' : 'Image or PDF (click to select file)'}</p>
                                        </div>
                                    </div>
                                    {formData.certificate && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                                            <Check className="w-3 h-3" />
                                            <span>{isRTL ? 'تم الرفع' : 'Uploaded'}</span>
                                        </span>
                                    )}
                                </div>
                                <FileUpload
                                    accept="image/jpeg,image/png,application/pdf"
                                    maxSize={50 * 1024 * 1024}
                                    folder="instructor-applications/certificates"
                                    onUploadSuccess={(res) => {
                                        setFormData(prev => ({ ...prev, certificate: res.url }));
                                        toast.success(isRTL ? 'تم رفع الشهادة الأكاديمية بنجاح ✨' : 'Certificate uploaded ✨');
                                    }}
                                    onUploadError={() => toast.error(isRTL ? 'تعذر رفع ملف الشهادة.' : 'Failed to upload certificate.')}
                                    label={isRTL ? 'رفع الشهادة أو وثيقة التخرج' : 'Upload Certificate / Diploma'}
                                    helperText={isRTL ? 'اضغط في أي مكان في الصندوق أو اسحب الملف هنا' : 'Click anywhere in this box or drag file here'}
                                    showPreview={true}
                                    previewType="auto"
                                    value={formData.certificate}
                                />
                            </div>

                            {/* Instructor Photo Upload */}
                            <div 
                                onClick={(e) => triggerBoxUpload(e, 'instructor-applications/photos')}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-blue-500 hover:shadow-lg ${
                                    formData.photo
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                                title={isRTL ? 'انقر هنا لرفع الصورة الشخصية الرسمية' : 'Click here to upload portrait photo'}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'الصورة الشخصية الرسمية للمحاضر' : 'Official Instructor Photo'} <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">{isRTL ? 'صورة واضحة تظهر ببروفايلك للطلاب (انقر لفتح واختيار الملف)' : 'Displayed on profile (click to select file)'}</p>
                                        </div>
                                    </div>
                                    {formData.photo && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                                            <Check className="w-3 h-3" />
                                            <span>{isRTL ? 'تم الرفع' : 'Uploaded'}</span>
                                        </span>
                                    )}
                                </div>
                                <FileUpload
                                    accept="image/jpeg,image/png"
                                    maxSize={20 * 1024 * 1024}
                                    folder="instructor-applications/photos"
                                    onUploadSuccess={(res) => {
                                        setFormData(prev => ({ ...prev, photo: res.url }));
                                        toast.success(isRTL ? 'تم رفع الصورة الشخصية بنجاح ✨' : 'Profile photo uploaded ✨');
                                    }}
                                    onUploadError={() => toast.error(isRTL ? 'تعذر رفع الصورة الشخصية.' : 'Failed to upload photo.')}
                                    label={isRTL ? 'رفع الصورة الشخصية الرسمية' : 'Upload Official Portrait Photo'}
                                    helperText={isRTL ? 'اضغط في أي مكان في الصندوق أو اسحب الملف هنا' : 'Click anywhere in this box or drag file here'}
                                    showPreview={true}
                                    previewType="image"
                                    value={formData.photo}
                                />
                            </div>

                            {/* Demo/Intro Video Upload */}
                            <div 
                                onClick={(e) => triggerBoxUpload(e, 'instructor-applications/videos')}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-blue-500 hover:shadow-lg ${
                                    formData.video
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                }`}
                                title={isRTL ? 'انقر هنا لرفع الفيديو التعريفي' : 'Click here to upload demo video'}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'فيديو تعريفي أو مقطع شرح تجريبي' : 'Intro Video / Teaching Demo'} <span className="text-red-500">*</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-400">{isRTL ? 'مقطع (2-5 دقائق) يوضح أسلوب إلقائك (انقر لفتح واختيار الملف)' : 'Short demo video (click to select file)'}</p>
                                        </div>
                                    </div>
                                    {formData.video && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                                            <Check className="w-3 h-3" />
                                            <span>{isRTL ? 'تم الرفع' : 'Uploaded'}</span>
                                        </span>
                                    )}
                                </div>
                                <FileUpload
                                    accept="video/mp4,video/quicktime,video/webm"
                                    maxSize={150 * 1024 * 1024}
                                    folder="instructor-applications/videos"
                                    onUploadSuccess={(res) => {
                                        setFormData(prev => ({ ...prev, video: res.url }));
                                        toast.success(isRTL ? 'تم رفع الفيديو بنجاح ✨' : 'Demo video uploaded ✨');
                                    }}
                                    onUploadError={() => toast.error(isRTL ? 'تعذر رفع الفيديو التعريفي.' : 'Failed to upload video.')}
                                    label={isRTL ? 'رفع الفيديو التعريفي (MP4)' : 'Upload Video Demo (MP4)'}
                                    helperText={isRTL ? 'اضغط في أي مكان في الصندوق أو اسحب الملف هنا' : 'Click anywhere in this box or drag file here'}
                                    showPreview={true}
                                    previewType="video"
                                    value={formData.video}
                                />
                            </div>

                        </div>

                        {/* Verification Guidance Notice */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                                <p className="font-bold">
                                    {isRTL ? 'نصائح لسرعة مراجعة واعتماد طلبك من اللجنة الأكاديمية:' : 'Tips for quick application approval:'}
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300/90 leading-relaxed">
                                    <li>{isRTL ? 'التأكد من أن السيرة الذاتية تتضمن خبراتك التدريبية والعملية السابقة.' : 'Ensure your CV highlights past teaching and training experience.'}</li>
                                    <li>{isRTL ? 'تقديم صورة شخصية رسمية ذات إضاءة ممتازة لخلق انطباع احترافي لدى طلابك.' : 'Use a well-lit, professional portrait photo.'}</li>
                                    <li>{isRTL ? 'أن يكون مقطع الفيديو واضح الصوت والصورة ويُظهر أسلوبك في الشرح وتبسيط المعلومة.' : 'Ensure demo video has clear audio and demonstrates teaching style.'}</li>
                                </ul>
                            </div>
                        </div>

                    </section>

                    {/* ----------------------------------------------------------------- */}
                    {/* SECURITY & TRUST REASSURANCE CARD                                 */}
                    {/* ----------------------------------------------------------------- */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-[#004C97] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-900/20">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {isRTL ? 'سرية وأمان البيانات والمستندات الرسمية' : 'Confidentiality & Data Protection'}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isRTL 
                                        ? 'تخضع جميع الوثائق المرفوعة لأعلى معايير التشفير والسرية التامة وتُستخدم لأغراض التحقق والاعتماد الداخلي فقط.'
                                        : 'All uploaded files are strictly encrypted and used solely for internal accreditation review.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 bg-white/80 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            <Clock className="w-4 h-4 text-[#F7931E]" />
                            <span>{isRTL ? 'مدة المراجعة: 24 - 48 ساعة' : 'Review Time: 24 - 48 Hours'}</span>
                        </div>
                    </div>

                    {/* ----------------------------------------------------------------- */}
                    {/* SUBMIT BUTTON BAR                                                 */}
                    {/* ----------------------------------------------------------------- */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4">
                        
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {progressPercent === 100 
                                    ? (isRTL ? '✨ جميع البيانات والمستندات مكتملة وجاهزة للإرسال' : '✨ All fields completed and ready for submission')
                                    : (isRTL ? `متبقي ${totalFields - totalFilled} حقول/مستندات لاستكمال الملف` : `${totalFields - totalFilled} fields remaining`)}
                            </p>
                            <p className="text-xs text-slate-400">
                                {isRTL 
                                    ? 'بالنقر على الإرسال، فإنك تؤكد صحة البيانات والمستندات المقدمة وتوافق على سياسة مدربي أكاديمية AEC.'
                                    : 'By submitting, you agree to AEC Academy instructor terms and guidelines.'}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#004C97] via-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.98] cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{isRTL ? 'جاري إرسال الطلب والمستندات...' : 'Submitting application...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isRTL ? 'إرسال طلب الاعتماد والمراجعة الأكاديمية' : 'Submit Accreditation Application'}</span>
                                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </main>

        </div>
    );
};

export default InstructorApplication;
