import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate } from '../utils/formatDate';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { courseService } from '../services/new-api';
import api from '../services/new-api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategoryLookup } from '../context/CategoryLookupContext';
import { normalizeCourseType } from '../constants/courseTypes';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';
import RichTextDisplay from '../components/RichTextDisplay/RichTextDisplay';
import CourseCard from '../components/CourseCard';
import {
    Star,
    Users,
    Clock,
    Globe,
    MapPin,
    Calendar,
    Play,
    Lock,
    ChevronDown,
    ChevronUp,
    ShoppingCart,
    CreditCard,
    Share2,
    CheckCircle2,
    Award,
    Infinity as InfinityIcon,
    Video,
    BookOpen,
    FileText,
    FileDown,
    ShieldCheck,
    Check,
    ExternalLink,
    GraduationCap,
    Sparkles,
    Smartphone,
    Layers,
    UserCheck,
    X,
    Building,
    Compass,
    AlertCircle,
    SlidersHorizontal,
    Tv,
    Eye
} from 'lucide-react';

const CoursePreview = () => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, isInCart } = useCart();
    const { localizeCategory, localizeSubcategory } = useCategoryLookup();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [selectedPreviewVideo, setSelectedPreviewVideo] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [checkingEnrollment, setCheckingEnrollment] = useState(false);

    useEffect(() => {
        fetchCourseData();
        if (user) {
            checkEnrollmentStatus();
        }
    }, [id, user]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const courseData = await courseService.getCourseById(id);

            // Normalize topics data - ensure it's always an array of strings, filter out error messages
            if (courseData) {
                let normalizedTopics = [];

                const isValidTopic = (str) => {
                    if (!str || typeof str !== 'string') return false;
                    const trimmed = str.trim();
                    if (!trimmed) return false;
                    const errorPatterns = [
                        /upload failed/i,
                        /no file information/i,
                        /error/i,
                        /failed/i
                    ];
                    return !errorPatterns.some(pattern => pattern.test(trimmed));
                };

                if (courseData.topics) {
                    if (Array.isArray(courseData.topics)) {
                        normalizedTopics = courseData.topics.filter(t => isValidTopic(t));
                    } else if (typeof courseData.topics === 'string' && courseData.topics.trim()) {
                        normalizedTopics = courseData.topics.split(',')
                            .map(t => t.trim())
                            .filter(t => isValidTopic(t));
                    } else {
                        normalizedTopics = [];
                    }
                } else if (courseData.topic && isValidTopic(courseData.topic)) {
                    normalizedTopics = [courseData.topic.trim()];
                } else {
                    normalizedTopics = [];
                }

                courseData.topics = normalizedTopics;
            }

            setCourse(courseData);
            setLoading(false); // Stop loading immediately after getting main data

            // Auto-expand the first section by default
            if (courseData?.sections && courseData.sections.length > 0) {
                const firstSectionId = courseData.sections[0]._id || 0;
                setExpandedSections({ [firstSectionId]: true });
            }

            // Fetch related courses from same category in the background
            if (courseData?.category) {
                courseService.getAllCourses({
                    category: courseData.category,
                    limit: 5,
                    page: 1
                }).then(response => {
                    const related = (response.courses || [])
                        .filter(c => c._id !== id)
                        .slice(0, 4);
                    setRelatedCourses(related);
                }).catch(catErr => {
                    console.error('Error fetching related courses:', catErr);
                });
            }
        } catch (err) {
            console.error('Error fetching course:', err);
            setError(t('course.preview.loadFailed', 'فشل تحميل بيانات الدورة'));
            toast.error(t('course.preview.loadFailed', 'فشل تحميل بيانات الدورة'));
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        try {
            setCheckingEnrollment(true);
            const response = await api.get(`/enrollment/status/${id}`);
            setEnrollmentStatus(response.data);
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 403) {
                setEnrollmentStatus(null);
            } else {
                console.error('Error checking enrollment:', err);
            }
        } finally {
            setCheckingEnrollment(false);
        }
    };

    const handleAddToCart = () => {
        if (!course) return;
        if (isInCart(course._id)) {
            toast.info(t('course.toast.alreadyInCart', 'الدورة موجودة بالفعل في السلة'));
            return;
        }
        addToCart(course);
        toast.success(t('course.toast.addedToCart', 'تمت إضافة الدورة إلى السلة'));
    };

    const handleEnrollNow = () => {
        if (!course) return;
        if (course?.isFull) {
            toast.error(t('course.preview.courseFull', 'عذراً، مقاعد هذه الدورة مكتملة'));
            return;
        }
        if (!isInCart(course._id)) {
            addToCart(course);
        }
        navigate('/checkout');
    };

    const handleContinueCourse = () => {
        navigate(`/course/${id}/study`);
    };

    const handleShare = () => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t('autoGenerated.course_link_copied_to_clipboar', `Course link copied to clipboard!`));
        } else {
            toast.info(window.location.href);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return isRTL ? 'ساعتان' : '2 hours';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return isRTL ? `${hours} ساعة و ${mins} دقيقة` : `${hours}h ${mins}m`;
        }
        if (hours > 0) {
            return isRTL ? `${hours} ساعة` : `${hours} hours`;
        }
        return isRTL ? `${mins} دقيقة` : `${mins} mins`;
    };

    const formatPrice = (price) => {
        return t('course.card.price.sar', { amount: Number(price).toLocaleString() });
    };

    const getCourseTypeConfig = (type) => {
        const canonical = normalizeCourseType(type);
        if (canonical === 'live') {
            return {
                label: t('course.card.courseType.live', 'مباشر تفاعلي'),
                icon: Tv,
                badgeClasses: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
                dotClass: 'bg-rose-400 animate-pulse'
            };
        }
        if (canonical === 'onsite') {
            return {
                label: t('course.card.courseType.onsite', 'تدريب حضوري'),
                icon: Building,
                badgeClasses: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
                dotClass: 'bg-emerald-400'
            };
        }
        return {
            label: t('course.card.courseType.recorded', 'مسجل ذاتي'),
            icon: Play,
            badgeClasses: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
            dotClass: 'bg-sky-400'
        };
    };

    const getLevelLabel = (level) => {
        const map = {
            beginner: t('course.card.level.beginner', 'مبتدئ'),
            intermediate: t('course.card.level.intermediate', 'متوسط'),
            advanced: t('course.card.level.advanced', 'متقدم'),
            'all levels': t('course.card.level.allLevels', 'جميع المستويات'),
        };
        return map[level?.toLowerCase?.()] || level || t('course.preview.levelDefault', 'مبتدئ');
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const openPreviewModal = (videoUrl) => {
        if (videoUrl) {
            setSelectedPreviewVideo(videoUrl);
        }
    };

    const closePreviewModal = () => {
        setSelectedPreviewVideo(null);
    };

    if (loading) return <LoadingNew />;

    if (error || !course) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {t('course.preview.courseNotFound', 'الدورة غير موجودة')}
                    </h2>
                    <p className="text-slate-600 mb-6 text-sm">
                        {error || (t('autoGenerated.unable_to_find_this_course', `Unable to find this course`))}
                    </p>
                    <button
                        onClick={() => navigate('/explore')}
                        className="w-full bg-[#004C97] hover:bg-[#071942] text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-blue-900/10"
                    >
                        {t('student.dashboard.quickActions.browseCourses', 'استكشف كافة الدورات')}
                    </button>
                </div>
            </div>
        );
    }

    const isAvailable = course.status === 'approved';
    const totalLectures = course.sections?.reduce((total, section) => total + (section.lectures?.length || 0), 0) || 0;
    const typeConfig = getCourseTypeConfig(course.courseType);

    const coursePrice = Number(course.displayPrice ?? course.price ?? 0);
    const originalPrice = Number(course.originalPrice || 0);
    const hasDiscount = originalPrice > coursePrice && coursePrice > 0;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - coursePrice) / originalPrice) * 100) : 0;

    const instructorName = course.instructor
        ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()
        : (t('autoGenerated.aec_academy', `AEC Academy`));

    const instructorAvatar = course.instructor?.photo || course.instructor?.avatar || course.instructor?.profilePicture;
    const instructorInitials = `${course.instructor?.firstName?.[0] || 'A'}${course.instructor?.lastName?.[0] || 'C'}`;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ========================================================================= */}
            {/* HERO SECTION: Cinematic AEC Deep Navy with Brand Mesh & Metadata         */}
            {/* ========================================================================= */}
            <section className="relative bg-gradient-to-b from-[#071942] via-[#091f52] to-[#0b2460] text-white pt-8 pb-14 lg:pb-20 overflow-hidden border-b border-[#004C97]/30">
                {/* Ambient Decorative Lighting */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#004C97]/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#F7931E]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center flex-wrap gap-2 text-xs sm:text-sm text-blue-200/80">
                        <Link to="/" className="hover:text-white transition flex items-center gap-1.5">
                            <span>{t('course.preview.home', 'الرئيسية')}</span>
                        </Link>
                        <span className="text-blue-400/50">/</span>
                        <Link to="/explore" className="hover:text-white transition">
                            {t('course.preview.courses', 'الدورات')}
                        </Link>
                        {course.category && (
                            <>
                                <span className="text-blue-400/50">/</span>
                                <Link
                                    to={`/category/${course.category?._id || course.category}`}
                                    className="hover:text-white transition font-medium text-blue-100"
                                >
                                    {localizeCategory(course.category)}
                                </Link>
                            </>
                        )}
                        {course.subCategory && (
                            <>
                                <span className="text-blue-400/50">/</span>
                                <span className="text-blue-300">
                                    {localizeSubcategory(course.subCategory, course.category)}
                                </span>
                            </>
                        )}
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Course Info Column (Desktop: 7-8 cols, Mobile: full) */}
                        <div className="lg:col-span-8">
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                                {/* Course Type Badge */}
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${typeConfig.badgeClasses}`}>
                                    <span className={`w-2 h-2 rounded-full ${typeConfig.dotClass}`} />
                                    <span>{typeConfig.label}</span>
                                </div>

                                {/* Level Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/15 backdrop-blur-md">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-300" />
                                    <span>{getLevelLabel(course.courseLevel)}</span>
                                </div>

                                {/* Language Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-white/15 backdrop-blur-md">
                                    <Globe className="w-3.5 h-3.5 text-blue-300" />
                                    <span>{course.language || t('course.preview.languageDefault', 'العربية')}</span>
                                </div>
                            </div>

                            {/* Course Main Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                                {course.title}
                            </h1>

                            {/* Short Description */}
                            {course.description && (
                                <div className="text-blue-100/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 max-w-3xl">
                                    <RichTextDisplay
                                        content={course.description}
                                        showFull={false}
                                        maxLength={160}
                                        className="text-blue-100/90"
                                    />
                                </div>
                            )}

                            {/* High-Impact Stats Bar */}
                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 py-4 px-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-sm mb-6">
                                {/* Ratings */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-black text-white text-base">
                                            {course.averageRating?.toFixed(1) || '4.8'}
                                        </span>
                                    </div>
                                    <span className="text-blue-200 text-xs">
                                        ({course.ratings?.length || 0} {t('course.preview.reviewPlural', 'تقييم')})
                                    </span>
                                </div>

                                <div className="hidden sm:block w-px h-4 bg-white/20" />

                                {/* Students */}
                                <div className="flex items-center gap-2 text-blue-100">
                                    <Users className="w-4 h-4 text-blue-300" />
                                    <span>
                                        {t('course.card.students', { count: course.enrolledStudents?.length || 0 })}
                                    </span>
                                </div>

                                {/* Duration */}
                                {course.duration > 0 && (
                                    <>
                                        <div className="hidden sm:block w-px h-4 bg-white/20" />
                                        <div className="flex items-center gap-2 text-blue-100">
                                            <Clock className="w-4 h-4 text-blue-300" />
                                            <span>{formatDuration(course.duration)}</span>
                                        </div>
                                    </>
                                )}

                                {totalLectures > 0 && (
                                    <>
                                        <div className="hidden sm:block w-px h-4 bg-white/20" />
                                        <div className="flex items-center gap-2 text-blue-100">
                                            <BookOpen className="w-4 h-4 text-blue-300" />
                                            <span>{t('course.preview.lecturesCount', { count: totalLectures })}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Instructor Avatar Chip */}
                            <div className="flex items-center gap-3">
                                {instructorAvatar ? (
                                    <img
                                        src={instructorAvatar}
                                        alt={instructorName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-[#F7931E] shadow-md"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#004C97] to-[#F7931E] flex items-center justify-center font-bold text-white text-base shadow-md border-2 border-white/20">
                                        {instructorInitials}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-blue-200">
                                        {t('course.preview.courseInstructor', 'محاضر الدورة')}
                                    </p>
                                    <p className="font-bold text-white text-base hover:text-blue-200 transition">
                                        {instructorName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Video Preview Card / Quick Peek (lg:hidden) */}
                        <div className="lg:hidden col-span-full">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-video bg-slate-900 group">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#071942] to-[#004C97] flex items-center justify-center">
                                        <GraduationCap className="w-16 h-16 text-white/40" />
                                    </div>
                                )}

                                {/* Trailer play overlay */}
                                {course.trailer && (
                                    <button
                                        onClick={() => openPreviewModal(course.trailer)}
                                        className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 group-hover:scale-105"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#004C97] text-white flex items-center justify-center shadow-xl shadow-blue-900/40 group-hover:bg-[#F7931E] transition">
                                            <Play className="w-7 h-7 fill-white translate-x-0.5" />
                                        </div>
                                        <span className="text-xs font-bold text-white tracking-wide bg-black/60 px-3 py-1 rounded-full">
                                            {t('course.preview.previewVideo', 'معاينة مقدمة الدورة')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* MAIN CONTENT AREA: Left Sections & Right Sticky Enrollment Card           */}
            {/* ========================================================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                    {/* LEFT COLUMN: Course Deep Dive Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* SECTION 1: About This Course (نبذة عن الدورة) */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004C97] flex items-center justify-center">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                        {t('course.preview.aboutThisCourse', 'عن هذه الدورة')}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        {t('autoGenerated.comprehensive_overview_of_the_', `Comprehensive overview of the course`)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-slate-700 leading-relaxed text-base">
                                <div className={expandedDescription ? '' : 'line-clamp-6'}>
                                    <RichTextDisplay
                                        content={course.description}
                                        showFull={expandedDescription}
                                        className="text-slate-700 leading-relaxed"
                                    />
                                </div>
                                {course.description && course.description.length > 300 && (
                                    <button
                                        onClick={() => setExpandedDescription(!expandedDescription)}
                                        className="text-[#004C97] hover:text-[#071942] font-bold mt-4 inline-flex items-center gap-1.5 text-sm transition"
                                    >
                                        {expandedDescription ? (
                                            <>
                                                <span>{t('course.preview.showLess', 'عرض أقل')}</span>
                                                <ChevronUp className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('course.preview.showMore', 'عرض المزيد')}</span>
                                                <ChevronDown className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* SECTION 2: What You'll Learn (ماذا ستتعلم) */}
                        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {t('course.preview.whatYouLearn', 'ماذا ستتعلّم في هذا المساق')}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('autoGenerated.key_skills_and_knowledge_gaine', `Key skills and knowledge gained`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.whatYouWillLearn.map((item, index) => {
                                        const mainText = typeof item === 'string' ? item : (item?.main || '');
                                        const subPoints = typeof item === 'string' ? [] : (item?.subPoints || []);

                                        return (
                                            <div
                                                key={index}
                                                className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 hover:border-blue-200 rounded-2xl p-4 transition duration-200 flex items-start gap-3.5"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-slate-800 font-bold text-sm sm:text-base leading-snug">
                                                        {mainText}
                                                    </p>
                                                    {subPoints && subPoints.length > 0 && (
                                                        <ul className="mt-2 space-y-1.5 ms-2 text-xs text-slate-600">
                                                            {subPoints.map((sub, sIdx) => (
                                                                <li key={sIdx} className="flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                                    <span>{sub}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: Course Topics (محاور الدورة) */}
                        {course.topics && Array.isArray(course.topics) && course.topics.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {t('course.preview.topics', 'محاور ومواضيع الدورة')}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('autoGenerated.key_topics_covered_in_this_cou', `Key topics covered in this course`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {course.topics.map((topic, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 border border-purple-200/80 hover:border-purple-400 transition"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION 4: Course Brochure (بروشور الدورة) */}
                        {course.brochure && (
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#071942] to-[#004C97] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931E]/20 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                            <FileText className="w-7 h-7 text-[#F7931E]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white mb-1">
                                                {t('course.preview.courseBrochure', 'كتيب الدورة التدريبية')}
                                            </h3>
                                            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
                                                {t('course.preview.brochureDescription', 'حمّل كتيب الدورة للاطلاع على تفاصيل المحتوى والهيكل ونتائج التعلّم بصيغة PDF.')}
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={course.brochure}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#F7931E] to-[#f58207] hover:from-[#f58207] hover:to-[#e67500] text-white font-extrabold rounded-2xl shadow-lg shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
                                    >
                                        <FileDown className="w-5 h-5" />
                                        <span>{t('course.preview.downloadBrochure', 'تحميل الكتيب')}</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* SECTION 5: Course Curriculum (محتوى الدورة والمنهج) */}
                        {course.sections && course.sections.length > 0 && totalLectures > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004C97] flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                                {t('course.preview.courseContent', 'محتوى ومنهج الدورة')}
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                {t('course.preview.sectionsCount', { count: course.sections.length })} • {t('course.preview.lecturesCount', { count: totalLectures })}
                                            </p>
                                        </div>
                                    </div>

                                    {course.duration > 0 && (
                                        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
                                            {t('course.preview.totalLength', { duration: formatDuration(course.duration) })}
                                        </div>
                                    )}
                                </div>

                                {/* Accordion List */}
                                <div className="space-y-3">
                                    {course.sections.map((section, sectionIndex) => {
                                        const sId = section._id || sectionIndex;
                                        const isExpanded = !!expandedSections[sId];
                                        const lecturesCount = section.lectures?.length || 0;

                                        return (
                                            <div
                                                key={sId}
                                                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection(sId)}
                                                    className="w-full px-5 py-4 bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between text-start"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                            {sectionIndex + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                                                {section.name || section.title || `${t('course.curriculum.section', 'القسم')} ${sectionIndex + 1}`}
                                                            </h3>
                                                            <p className="text-xs text-slate-500">
                                                                {t('course.preview.lecturesCount', { count: lecturesCount })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-slate-600" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-slate-600" />
                                                        )}
                                                    </div>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-t border-slate-200 bg-white"
                                                        >
                                                            <div className="p-3 space-y-1.5">
                                                                {section.lectures && section.lectures.map((lecture, lIdx) => {
                                                                    const previewUrl = lecture?.video?.url || lecture.videoUrl || '';
                                                                    const isPreview = lecture.preview && !!previewUrl;

                                                                    return (
                                                                        <div
                                                                            key={lecture._id || lIdx}
                                                                            onClick={() => isPreview && openPreviewModal(previewUrl)}
                                                                            className={`px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm transition ${isPreview
                                                                                    ? 'bg-blue-50/50 hover:bg-blue-50 text-blue-900 cursor-pointer border border-blue-100'
                                                                                    : 'hover:bg-slate-50 text-slate-700'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                {isPreview ? (
                                                                                    <div className="w-7 h-7 rounded-full bg-[#004C97] text-white flex items-center justify-center shrink-0">
                                                                                        <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                                                        <Lock className="w-3.5 h-3.5" />
                                                                                    </div>
                                                                                )}

                                                                                <span className="font-medium truncate text-slate-800">
                                                                                    {lecture.name || lecture.title || `${t('course.study.lessons', 'الدرس')} ${lIdx + 1}`}
                                                                                </span>

                                                                                {isPreview && (
                                                                                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                                        {t('course.preview.previewLabel', 'معاينة مجانية')}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {lecture.duration && (
                                                                                <span className="text-xs text-slate-400 font-mono shrink-0">
                                                                                    {formatDuration(lecture.duration)}
                                                                                </span>
                                                                            )}
                                                                        </div>
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
                            </div>
                        )}

                        {/* SECTION 5.5: Additional Files (ملفات وملحقات الدورة) */}
                        {course.additionalFiles && course.additionalFiles.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {t('course.preview.additionalFiles', 'ملحقات وملفات الدورة')}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('autoGenerated.files_and_resources_included', `Files and resources included in this course`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {course.additionalFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-sm">{file.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {t('course.preview.lockedFile', 'هذا الملف متاح للمشتركين فقط')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block text-xs text-slate-400 shrink-0 font-medium bg-slate-100 px-3 py-1 rounded-full">
                                                {file.type ? file.type.toUpperCase() : 'FILE'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION 6: Live / Onsite Meeting & Logistics (إن وجدت) */}
                        {((course.courseType === 'onsite' && course.location) || (course.courseType === 'live' && course.startDate)) && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {course.courseType === 'onsite'
                                                ? t('course.preview.courseLocation', 'مقر وتفاصيل الحضور')
                                                : t('course.preview.liveSession', 'مواعيد الجلسات التفاعلية المباشرة')
                                            }
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('autoGenerated.location_schedule_and_attendan', `Location, schedule, and attendance details`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {course.location && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-[#004C97] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium mb-0.5">{t('course.preview.location', 'المقر')}</p>
                                                <p className="text-sm font-bold text-slate-900">{course.location}</p>
                                                {course.address && <p className="text-xs text-slate-600 mt-1">{course.address}</p>}
                                                {course.governorate && <p className="text-xs text-slate-500">{course.governorate}</p>}
                                                {course.mapsUrl && (
                                                    <a
                                                        href={course.mapsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-[#004C97] font-bold hover:underline mt-2"
                                                    >
                                                        <span>{t('course.preview.viewOnMap', 'عرض على خرائط Google')}</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {course.onlinePlatform && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                                            <Tv className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium mb-0.5">{t('course.preview.platform', 'المنصة')}</p>
                                                <p className="text-sm font-bold text-slate-900 capitalize">{String(course.onlinePlatform).replace('-', ' ')}</p>
                                                <p className="text-xs text-slate-500 mt-1">{t('course.preview.meetingAfterEnroll', 'يتم إرسال رابط الاجتماع فور التسجيل')}</p>
                                            </div>
                                        </div>
                                    )}

                                    {(course.startDate || course.endDate) && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-[#004C97] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium mb-0.5">{t('course.preview.timeline', 'الجدول الزمني')}</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {course.startDate && formatDate(course.startDate, language)}
                                                    {course.startDate && course.endDate && ' — '}
                                                    {course.endDate && formatDate(course.endDate, language)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {Array.isArray(course.scheduleDays) && course.scheduleDays.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-[#004C97] shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium mb-0.5">{t('course.preview.schedule', 'أيام ومواعيد الحصص')}</p>
                                                <p className="text-sm font-bold text-slate-900 capitalize">{course.scheduleDays.join(', ')}</p>
                                                {(course.sessionStartTime || course.sessionEndTime) && (
                                                    <p className="text-xs text-slate-600 mt-1">{course.sessionStartTime} – {course.sessionEndTime}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {course.additionalInstructions && (
                                    <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                                        <p className="font-bold mb-1">{t('course.preview.instructions', 'ملاحظات وتعليمات هامة:')}</p>
                                        <p className="whitespace-pre-wrap text-amber-800 text-xs sm:text-sm leading-relaxed">{course.additionalInstructions}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 7: About Instructor (عن المحاضر) */}
                        {course.instructor && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004C97] flex items-center justify-center">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {t('course.preview.instructor', 'محاضر الدورة')}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('autoGenerated.instructor_credentials_and_exp', `Instructor credentials and experience`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    {instructorAvatar ? (
                                        <img
                                            src={instructorAvatar}
                                            alt={instructorName}
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#071942] to-[#004C97] flex items-center justify-center font-black text-white text-2xl shadow-md border-2 border-slate-100 shrink-0">
                                            {instructorInitials}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">
                                                {instructorName}
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#004C97] border border-blue-200">
                                                {t('autoGenerated.verified_instructor', `Verified Instructor`)}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                            {course.instructor.bio || t('course.preview.instructorBioDefault', 'محاضر ذو خبرة شغوف بالتعليم ومشاركة المعرفة مع الطلاب.')}
                                        </p>

                                        {course.instructor.email && (
                                            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                                <span>✉</span>
                                                <span>{course.instructor.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 8: Reviews & Ratings (التقييمات والآراء) */}
                        {course.ratings && course.ratings.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                        <Star className="w-5 h-5 fill-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {t('course.preview.studentReviews', 'تقييمات وآراء الطلاب')}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {t('course.preview.basedOnReviews', {
                                                count: course.ratings.length,
                                                reviewsWord: course.ratings.length === 1
                                                    ? t('course.preview.reviewSingular', 'تقييم')
                                                    : t('course.preview.reviewPlural', 'تقييمات'),
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
                                    <div className="text-center sm:border-e sm:border-slate-200 sm:pe-8">
                                        <div className="text-5xl font-black text-slate-900 tracking-tight">
                                            {course.averageRating?.toFixed(1) || '4.8'}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-4 h-4 ${s <= (course.averageRating || 4.8) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">{t('course.preview.averageRating', 'متوسط التقييم العام')}</p>
                                    </div>

                                    <div className="flex-1 text-sm text-slate-600">
                                        <p className="leading-relaxed">
                                            {t('autoGenerated.these_reviews_are_gathered_fro', `These reviews are gathered from verified enrolled students to ensure maximum quality and transparency.`)
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Review Cards List */}
                                <div className="space-y-4">
                                    {course.ratings.slice(0, 5).map((review, index) => {
                                        const studentName = review.student?.firstName
                                            ? `${review.student.firstName} ${review.student.lastName || ''}`.trim()
                                            : t('course.preview.anonymousStudent', 'طالب المساق');

                                        return (
                                            <div
                                                key={index}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                                                            {studentName[0] || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{studentName}</p>
                                                            <div className="flex items-center gap-1 text-amber-400">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {review.createdAt && (
                                                        <span className="text-xs text-slate-400">
                                                            {formatDate(review.createdAt, language)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 text-sm leading-relaxed ps-13">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SECTION 9: Copyright Notice (إشعار الملكية الفكرية) */}
                        <div className="rounded-3xl p-6 bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs sm:text-sm">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-[#004C97] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-[#004C97] mb-1">
                                        {t('course.preview.copyrightTitle', 'إشعار حقوق النشر والملكية الفكرية')}
                                    </h4>
                                    <p className="text-blue-800 leading-relaxed">
                                        {isRTL ? t('course.preview.copyrightAr') : t('course.preview.copyrightEn')}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Elevated Floating Purchase Card (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">

                            {/* The Main Checkout / Enrollment Card */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 overflow-hidden">

                                {/* Video Trailer Thumbnail with Play Button */}
                                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#071942] to-[#004C97] flex items-center justify-center">
                                            <GraduationCap className="w-16 h-16 text-white/40" />
                                        </div>
                                    )}

                                    {/* Vignette Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                                    {/* Play Button Trigger */}
                                    {course.trailer ? (
                                        <button
                                            type="button"
                                            onClick={() => openPreviewModal(course.trailer)}
                                            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 transition"
                                        >
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full bg-white text-[#004C97] flex items-center justify-center shadow-2xl hover:scale-110 transition duration-300">
                                                    <Play className="w-7 h-7 fill-[#004C97] translate-x-0.5" />
                                                </div>
                                                <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping -z-10" />
                                            </div>
                                            <span className="text-xs font-bold text-white tracking-wide bg-black/50 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                                                {t('course.preview.previewVideo', 'مشاهدة الفيديو التعريفي')}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="absolute bottom-3 start-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#004C97]/90 text-white backdrop-blur-md border border-white/20">
                                                AEC Academy
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-6">

                                    {/* Price Box */}
                                    <div className="mb-6 pb-6 border-b border-slate-100">
                                        {!user ? (
                                            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                                                <p className="text-xs text-blue-900 font-semibold mb-2">
                                                    {t('course.card.loginToViewPrice', 'سجل الدخول لعرض السعر والاشتراك')}
                                                </p>
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="w-full bg-[#004C97] hover:bg-[#071942] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 shadow-md"
                                                >
                                                    {t('course.preview.signIn', 'تسجيل الدخول')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline justify-between flex-wrap gap-2">
                                                <div>
                                                    <div className="text-xs font-semibold text-slate-400 mb-1">
                                                        {t('course.preview.coursePrice', 'سعر الدورة')}
                                                    </div>
                                                    <div className="flex items-baseline gap-2.5">
                                                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                                                            {coursePrice === 0 ? t('common.free', 'مجاناً') : formatPrice(coursePrice)}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-base text-slate-400 line-through">
                                                                {formatPrice(originalPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasDiscount && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        -{discountPercent}% {t('autoGenerated.off', `OFF`)}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {course.isFull && (
                                            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center">
                                                {t('course.preview.courseFull', 'عذراً، مقاعد هذه الدورة مكتملة حالياً')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons (CTAs) */}
                                    <div className="space-y-3 mb-6">
                                        {enrollmentStatus?.isInstructor ? (
                                            <button
                                                onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 px-6 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                                            >
                                                <span>{t('course.card.actions.manageCourse', 'إدارة وتعديل الدورة')}</span>
                                            </button>
                                        ) : (user?.role === 'admin' || enrollmentStatus?.isAdmin) ? (
                                            <button
                                                onClick={handleContinueCourse}
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-98"
                                            >
                                                <Play className="w-5 h-5 fill-white" />
                                                <span>{t('course.preview.adminViewContent', 'معاينة محتوى ومحاضرات الدورة (إدارة)')}</span>
                                            </button>
                                        ) : enrollmentStatus ? (
                                            <button
                                                onClick={handleContinueCourse}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-98"
                                            >
                                                <Play className="w-5 h-5 fill-white" />
                                                <span>{t('course.card.actions.continueCourse', 'متابعة الدورة الآن')}</span>
                                            </button>
                                        ) : isAvailable ? (
                                            <>
                                                {/* Primary CTA: Enroll Now */}
                                                <button
                                                    onClick={handleEnrollNow}
                                                    disabled={course.isFull}
                                                    className="w-full bg-[#004C97] hover:bg-[#071942] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-98"
                                                >
                                                    <CreditCard className="w-5 h-5" />
                                                    <span>{t('course.preview.enroll', 'سجّل الآن')}</span>
                                                </button>

                                                {/* Secondary CTA: Add to Cart */}
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={isInCart(course._id) || course.isFull}
                                                    className={`w-full py-3.5 px-6 rounded-2xl font-bold transition flex items-center justify-center gap-2 border ${isInCart(course._id)
                                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                                            : 'bg-white hover:bg-slate-50 text-[#004C97] border-blue-200 shadow-sm'
                                                        }`}
                                                >
                                                    {isInCart(course._id) ? (
                                                        <>
                                                            <Check className="w-4 h-4 text-emerald-600" />
                                                            <span>{t('course.preview.inCart', 'في السلة')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="w-4 h-4" />
                                                            <span>{t('course.preview.addToCart', 'أضف إلى السلة')}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-3 text-center text-xs font-bold text-red-600 bg-red-50 rounded-xl">
                                                {t('course.preview.courseNotAvailable', 'الدورة غير متاحة للتسجيل حالياً')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Guarantee Banner */}
                                    <div className="flex items-center gap-2.5 text-xs text-slate-500 justify-center mb-6 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{t('autoGenerated.quality_guarantee_instant_life', `Quality guarantee • Instant lifetime access`)}</span>
                                    </div>

                                    {/* Course Includes List */}
                                    <div className="space-y-3.5 pt-4 border-t border-slate-100 text-sm text-slate-700">
                                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                                            {t('course.preview.courseIncludes', 'مميزات هذا المساق:')}
                                        </h4>

                                        {course.duration > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004C97] flex items-center justify-center shrink-0">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <span>{t('course.preview.onDemandVideo', { duration: formatDuration(course.duration) })}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                <InfinityIcon className="w-4 h-4" />
                                            </div>
                                            <span>{t('course.preview.fullLifetimeAccess', 'وصول غير محدود مدى الحياة')}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                <Award className="w-4 h-4" />
                                            </div>
                                            <span>{t('course.preview.certificateCompletion', 'شهادة إتمام معتمدة بعد النجاح')}</span>
                                        </div>

                                        {totalLectures > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span>{t('course.preview.lecturesCount', { count: totalLectures })}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <span>{t('autoGenerated.access_on_mobile_and_desktop', `Access on mobile and desktop`)}</span>
                                        </div>

                                        {course.brochure && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F7931E] flex items-center justify-center shrink-0">
                                                    <FileDown className="w-4 h-4" />
                                                </div>
                                                <a
                                                    href={course.brochure}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#004C97] font-bold hover:underline"
                                                >
                                                    {t('course.preview.brochureAvailable', 'كتيب الدورة متوفر للتحميل')}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Share Link Button */}
                                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-[#004C97] transition py-2"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span>{t('course.preview.share', 'مشاركة رابط المساق مع الزملاء')}</span>
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* ========================================================================= */}
            {/* RELATED COURSES SECTION: Unified High-End Grid with <CourseCard />        */}
            {/* ========================================================================= */}
            {relatedCourses.length > 0 && (
                <section className="bg-white py-14 lg:py-20 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004C97] mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{t('autoGenerated.recommended', `Recommended`)}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {t('course.preview.relatedCourses', 'دورات ذات صلة قد تهمك')}
                                </h2>
                            </div>

                            <Link
                                to="/explore"
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#004C97] hover:text-[#071942] transition"
                            >
                                <span>{t('autoGenerated.view_all_courses', `View all courses`)}</span>
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedCourses.map((relatedCourse) => (
                                <CourseCard key={relatedCourse._id} course={relatedCourse} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================================= */}
            {/* MOBILE STICKY BOTTOM ACTION BAR (lg:hidden)                               */}
            {/* ========================================================================= */}
            {isAvailable && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 z-40">
                    <div className="flex items-center gap-3">
                        {enrollmentStatus?.isInstructor ? (
                            <button
                                onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                                className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {t('course.card.actions.manageCourse', 'إدارة الدورة')}
                            </button>
                        ) : (user?.role === 'admin' || enrollmentStatus?.isAdmin) ? (
                            <button
                                onClick={handleContinueCourse}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                {t('course.preview.adminViewContent', 'معاينة محتوى ومحاضرات الدورة (إدارة)')}
                            </button>
                        ) : enrollmentStatus ? (
                            <button
                                onClick={handleContinueCourse}
                                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                {t('course.card.actions.continueCourse', 'متابعة الدورة')}
                            </button>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <div className="text-lg font-black text-slate-900 leading-tight">
                                        {coursePrice === 0 ? t('common.free', 'مجاناً') : formatPrice(coursePrice)}
                                    </div>
                                    {hasDiscount && (
                                        <div className="text-xs text-slate-400 line-through">
                                            {formatPrice(originalPrice)}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isInCart(course._id) || course.isFull}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition border ${isInCart(course._id)
                                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                                            : 'bg-slate-50 text-[#004C97] border-blue-200'
                                        }`}
                                >
                                    {isInCart(course._id) ? t('course.preview.inCart', 'في السلة') : t('course.preview.addToCart', 'أضف للسلة')}
                                </button>

                                <button
                                    onClick={handleEnrollNow}
                                    disabled={course.isFull}
                                    className="bg-[#004C97] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                                >
                                    {t('course.preview.enroll', 'سجّل الآن')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FULLSCREEN PREVIEW VIDEO MODAL                                            */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {selectedPreviewVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
                        onClick={closePreviewModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                    <Play className="w-4 h-4 text-[#F7931E] fill-[#F7931E]" />
                                    <h3 className="text-base font-bold text-white">
                                        {t('course.preview.previewVideo', 'معاينة الفيديو')}
                                    </h3>
                                </div>
                                <button
                                    onClick={closePreviewModal}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="aspect-video bg-black">
                                <video
                                    className="w-full h-full"
                                    controls
                                    autoPlay
                                >
                                    <source src={selectedPreviewVideo} type="video/mp4" />
                                    {t('autoGenerated.your_browser_does_not_support_', `Your browser does not support the video tag.`)}
                                </video>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CoursePreview;
