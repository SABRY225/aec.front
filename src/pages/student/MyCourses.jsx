import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Search,
    Video,
    MapPin,
    Clock,
    QrCode,
    Download,
    Play,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ExternalLink,
    Compass,
    Check,
    AlertCircle,
    Calendar,
    Award,
    Filter,
    Layers
} from 'lucide-react';
import { enrollmentService } from '../../services/new-api';
import { useCategoryLookup } from '../../context/CategoryLookupContext';
import { normalizeCourseType } from '../../constants/courseTypes';

const MyCourses = () => {
    const { t, i18n } = useTranslation();
    const { localizeCategory } = useCategoryLookup();
    const isRtl = i18n.language === 'ar';

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeTab, setTypeTab] = useState('all'); // all | recorded | live | onsite
    const [statusTab, setStatusTab] = useState('all'); // all | in-progress | completed
    const [qrLoading, setQrLoading] = useState({});
    const [pdfLoading, setPdfLoading] = useState({});

    const getCourseTypeInfo = (type) => {
        const canonical = normalizeCourseType(type);
        switch (canonical) {
            case 'live':
                return {
                    label: t('course.card.courseType.live', 'بث مباشر'),
                    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
                    dotClass: 'bg-rose-500'
                };
            case 'onsite':
                return {
                    label: t('course.card.courseType.onsite', 'حضوري'),
                    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
                    dotClass: 'bg-emerald-500'
                };
            default:
                return {
                    label: t('course.card.courseType.recorded', 'مسجّل'),
                    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
                    dotClass: 'bg-blue-500'
                };
        }
    };

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            const response = await enrollmentService.getMyCourses();

            if (Array.isArray(response)) {
                setCourses(response);
            } else if (response && response.courses && Array.isArray(response.courses)) {
                setCourses(response.courses);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error(t('student.myCourses.fetchFailed', 'تعذّر جلب الدورات المسجّلة'));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQR = async (courseId) => {
        try {
            setQrLoading(prev => ({ ...prev, [courseId]: true }));
            const response = await enrollmentService.generateQRCode(courseId);

            const blob = new Blob([response], { type: 'image/png' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `course-${courseId}-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t('student.myCourses.qrSuccess', 'تم تحميل رمز QR بنجاح!'));
        } catch (error) {
            console.error('Error generating QR code:', error);
            toast.error(t('student.myCourses.qrFailed', 'تعذّر إنشاء رمز QR'));
        } finally {
            setQrLoading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const handleDownloadPDF = async (courseId) => {
        try {
            setPdfLoading(prev => ({ ...prev, [courseId]: true }));
            const response = await enrollmentService.downloadEnrollmentPDF(courseId);

            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `course-${courseId}-enrollment.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t('student.myCourses.pdfSuccess', 'تم تحميل ملف PDF بنجاح!'));
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error(t('student.myCourses.pdfFailed', 'تعذّر تحميل ملف PDF'));
        } finally {
            setPdfLoading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    // Filter courses based on type, status, and search query
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            // Course Type Filter
            if (typeTab !== 'all') {
                const canonical = normalizeCourseType(course.courseType);
                if (canonical !== typeTab) return false;
            }

            // Status Filter
            const progress = course.progress ?? 0;
            const isCompleted = progress >= 100 || course.enrollmentStatus === 'completed' || course.enrollmentStatus === 'finished';
            if (statusTab === 'in-progress' && isCompleted) return false;
            if (statusTab === 'completed' && !isCompleted) return false;

            // Search Query Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const title = (course.title || '').toLowerCase();
                const instructorName = `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.toLowerCase();
                const category = (course.category || '').toLowerCase();
                return title.includes(query) || instructorName.includes(query) || category.includes(query);
            }

            return true;
        });
    }, [courses, typeTab, statusTab, searchQuery]);

    // Summary counts
    const inProgressCount = useMemo(() => {
        return courses.filter(c => (c.progress ?? 0) < 100 && c.enrollmentStatus !== 'completed' && c.enrollmentStatus !== 'finished').length;
    }, [courses]);

    const completedCount = useMemo(() => {
        return courses.filter(c => (c.progress ?? 0) >= 100 || c.enrollmentStatus === 'completed' || c.enrollmentStatus === 'finished').length;
    }, [courses]);

    const typeTabs = [
        { id: 'all', label: t('explore.courseTypeFilter.all', 'الكل'), count: courses.length },
        { id: 'recorded', label: t('explore.courseTypeFilter.recorded', 'مسجّلة'), count: courses.filter(c => normalizeCourseType(c.courseType) === 'recorded').length },
        { id: 'live', label: t('explore.courseTypeFilter.online', 'بث مباشر'), count: courses.filter(c => normalizeCourseType(c.courseType) === 'live').length },
        { id: 'onsite', label: t('explore.courseTypeFilter.offline', 'حضوري'), count: courses.filter(c => normalizeCourseType(c.courseType) === 'onsite').length },
    ];

    // Skeleton loader
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Skeleton */}
                    <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

                    {/* Filter Skeleton */}
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>

                    {/* Cards Skeleton Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

                {/* 1. HEADER SECTION & MINI KPI CARDS */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-slate-800">
                    <div className="absolute -top-24 -end-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -start-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                <span>{t('student.myCourses.title', 'دوراتي التدريبية')}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                {t('student.myCourses.title', 'دوراتي التدريبية')}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                {t('autoGenerated.resume_your_learning_journeys_', `Resume your learning journeys, track your lecture progress, and access attendance tickets & QR codes.`)}
                            </p>
                        </div>

                        {/* Top Summary Badges */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                                <span className="block text-2xl font-black text-white">{courses.length}</span>
                                <span className="block text-[11px] font-medium text-slate-300">{t('autoGenerated.total_courses', `Total Courses`)}</span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                                <span className="block text-2xl font-black text-amber-300">{inProgressCount}</span>
                                <span className="block text-[11px] font-medium text-slate-300">{t('autoGenerated.in_progress', `In Progress`)}</span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                                <span className="block text-2xl font-black text-emerald-300">{completedCount}</span>
                                <span className="block text-[11px] font-medium text-slate-300">{t('autoGenerated.completed', `Completed`)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SEARCH & FILTER CONTROLS */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('autoGenerated.search_courses_or_instructor', `Search courses or instructor...`)}
                            className="w-full ps-10 pe-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs: Type & Status */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter (In Progress / Completed) */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                            <button
                                onClick={() => setStatusTab('all')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'all'
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {t('autoGenerated.all_status', `All Status`)}
                            </button>
                            <button
                                onClick={() => setStatusTab('in-progress')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'in-progress'
                                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {t('autoGenerated.in_progress', `In Progress`)}
                            </button>
                            <button
                                onClick={() => setStatusTab('completed')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${statusTab === 'completed'
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {t('autoGenerated.completed', `Completed`)}
                            </button>
                        </div>

                        {/* Course Type Tabs */}
                        <div className="flex items-center gap-1.5">
                            {typeTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setTypeTab(tab.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                        typeTab === tab.id
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                            typeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. COURSES GRID */}
                {filteredCourses.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-8 ring-blue-50/50 dark:ring-blue-900/10">
                            <Compass className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {courses.length === 0
                                ? t('student.myCourses.empty', 'لم تسجّل في أي دورة بعد.')
                                : (t('autoGenerated.no_courses_match_your_filter', `No courses match your filter`))}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                            {courses.length === 0
                                ? (t('autoGenerated.explore_our_course_catalog_and', `Explore our course catalog and start acquiring new professional skills today.`))
                                : (t('autoGenerated.try_adjusting_your_search_term', `Try adjusting your search terms or filters to find what you are looking for.`))}
                        </p>
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-md shadow-blue-500/25 transition-all text-sm font-semibold hover:scale-105"
                        >
                            <Search className="h-4 w-4" />
                            <span>{t('student.myCourses.browse', 'تصفح كل الدورات')}</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course, idx) => {
                                const typeInfo = getCourseTypeInfo(course.courseType);
                                const progress = Math.min(100, Math.max(0, Math.round(course.progress ?? 0)));
                                const isCompleted = progress >= 100 || course.enrollmentStatus === 'completed' || course.enrollmentStatus === 'finished';

                                return (
                                    <motion.div
                                        key={course.courseId || course.enrollmentId || idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                                        className="group flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Thumbnail & Badges Container */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}

                                            {/* Fallback Graphic */}
                                            <div className={`${course.thumbnail ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white`}>
                                                <BookOpen className="h-10 w-10 opacity-70" />
                                            </div>

                                            {/* Top badges */}
                                            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                                                {/* Course Type Badge */}
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border backdrop-blur-md shadow-xs ${typeInfo.badgeClass}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.dotClass}`} />
                                                    {typeInfo.label}
                                                </span>

                                                {/* Category Badge */}
                                                {course.category && (
                                                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-900/70 text-white backdrop-blur-md">
                                                        {localizeCategory(course.category)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Completed Overlay Banner */}
                                            {isCompleted && (
                                                <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>{t('autoGenerated.course_completed', `Course Completed`)}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div className="space-y-3">
                                                {/* Title */}
                                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {course.title}
                                                </h3>

                                                {/* Instructor Row */}
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                                        {course.instructor?.photo ? (
                                                            <img
                                                                src={course.instructor.photo}
                                                                alt={`${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{course.instructor?.firstName?.[0] || 'I'}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                                                        {course.instructor?.firstName} {course.instructor?.lastName}
                                                    </span>
                                                </div>

                                                {/* Onsite Course Details Box */}
                                                {normalizeCourseType(course.courseType) === 'onsite' && (
                                                    <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs space-y-1.5">
                                                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                                                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                            <span className="truncate">{course.location || (t('autoGenerated.onsite_venue', `Onsite Venue`))}</span>
                                                        </div>
                                                        {course.address && (
                                                            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 line-clamp-1 ps-5">
                                                                {course.address}
                                                            </p>
                                                        )}
                                                        {course.serialNumber && (
                                                            <div className="pt-1 flex items-center justify-between border-t border-emerald-200/50 dark:border-emerald-900/40 text-[11px]">
                                                                <span className="text-emerald-700 dark:text-emerald-400">{t('autoGenerated.serial', `Serial:`)}</span>
                                                                <code className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{course.serialNumber}</code>
                                                            </div>
                                                        )}
                                                        {course.checkedIn && (
                                                            <div className="pt-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                <span>{t('student.myCourses.checkedIn', '✓ تم تسجيل الحضور')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Live Online Course Details Box */}
                                                {normalizeCourseType(course.courseType) === 'live' && (
                                                    <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs space-y-2">
                                                        <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                                                            <div className="flex items-center gap-1.5">
                                                                <Video className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                                                <span className="truncate">{course.onlinePlatform || t('student.myCourses.liveOnline', 'دورة مباشرة أونلاين')}</span>
                                                            </div>
                                                            {course.sessionStartTime && (
                                                                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                                                                    {course.sessionStartTime}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {course.meetingLink && (
                                                            <a
                                                                href={course.meetingLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                <span>{t('student.myCourses.joinMeeting', 'الانضمام لرابط البث المباشر')}</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}

                                                        {course.groupLink && (
                                                            <a
                                                                href={course.groupLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                {t('student.myCourses.groupLink', 'رابط مجموعة الدورة')}
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar & Actions */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                {/* Progress Bar */}
                                                <div>
                                                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                                                        <span className="text-slate-500 dark:text-slate-400">{t('student.myCourses.progress', 'التقدم')}</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                                isCompleted
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                                            }`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Onsite Action Buttons (QR / PDF) */}
                                                {normalizeCourseType(course.courseType) === 'onsite' && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleGenerateQR(course.courseId)}
                                                            disabled={qrLoading[course.courseId]}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            <QrCode className="h-3.5 w-3.5" />
                                                            <span>{qrLoading[course.courseId] ? t('common.loading', 'جاري التحميل...') : t('student.myCourses.qrCode', 'رمز QR')}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadPDF(course.courseId)}
                                                            disabled={pdfLoading[course.courseId]}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            <span>{pdfLoading[course.courseId] ? t('common.loading', 'جاري التحميل...') : 'PDF'}</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Primary Study / View Action Button */}
                                                <Link
                                                    to={`/student/course/${course.courseId}/study`}
                                                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                                                        isCompleted
                                                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 active:scale-98'
                                                    }`}
                                                >
                                                    {normalizeCourseType(course.courseType) === 'onsite' ? (
                                                        <>
                                                            <span>{t('student.myCourses.viewEnrollment', 'عرض التذكرة والبيانات')}</span>
                                                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                                        </>
                                                    ) : normalizeCourseType(course.courseType) === 'live' ? (
                                                        <>
                                                            <Video className="h-4 w-4" />
                                                            <span>{t('student.myCourses.viewOnlineCourse', 'تفاصيل البث والمحاضرات')}</span>
                                                        </>
                                                    ) : isCompleted ? (
                                                        <>
                                                            <span>{t('autoGenerated.review_course_content', `Review Course Content`)}</span>
                                                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                                        </>
                                                    ) : progress > 0 ? (
                                                        <>
                                                            <Play className="h-4 w-4 fill-white" />
                                                            <span>{t('student.myCourses.continueLearning', 'متابعة التعلّم')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-4 w-4 fill-white" />
                                                            <span>{t('student.myCourses.startCourse', 'بدء الدورة')}</span>
                                                        </>
                                                    )}
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyCourses;