import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import RichTextDisplay from '../../../components/RichTextDisplay/RichTextDisplay';
import {
    Rocket,
    CheckCircle2,
    Clock,
    BookOpen,
    Layers,
    FileText,
    Globe,
    AlertCircle,
    Eye,
    Send,
    Loader2,
    Image as ImageIcon,
    Tag,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

const PublishStep = ({ courseData, handleSubmitForReview }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);

    const validateCourse = () => [];

    const handleSubmit = async () => {
        const validationErrors = validateCourse();
        setErrors(validationErrors);

        if (validationErrors.length === 0) {
            setIsSubmitting(true);
            try {
                await handleSubmitForReview();
            } catch (error) {
                console.error('Error submitting course for review:', error);
                setErrors([t('instructor.courseCreation.submitFailed', 'فشل إرسال الدورة للمراجعة. يرجى إعادة المحاولة.')]);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Calculate total lectures and duration
    const totalLectures = courseData.sections?.reduce(
        (total, section) => total + (section.lectures ? section.lectures.length : 0), 0
    ) || 0;

    const totalSections = courseData.sections?.length || 0;

    // Check completion criteria
    const isBasicInfoComplete = Boolean(courseData.title && courseData.category && courseData.price !== undefined);
    const isAdvancedComplete = Boolean(courseData.thumbnail);
    const isCurriculumComplete = totalSections > 0 && totalLectures > 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                            {t('instructor.courseCreation.publishTitle', 'المراجعة النهائية ونشر الدورة')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('instructor.courseCreation.publishSubtitle', 'راجع بيانات الدورة وتأكد من اكتمال المتطلبات قبل إرسالها للاعتماد')}
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold self-start sm:self-center border border-emerald-100 dark:border-emerald-900/50">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>{t('instructor.courseCreation.step5Badge', 'الخطوة الأخيرة: الاعتماد')}</span>
                </div>
            </div>

            {/* Checklist Card */}
            <div className="p-6 sm:p-7 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl space-y-4">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                        {t('instructor.courseCreation.publishChecklist', 'قائمة الجاهزية والتحقق')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic Info Check */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        isBasicInfoComplete
                            ? 'bg-white dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-800/80 border-amber-200 dark:border-amber-800/60'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isBasicInfoComplete
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}>
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {t('instructor.courseCreation.publishChecklistBasic', 'المعلومات الأساسية')}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {isBasicInfoComplete ? 'العنوان، التصنيف، والسعر مكتمل' : 'يرجى استكمال الحقول الإلزامية'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Media Check */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        isAdvancedComplete
                            ? 'bg-white dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-800/80 border-amber-200 dark:border-amber-800/60'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isAdvancedComplete
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}>
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {t('instructor.courseCreation.publishChecklistAdvanced', 'الوسائط والمخرجات')}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {isAdvancedComplete ? 'غلاف الدورة تم رفعه بنجاح' : 'غلاف الدورة التدريبية مطلوب'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Check */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        isCurriculumComplete
                            ? 'bg-white dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-800/80 border-amber-200 dark:border-amber-800/60'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isCurriculumComplete
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}>
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {t('instructor.courseCreation.curriculumTitle', 'المنهج الدراسي')}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {isCurriculumComplete ? `${totalSections} أقسام • ${totalLectures} محاضرات` : 'يمكن إضافة دروس أو نشر المسودة'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Student Preview Mockup */}
            <div className="p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Eye className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                            {t('instructor.courseCreation.coursePreview', 'معاينة بطاقة الدورة (كما يراها الطلاب)')}
                        </h3>
                    </div>

                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold">
                        {t('instructor.courseCreation.previewMode', 'معاينة حية')}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Thumbnail Column */}
                    <div className="lg:col-span-5">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group">
                            {courseData.thumbnail ? (
                                <img
                                    src={courseData.thumbnail instanceof File ? URL.createObjectURL(courseData.thumbnail) : courseData.thumbnail}
                                    alt="Course Thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
                                    <span className="text-xs font-medium">لم يتم رفع صورة غلاف</span>
                                </div>
                            )}

                            {/* Floating category & level badges */}
                            <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
                                {courseData.category && (
                                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg shadow-sm">
                                        {courseData.category}
                                    </span>
                                )}
                                {courseData.courseLevel && (
                                    <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold rounded-lg shadow-sm">
                                        {courseData.courseLevel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-7 space-y-4">
                        <div>
                            <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                {courseData.title || 'عنوان الدورة التدريبية'}
                            </h4>
                            {courseData.subtitle && (
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {courseData.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Description Preview */}
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-h-24 overflow-hidden relative">
                            <RichTextDisplay
                                content={courseData.description || 'وصف الدورة التدريبية سيظهر هنا بالتفصيل للطلاب...'}
                                showFull={false}
                                className="text-slate-600 dark:text-slate-400 text-xs"
                            />
                            <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                        </div>

                        {/* Metadata stats bar */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span>{totalLectures} محاضرة</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <span>{courseData.duration ? `${Math.floor(parseFloat(courseData.duration) / 60)} ساعة` : 'غير محدد'}</span>
                            </div>
                            {courseData.language && (
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-emerald-500" />
                                    <span>{courseData.language}</span>
                                </div>
                            )}
                        </div>

                        {/* Pricing section */}
                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <span className="text-[11px] text-slate-400 block mb-0.5">سعر الدورة للطالب</span>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                                        {courseData.price !== undefined && courseData.price !== ''
                                            ? `${parseFloat(courseData.price || 0).toFixed(2)} ر.س`
                                            : 'مجاناً'}
                                    </span>
                                    {courseData.originalPrice && parseFloat(courseData.originalPrice) > parseFloat(courseData.price || 0) && (
                                        <span className="text-sm text-slate-400 line-through">
                                            {parseFloat(courseData.originalPrice).toFixed(2)} ر.س
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Assurance & Guidelines Notice */}
            <div className="p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-3xl">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200">
                            {t('instructor.courseCreation.reviewProcessTitle', 'ماذا يحدث بعد إرسال الدورة للمراجعة؟')}
                        </h4>
                        <p className="text-xs leading-relaxed text-blue-900/80 dark:text-blue-300/80">
                            يقوم فريق الجودة التعليمية بمراجعة محتوى الدورة والتأكد من وضوح الصوت والصورة والمحتوى الأكاديمي. تستغرق المراجعة عادة بين 24 إلى 48 ساعة، وسيصلك إشعار بالبريد الإلكتروني فور اعتمادها ونشرها للمتعلمين.
                        </p>
                    </div>
                </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl">
                    <h3 className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{t('instructor.courseCreation.fixBeforeSubmit', 'يرجى تصحيح الملاحظات التالية قبل الإرسال:')}</span>
                    </h3>
                    <ul className="list-disc ps-5 text-xs text-red-600/90 dark:text-red-400/90 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/25 transition-all text-sm sm:text-base active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t('instructor.courseCreation.submitting', 'جاري إرسال الدورة للمراجعة...')}</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>{t('instructor.courseCreation.submitForReview', 'إرسال الدورة للمراجعة والاعتماد')}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PublishStep;