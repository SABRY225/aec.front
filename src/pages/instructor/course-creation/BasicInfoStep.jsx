import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
    Plus, 
    X, 
    Sparkles, 
    BookOpen, 
    Clock, 
    Calendar, 
    MapPin, 
    Video, 
    FileText, 
    Upload, 
    AlertCircle, 
    ArrowRight, 
    ArrowLeft, 
    Loader2,
    Check,
    CheckCircle2
} from 'lucide-react';
import { categoryService } from '../../../services/new-api';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import { useFileUpload } from '../../../hooks/useFileUpload';
import FileUpload from '../../../components/shared/FileUpload/FileUpload';
import { useLanguage } from '../../../hooks/useLanguage';

const BasicInfoStep = ({ courseData, handleChange, onNext = null }) => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    // Form validation state
    const [errors, setErrors] = useState({});
    const [topicInput, setTopicInput] = useState('');
    const { uploadFile, uploading: uploadingBrochure } = useFileUpload();

    // Initialize topics if not present
    useEffect(() => {
        // Only initialize if topics is not set or is empty array
        if (!courseData.topics || (Array.isArray(courseData.topics) && courseData.topics.length === 0 && courseData.topic)) {
            // If topic exists (old format), convert it
            if (courseData.topic && courseData.topic.trim()) {
                handleChange('topics', [courseData.topic.trim()]);
            } else if (!courseData.topics) {
                handleChange('topics', []);
            }
        }
    }, [courseData.topic]);

    const addTopic = () => {
        const trimmedTopic = topicInput.trim();
        if (!trimmedTopic) return;
        
        const currentTopics = courseData.topics || [];
        if (currentTopics.includes(trimmedTopic)) {
            toast.info(t('instructor.courseCreation.topicAlreadyAdded'));
            return;
        }
        
        handleChange('topics', [...currentTopics, trimmedTopic]);
        setTopicInput('');
    };

    const removeTopic = (index) => {
        const currentTopics = courseData.topics || [];
        handleChange('topics', currentTopics.filter((_, i) => i !== index));
    };

    const handleBrochureUpload = async (uploadData) => {
        try {
            console.log('=== Brochure Upload Handler ===');
            console.log('Upload data received:', uploadData);
            console.log('Type:', typeof uploadData);
            console.log('Is Array:', Array.isArray(uploadData));
            
            let brochureUrl = '';
            
            // FileUpload component passes: { file, result, url }
            // Since multiple={false}, it should be a single object, not an array
            if (uploadData) {
                // Try to extract URL from the upload response
                if (typeof uploadData === 'string') {
                    // If it's already a string (URL), use it directly
                    brochureUrl = uploadData;
                } else if (uploadData.url) {
                    // Primary: use the url property
                    brochureUrl = uploadData.url;
                } else if (uploadData.result) {
                    // Fallback: use result property (could be string or object)
                    if (typeof uploadData.result === 'string') {
                        brochureUrl = uploadData.result;
                    } else if (uploadData.result?.url) {
                        brochureUrl = uploadData.result.url;
                    }
                } else if (Array.isArray(uploadData) && uploadData.length > 0) {
                    // Handle array case (shouldn't happen with multiple={false}, but just in case)
                    const firstItem = uploadData[0];
                    brochureUrl = firstItem?.url || firstItem?.result || (typeof firstItem === 'string' ? firstItem : null);
                }
            }
            
            console.log('Extracted brochure URL:', brochureUrl);
            console.log('URL type:', typeof brochureUrl);
            console.log('URL is valid string?', typeof brochureUrl === 'string' && brochureUrl.trim().length > 0);
            
            // Validate that we have a valid URL string
            if (brochureUrl && typeof brochureUrl === 'string' && brochureUrl.trim()) {
                const trimmedUrl = brochureUrl.trim();
                console.log('Setting brochure URL:', trimmedUrl);
                handleChange('brochure', trimmedUrl);
                toast.success(t('instructor.courseCreation.brochureUploaded'));
            } else {
                console.error('Invalid brochure URL extracted:', brochureUrl);
                toast.error(t('instructor.courseCreation.brochureUrlFailed'));
            }
            console.log('=== End Brochure Upload Handler ===');
        } catch (error) {
            console.error('Brochure upload error:', error);
            console.error('Error stack:', error.stack);
            toast.error(`Failed to upload brochure: ${error.message || 'Unknown error'}`);
        }
    };

    // Validate form fields
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'title':
                if (!value.trim()) error = t('instructor.courseCreation.validationTitleRequired');
                else if (value.trim().length < 5) error = t('instructor.courseCreation.validationTitleMin');
                else if (value.trim().length > 100) error = t('instructor.courseCreation.validationTitleMax');
                break;
            case 'description':
                // Strip HTML tags for length validation
                const textContent = value ? value.replace(/<[^>]*>/g, '').trim() : '';
                if (!textContent) error = t('instructor.courseCreation.validationDescRequired');
                else if (textContent.length < 20) error = t('instructor.courseCreation.validationDescMin');
                break;
            case 'category':
                if (!value) error = t('instructor.courseCreation.validationCategory');
                break;
            case 'subCategory':
                if (!value) error = t('instructor.courseCreation.validationSubcategory');
                break;
            case 'topics':
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    error = t('instructor.courseCreation.validationTopics');
                } else if (Array.isArray(value) && value.some(topic => !topic.trim())) {
                    error = t('instructor.courseCreation.validationTopicsEmpty');
                }
                break;
            case 'startDate':
                // Only validate if course type is not 'recorded'
                if (courseData.courseType !== 'recorded') {
                    if (!value) error = t('instructor.courseCreation.validationStartDate');
                    else {
                        const startDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (startDate < today) {
                            error = t('instructor.courseCreation.validationStartPast');
                        }
                    }
                }
                break;
            case 'endDate':
                // Only validate if course type is not 'recorded'
                if (courseData.courseType !== 'recorded') {
                    if (!value) error = t('instructor.courseCreation.validationEndDate');
                    else if (courseData.startDate && new Date(value) <= new Date(courseData.startDate)) {
                        error = t('instructor.courseCreation.validationEndAfter');
                    }
                }
                break;
            case 'language':
                if (!value) error = t('instructor.courseCreation.validationLanguage');
                break;
            case 'courseLevel':
                if (!value) error = t('instructor.courseCreation.validationLevel');
                break;
            case 'courseType':
                if (!value) error = t('instructor.courseCreation.validationType');
                break;
            case 'location':
                if (courseData.courseType === 'onsite' && !value.trim()) {
                    error = t('instructor.courseCreation.validationLocation');
                }
                break;
            case 'address':
                if (courseData.courseType === 'onsite' && !value.trim()) {
                    error = t('instructor.courseCreation.validationAddress');
                }
                break;
            case 'duration':
                if (!value) error = t('instructor.courseCreation.validationDuration');
                else if (isNaN(value) || parseInt(value) <= 0) error = t('instructor.courseCreation.validationDurationPositive');
                break;
            case 'price':
                if (value === '') error = t('instructor.courseCreation.validationPrice');
                else if (isNaN(value) || parseFloat(value) < 0) error = t('instructor.courseCreation.validationPriceNonNeg');
                break;
            default:
                break;
        }

        return error;
    };

    // Handle field validation on blur
    const handleBlur = (name, value) => {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Wrapper for handleChange to include validation
    const handleFieldChange = (name, value) => {
        handleChange(name, value);
        if (errors[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    // Validate all fields
    const validateAllFields = () => {
        const newErrors = {};
        let isValid = true;

        // Validate each field
        Object.entries(courseData).forEach(([key, value]) => {
            // Skip validation for subtitleLanguage as it's optional
            if (key === 'subtitleLanguage') return;

            // Skip location validation if course type is not onsite
            if (key === 'location' && courseData.courseType !== 'onsite') return;

            // Skip address validation if course type is not onsite
            if (key === 'address' && courseData.courseType !== 'onsite') return;

            // Skip startDate and endDate validation if course type is recorded
            if ((key === 'startDate' || key === 'endDate') && courseData.courseType === 'recorded') return;

            // Skip topic validation (we use topics now)
            if (key === 'topic') return;

            const error = validateField(key, value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        // Validate topics separately
        const topicsError = validateField('topics', courseData.topics);
        if (topicsError) {
            newErrors.topics = topicsError;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // State for button loading
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timeoutRef = useRef(null);

    // Safety mechanism: Reset loading state on unmount or after timeout
    useEffect(() => {
        // Reset submitting state when component mounts or onNext changes
        setIsSubmitting(false);

        return () => {
            setIsSubmitting(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onNext]);

    // Reset submitting state if onNext becomes available
    useEffect(() => {
        if (onNext && typeof onNext === 'function' && isSubmitting) {
            // If we were stuck in submitting state and onNext is now available, reset
            const timer = setTimeout(() => {
                setIsSubmitting(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [onNext, isSubmitting]);

    // Override the onNext function to validate before proceeding
    // Validate topics before proceeding
    const validateTopics = () => {
        const topics = courseData.topics || [];
        if (topics.length === 0) {
            setErrors(prev => ({ ...prev, topics: 'At least one topic is required' }));
            return false;
        }
        setErrors(prev => ({ ...prev, topics: '' }));
        return true;
    };

    const handleNextWithValidation = async () => {
        // Check if onNext is a function
        if (!onNext || typeof onNext !== 'function') {
            console.error('onNext is not a function:', onNext);
            toast.error(t('instructor.courseCreation.navUnavailable'));
            return;
        }

        // Reset submitting state first to prevent stuck state
        setIsSubmitting(false);

        // Validate topics first
        if (!validateTopics()) {
            toast.error(t('instructor.courseCreation.addTopic'));
            return;
        }

        if (validateAllFields()) {
            setIsSubmitting(true);
            try {
                await onNext();
                // Small delay to ensure state updates properly
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('Error proceeding to next step:', error);
                const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
                toast.error(errorMessage);
                // Ensure state is reset even on error
                setIsSubmitting(false);
            } finally {
                // Always reset, with a small delay to ensure UI updates
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                // Reset immediately first
                setIsSubmitting(false);
                // Then set timeout as backup
                timeoutRef.current = setTimeout(() => {
                    setIsSubmitting(false);
                    timeoutRef.current = null;
                }, 200);
            }
        } else {
            toast.error(t('instructor.courseCreation.fixErrors'));
            // Scroll to the first error within the scrollable container, without displacing the window
            const firstErrorField = document.querySelector('.border-red-500');
            if (firstErrorField) {
                const scrollContainer = firstErrorField.closest('main') || document.querySelector('main');
                if (scrollContainer) {
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const fieldRect = firstErrorField.getBoundingClientRect();
                    const relativeTop = fieldRect.top - containerRect.top + scrollContainer.scrollTop - 100;
                    scrollContainer.scrollTo({ top: Math.max(0, relativeTop), behavior: 'smooth' });
                } else {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                firstErrorField.focus({ preventScroll: true });
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
        }
    };
    const [categories, setCategories] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                if (response.success && response.data) {
                    const formattedCategories = response.data.map(category => ({
                        value: category.slug,
                        label: language === 'ar' ? (category.nameAr || category.nameEn) : category.nameEn,
                        id: category._id
                    }));
                    setCategories(formattedCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [language]);

    // Update available subcategories when category changes
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (courseData.category) {
                setSubcategoriesLoading(true);
                try {
                    // Find the category ID from the slug
                    const selectedCategory = categories.find(cat => cat.value === courseData.category);
                    if (selectedCategory) {
                        const response = await categoryService.getSubcategories(selectedCategory.id);
                        if (response.success && response.data) {
                            const formattedSubcategories = response.data.map(subcategory => ({
                                value: subcategory.slug,
                                label: language === 'ar' ? (subcategory.nameAr || subcategory.nameEn) : subcategory.nameEn
                            }));
                            setAvailableSubCategories(formattedSubcategories);

                            // Reset subcategory if it's not valid for the new category
                            if (courseData.subCategory && !formattedSubcategories.find(sub => sub.value === courseData.subCategory)) {
                                handleChange('subCategory', '');
                            }
                        } else {
                            setAvailableSubCategories([]);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching subcategories:', error);
                    setAvailableSubCategories([]);
                } finally {
                    setSubcategoriesLoading(false);
                }
            } else {
                setAvailableSubCategories([]);
                setSubcategoriesLoading(false);
                if (courseData.subCategory) {
                    handleChange('subCategory', '');
                }
            }
        };

        if (categories.length > 0) {
            fetchSubcategories();
        }
    }, [courseData.category, categories]);

    return (
        <div className="space-y-8" dir={t('autoGenerated.ltr', `ltr`)}>
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        {t('instructor.courseCreation.basicInfoTitle', 'المعلومات الأساسية للدورة')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('instructor.courseCreation.basicInfoSubtitle', 'حدد العنوان الرئيسي، التصنيف، لغة التدريس ونوع الدورة التدريبية')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Course Title */}
                <div className="col-span-1 lg:col-span-2">
                    <label htmlFor="title" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.courseTitle', 'عنوان الدورة التدريبية')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={courseData.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        onBlur={(e) => handleBlur('title', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.title ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium`}
                        placeholder={t('instructor.courseCreation.titlePlaceholder')}
                        required
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.title}</p>}
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t('instructor.courseCreation.titleHint', 'اختر عنواناً واضحاً وجذاباً يعكس محتوى الدورة وقيمتها التعليمية بدقة.')}
                    </p>
                </div>

                {/* Course Description */}
                <div className="col-span-1 lg:col-span-2">
                    <label htmlFor="description" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.courseDescription', 'وصف الدورة التدريبية')} <span className="text-red-500">*</span>
                    </label>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/60">
                        <RichTextEditor
                            value={courseData.description || ''}
                            onChange={(value) => handleFieldChange('description', value)}
                            placeholder={t('instructor.courseCreation.descriptionPlaceholder')}
                            error={!!errors.description}
                        />
                    </div>
                    {errors.description && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.description}</p>}
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t('instructor.courseCreation.descriptionHint', 'اشرح ما سيتعلمه المتدرب، ولمن وُجهت الدورة، وما يميزها عن غيرها.')}
                    </p>
                </div>

                {/* Category */}
                <div className="col-span-1">
                    <label htmlFor="category" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.category', 'التصنيف الرئيسي')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="category"
                        value={courseData.category}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        onBlur={(e) => handleBlur('category', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer disabled:opacity-50`}
                        disabled={loading}
                        required
                    >
                        <option value="">
                            {loading ? "جاري تحميل التصنيفات..." : "اختر التصنيف الرئيسي"}
                        </option>
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.category}</p>}
                </div>

                {/* Subcategory */}
                <div className="col-span-1">
                    <label htmlFor="subCategory" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.subCategory', 'التصنيف الفرعي')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="subCategory"
                        value={courseData.subCategory}
                        onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                        onBlur={(e) => handleBlur('subCategory', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.subCategory ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer disabled:opacity-50`}
                        disabled={!courseData.category || loading || subcategoriesLoading}
                        required
                    >
                        <option value="">
                            {!courseData.category
                                ? "اختر التصنيف الرئيسي أولاً"
                                : subcategoriesLoading
                                    ? "جاري التحميل..."
                                    : availableSubCategories.length === 0 && courseData.category
                                        ? "لا توجد تصنيفات فرعية متاحة"
                                        : "اختر التصنيف الفرعي"
                            }
                        </option>
                        {!subcategoriesLoading && availableSubCategories.map((subCategory) => (
                            <option key={subCategory.value} value={subCategory.value}>
                                {subCategory.label}
                            </option>
                        ))}
                    </select>
                    {errors.subCategory && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.subCategory}</p>}
                </div>

                {/* Topics */}
                <div className="col-span-1 lg:col-span-2">
                    <label htmlFor="topics" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.topicsLabel', 'الموضوعات والكلمات المفتاحية')} <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="topics"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTopic();
                                    }
                                }}
                                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                placeholder={t('instructor.courseCreation.topicPlaceholder')}
                            />
                            <button
                                type="button"
                                onClick={addTopic}
                                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة</span>
                            </button>
                        </div>

                        {/* Topics List */}
                        {courseData.topics && courseData.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {courseData.topics.map((topic, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all shadow-xs"
                                    >
                                        <span>{topic}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTopic(index)}
                                            className="text-blue-500 hover:text-red-600 transition-colors p-0.5 rounded-md"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.topics && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.topics}</p>}
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('instructor.courseCreation.topicsHint')}</p>
                    </div>
                </div>

                {/* Language */}
                <div className="col-span-1">
                    <label htmlFor="language" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.languageLabel')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="language"
                        value={courseData.language}
                        onChange={(e) => handleFieldChange('language', e.target.value)}
                        onBlur={(e) => handleBlur('language', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.language ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer`}
                        required
                    >
                        <option value="">{t('instructor.courseCreation.selectLanguage')}</option>
                        <option value="arabic">{t('student.settings.account.languages.arabic', 'العربية')}</option>
                        <option value="english">{t('student.settings.account.languages.english', 'الإنجليزية')}</option>
                        <option value="french">{t('student.settings.account.languages.french', 'الفرنسية')}</option>
                        <option value="spanish">{t('student.settings.account.languages.spanish', 'الإسبانية')}</option>
                        <option value="german">{t('student.settings.account.languages.german', 'الألمانية')}</option>
                    </select>
                    {errors.language && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.language}</p>}
                </div>

                {/* Subtitle Language */}
                <div className="col-span-1">
                    <label htmlFor="subtitleLanguage" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.subtitleLanguageLabel', 'لغة الترجمة النصية (اختياري)')}
                    </label>
                    <select
                        id="subtitleLanguage"
                        value={courseData.subtitleLanguage}
                        onChange={(e) => handleFieldChange('subtitleLanguage', e.target.value)}
                        onBlur={(e) => handleBlur('subtitleLanguage', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
                    >
                        <option value="">{t('instructor.courseCreation.selectSubtitle', 'بدون ترجمة')}</option>
                        <option value="arabic">{t('student.settings.account.languages.arabic', 'العربية')}</option>
                        <option value="english">{t('student.settings.account.languages.english', 'الإنجليزية')}</option>
                    </select>
                </div>

                {/* Course Level */}
                <div className="col-span-1">
                    <label htmlFor="courseLevel" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.courseLevelLabel', 'مستوى الصعوبة')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="courseLevel"
                        value={courseData.courseLevel}
                        onChange={(e) => handleFieldChange('courseLevel', e.target.value)}
                        onBlur={(e) => handleBlur('courseLevel', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.courseLevel ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer`}
                        required
                    >
                        <option value="">{t('instructor.courseCreation.selectLevel')}</option>
                        <option value="beginner">{t('course.card.level.beginner', 'مبتدئ')}</option>
                        <option value="intermediate">{t('course.card.level.intermediate', 'متوسط')}</option>
                        <option value="advanced">{t('course.card.level.advanced', 'متقدم')}</option>
                        <option value="all-levels">{t('instructor.settings.profile.allLevels', 'جميع المستويات')}</option>
                    </select>
                    {errors.courseLevel && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.courseLevel}</p>}
                </div>

                {/* Course Type */}
                <div className="col-span-1">
                    <label htmlFor="courseType" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.courseTypeLabel', 'طبيعة تقديم الدورة')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="courseType"
                        value={courseData.courseType}
                        onChange={(e) => {
                            const newType = e.target.value;
                            handleFieldChange('courseType', newType);
                            if (newType === 'recorded') {
                                handleChange('startDate', '');
                                handleChange('endDate', '');
                            }
                        }}
                        onBlur={(e) => handleBlur('courseType', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.courseType ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium cursor-pointer`}
                        required
                    >
                        <option value="">{t('instructor.courseCreation.selectCourseType')}</option>
                        <option value="recorded">{t('course.card.courseType.recorded', 'دورة مسجلة (Self-Paced)')}</option>
                        <option value="live">{t('course.card.courseType.live', 'بث مباشر تفاعلي (Online Live)')}</option>
                        <option value="onsite">{t('course.card.courseType.onsite', 'حضوري في قاعة (Onsite)')}</option>
                    </select>
                    {errors.courseType && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.courseType}</p>}
                </div>

                {/* Start Date and End Date - Only show if course type is not 'recorded' */}
                {courseData.courseType !== 'recorded' && (
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-3xl bg-blue-50/30 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700/80">
                        {/* Start Date */}
                        <div>
                            <label htmlFor="startDate" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>{t('instructor.courseCreation.startDate', 'تاريخ البدء')} <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={courseData.startDate}
                                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                                onBlur={(e) => handleBlur('startDate', e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.startDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium`}
                                required
                            />
                            {errors.startDate && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.startDate}</p>}
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="endDate" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>{t('instructor.courseCreation.endDate', 'تاريخ الانتهاء')} <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={courseData.endDate}
                                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                                onBlur={(e) => handleBlur('endDate', e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${errors.endDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium`}
                                required
                            />
                            {errors.endDate && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.endDate}</p>}
                        </div>
                    </div>
                )}

                {/* Location and Address for Onsite Courses */}
                {courseData.courseType === 'onsite' && (
                    <div className="col-span-1 lg:col-span-2 p-5 rounded-3xl bg-amber-50/30 dark:bg-slate-800/40 border border-amber-200/60 dark:border-slate-700/80 space-y-4">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-xs sm:text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>بيانات وموقع القاعة الحضورية</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="location" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.locationName', 'اسم المركز أو القاعة')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={courseData.location}
                                    onChange={(e) => handleFieldChange('location', e.target.value)}
                                    onBlur={(e) => handleBlur('location', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.location ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm`}
                                    placeholder={t('instructor.courseCreation.locationPlaceholder')}
                                    required
                                />
                                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.fullAddress', 'العنوان التفصيلي')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    value={courseData.address || ''}
                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                    onBlur={(e) => handleBlur('address', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm`}
                                    placeholder={t('instructor.courseCreation.addressPlaceholder')}
                                    required
                                />
                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                            </div>

                            <div>
                                <label htmlFor="governorate" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.governorate', 'المدينة / المحافظة')}
                                </label>
                                <input
                                    type="text"
                                    id="governorate"
                                    value={courseData.governorate || ''}
                                    onChange={(e) => handleFieldChange('governorate', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    placeholder="مثال: الرياض"
                                />
                            </div>

                            <div>
                                <label htmlFor="mapsUrl" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.mapsUrl', 'رابط خرائط جوجل (Google Maps)')}
                                </label>
                                <input
                                    type="url"
                                    id="mapsUrl"
                                    value={courseData.mapsUrl || ''}
                                    onChange={(e) => handleFieldChange('mapsUrl', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    placeholder="https://maps.google.com/..."
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Online (live) platform info */}
                {courseData.courseType === 'live' && (
                    <div className="col-span-1 lg:col-span-2 p-5 rounded-3xl bg-blue-50/30 dark:bg-slate-800/40 border border-blue-200/60 dark:border-slate-700/80 space-y-4">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400 font-bold text-xs sm:text-sm">
                            <Video className="w-4 h-4" />
                            <span>بيانات البث المباشر (تظهر للطلاب المسجلين فقط)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="onlinePlatform" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.onlinePlatform', 'منصة البث')}
                                </label>
                                <select
                                    id="onlinePlatform"
                                    value={courseData.onlinePlatform || ''}
                                    onChange={(e) => handleFieldChange('onlinePlatform', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                >
                                    <option value="">اختر المنصة</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="google-meet">Google Meet</option>
                                    <option value="microsoft-teams">Microsoft Teams</option>
                                    <option value="other">منصة أخرى</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="meetingLink" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.meetingLink', 'رابط الجلسة (خاص)')}
                                </label>
                                <input
                                    type="url"
                                    id="meetingLink"
                                    value={courseData.meetingLink || ''}
                                    onChange={(e) => handleFieldChange('meetingLink', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    placeholder="https://"
                                    dir="ltr"
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label htmlFor="meetingJoinInfo" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.meetingJoinInfo', 'كلمة المرور ومعلومات الانضمام')}
                                </label>
                                <textarea
                                    id="meetingJoinInfo"
                                    value={courseData.meetingJoinInfo || ''}
                                    onChange={(e) => handleFieldChange('meetingJoinInfo', e.target.value)}
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    placeholder="Passcode, Meeting ID, etc."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Shared fields for Live + Onsite */}
                {(courseData.courseType === 'live' || courseData.courseType === 'onsite') && (
                    <div className="col-span-1 lg:col-span-2 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/80 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="maxCapacity" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.maxCapacity', 'الطاقة الاستيعابية القصوى')}
                                </label>
                                <input
                                    type="number"
                                    id="maxCapacity"
                                    min="1"
                                    value={courseData.maxCapacity || ''}
                                    onChange={(e) => handleFieldChange('maxCapacity', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    placeholder="اتركه فارغاً إن كان العدد غير محدود"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    {t('instructor.courseCreation.sessionTime', 'وقت انعقاد المحاضرة')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        value={courseData.sessionStartTime || ''}
                                        onChange={(e) => handleFieldChange('sessionStartTime', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    />
                                    <input
                                        type="time"
                                        value={courseData.sessionEndTime || ''}
                                        onChange={(e) => handleFieldChange('sessionEndTime', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('instructor.courseCreation.scheduleDays', 'أيام تقديم الجلسات أسبوعياً')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map((day) => {
                                    const selected = Array.isArray(courseData.scheduleDays) && courseData.scheduleDays.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => {
                                                const current = Array.isArray(courseData.scheduleDays) ? [...courseData.scheduleDays] : [];
                                                const next = selected ? current.filter((d) => d !== day) : [...current, day];
                                                handleFieldChange('scheduleDays', next);
                                            }}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                selected 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30' 
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {t(`instructor.courseCreation.day.${day}`, day)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="additionalInstructions" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('instructor.courseCreation.additionalInstructions', 'إرشادات وملاحظات خاصة للمتدربين')}
                            </label>
                            <textarea
                                id="additionalInstructions"
                                value={courseData.additionalInstructions || ''}
                                onChange={(e) => handleFieldChange('additionalInstructions', e.target.value)}
                                rows={2}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Duration */}
                <div className="col-span-1">
                    <label htmlFor="duration" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{t('instructor.courseCreation.durationHours', 'المدة الإجمالية (بالساعات)')} <span className="text-red-500">*</span></span>
                    </label>
                    <input
                        type="number"
                        id="duration"
                        value={courseData.duration !== '' && courseData.duration != null && courseData.duration !== undefined ? (Number(courseData.duration) / 60) : ''}
                        onChange={(e) => {
                            const hours = e.target.value === '' ? '' : parseFloat(e.target.value);
                            const minutes = hours === '' ? '' : (typeof hours === 'number' ? Math.round(hours * 60) : Math.round(parseFloat(hours) * 60));
                            handleFieldChange('duration', minutes);
                        }}
                        onBlur={() => handleBlur('duration', courseData.duration)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.duration ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium`}
                        placeholder={t('instructor.courseCreation.durationPlaceholder')}
                        min="0.5"
                        step="0.5"
                        required
                    />
                    {errors.duration && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.duration}</p>}
                </div>

                {/* Price */}
                <div className="col-span-1">
                    <label htmlFor="price" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.priceSar', 'سعر الدورة (ر.س)')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="price"
                        value={courseData.price}
                        onChange={(e) => handleFieldChange('price', e.target.value)}
                        onBlur={(e) => handleBlur('price', e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border ${errors.price ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.price}</p>}
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t('instructor.courseCreation.freeCourseHint', 'اكتب 0 إذا كانت الدورة مجانية للجميع')}
                    </p>
                </div>

                {/* Price Before Discount (Optional) */}
                <div className="col-span-1">
                    <label htmlFor="originalPrice" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('instructor.courseCreation.priceBeforeDiscount', 'السعر قبل الخصم (ر.س - اختياري)')}
                    </label>
                    <input
                        type="number"
                        id="originalPrice"
                        value={courseData.originalPrice || ''}
                        onChange={(e) => handleFieldChange('originalPrice', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t('instructor.courseCreation.discountHint')}
                    </p>
                </div>

                {/* Course Brochure */}
                <div className="col-span-1 lg:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>{t('instructor.courseCreation.courseBrochure', 'البروشور التعريفي للدورة (PDF)')}</span>
                        <span className="text-xs font-normal text-slate-400">{t('instructor.courseCreation.optional')}</span>
                    </label>
                    
                    {/* Show existing brochure if available */}
                    {courseData.brochure && (
                        <div className="mb-3 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300">{t('instructor.courseCreation.brochureUploaded', 'تم رفع البروشور بنجاح')}</p>
                                    <a
                                        href={courseData.brochure}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                                    >
                                        {courseData.brochure.split('/').pop()}
                                    </a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('brochure', null)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                                {t('instructor.courseCreation.remove', 'حذف')}
                            </button>
                        </div>
                    )}
                    
                    <FileUpload
                        accept=".pdf"
                        maxSize={100 * 1024 * 1024} // 100MB
                        folder="courses/brochures"
                        onUploadSuccess={handleBrochureUpload}
                        onUploadError={(error) => toast.error(`Failed to upload brochure: ${error}`)}
                        label={courseData.brochure ? "استبدال ملف البروشور" : "رفع بروشور الدورة (PDF)"}
                        helperText="ملف PDF لا يتجاوز 100MB"
                        multiple={false}
                        value={courseData.brochure}
                        showPreview={false}
                    />
                </div>
            </div>

            {/* Next Step Action Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={handleNextWithValidation}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 transition-all text-xs sm:text-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('instructor.courseCreation.loading', 'جاري المتابعة...')}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('instructor.courseCreation.next', 'المتابعة للخطوة التالية')}</span>
                            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BasicInfoStep;