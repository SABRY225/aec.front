import { useState, useEffect } from 'react';
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
    Image, 
    CheckCircle2, 
    ShieldCheck, 
    Sparkles, 
    Loader2, 
    ArrowLeft,
    LogOut,
    Award,
    MapPin,
    Calendar,
    Users
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
                toast.error('يرجى ملء جميع الحقول المطلوبة للمتابعة.');
                return;
            }
        }

        if (isNaN(formData.age) || Number(formData.age) < 18 || Number(formData.age) > 90) {
            toast.error('يرجى إدخال عمر صحيح بين 18 و 90 سنة.');
            return;
        }

        // Check required files
        if (!formData.cv) {
            toast.error('يرجى رفع ملف السيرة الذاتية (CV).');
            return;
        }
        if (!formData.certificate) {
            toast.error('يرجى رفع المؤهل أو الشهادة الأكاديمية.');
            return;
        }
        if (!formData.photo) {
            toast.error('يرجى رفع الصورة الشخصية للمحاضر.');
            return;
        }
        if (!formData.video) {
            toast.error('يرجى رفع فيديو تعريفي أو شرح تجريبي.');
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

            toast.success('تم تقديم طلب الانضمام بنجاح! جاري تحويلك لمتابعة حالة المراجعة...');
            navigate('/instructor/pending-approval', { replace: true });
        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || 'تعذر إرسال الطلب. يرجى التأكد من رفع جميع الملفات والمحاولة مجدداً.';
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-arabic py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200" dir="rtl">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Logo & Actions Bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="inline-block bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-9 object-contain" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200/60 dark:border-red-900/50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>

                {/* Hero Header Card */}
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 start-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-bold mb-3 border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>طلب الانضمام إلى هيئة التدريس</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                            استكمل بياناتك لتقديم طلب اعتماد المحاضر
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                            مرحباً بك د/ <strong>{user?.firstName} {user?.lastName}</strong>. لقد قمت بإنشاء حسابك كمحاضر، يرجى الآن استكمال بياناتك الأكاديمية ورفع المستندات الرسمية لمراجعتها واعتماد حسابك للبدء في نشر الدورات والتدريب.
                        </p>
                    </div>
                </div>

                {/* Application Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Section 1: Personal Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                    1
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    البيانات الشخصية والمعلومات الأساسية
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* First Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الأول *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                    />
                                </div>

                                {/* Middle Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الأوسط *</label>
                                    <input
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="اسم الأب أو اللقب"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم العائلة *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Age */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العمر *</label>
                                    <input
                                        type="number"
                                        name="age"
                                        min="18"
                                        max="90"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="مثال: 32"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الجنس *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer"
                                    >
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>

                                {/* Marital Status */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحالة الاجتماعية *</label>
                                    <select
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer"
                                    >
                                        <option value="single">أعزب / عزباء</option>
                                        <option value="married">متزوج / متزوجة</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nationality */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الجنسية *</label>
                                    <select
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">اختر الجنسية</option>
                                        {countries.map((c) => (
                                            <option key={c.value} value={c.label}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Residence Place / Country */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">دولة ومكان الإقامة *</label>
                                    <select
                                        name="place"
                                        value={formData.place}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">اختر مكان الإقامة</option>
                                        {countries.map((c) => (
                                            <option key={c.value} value={c.label}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الجوال *</label>
                                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-blue-600" dir="ltr">
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
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none font-medium bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white"
                                            placeholder="501234567"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        dir="ltr"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Academic Qualification & Specialization */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    المؤهلات والتخصص التدريبي
                                </h3>
                            </div>

                            {/* Degree */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    المؤهل الأكاديمي والشهادة الجامعية *
                                </label>
                                <input
                                    type="text"
                                    name="universityDegree"
                                    value={formData.universityDegree}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="مثال: بكالوريوس في إدارة الأعمال، ماجستير لغويات، دكتوراه علوم حاسب..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        مجال التخصص التدريبي الرئيسي *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        disabled={categoriesLoading}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">اختر مجال التخصص</option>
                                        {categories.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        التخصص الفرعي الدقيق *
                                    </label>
                                    <select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.category || subcategoriesLoading}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:border-blue-600 focus:outline-none bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white transition-all font-medium cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">
                                            {subcategoriesLoading ? 'جاري التحميل...' : 'اختر التخصص الفرعي'}
                                        </option>
                                        {availableSubcategories.map((sub) => (
                                            <option key={sub.value} value={sub.value}>
                                                {sub.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: File Uploads */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                        المستندات والملفات المطلوبة
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        يرجى رفع المستندات الرسمية بصيغة واضحة لاعتماد طلبكم
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* CV Upload */}
                                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                                    <FileUpload
                                        accept="application/pdf"
                                        maxSize={50 * 1024 * 1024}
                                        folder="instructor-applications/cvs"
                                        onUploadSuccess={(res) => {
                                             setFormData(prev => ({ ...prev, cv: res.url }));
                                            toast.success('تم رفع السيرة الذاتية بنجاح.');
                                        }}
                                        onUploadError={() => toast.error('تعذر رفع ملف السيرة الذاتية.')}
                                        label="السيرة الذاتية (CV) *"
                                        helperText="ملف PDF محدث لا يتجاوز 50MB"
                                        value={formData.cv}
                                    />
                                </div>

                                {/* Certificates Upload */}
                                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                                    <FileUpload
                                        accept="image/jpeg,image/png,application/pdf"
                                        maxSize={50 * 1024 * 1024}
                                        folder="instructor-applications/certificates"
                                        onUploadSuccess={(res) => {
                                            setFormData(prev => ({ ...prev, certificate: res.url }));
                                            toast.success('تم رفع الشهادة الأكاديمية بنجاح.');
                                        }}
                                        onUploadError={() => toast.error('تعذر رفع ملف الشهادة.')}
                                        label="الشهادات والمؤهلات الأكاديمية *"
                                        helperText="صورة الشهادة أو ملف PDF"
                                        showPreview={true}
                                        previewType="auto"
                                        value={formData.certificate}
                                    />
                                </div>

                                {/* Instructor Photo */}
                                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                                    <FileUpload
                                        accept="image/jpeg,image/png"
                                        maxSize={20 * 1024 * 1024}
                                        folder="instructor-applications/photos"
                                        onUploadSuccess={(res) => {
                                            setFormData(prev => ({ ...prev, photo: res.url }));
                                            toast.success('تم رفع الصورة الشخصية بنجاح.');
                                        }}
                                        onUploadError={() => toast.error('تعذر رفع الصورة الشخصية.')}
                                        label="الصورة الشخصية الرسمية *"
                                        helperText="صورة شخصية حديثة بخلفية واضحة"
                                        showPreview={true}
                                        previewType="image"
                                        value={formData.photo}
                                    />
                                </div>

                                {/* Intro Video */}
                                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                                    <FileUpload
                                        accept="video/mp4,video/quicktime,video/webm"
                                        maxSize={150 * 1024 * 1024}
                                        folder="instructor-applications/videos"
                                        onUploadSuccess={(res) => {
                                            setFormData(prev => ({ ...prev, video: res.url }));
                                            toast.success('تم رفع الفيديو بنجاح.');
                                        }}
                                        onUploadError={() => toast.error('تعذر رفع الفيديو التعريفي.')}
                                        label="فيديو تعريفي أو مقطع شرح تجريبي *"
                                        helperText="فيديو قصير (2-5 دقائق) بصيغة MP4"
                                        showPreview={true}
                                        previewType="video"
                                        value={formData.video}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 transition-all duration-200 flex items-center justify-center gap-3 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>جاري إرسال الطلب والمستندات...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>إرسال طلب الانضمام للمراجعة والاعتماد</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default InstructorApplication;
