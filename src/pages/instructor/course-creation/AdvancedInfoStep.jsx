import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { useFileUpload } from '../../../hooks/useFileUpload';
import FileUpload from '../../../components/shared/FileUpload';
import {
    Sparkles,
    Image as ImageIcon,
    Video,
    Plus,
    Trash2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    AlertCircle,
    Info,
    HelpCircle,
    CornerDownLeft,
    X
} from 'lucide-react';

const AdvancedInfoStep = ({ courseData, handleChange, onNext }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [trailerPreview, setTrailerPreview] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [errors, setErrors] = useState({
        thumbnail: '',
        whatYouWillLearn: ''
    });
    
    // Initialize thumbnailPreview and trailerPreview from courseData if available
    useEffect(() => {
        if (courseData.thumbnail) {
            setThumbnailPreview(courseData.thumbnail);
        }
        if (courseData.trailer) {
            setTrailerPreview(courseData.trailer);
        }
    }, [courseData.thumbnail, courseData.trailer]);

    // Handle thumbnail upload completion
    const handleThumbnailUploadComplete = (result) => {
        const url = result.url || result.result;
        handleChange('thumbnail', url);
        setThumbnailPreview(url);
        
        if (errors.thumbnail) {
            setErrors(prev => ({
                ...prev,
                thumbnail: ''
            }));
        }
        
        toast.success(t('instructor.courseCreation.thumbnailUploaded', 'تم رفع غلاف الدورة بنجاح'));
    };

    // Handle trailer upload completion
    const handleTrailerUploadComplete = (result) => {
        const url = result.url || result.result;
        handleChange('trailer', url);
        setTrailerPreview(url);
        toast.success(t('instructor.courseCreation.trailerUploaded', 'تم رفع الفيديو الترويجي بنجاح'));
    };

    // Validation functions
    const validateField = (field, value) => {
        let errorMessage = '';
        
        switch (field) {
            case 'thumbnail':
                if (!value) {
                    errorMessage = t('instructor.courseCreation.thumbnailRequired', 'صورة غلاف الدورة مطلوبة');
                }
                break;
            case 'whatYouWillLearn':
                // Optional - no validation required
                break;
            default:
                break;
        }
        
        return errorMessage;
    };
    
    const validateAllFields = () => {
        const newErrors = {};
        newErrors.thumbnail = validateField('thumbnail', courseData.thumbnail);
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };
    
    // State for button loading
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleNextWithValidation = async () => {
        setIsSubmitting(false);
        const isValid = validateAllFields();
        
        if (isValid) {
            setIsSubmitting(true);
            try {
                await onNext();
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('Error proceeding to next step:', error);
                const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ، يرجى المحاولة لاحقاً';
                toast.error(errorMessage);
                setIsSubmitting(false);
            } finally {
                setTimeout(() => {
                    setIsSubmitting(false);
                }, 100);
            }
        } else {
            toast.error(t('instructor.courseCreation.fixErrors', 'يرجى تصحيح الأخطاء قبل المتابعة'));
        }
    };
    
    // Initialize whatYouWillLearn structure if needed
    useEffect(() => {
        if (!courseData.whatYouWillLearn || courseData.whatYouWillLearn.length === 0) {
            handleChange('whatYouWillLearn', []);
        } else if (typeof courseData.whatYouWillLearn[0] === 'string') {
            const migrated = courseData.whatYouWillLearn.map(item => ({
                main: item,
                subPoints: []
            }));
            handleChange('whatYouWillLearn', migrated);
        }
    }, []);

    // Handle main learning outcome change
    const handleMainOutcomeChange = (index, value) => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        const updatedOutcomes = [...currentOutcomes];
        if (!updatedOutcomes[index]) {
            updatedOutcomes[index] = { main: '', subPoints: [] };
        }
        updatedOutcomes[index].main = value;
        handleChange('whatYouWillLearn', updatedOutcomes);
        
        if (errors.whatYouWillLearn) {
            setErrors(prev => ({
                ...prev,
                whatYouWillLearn: ''
            }));
        }
    };

    // Handle sub-point change
    const handleSubPointChange = (mainIndex, subIndex, value) => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        const updatedOutcomes = [...currentOutcomes];
        if (!updatedOutcomes[mainIndex]) {
            updatedOutcomes[mainIndex] = { main: '', subPoints: [] };
        }
        if (!updatedOutcomes[mainIndex].subPoints) {
            updatedOutcomes[mainIndex].subPoints = [];
        }
        updatedOutcomes[mainIndex].subPoints[subIndex] = value;
        handleChange('whatYouWillLearn', updatedOutcomes);
    };

    // Add sub-point to a main outcome
    const addSubPoint = (mainIndex) => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        const updatedOutcomes = [...currentOutcomes];
        if (!updatedOutcomes[mainIndex]) {
            updatedOutcomes[mainIndex] = { main: '', subPoints: [] };
        }
        if (!updatedOutcomes[mainIndex].subPoints) {
            updatedOutcomes[mainIndex].subPoints = [];
        }
        updatedOutcomes[mainIndex].subPoints.push('');
        handleChange('whatYouWillLearn', updatedOutcomes);
    };

    // Remove sub-point from a main outcome
    const removeSubPoint = (mainIndex, subIndex) => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        const updatedOutcomes = [...currentOutcomes];
        if (updatedOutcomes[mainIndex] && updatedOutcomes[mainIndex].subPoints) {
            updatedOutcomes[mainIndex].subPoints = updatedOutcomes[mainIndex].subPoints.filter((_, i) => i !== subIndex);
            handleChange('whatYouWillLearn', updatedOutcomes);
        }
    };

    const addLearningOutcome = () => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        if (currentOutcomes.length < 12) {
            handleChange('whatYouWillLearn', [...currentOutcomes, { main: '', subPoints: [] }]);
        }
    };

    const removeLearningOutcome = (index) => {
        const currentOutcomes = courseData.whatYouWillLearn || [];
        const updatedOutcomes = currentOutcomes.filter((_, i) => i !== index);
        handleChange('whatYouWillLearn', updatedOutcomes);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                            {t('instructor.courseCreation.advancedInfoTitle', 'الوسائط والمخرجات التعليمية')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('instructor.courseCreation.advancedInfoSubtitle', 'أضف صورة الغلاف الجذابة، الفيديو الترويجي، والمهارات التي سيكتسبها الطلاب')}
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-semibold self-start sm:self-center border border-indigo-100 dark:border-indigo-900/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('instructor.courseCreation.step2Badge', 'الخطوة 2 من 5')}</span>
                </div>
            </div>

            {/* Media Uploads Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Thumbnail */}
                <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    errors.thumbnail
                        ? 'border-red-400 bg-red-50/20 dark:bg-red-950/10'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                }`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {t('instructor.courseCreation.courseThumbnailLabel', 'صورة غلاف الدورة')} <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400">16:9 • JPG, PNG, WebP (بحد أقصى 5MB)</span>
                            </div>
                        </div>

                        {thumbnailPreview && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('common.uploaded', 'تم الرفع')}
                            </span>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700">
                        <FileUpload
                            accept="image/*"
                            maxSize={5 * 1024 * 1024} // 5MB
                            folder="courses/thumbnails"
                            onUploadSuccess={handleThumbnailUploadComplete}
                            onUploadError={(error) => toast.error(error)}
                            label={t('instructor.courseCreation.uploadThumbnail', 'اسحب وأفلت غلاف الدورة هنا، أو تصفح ملفاتك')}
                            helperText={t('instructor.courseCreation.thumbnailHelper', 'الصورة الأولى التي يراها الطالب ويجب أن تعبر عن جودة دورتك')}
                            showPreview={true}
                            previewType="image"
                            value={thumbnailPreview}
                            disabled={uploadingFiles.thumbnail}
                            className={`thumbnail-upload ${errors.thumbnail ? 'border-red-500' : ''}`}
                        />
                    </div>

                    {errors.thumbnail && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errors.thumbnail}</span>
                        </div>
                    )}
                </div>

                {/* Course Trailer Video */}
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Video className="w-4 h-4" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {t('instructor.courseCreation.courseTrailerLabel', 'الفيديو الترويجي للدورة')}
                                </label>
                                <span className="text-[11px] text-slate-400">MP4, WebM (بحد أقصى 50MB) • اختياري</span>
                            </div>
                        </div>

                        {trailerPreview && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('common.uploaded', 'تم الرفع')}
                            </span>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700">
                        <FileUpload
                            accept="video/*"
                            maxSize={50 * 1024 * 1024} // 50MB
                            folder="courses/trailers"
                            onUploadSuccess={handleTrailerUploadComplete}
                            onUploadError={(error) => toast.error(error)}
                            label={t('instructor.courseCreation.uploadTrailer', 'ارفع فيديو ترويجي قصير (1-2 دقيقة)')}
                            helperText={t('instructor.courseCreation.trailerHelper', 'الفيديو الترويجي يضاعف نسبة التحاق الطلاب بالدورة بمعدل 5x')}
                            showPreview={true}
                            previewType="video"
                            value={trailerPreview}
                            disabled={uploadingFiles.trailer}
                            className="trailer-upload"
                        />
                    </div>
                </div>
            </div>

            {/* What You Will Learn Section */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                                {t('instructor.courseCreation.whatStudentsLearn', 'ماذا سيتعلم الطالب من هذه الدورة؟')}
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('instructor.courseCreation.outcomesHint', 'حدد أهدافاً تعليمية واضحة ومحددة تساعد الطلاب على فهم المهارات التي سيكتسبونها')}
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 self-start sm:self-center shadow-sm">
                        <span>{courseData.whatYouWillLearn?.length || 0}</span>
                        <span>/</span>
                        <span>12 {t('instructor.courseCreation.outcomesMax', 'مخرجات')}</span>
                    </span>
                </div>

                {errors.whatYouWillLearn && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errors.whatYouWillLearn}</span>
                    </div>
                )}

                {/* Outcomes List */}
                <div className="space-y-4">
                    {courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0 ? (
                        courseData.whatYouWillLearn.map((outcome, index) => {
                            const mainText = typeof outcome === 'string' ? outcome : (outcome?.main || '');
                            const subPoints = typeof outcome === 'string' ? [] : (outcome?.subPoints || []);
                            
                            return (
                                <div 
                                    key={index} 
                                    className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5"
                                >
                                    {/* Main Learning Outcome Item */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex items-center gap-2.5 flex-1">
                                            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={mainText}
                                                onChange={(e) => handleMainOutcomeChange(index, e.target.value)}
                                                className={`w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/70 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100 transition-all ${
                                                    errors.whatYouWillLearn && !mainText.trim()
                                                        ? 'border-red-400'
                                                        : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                                placeholder={t('instructor.courseCreation.outcomePlaceholder', 'مثال: إتقان بناء تطبيقات الويب المتقدمة باستخدام React')}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => addSubPoint(index)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold rounded-xl transition-colors"
                                                title={t('instructor.courseCreation.addSubPoint', 'إضافة نقطة تفصيلية')}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">{t('instructor.courseCreation.addSubPoint', 'نقطة فرعية')}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => removeLearningOutcome(index)}
                                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                                title={t('instructor.courseCreation.removeOutcome', 'حذف هذا المخرج')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sub-points List */}
                                    {subPoints.length > 0 && (
                                        <div className="ms-8 sm:ms-10 ps-3 sm:ps-4 border-s-2 border-indigo-200 dark:border-indigo-900/60 space-y-2.5 pt-1">
                                            {subPoints.map((subPoint, subIndex) => (
                                                <div key={subIndex} className="flex items-center gap-2">
                                                    <CornerDownLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={subPoint}
                                                        onChange={(e) => handleSubPointChange(index, subIndex, e.target.value)}
                                                        className="w-full px-3.5 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                        placeholder={t('instructor.courseCreation.subOutcomePlaceholder', 'نقطة فرعية توضيحية')}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubPoint(index, subIndex)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                                                        title={t('instructor.courseCreation.removeSubPoint', 'حذف النقطة الفرعية')}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20">
                            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {t('instructor.courseCreation.noOutcomesYet', 'لم يتم إضافة مخرجات تعليمية بعد')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                اضغط على الزر أدناه لإضافة ما سيتعلمه الطالب خطوة بخطوة
                            </p>
                        </div>
                    )}
                </div>

                {(!courseData.whatYouWillLearn || courseData.whatYouWillLearn.length < 12) && (
                    <button
                        type="button"
                        onClick={addLearningOutcome}
                        className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-800/80 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:border-blue-500"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('instructor.courseCreation.addMainOutcome', 'إضافة مخرج تعليمي رئيسي جديد')}</span>
                    </button>
                )}
            </div>

            {/* Copyright & IP Protection Notice */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-3xl">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                            <span>{t('instructor.courseCreation.copyrightNoticeTitle', 'إشعار حقوق الملكية الفكرية')}</span>
                            <span className="text-[11px] font-normal text-blue-600 dark:text-blue-400">/ Copyright Policy</span>
                        </h4>
                        <p className="text-xs leading-relaxed text-blue-900/80 dark:text-blue-300/80">
                            جميع محتويات ومواد الدورة التدريبية المرفوعة تخضع لحماية الملكية الفكرية. تأكد من امتلاكك الكامل لحقوق نشر المواد المعروضة أو حصولك على التصاريح القانونية اللازمة.
                        </p>
                        <p className="text-[11px] text-blue-800/70 dark:text-blue-400/70">
                            All uploaded course content and materials are protected. Ensure you own or have obtained the necessary rights to teach and distribute these materials.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Step Action Buttons */}
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

export default AdvancedInfoStep;