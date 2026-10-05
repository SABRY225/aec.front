import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { courseService, courseContentService } from '../services/new-api';
import { useAuth } from '../context/AuthContext';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';
import { formatDate } from '../utils/formatDate';
import OfflineCourseStudy from './OfflineCourseStudy';
import {
    Play,
    Pause,
    CheckCircle2,
    Circle,
    Video,
    FileText,
    Edit3,
    Star,
    User,
    Clock,
    Globe,
    Calendar,
    Menu,
    X,
    Download,
    Bookmark,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Award,
    Sparkles,
    BookOpen,
    Layers,
    Check,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    HelpCircle,
    ShieldCheck,
    CheckCheck,
    RefreshCw,
    FolderDown,
    PanelLeftClose,
    PanelLeftOpen,
    GraduationCap,
    Info,
    FileDown,
    Maximize2
} from 'lucide-react';

// Assignment Questions Component
const AssignmentQuestions = ({ questions, onSubmit, isCompleted, loading }) => {
    const { t } = useTranslation();
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleSubmit = () => {
        const formattedAnswers = questions.map((question, index) => ({
            questionId: question._id || index,
            answer: answers[index] !== undefined ? answers[index] : null
        })).filter(a => a.answer !== null);
        
        onSubmit(formattedAnswers);
    };

    return (
        <div className="space-y-6">
            {questions.map((question, index) => {
                const isSelected = answers[index] !== undefined;
                
                return (
                    <div key={index} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm transition hover:border-slate-300">
                        <div className="mb-5">
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#004C97] border border-blue-100">
                                    {t('course.study.question', { num: index + 1 })}
                                </span>
                                {question.points && (
                                    <span className="text-xs font-semibold text-slate-500">
                                        {question.points} {t('course.study.points', 'نقاط')}
                                    </span>
                                )}
                            </div>
                            
                            {/* Question Text */}
                            {question.content && (
                                <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed mb-4">
                                    {question.content}
                                </p>
                            )}
                            
                            {/* Question Image */}
                            {question.contentImage && (
                                <div className="mb-4">
                                    <img 
                                        src={question.contentImage} 
                                        alt={t('course.study.questionImage', 'صورة السؤال')}
                                        className="max-w-full max-h-80 h-auto rounded-xl border border-slate-200 object-contain shadow-sm"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* No content warning */}
                            {!question.content && !question.contentImage && (
                                <p className="text-slate-400 italic text-sm">{t('course.study.noQuestionContent', 'لا يوجد محتوى لهذا السؤال')}</p>
                            )}
                        </div>
                        
                        {/* MCQ Options */}
                        {(question.type === 'mcq' || question.type === 'true-false') && question.options && (
                            <div className="space-y-3">
                                {question.options.map((option, optionIndex) => {
                                    const optionText = typeof option === 'string' ? option : (option.text || '');
                                    const optionImage = typeof option === 'object' ? option.image : null;
                                    const isOptionSelected = answers[index] === optionIndex;
                                    
                                    return (
                                        <label 
                                            key={optionIndex} 
                                            className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                isOptionSelected 
                                                    ? 'border-[#004C97] bg-blue-50/60 shadow-sm' 
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={optionIndex}
                                                checked={isOptionSelected}
                                                onChange={() => handleAnswerChange(index, optionIndex)}
                                                className="mt-1 w-4 h-4 text-[#004C97] focus:ring-[#004C97]"
                                            />
                                            <div className="flex-1 min-w-0">
                                                {/* Option Text */}
                                                {optionText && (
                                                    <span className={`block text-sm sm:text-base leading-relaxed ${isOptionSelected ? 'font-bold text-[#004C97]' : 'text-slate-700'}`}>
                                                        {optionText}
                                                    </span>
                                                )}
                                                
                                                {/* Option Image */}
                                                {optionImage && (
                                                    <div className="mt-2.5">
                                                        <img 
                                                            src={optionImage} 
                                                            alt={t('course.study.optionAlt', { num: optionIndex + 1 })}
                                                            className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200 object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* No content warning */}
                                                {!optionText && !optionImage && (
                                                    <span className="text-slate-400 italic text-xs">{t('course.study.emptyOption', 'خيار فارغ')}</span>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        
                        {/* Essay Answer */}
                        {question.type === 'essay' && (
                            <textarea
                                rows={6}
                                name={`question-${index}`}
                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004C97] focus:border-transparent text-slate-800 text-sm sm:text-base leading-relaxed"
                                placeholder={t('course.study.answerPlaceholder', 'اكتب إجابتك هنا بتفصيل...')}
                                value={answers[index] || ''}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                            />
                        )}
                    </div>
                );
            })}
            
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={isCompleted || loading}
                    className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                        isCompleted 
                            ? 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none' 
                            : 'bg-[#004C97] hover:bg-[#071942] text-white shadow-blue-900/20 hover:scale-[1.01]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{t('common.submitting', 'جارٍ الإرسال...')}</span>
                        </>
                    ) : isCompleted ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>{t('course.study.submitted', 'تم تسليم الإجابات بنجاح')}</span>
                        </>
                    ) : (
                        <>
                            <CheckCheck className="w-5 h-5" />
                            <span>{t('course.study.submitAssignmentBtn', 'تسليم الواجب الآن')}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

/** Seconds from API (may be missing); returns null if not usable */
const parseDurationSeconds = (value) => {
    if (value == null) return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
};

/** mm:ss for duration in seconds */
const formatDurationMMSS = (totalSeconds) => {
    const s = Math.floor(totalSeconds % 60);
    const m = Math.floor(totalSeconds / 60);
    return `${m}:${String(s).padStart(2, '0')}`;
};

const FileDownloadRow = ({ file }) => {
    const { t } = useTranslation();
    if (!file?.url) return null;
    const label = file.name || t('course.study.downloadDefault', 'ملف مرفق للتحميل');
    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-xl transition duration-150 group"
        >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#004C97] flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
            </div>
            <span className="flex-1 text-slate-800 font-semibold text-xs sm:text-sm truncate">{label}</span>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-[#004C97] flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-4 h-4" />
            </div>
        </a>
    );
};

const CourseStudy = () => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [studyData, setStudyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [currentContent, setCurrentContent] = useState(null);
    const [contentType, setContentType] = useState('lecture'); // 'lecture' or 'assignment'
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [loadedVideoDurationSec, setLoadedVideoDurationSec] = useState(null);
    const [courseMaterialsOpen, setCourseMaterialsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'resources', 'info'

    useEffect(() => {
        fetchStudyData();
    }, [id]);

    // Keep the selected lecture/assignment in sync when study data updates
    useEffect(() => {
        if (!studyData?.sections?.length || !currentContent?._id) return;

        const idStr = String(currentContent._id);

        for (const section of studyData.sections) {
            const lec = (section.lectures || []).find((l) => String(l._id) === idStr);
            if (lec) {
                if (lec !== currentContent) {
                    setCurrentContent(lec);
                    setContentType('lecture');
                }
                return;
            }
            const asg = (section.assignments || []).find((a) => String(a._id) === idStr);
            if (asg) {
                if (asg !== currentContent) {
                    setCurrentContent(asg);
                    setContentType('assignment');
                }
                return;
            }
        }
    }, [studyData]);

    const fetchStudyData = async (retryCount = 0) => {
        try {
            setLoading(true);
            const data = await courseService.getCourseStudyData(id);
            setStudyData(data);
            
            // Auto-expand first section and select first lecture
            if (data.sections?.length > 0 && data.course?.courseType !== 'onsite') {
                const firstSectionId = data.sections[0]._id;
                setExpandedSections({ [firstSectionId]: true });
                
                if (data.sections[0].lectures?.length > 0) {
                    setCurrentContent(data.sections[0].lectures[0]);
                    setContentType('lecture');
                }
            }
        } catch (error) {
            console.error('Error fetching study data:', error);
            
            if (error.response?.status === 401 && retryCount < 2) {
                setTimeout(() => {
                    fetchStudyData(retryCount + 1);
                }, 1000);
                return;
            }
            
            if (error.response?.status === 403) {
                toast.error(t('course.study.enrolledRequired', 'يجب أن تكون مسجلاً في هذه الدورة للوصول إلى المحتوى'));
                navigate(`/course/${id}`);
            } else if (error.response?.status === 401) {
                toast.error(t('course.study.authRequired', 'يرجى تسجيل الدخول أولاً'));
                navigate('/login');
            } else {
                toast.error(t('course.study.loadFailed', 'تعذر تحميل بيانات المحتوى التدريبي'));
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleToggleAllSections = () => {
        if (!studyData?.sections?.length) return;
        const allExpanded = studyData.sections.every((s) => expandedSections[s._id]);
        if (allExpanded) {
            setExpandedSections({});
        } else {
            const next = {};
            studyData.sections.forEach((s) => {
                next[s._id] = true;
            });
            setExpandedSections(next);
        }
    };

    const selectContent = (content, type) => {
        setCurrentContent(content);
        setContentType(type);
        setVideoPlaying(false);
        setLoadedVideoDurationSec(null);
    };

    const markLectureComplete = async (lectureId) => {
        try {
            setLoading(true);
            await courseContentService.markLectureComplete(id, lectureId);
            toast.success(t('course.study.lectureComplete', 'تم وضع علامة إتمام على المحاضرة بنجاح'));
            
            // Refresh study data
            const updatedData = await courseService.getCourseStudyData(id);
            setStudyData(updatedData);
        } catch (error) {
            console.error('Error marking lecture complete:', error);
            toast.error(error.response?.data?.message || t('course.study.lectureCompleteFailed', 'فشل في تحديث حالة إتمام المحاضرة'));
        } finally {
            setLoading(false);
        }
    };

    const submitAssignment = async (assignmentId, answers = []) => {
        try {
            setLoading(true);
            const result = await courseContentService.submitAssignment(id, assignmentId, answers);
            toast.success(t('course.study.assignmentSubmitted', { score: result.score, total: result.totalPoints }));
            
            // Refresh study data
            const updatedData = await courseService.getCourseStudyData(id);
            setStudyData(updatedData);
        } catch (error) {
            console.error('Error submitting assignment:', error);
            toast.error(error.response?.data?.message || t('course.study.assignmentFailed', 'فشل تسليم الواجب'));
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async () => {
        try {
            await courseService.rateCourse(id, rating, review);
            toast.success(t('course.study.ratingSubmitted', 'تم إرسال تقييمك بنجاح، شكراً لمشاركتك!'));
            setShowRatingModal(false);
            setRating(0);
            setReview('');
            
            fetchStudyData();
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error(error.response?.data?.message || t('course.study.ratingFailed', 'فشل في إرسال التقييم'));
        }
    };

    const calculateTimeRemaining = () => {
        if (!studyData?.course?.endDate) return null;
        const endDate = new Date(studyData.course.endDate);
        const now = new Date();
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Flatten all items for previous/next lesson navigation
    const allItems = useMemo(() => {
        if (!studyData?.sections) return [];
        const list = [];
        studyData.sections.forEach((section) => {
            (section.lectures || []).forEach((lec) => {
                list.push({ ...lec, contentType: 'lecture', sectionName: section.name });
            });
            (section.assignments || []).forEach((asg) => {
                list.push({ ...asg, contentType: 'assignment', sectionName: section.name });
            });
        });
        return list;
    }, [studyData]);

    const currentIndex = useMemo(() => {
        if (!currentContent?._id || !allItems.length) return -1;
        return allItems.findIndex((item) => String(item._id) === String(currentContent._id));
    }, [currentContent, allItems]);

    const prevContent = currentIndex > 0 ? allItems[currentIndex - 1] : null;
    const nextContent = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

    const goToContent = (item) => {
        if (!item) return;
        selectContent(item, item.contentType);
    };

    if (loading && !studyData) {
        return <LoadingNew />;
    }

    if (!studyData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{t('course.study.notFound', 'لم يتم العثور على محتوى المساق')}</h2>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        {t('course.study.notFoundDesc', 'قد يكون هذا المساق غير متوفر حالياً أو يتطلب تسجيلاً مسبقاً.')}
                    </p>
                    <button
                        onClick={() => navigate('/student/my-courses')}
                        className="w-full bg-[#004C97] hover:bg-[#071942] text-white py-3.5 px-6 rounded-2xl font-bold transition shadow-lg shadow-blue-900/15"
                    >
                        {t('course.study.backToMyCourses', 'العودة إلى دوراتي')}
                    </button>
                </div>
            </div>
        );
    }

    // Offline / onsite courses get a dedicated venue + ticket experience
    if (studyData.course?.courseType === 'onsite') {
        return (
            <OfflineCourseStudy
                studyData={studyData}
                language={language}
                isRTL={isRTL}
            />
        );
    }

    const daysRemaining = calculateTimeRemaining();
    const progressPercent = Math.round(studyData.progress?.overallProgress || 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* ========================================================================= */}
            {/* STUDIO HEADER: Premium Deep Navy Bar with Progress & Navigation           */}
            {/* ========================================================================= */}
            <header className="sticky top-0 z-40 bg-[#071942] text-white border-b border-blue-900/40 shadow-lg px-4 sm:px-6 py-3.5">
                <div className="flex items-center justify-between gap-4">
                    
                    {/* Left side: Back to courses & Course Title */}
                    <div className="flex items-center gap-3.5 min-w-0">
                        <button
                            onClick={() => navigate('/student/my-courses')}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition flex items-center justify-center shrink-0 border border-white/10"
                            title={t('course.study.backToMyCourses', 'العودة لدوراتي')}
                        >
                            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Link 
                                    to={`/course/${id}`}
                                    className="text-xs text-blue-200/80 hover:text-white transition flex items-center gap-1 truncate"
                                >
                                    <span>{studyData.course?.title}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </Link>
                            </div>
                            <h1 className="text-sm sm:text-base font-black text-white truncate">
                                {currentContent?.name || currentContent?.title || t('course.study.selectContent', 'محتوى الدرس')}
                            </h1>
                        </div>
                    </div>

                    {/* Center / Right side: Progress Bar, Rating & Sidebar Toggle */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        
                        {/* Overall Progress Pill */}
                        {studyData.progress?.overallProgress !== null && (
                            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                                <div className="w-16 h-2 rounded-full bg-white/20 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-black text-white">
                                    {progressPercent}% {t('course.study.completedShort', 'مكتمل')}
                                </span>
                            </div>
                        )}

                        {/* Rate Course Button */}
                        {studyData.canRate && (
                            <button
                                onClick={() => setShowRatingModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition shadow-sm"
                            >
                                <Star className="w-3.5 h-3.5 fill-amber-300" />
                                <span className="hidden md:inline">{t('course.study.rateCourse', 'تقييم المساق')}</span>
                            </button>
                        )}

                        {/* Toggle Sidebar on Desktop & Mobile */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 border border-white/10 text-xs font-bold"
                            title={sidebarOpen ? t('course.study.hideSidebar', 'إخفاء المنهج') : t('course.study.showSidebar', 'عرض المنهج')}
                        >
                            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                            <span className="hidden lg:inline">
                                {sidebarOpen ? t('course.study.hideCurriculum', 'إخفاء المنهج') : t('course.study.showCurriculum', 'عرض المنهج')}
                            </span>
                        </button>
                    </div>

                </div>
            </header>

            {/* ========================================================================= */}
            {/* WORKSPACE: Studio Two-Column (Collapsible Curriculum Sidebar + Theater Player) */}
            {/* ========================================================================= */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Left/Start Sidebar (Curriculum Drawer) */}
                <aside
                    className={`fixed lg:static top-[57px] bottom-0 ${isRTL ? 'right-0' : 'left-0'} z-50 lg:z-10 w-80 sm:w-96 bg-white border-${isRTL ? 'l' : 'r'} border-slate-200/90 shadow-2xl lg:shadow-none flex flex-col transition-all duration-300 ease-in-out ${
                        sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:hidden' : '-translate-x-full lg:hidden')
                    }`}
                >
                    {/* Sidebar Header with Progress Summary */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#004C97]" />
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    {t('course.study.curriculum', 'محتويات ومنهج الدورة')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar & Counts */}
                        {studyData.progress?.overallProgress !== null && (
                            <div>
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                                    <span>{t('course.study.yourProgress', 'تقدمك في المساق')}</span>
                                    <span className="text-[#004C97]">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="bg-gradient-to-r from-[#004C97] to-teal-500 h-2 rounded-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>
                                        {studyData.progress.completedLectures + studyData.progress.completedAssignments} / {studyData.progress.totalLectures + studyData.progress.totalAssignments} {t('course.study.itemsDone', 'مكتمل')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleToggleAllSections}
                                        className="text-[#004C97] hover:underline font-bold"
                                    >
                                        {t('course.curriculum.toggleAll', 'تبديل الكل')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section & Lessons Accordion List */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                        {studyData.sections.map((section, sIndex) => {
                            const isExpanded = !!expandedSections[section._id];
                            const lectures = section.lectures || [];
                            const assignments = section.assignments || [];
                            const totalItems = lectures.length + assignments.length;
                            const completedInSec = lectures.filter(l => l.isCompleted).length + assignments.filter(a => a.isCompleted).length;

                            return (
                                <div 
                                    key={section._id} 
                                    className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-xs"
                                >
                                    <button
                                        onClick={() => toggleSection(section._id)}
                                        className={`w-full flex items-center justify-between p-3.5 text-start transition ${
                                            isExpanded ? 'bg-slate-100/70 font-bold' : 'bg-slate-50/70 hover:bg-slate-100/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center shrink-0">
                                                {sIndex + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                    {section.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-normal">
                                                    {completedInSec}/{totalItems} {t('course.study.completedShort', 'مكتمل')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-slate-400 ms-2 shrink-0">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t border-slate-100 bg-white"
                                            >
                                                <div className="p-1.5 space-y-1">
                                                    {/* Lectures */}
                                                    {lectures.map((lecture) => {
                                                        const isSelected = currentContent?._id === lecture._id;

                                                        return (
                                                            <button
                                                                key={lecture._id}
                                                                onClick={() => selectContent(lecture, 'lecture')}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-start ${
                                                                    isSelected
                                                                        ? 'bg-blue-50/90 text-[#004C97] font-bold border border-blue-200 shadow-xs'
                                                                        : 'hover:bg-slate-50 text-slate-700'
                                                                }`}
                                                            >
                                                                <div className="shrink-0">
                                                                    {lecture.isCompleted ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    ) : (
                                                                        <Circle className="w-4 h-4 text-slate-300" />
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Video className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#004C97]' : 'text-slate-400'}`} />
                                                                        <span className="text-xs sm:text-sm truncate">
                                                                            {lecture.name}
                                                                        </span>
                                                                    </div>

                                                                    {parseDurationSeconds(lecture.video?.duration) != null && (
                                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 ps-5">
                                                                            {formatDurationMMSS(parseDurationSeconds(lecture.video.duration))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Assignments */}
                                                    {assignments.map((assignment) => {
                                                        const isSelected = currentContent?._id === assignment._id;

                                                        return (
                                                            <button
                                                                key={assignment._id}
                                                                onClick={() => selectContent(assignment, 'assignment')}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-start ${
                                                                    isSelected
                                                                        ? 'bg-orange-50/90 text-[#f58207] font-bold border border-orange-200 shadow-xs'
                                                                        : 'hover:bg-slate-50 text-slate-700'
                                                                }`}
                                                            >
                                                                <div className="shrink-0">
                                                                    {assignment.isCompleted ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                    ) : (
                                                                        <Circle className="w-4 h-4 text-slate-300" />
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Edit3 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#f58207]' : 'text-orange-500'}`} />
                                                                        <span className="text-xs sm:text-sm truncate">
                                                                            {assignment.title}
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-[10px] text-slate-400 mt-0.5 ps-5">
                                                                        {assignment.totalPoints} {t('course.study.points', 'درجة')}
                                                                        {assignment.userScore !== null && (
                                                                            <span className="ms-1 font-bold text-emerald-600">
                                                                                ({assignment.userScore} / {assignment.totalPoints})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Help Note */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-center text-xs text-slate-500">
                        <span>{t('course.study.needHelp', 'بحاجة إلى مساعدة؟')} </span>
                        <Link to="/contact" className="text-[#004C97] font-bold hover:underline">
                            {t('course.study.support', 'تواصل مع الدعم الفني')}
                        </Link>
                    </div>
                </aside>

                {/* Main Theater & Learning Workspace */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAFC]">
                    
                    {/* Course Materials Notification Banner (If present) */}
                    {studyData.course?.additionalFiles?.length > 0 && (
                        <div className="px-4 sm:px-8 pt-6">
                            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 p-4 shadow-xs">
                                <button
                                    type="button"
                                    onClick={() => setCourseMaterialsOpen((o) => !o)}
                                    className="w-full flex items-center justify-between gap-3 text-start"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#004C97] text-white flex items-center justify-center shrink-0 shadow-sm">
                                            <FolderDown className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-slate-900 block">
                                                {t('course.study.courseMaterials', 'الملفات والمراجع التدريبية الشاملة')}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {t('course.study.materialsCount', { count: studyData.course.additionalFiles.length })} {t('course.study.filesAvailable', 'ملف متاح للتحميل')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#004C97]">
                                        <span>{courseMaterialsOpen ? t('common.close', 'إغلاق') : t('common.view', 'عرض')}</span>
                                        {courseMaterialsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {courseMaterialsOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden pt-4 mt-3 border-t border-blue-100"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {studyData.course.additionalFiles.map((file, index) => (
                                                    <FileDownloadRow
                                                        key={`course-file-${file.url}-${index}`}
                                                        file={file}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    {currentContent ? (
                        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
                            
                            {contentType === 'lecture' ? (
                                <div>
                                    {/* Cinema Video Player Container */}
                                    {currentContent.video?.url ? (
                                        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                                            <div
                                                className="aspect-video w-full bg-black select-none relative"
                                                onContextMenu={(e) => e.preventDefault()}
                                            >
                                                <video
                                                    key={String(currentContent._id)}
                                                    controls
                                                    controlsList="nodownload"
                                                    playsInline
                                                    draggable={false}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    className="w-full h-full object-contain"
                                                    poster={currentContent.thumbnail}
                                                    onPlay={() => setVideoPlaying(true)}
                                                    onPause={() => setVideoPlaying(false)}
                                                    onLoadedMetadata={(e) => {
                                                        const d = e.target.duration;
                                                        if (Number.isFinite(d)) setLoadedVideoDurationSec(Math.round(d));
                                                    }}
                                                >
                                                    <source src={currentContent.video.url} type="video/mp4" />
                                                    {t('fileUpload.videoNotSupported', 'المتصفح لا يدعم تشغيل هذا الفيديو')}
                                                </video>
                                            </div>

                                            {/* Action bar below video player */}
                                            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const apiSec = parseDurationSeconds(currentContent.video?.duration);
                                                        const sec = apiSec ?? loadedVideoDurationSec;
                                                        return (
                                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                                                <Clock className="w-3.5 h-3.5 text-[#F7931E]" />
                                                                <span>
                                                                    {sec != null
                                                                        ? formatDurationMMSS(sec)
                                                                        : t('course.study.durationEmpty', '--:--')}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Mark Lecture Complete CTA */}
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        onClick={() => markLectureComplete(currentContent._id)}
                                                        disabled={currentContent.isCompleted || loading}
                                                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-sm ${
                                                            currentContent.isCompleted 
                                                                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-not-allowed' 
                                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20 hover:scale-[1.02] active:scale-98'
                                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>
                                                            {currentContent.isCompleted 
                                                                ? t('course.study.completed', 'تمت المشاهدة والإكمال ✓') 
                                                                : t('course.study.markCompleteBtn', 'وضع علامة إكمال')}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                                            <Video className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                {t('course.study.noVideo', 'لا يوجد فيديو مرفق لهذه المحاضرة')}
                                            </h3>
                                            <p className="text-slate-500 text-sm">
                                                {t('course.study.checkDescriptionBelow', 'يرجى مراجعة تفاصيل المحتوى والملفات المرفقة أدناه.')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Previous / Next Lecture Navigation Pills */}
                                    <div className="flex items-center justify-between gap-4 py-4">
                                        {prevContent ? (
                                            <button
                                                onClick={() => goToContent(prevContent)}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition"
                                            >
                                                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                                <span>{t('course.study.prevLesson', 'الدرس السابق')}</span>
                                            </button>
                                        ) : <div />}

                                        {nextContent ? (
                                            <button
                                                onClick={() => goToContent(nextContent)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004C97] hover:bg-[#071942] text-white text-xs sm:text-sm font-black shadow-md shadow-blue-900/15 transition"
                                            >
                                                <span>{t('course.study.nextLesson', 'الدرس التالي')}</span>
                                                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                        ) : <div />}
                                    </div>

                                    {/* Tabs: Overview, Resources, Instructor */}
                                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-2 border-b border-slate-100 p-2 sm:px-6">
                                            <button
                                                onClick={() => setActiveTab('overview')}
                                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                                    activeTab === 'overview'
                                                        ? 'bg-blue-50 text-[#004C97]'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Info className="w-4 h-4" />
                                                <span>{t('course.study.tabOverview', 'عن الدرس')}</span>
                                            </button>

                                            {Array.isArray(currentContent.files) && currentContent.files.length > 0 && (
                                                <button
                                                    onClick={() => setActiveTab('resources')}
                                                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                                        activeTab === 'resources'
                                                            ? 'bg-blue-50 text-[#004C97]'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{t('course.study.tabResources', 'الملفات المرفقة')} ({currentContent.files.length})</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setActiveTab('info')}
                                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                                                    activeTab === 'info'
                                                        ? 'bg-blue-50 text-[#004C97]'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                            >
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{t('course.study.tabCourseInfo', 'معلومات الدورة والمحاضر')}</span>
                                            </button>
                                        </div>

                                        <div className="p-6 sm:p-8">
                                            {activeTab === 'overview' && (
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 mb-3">
                                                        {currentContent.name}
                                                    </h3>
                                                    {currentContent.description ? (
                                                        <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                                                            {currentContent.description}
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 italic text-sm">
                                                            {t('course.study.noDescription', 'لا يتوفر وصف تفصيلي لهذا الدرس.')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'resources' && Array.isArray(currentContent.files) && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                                                        {t('course.study.lectureResources', 'ملفات ووثائق خاصة بهذا الدرس:')}
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {currentContent.files.map((file, index) => (
                                                            <FileDownloadRow
                                                                key={`lec-${currentContent._id}-file-${file.url}-${index}`}
                                                                file={file}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'info' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Instructor Info */}
                                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                            {t('course.study.instructor', 'محاضر الدورة')}
                                                        </h4>
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#004C97] to-[#071942] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                                {studyData.course?.instructor?.firstName?.[0] || 'I'}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-black text-slate-900 text-base">
                                                                    {studyData.course?.instructor?.firstName} {studyData.course?.instructor?.lastName}
                                                                </h5>
                                                                <p className="text-xs text-slate-500">
                                                                    {t('course.study.courseInstructor', 'محاضر معتمد في المنصة')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Course Metadata */}
                                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                            {t('course.study.courseInfo', 'بيانات الدورة')}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-slate-700">
                                                            <Clock className="w-4 h-4 text-[#004C97]" />
                                                            <span>{studyData.course?.duration || 120} {t('course.study.minutes', 'دقيقة تدريبية')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-700">
                                                            <Globe className="w-4 h-4 text-[#004C97]" />
                                                            <span>{studyData.course?.language || 'العربية'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-700">
                                                            <Award className="w-4 h-4 text-[#004C97]" />
                                                            <span>{studyData.course?.courseLevel || 'جميع المستويات'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Assignment Content View */
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#f58207] border border-orange-200 mb-2">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>{t('course.study.assignmentLabel', 'واجب تطبيقي')}</span>
                                                </div>
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                                    {currentContent.title}
                                                </h2>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-slate-700">
                                                    {currentContent.totalPoints} {t('course.study.points', 'درجة')}
                                                </span>
                                                {currentContent.dueDate && (
                                                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 font-bold text-amber-800 border border-amber-200">
                                                        {t('course.study.dueLabel', { date: formatDate(currentContent.dueDate, language) })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {currentContent.description && (
                                            <div className="text-slate-700 text-sm sm:text-base leading-relaxed pt-5">
                                                {currentContent.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Questions */}
                                    {currentContent.questions && currentContent.questions.length > 0 ? (
                                        <AssignmentQuestions 
                                            questions={currentContent.questions}
                                            onSubmit={(answers) => submitAssignment(currentContent._id, answers)}
                                            isCompleted={currentContent.isCompleted}
                                            loading={loading}
                                        />
                                    ) : (
                                        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                                            <p className="text-slate-500 text-sm">
                                                {t('course.study.noAssignmentQuestions', 'لا توجد أسئلة مخصصة لهذا الواجب حالياً.')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center max-w-sm">
                                <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {t('course.study.selectContentLearning', 'اختر درساً للبدء في المتابعة')}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t('course.study.selectContentHint', 'انقر على أي محاضرة أو واجب في القائمة الجانبية لعرض محتواها ومتابعة رحلتك التعليمية.')}
                                </p>
                            </div>
                        </div>
                    )}
                </main>

            </div>

            {/* ========================================================================= */}
            {/* RATING MODAL                                                              */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showRatingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRatingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-slate-900">
                                    {t('course.study.rateThisCourse', 'تقييمك لهذه الدورة')}
                                </h3>
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-6">
                                {t('course.study.rateHint', 'شاركنا رأيك الصادق لمساعدة زملائك والارتقاء بجودة المحتوى التدريبي.')}
                            </p>

                            <div className="mb-6 text-center">
                                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">
                                    {t('course.study.rating', 'التقييم')}
                                </label>
                                <div className="inline-flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-7 h-7 transition-colors ${
                                                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    {t('course.study.reviewOptional', 'ملاحظاتك ومراجعتك (اختياري)')}
                                </label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    rows={4}
                                    className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#004C97] focus:border-transparent text-sm leading-relaxed"
                                    placeholder={t('course.study.reviewPlaceholder', 'اكتب تعليقك أو ملاحظاتك المفيدة حول أسلوب التدريب والمحتوى...')}
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                                >
                                    {t('common.cancel', 'إلغاء')}
                                </button>
                                <button
                                    onClick={submitRating}
                                    disabled={rating === 0}
                                    className="flex-1 py-3 px-4 bg-[#004C97] hover:bg-[#071942] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition text-sm shadow-md"
                                >
                                    {t('course.study.submitRating', 'إرسال التقييم')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseStudy;