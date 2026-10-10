import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    BookOpen, 
    Layers, 
    ListOrdered, 
    DollarSign,
    Globe, 
    Plus, 
    Trash2, 
    ArrowLeft,
    ArrowRight,
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    MapPin,
    Clock,
    FileText,
    Video,
    GraduationCap,
    Star,
    ExternalLink,
    HelpCircle,
    Search
} from 'lucide-react';
import { adminService, categoryService, subcategoryService } from '../../services/new-api';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

const CourseEdit = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [apiCategories, setApiCategories] = useState([]);
    const [apiSubcategories, setApiSubcategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [newTagInput, setNewTagInput] = useState('');
    const [newOutcomeInput, setNewOutcomeInput] = useState('');
    const [newRequirementInput, setNewRequirementInput] = useState('');

    // Form data state
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        title: '',
        description: '',
        category: '',
        subCategory: '',
        courseLevel: 'beginner',
        courseType: 'recorded',
        language: 'العربية',
        subtitleLanguage: '',
        duration: '',
        topic: '',
        topics: [],
        location: '',
        address: '',
        governorate: '',
        startDate: '',
        endDate: '',
        maxCapacity: '',

        // Step 2: Pricing & Country Pricing
        price: '',
        originalPrice: '',
        coursePricing: [],

        // Step 3: Media & Outcomes
        thumbnail: '',
        trailer: '',
        brochure: '',
        whatYouWillLearn: [],
        requirements: [],

        // Step 4: Curriculum
        sections: [
            {
                name: 'القسم الأول: المقدمة',
                lectures: []
            }
        ],

        // Step 5: Admin Settings & Status
        featured: false,
        status: 'approved'
    });

    // Available countries for regional pricing rules
    const availableCountries = [
        { code: 'SA', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
        { code: 'AE', name: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', flag: '🇦🇪' },
        { code: 'KW', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
        { code: 'QA', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
        { code: 'BH', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
        { code: 'OM', name: 'سلطنة عمان', nameEn: 'Oman', flag: '🇴🇲' },
        { code: 'EG', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
        { code: 'JO', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
        { code: 'IQ', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
        { code: 'LB', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
        { code: 'SY', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
        { code: 'YE', name: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
        { code: 'PS', name: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
        { code: 'MA', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
        { code: 'TN', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
        { code: 'DZ', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
        { code: 'LY', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
        { code: 'SD', name: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
        { code: 'US', name: 'الولايات المتحدة', nameEn: 'United States', flag: '🇺🇸' },
        { code: 'OTHER', name: 'باقي دول العالم', nameEn: 'Other Countries', flag: '🌐' }
    ];

    const WORLD_LANGUAGES = [
        { value: 'العربية', label: isRTL ? 'العربية' : 'Arabic' },
        { value: 'English', label: isRTL ? 'الإنجليزية' : 'English' },
        { value: 'Français', label: isRTL ? 'الفرنسية' : 'French' },
        { value: 'Español', label: isRTL ? 'الإسبانية' : 'Spanish' },
        { value: 'Deutsch', label: isRTL ? 'الألمانية' : 'German' },
        { value: 'Italiano', label: isRTL ? 'الإيطالية' : 'Italian' },
        { value: 'Português', label: isRTL ? 'البرتغالية' : 'Portuguese' },
        { value: 'Русский', label: isRTL ? 'الروسية' : 'Russian' },
        { value: '中文', label: isRTL ? 'الصينية' : 'Chinese' },
        { value: '日本語', label: isRTL ? 'اليابانية' : 'Japanese' },
        { value: '한국어', label: isRTL ? 'الكورية' : 'Korean' },
        { value: 'Türkçe', label: isRTL ? 'التركية' : 'Turkish' },
        { value: 'हिन्दी', label: isRTL ? 'الهندية' : 'Hindi' },
        { value: 'اردو', label: isRTL ? 'الأوردو' : 'Urdu' }
    ];

    const courseLevels = [
        { value: 'beginner', label: isRTL ? 'مبتدئ' : 'Beginner' },
        { value: 'intermediate', label: isRTL ? 'متوسط' : 'Intermediate' },
        { value: 'advanced', label: isRTL ? 'متقدم' : 'Advanced' },
        { value: 'all_levels', label: isRTL ? 'جميع المستويات' : 'All Levels' }
    ];

    const courseTypes = [
        { value: 'recorded', label: isRTL ? 'مسجلة أونلاين' : 'Recorded Online' },
        { value: 'live', label: isRTL ? 'بث مباشر تفاعلي' : 'Live Interactive' },
        { value: 'onsite', label: isRTL ? 'حضورية في المركز' : 'On-Site' }
    ];

    // Stepper configuration - mirrors the instructor course-creation stepper design
    const steps = [
        { name: isRTL ? 'المعلومات الأساسية' : 'Basic Info', icon: BookOpen },
        { name: isRTL ? 'التسعير وقواعد الدول' : 'Pricing & Countries', icon: DollarSign },
        { name: isRTL ? 'الوسائط والمخرجات' : 'Media & Outcomes', icon: Layers },
        { name: isRTL ? 'المنهج والدروس' : 'Curriculum', icon: ListOrdered },
        { name: isRTL ? 'إعدادات الإدارة والمراجعة' : 'Settings & Review', icon: Sparkles }
    ];

    useEffect(() => {
        fetchCourseDetails();
        fetchCategories();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getCategories();
            setApiCategories(res.data || res || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        if (formData.category && apiCategories.length > 0) {
            const selectedCat = apiCategories.find(c => c.name === formData.category || c._id === formData.category || c.slug === formData.category);
            if (selectedCat) {
                subcategoryService.getSubcategoriesByCategory(selectedCat._id)
                    .then(res => setApiSubcategories(res.data || res || []))
                    .catch(console.error);
            }
        }
    }, [formData.category, apiCategories]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCourseDetails(id);
            
            // Format learning outcomes for state
            let formattedOutcomes = [];
            if (data.whatYouWillLearn && Array.isArray(data.whatYouWillLearn)) {
                formattedOutcomes = data.whatYouWillLearn.map(item => 
                    typeof item === 'string' ? item : (item.main || '')
                ).filter(Boolean);
            }

            setFormData({
                title: data.title || '',
                description: data.description || '',
                category: data.category || '',
                subCategory: data.subCategory || '',
                courseLevel: data.courseLevel || data.level || 'beginner',
                courseType: data.courseType || 'recorded',
                language: (() => {
                    const dbLang = data.language || '';
                    const lower = dbLang.trim().toLowerCase();
                    if (lower === 'en' || lower === 'english') return 'English';
                    if (lower === 'ar' || lower === 'arabic' || lower === 'العربية') return 'العربية';
                    if (lower === 'fr' || lower === 'french') return 'Français';
                    const match = WORLD_LANGUAGES.find(l => l.value.toLowerCase() === lower);
                    return match ? match.value : (dbLang || 'العربية');
                })(),
                subtitleLanguage: data.subtitleLanguage || '',
                duration: data.duration || '',
                topic: data.topic || '',
                topics: Array.isArray(data.topics) ? data.topics : (data.topic ? [data.topic] : []),
                location: data.location || '',
                address: data.address || '',
                governorate: data.governorate || '',
                startDate: data.startDate ? data.startDate.split('T')[0] : '',
                endDate: data.endDate ? data.endDate.split('T')[0] : '',
                maxCapacity: data.maxCapacity || '',
                price: data.price !== undefined ? data.price : '',
                originalPrice: data.originalPrice || '',
                coursePricing: Array.isArray(data.coursePricing) ? data.coursePricing : [],
                thumbnail: data.thumbnail || '',
                trailer: data.promotionalVideo || data.trailer || '',
                brochure: data.brochure || '',
                whatYouWillLearn: formattedOutcomes,
                requirements: Array.isArray(data.requirements) ? data.requirements : [],
                sections: Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : [
                    { name: isRTL ? 'القسم الأول: المقدمة' : 'Section 1: Introduction', lectures: [] }
                ],
                featured: Boolean(data.featured),
                status: data.status || 'approved'
            });
        } catch (error) {
            console.error('Error fetching course details:', error);
            toast.error(isRTL ? 'فشل تحميل تفاصيل الدورة' : 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Country Pricing Rules handlers
    const addPricingRule = () => {
        setFormData(prev => ({
            ...prev,
            coursePricing: [
                ...prev.coursePricing,
                {
                    groupName: '',
                    price: '',
                    countries: []
                }
            ]
        }));
        toast.info(isRTL ? 'تمت إضافة قاعدة تسعير دولة جديدة' : 'New country pricing rule added');
    };

    const removePricingRule = (index) => {
        setFormData(prev => ({
            ...prev,
            coursePricing: prev.coursePricing.filter((_, i) => i !== index)
        }));
        toast.info(isRTL ? 'تم حذف قاعدة التسعير' : 'Pricing rule removed');
    };

    const updatePricingRule = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            coursePricing: prev.coursePricing.map((rule, i) => 
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    };

    const toggleCountrySelection = (ruleIndex, countryCode) => {
        const rule = formData.coursePricing[ruleIndex];
        const isSelected = rule.countries.includes(countryCode);
        const newCountries = isSelected 
            ? rule.countries.filter(c => c !== countryCode)
            : [...rule.countries, countryCode];
        
        updatePricingRule(ruleIndex, 'countries', newCountries);
    };

    const selectAllCountriesForRule = (ruleIndex) => {
        updatePricingRule(ruleIndex, 'countries', availableCountries.map(c => c.code));
    };

    const clearCountriesForRule = (ruleIndex) => {
        updatePricingRule(ruleIndex, 'countries', []);
    };

    // Topics Tags handlers
    const addTag = () => {
        const val = newTagInput.trim();
        if (!val) return;
        if (!formData.topics.includes(val)) {
            setFormData(prev => ({
                ...prev,
                topics: [...prev.topics, val]
            }));
            setNewTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter(t => t !== tagToRemove)
        }));
    };

    // What You'll Learn handlers
    const addOutcome = () => {
        const val = newOutcomeInput.trim();
        if (!val) return;
        setFormData(prev => ({
            ...prev,
            whatYouWillLearn: [...prev.whatYouWillLearn, val]
        }));
        setNewOutcomeInput('');
    };

    const removeOutcome = (index) => {
        setFormData(prev => ({
            ...prev,
            whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
        }));
    };

    // Requirements handlers
    const addRequirement = () => {
        const val = newRequirementInput.trim();
        if (!val) return;
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, val]
        }));
        setNewRequirementInput('');
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    // Sections & Lectures handlers
    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    name: `${isRTL ? 'القسم' : 'Section'} ${prev.sections.length + 1}`,
                    lectures: []
                }
            ]
        }));
    };

    const removeSection = (secIndex) => {
        if (formData.sections.length <= 1) {
            toast.warn(isRTL ? 'يجب أن تحتوي الدورة على قسم واحد على الأقل' : 'At least one section is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== secIndex)
        }));
    };

    const updateSectionName = (secIndex, newName) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) => i === secIndex ? { ...sec, name: newName } : sec)
        }));
    };

    const addLecture = (secIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) => {
                if (i !== secIndex) return sec;
                return {
                    ...sec,
                    lectures: [
                        ...(sec.lectures || []),
                        {
                            title: `${isRTL ? 'درس' : 'Lecture'} ${(sec.lectures?.length || 0) + 1}`,
                            duration: 10,
                            videoUrl: '',
                            isFree: false
                        }
                    ]
                };
            })
        }));
    };

    const removeLecture = (secIndex, lecIndex) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) => {
                if (i !== secIndex) return sec;
                return {
                    ...sec,
                    lectures: (sec.lectures || []).filter((_, li) => li !== lecIndex)
                };
            })
        }));
    };

    const updateLecture = (secIndex, lecIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map((sec, i) => {
                if (i !== secIndex) return sec;
                const updatedLectures = [...(sec.lectures || [])];
                updatedLectures[lecIndex] = {
                    ...updatedLectures[lecIndex],
                    [field]: value
                };
                return {
                    ...sec,
                    lectures: updatedLectures
                };
            })
        }));
    };

    // Save All Course Changes
    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                coursePricing: formData.coursePricing.map(p => ({
                    groupName: p.groupName || '',
                    price: parseFloat(p.price) || 0,
                    countries: Array.isArray(p.countries) ? p.countries : []
                }))
            };

            await adminService.updateCourseDetails(id, payload);
            toast.success(isRTL ? 'تم حفظ وتحديث بيانات الدورة بنجاح ✨' : 'Course details updated successfully ✨');
            
            // Navigate back to course detail page after short delay
            setTimeout(() => {
                navigate(`/admin/courses/${id}`);
            }, 800);
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ أثناء حفظ التعديلات' : 'Failed to save course changes'));
        } finally {
            setSaving(false);
        }
    };

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleSave();
        }
    };

    const handlePrevious = () => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatPrice = (p) => {
        const val = Number(p || 0);
        return isRTL ? `${val.toLocaleString()} ر.س` : `${val.toLocaleString()} SAR`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center animate-pulse">
                        <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                    {isRTL ? 'جاري تحميل محرر الدورة...' : 'Loading course editor...'}
                </h3>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* ======================================================== */}
            {/* 1. HEADER BANNER */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                            {`الخطوة ${activeStep + 1} من ${steps.length} • ${steps[activeStep]?.name}`}
                        </span>
                        {formData.title && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                                {formData.title}
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                        {isRTL ? 'تعديل الدورة التدريبية' : 'Edit Course'}
                    </h1>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                        onClick={() => navigate(`/admin/courses/${id}`)}
                        className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition flex items-center gap-2"
                    >
                        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        <span>{isRTL ? 'إلغاء والعودة' : 'Cancel'}</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>{saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 2. STEPPER PROGRESS BAR */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isDone = index < activeStep;
                        const isCurrent = index === activeStep;
                        
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveStep(index)}
                                className="flex flex-col items-center relative z-10 text-center group cursor-pointer focus:outline-none"
                            >
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${
                                        isDone
                                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                            : isCurrent
                                            ? 'bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105 ring-4 ring-blue-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                                    ) : (
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                <span className={`mt-2 text-[11px] sm:text-xs font-bold transition-colors ${
                                    isCurrent 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : isDone 
                                        ? 'text-slate-700 dark:text-slate-300' 
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                    <span className="hidden md:inline">{step.name}</span>
                                    <span className="md:hidden">{step.name.split(' ')[0]}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Progress bar line */}
                <div className="relative mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
                        style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 3. STEP CONTENT CONTAINER */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-8">
                
                {/* STEP 1: BASIC INFO */}
                {activeStep === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <span>{isRTL ? 'المعلومات الأساسية للدورة' : 'Basic Course Information'}</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isRTL ? 'حدد عنوان الدورة، الوصف التفصيلي، التصنيفات، ومستوى ولغة الشرح.' : 'Set course title, description, category, language, and level.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'عنوان الدورة التدريبية' : 'Course Title'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder={isRTL ? 'أدخل عنوان الدورة الشامل والواضح...' : 'Enter course title...'}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'وصف الدورة ومحتواها' : 'Course Description'} <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/60 shadow-sm">
                                    <RichTextEditor
                                        value={formData.description || ''}
                                        onChange={(value) => handleInputChange('description', value)}
                                        placeholder={isRTL ? 'اكتب وصفاً جذاباً يوضح أهداف ومحتوى الدورة بالتفصيل...' : 'Write detailed course description...'}
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    {isRTL ? 'اشرح ما سيتعلمه المتدرب، ولمن وُجهت الدورة، وما يميزها عن غيرها مع إمكانية تنسيق النصوص.' : 'Explain what the student will learn, target audience, and key features with rich text formatting.'}
                                </p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'التصنيف الأساسي' : 'Category'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر التصنيف --' : '-- Select Category --'}</option>
                                    {apiCategories.map(c => (
                                        <option key={c._id} value={c.slug || c._id}>{c.name || (isRTL ? c.nameAr : c.nameEn)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SubCategory */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'التصنيف الفرعي' : 'Sub-Category'}
                                </label>
                                <select
                                    value={formData.subCategory}
                                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر التصنيف الفرعي --' : '-- Select Sub-Category --'}</option>
                                    {apiSubcategories.map(c => (
                                        <option key={c._id} value={c.slug || c._id}>{c.name || (isRTL ? c.nameAr : c.nameEn)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Course Level */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'المستوى التعليمي' : 'Course Level'}
                                </label>
                                <select
                                    value={formData.courseLevel}
                                    onChange={(e) => handleInputChange('courseLevel', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    {courseLevels.map(lvl => (
                                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Course Type */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'نوع الدورة' : 'Course Type'}
                                </label>
                                <select
                                    value={formData.courseType}
                                    onChange={(e) => handleInputChange('courseType', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    {courseTypes.map(ct => (
                                        <option key={ct.value} value={ct.value}>{ct.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'لغة الشرح' : 'Audio Language'}
                                </label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر لغة الشرح --' : '-- Select Language --'}</option>
                                    {WORLD_LANGUAGES.map(lang => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Duration (minutes) */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'المدة الإجمالية (بالدقائق)' : 'Total Duration (minutes)'}
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    placeholder="180"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />
                            </div>

                            {/* Topics / Tags Cloud */}
                            <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'الوسوم والكلمات المفتاحية (Topics)' : 'Topics & Tags'}
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newTagInput}
                                        onChange={(e) => setNewTagInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                                        placeholder={isRTL ? 'أدخل وسماً ثم اضغط إضافة...' : 'Add topic tag...'}
                                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{isRTL ? 'إضافة' : 'Add'}</span>
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-8">
                                    {formData.topics && formData.topics.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800">
                                            #{tag}
                                            <button 
                                                type="button" 
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-red-500 transition"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule & Location if onsite or live */}
                            {(formData.courseType === 'onsite' || formData.courseType === 'live') && (
                                <>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'تاريخ البدء' : 'Start Date'}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {formData.courseType === 'onsite' && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isRTL ? 'موقع ومقر الانعقاد' : 'Venue / Location'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder={isRTL ? 'مثال: الرياض - قاعة التدريب الرئيسية' : 'e.g. Riyadh Training Center'}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: PRICING & COUNTRY-SPECIFIC PRICING (THE USER'S EXPLICIT REQUIREMENT) */}
                {activeStep === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                <span>{isRTL ? 'التسعير ونظام التسعير حسب الدولة' : 'Pricing & Regional Country Rules'}</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isRTL 
                                    ? 'حدد السعر الأساسي للدورة، وأنشئ قواعد تسعير مخصصة لكل دولة أو مجموعة دول بالريال السعودي.'
                                    : 'Set base course pricing and configure custom country-specific pricing rules in SAR.'}
                            </p>
                        </div>

                        {/* Base Price & Discount Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                                    {isRTL ? 'السعر الأساسي المعتمد (ر.س)' : 'Base Course Price (SAR)'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute end-4 top-3.5 text-xs font-bold text-slate-400">
                                        {isRTL ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    {isRTL ? 'يطبق هذا السعر لجميع الطلاب ما لم تشملهم قاعدة تسعير مخصصة.' : 'Applies to all students unless overridden by a country rule.'}
                                </p>
                            </div>

                            <div className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                                    {isRTL ? 'السعر قبل الخصم (ر.س - اختياري)' : 'Original Price (Before Discount)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.originalPrice}
                                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute end-4 top-3.5 text-xs font-bold text-slate-400">
                                        {isRTL ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    {isRTL ? 'يظهر مشطوباً لإبراز نسبة الخصم للطلاب في الواجهة.' : 'Displayed with strikethrough to highlight discounts.'}
                                </p>
                            </div>
                        </div>

                        {/* =================================================== */}
                        {/* COUNTRY-SPECIFIC PRICING RULES (تسعير حسب الدولة) */}
                        {/* =================================================== */}
                        <div className="pt-4 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                            {isRTL ? 'قواعد التسعير المخصص حسب الدول (Country Pricing)' : 'Regional Country Pricing Rules'}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                            {isRTL ? 'حدد أسعاراً خاصة للطلاب حسب بلدانهم (مثال: خصم خاص لدول معينة)' : 'Customize course pricing for specific countries or regional tiers'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addPricingRule}
                                    className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition shrink-0 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{isRTL ? 'إضافة تسعيرة دولة' : 'Add Country Rule'}</span>
                                </button>
                            </div>

                            {/* Rules List */}
                            {formData.coursePricing && formData.coursePricing.length > 0 ? (
                                <div className="space-y-5">
                                    {formData.coursePricing.map((rule, rIndex) => (
                                        <div
                                            key={rIndex}
                                            className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4"
                                        >
                                            {/* Rule Header */}
                                            <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                                        {rIndex + 1}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {rule.groupName || `${isRTL ? 'قاعدة التسعير' : 'Rule'} #${rIndex + 1}`}
                                                    </h4>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removePricingRule(rIndex)}
                                                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                                    title={isRTL ? 'حذف هذه القاعدة' : 'Delete rule'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Rule Inputs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        {isRTL ? 'اسم المنطقة أو المجموعة (اختياري)' : 'Region / Group Name (Optional)'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={rule.groupName}
                                                        onChange={(e) => updatePricingRule(rIndex, 'groupName', e.target.value)}
                                                        placeholder={isRTL ? 'مثال: دول الخليج، مصر وشمال إفريقيا...' : 'e.g. GCC Countries'}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        {isRTL ? 'السعر المخصص بالريال السعودي (ر.س)' : 'Custom Price (SAR)'} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={rule.price}
                                                        onChange={(e) => updatePricingRule(rIndex, 'price', e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Country Selection Grid */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {isRTL ? 'اختر الدول المشمولة بهذه التسعيرة:' : 'Select applicable countries:'} 
                                                        <span className="ms-2 text-primary-600 font-normal">
                                                            ({rule.countries?.length || 0} {isRTL ? 'دولة محددة' : 'selected'})
                                                        </span>
                                                    </label>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => selectAllCountriesForRule(rIndex)}
                                                            className="text-[11px] font-bold text-blue-600 hover:underline"
                                                        >
                                                            {isRTL ? 'تحديد الكل' : 'Select All'}
                                                        </button>
                                                        <span>•</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => clearCountriesForRule(rIndex)}
                                                            className="text-[11px] font-bold text-slate-500 hover:underline"
                                                        >
                                                            {isRTL ? 'إلغاء التحديد' : 'Clear'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                                                    {availableCountries.map((c) => {
                                                        const isChecked = rule.countries && rule.countries.includes(c.code);
                                                        return (
                                                            <label
                                                                key={c.code}
                                                                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition select-none ${
                                                                    isChecked
                                                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleCountrySelection(rIndex, c.code)}
                                                                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm">{c.flag}</span>
                                                                <span className="truncate">{isRTL ? c.name : c.nameEn}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800">
                                    <Globe className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'لا توجد قواعد تسعير إقليمية مضافة حالياً' : 'No country-specific pricing rules'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {isRTL ? 'سيتم تطبيق السعر الأساسي لجميع الطلاب من مختلف البلدان.' : 'Standard base price will be applied to all students.'}
                                    </p>
                                </div>
                            )}

                            {/* Regional Pricing Summary Card */}
                            {formData.coursePricing && formData.coursePricing.length > 0 && (
                                <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-900/60">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-600" />
                                        <span>{isRTL ? 'ملخص خطة التسعير الحالية' : 'Pricing Plan Summary'}</span>
                                    </h4>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-slate-900/80">
                                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                                                {isRTL ? 'السعر الأساسي الموحد:' : 'Standard Base Price:'}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {formatPrice(formData.price)}
                                            </span>
                                        </div>

                                        {formData.coursePricing.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-slate-900/80">
                                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                                    {r.groupName || `${isRTL ? 'القاعدة' : 'Rule'} #${i + 1}`} ({r.countries?.length || 0} {isRTL ? 'دول' : 'countries'}):
                                                </span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {formatPrice(r.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: MEDIA & OUTCOMES */}
                {activeStep === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-600" />
                                <span>{isRTL ? 'الوسائط ومخرجات التعلم' : 'Media & Learning Outcomes'}</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isRTL ? 'أدخل روابط الوسائط البصرية ومخرجات التعلم والمتطلبات.' : 'Provide media URLs, learning outcomes, and prerequisites.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Thumbnail URL */}
                            <div className="md:col-span-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'رابط الصورة البارزة (Thumbnail URL)' : 'Thumbnail Image URL'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.thumbnail}
                                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                                    placeholder="https://example.com/course-thumbnail.jpg"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium"
                                />

                                {/* Live Image Preview */}
                                {formData.thumbnail && (
                                    <div className="mt-3 relative aspect-video max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                                        <img 
                                            src={formData.thumbnail} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Promotional Video URL */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'رابط الفيديو الترويجي (Trailer / Promo Video)' : 'Promotional Video URL'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.trailer}
                                    onChange={(e) => handleInputChange('trailer', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                />
                            </div>

                            {/* Brochure PDF URL */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'رابط كتيب الدورة (Brochure PDF URL)' : 'Course Brochure PDF URL'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.brochure}
                                    onChange={(e) => handleInputChange('brochure', e.target.value)}
                                    placeholder="https://example.com/brochure.pdf"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                />
                            </div>

                            {/* What You'll Learn */}
                            <div className="md:col-span-2 pt-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'ماذا سيتعلم الطالب (Learning Outcomes)' : 'What You Will Learn'}
                                </label>
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newOutcomeInput}
                                        onChange={(e) => setNewOutcomeInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOutcome(); }}}
                                        placeholder={isRTL ? 'أدخل مخرج تعلم جديد ثم اضغط إضافة...' : 'Add a learning outcome...'}
                                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addOutcome}
                                        className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{isRTL ? 'إضافة' : 'Add'}</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.whatYouWillLearn && formData.whatYouWillLearn.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeOutcome(idx)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="md:col-span-2 pt-2">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isRTL ? 'المتطلبات المسبقة للدورة (Requirements)' : 'Course Requirements'}
                                </label>
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newRequirementInput}
                                        onChange={(e) => setNewRequirementInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); }}}
                                        placeholder={isRTL ? 'أدخل متطلباً ثم اضغط إضافة...' : 'Add a requirement...'}
                                        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{isRTL ? 'إضافة' : 'Add'}</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.requirements && formData.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{req}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(idx)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: CURRICULUM */}
                {activeStep === 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ListOrdered className="w-5 h-5 text-indigo-600" />
                                    <span>{isRTL ? 'المنهج الدراسي والأقسام' : 'Curriculum & Sections'}</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {isRTL ? 'إدارة محتوى وهيكل الدورة من أقسام ومحاضرات تدريبية.' : 'Manage course structure, sections, and lectures.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addSection}
                                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition self-start sm:self-center"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isRTL ? 'إضافة قسم جديد' : 'Add Section'}</span>
                            </button>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-5">
                            {formData.sections && formData.sections.map((section, sIdx) => (
                                <div key={sIdx} className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                                {sIdx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={section.name || section.title || ''}
                                                onChange={(e) => updateSectionName(sIdx, e.target.value)}
                                                placeholder={isRTL ? 'عنوان القسم...' : 'Section Title...'}
                                                className="w-full max-w-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => addLecture(sIdx)}
                                                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{isRTL ? 'إضافة درس' : 'Add Lecture'}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => removeSection(sIdx)}
                                                className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                                title={isRTL ? 'حذف القسم' : 'Delete section'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lectures inside Section */}
                                    {section.lectures && section.lectures.length > 0 ? (
                                        <div className="space-y-2.5 ps-4 border-s-2 border-indigo-200 dark:border-indigo-800">
                                            {section.lectures.map((lecture, lIdx) => (
                                                <div key={lIdx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Video className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <input
                                                            type="text"
                                                            value={lecture.title || lecture.name || ''}
                                                            onChange={(e) => updateLecture(sIdx, lIdx, 'title', e.target.value)}
                                                            placeholder={isRTL ? 'عنوان الدرس...' : 'Lecture title...'}
                                                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-slate-400 text-[11px]">{isRTL ? 'المدة:' : 'Duration:'}</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={lecture.duration || 10}
                                                                onChange={(e) => updateLecture(sIdx, lIdx, 'duration', parseInt(e.target.value) || 0)}
                                                                className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center"
                                                            />
                                                            <span className="text-slate-400 text-[11px]">{isRTL ? 'د' : 'min'}</span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeLecture(sIdx, lIdx)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 ps-4">
                                            {isRTL ? 'لا توجد دروس في هذا القسم بعد. اضغط "إضافة درس" لإدراج درس.' : 'No lectures in this section yet.'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 5: ADMIN SETTINGS & REVIEW */}
                {activeStep === 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <span>{isRTL ? 'إعدادات الإدارة والمراجعة النهائية' : 'Admin Settings & Review'}</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isRTL ? 'راجع بيانات الدورة وخصص حالة الاعتماد والتمييز قبل الحفظ.' : 'Review course data and set publication status.'}
                            </p>
                        </div>

                        {/* Admin Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Featured Toggle Card */}
                            <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                                        <Star className="w-5 h-5 fill-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                            {isRTL ? 'دورة مميزة (Featured)' : 'Featured Course'}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {isRTL ? 'تظهر في القسم المميز بالصفحة الرئيسية للمنصة' : 'Show prominently on home page'}
                                        </p>
                                    </div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            {/* Status Card */}
                            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRTL ? 'حالة اعتماد الدورة' : 'Course Status'}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs sm:text-sm"
                                >
                                    <option value="approved">{isRTL ? 'معتمدة ومنشورة (Approved)' : 'Approved & Published'}</option>
                                    <option value="pending">{isRTL ? 'قيد المراجعة (Pending Review)' : 'Pending Review'}</option>
                                    <option value="rejected">{isRTL ? 'مرفوضة (Rejected)' : 'Rejected'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-4">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span>{isRTL ? 'ملخص مراجعة بيانات الدورة قبل الحفظ' : 'Final Review Summary'}</span>
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400 block mb-1">{isRTL ? 'العنوان' : 'Title'}</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{formData.title || '-'}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400 block mb-1">{isRTL ? 'السعر الأساسي' : 'Base Price'}</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{formatPrice(formData.price)}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400 block mb-1">{isRTL ? 'قواعد تسعير الدول' : 'Country Rules'}</span>
                                    <span className="font-bold text-blue-600 block">{formData.coursePricing?.length || 0} {isRTL ? 'قواعد' : 'rules'}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-400 block mb-1">{isRTL ? 'الأقسام والدروس' : 'Curriculum'}</span>
                                    <span className="font-bold text-emerald-600 block">{formData.sections?.length || 0} {isRTL ? 'أقسام' : 'sections'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ======================================================== */}
            {/* 4. PREVIOUS / NEXT STEPPER NAVIGATION */}
            {/* ======================================================== */}
            <div className="flex items-center justify-between gap-4">
                {activeStep > 0 ? (
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition shadow-sm active:scale-95"
                    >
                        {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        <span>{isRTL ? 'السابق' : 'Previous'}</span>
                    </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                    {activeStep < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95"
                        >
                            <span>{isRTL ? 'التالي' : 'Next'}</span>
                            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span>{saving ? (isRTL ? 'جاري حفظ التعديلات...' : 'Saving...') : (isRTL ? 'حفظ ونشر التعديلات النهائية ✨' : 'Save & Publish ✨')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEdit;