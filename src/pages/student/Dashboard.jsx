import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, enrollmentService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock,
    Compass,
    FileText,
    Flame,
    GraduationCap,
    Play,
    RefreshCw,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    Zap,
    XCircle,
    ChevronRight,
    Check,
    CheckCheck,
    Lightbulb,
    Video,
    Calendar,
    MapPin,
    ExternalLink,
    Bell
} from 'lucide-react';

// Format dynamic relative time
const formatActivityTime = (dateString, isRtl) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return isRtl ? 'الآن' : 'Just now';
        if (diffInSeconds < 3600) {
            const mins = Math.floor(diffInSeconds / 60);
            return isRtl ? `منذ ${mins} دقيقة` : `${mins}m ago`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return isRtl ? `منذ ${hours} ساعة` : `${hours}h ago`;
        }
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return isRtl ? `منذ ${days} أيام` : `${days}d ago`;
        }
        return date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
};

// Activity type icons & styles
const getActivityTheme = (type) => {
    switch (type) {
        case 'quiz':
            return {
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
                bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            };
        case 'certificate':
            return {
                icon: <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            };
        case 'enrollment':
            return {
                icon: <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
                bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
            };
        case 'lesson':
            return {
                icon: <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
                bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
            };
        default:
            return {
                icon: <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
                bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
            };
    }
};

// Premium Stat Card with dynamic progress accent
const StatCard = ({ icon, title, value, subtitle, gradient, accentColor, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 transition-all duration-300"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {value}
                        </span>
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`shrink-0 rounded-2xl p-3 sm:p-3.5 shadow-md text-white ${gradient} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>

            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
        </motion.div>
    );
};

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const isRtl = i18n.language === 'ar';

    const [timeRange, setTimeRange] = useState('thisWeek');
    const [stats, setStats] = useState(null);
    const [recentCourses, setRecentCourses] = useState([]);
    const [filterTab, setFilterTab] = useState('all'); // all, in-progress, completed
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData(false, timeRange);
    }, []);

    const fetchDashboardData = async (isManualRefresh = false, selectedRange = timeRange) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const [dashboardData, enrollmentsData] = await Promise.all([
                dashboardService.getStudentDashboard({ timeRange: selectedRange }).catch(err => {
                    console.warn('Dashboard stats fetch error:', err);
                    return null;
                }),
                enrollmentService.getMyCourses().catch(err => {
                    console.warn('Enrollment courses fetch error:', err);
                    return null;
                })
            ]);

            setStats(dashboardData);

            // Normalize courses list from enrollments
            const rawCourses = Array.isArray(enrollmentsData)
                ? enrollmentsData
                : (enrollmentsData?.courses || []);

            const formattedCourses = rawCourses.map(enrollment => {
                const courseObj = enrollment.course || enrollment;
                const instructorObj = enrollment.instructor || courseObj.instructor;
                const instructorName = typeof instructorObj === 'object'
                    ? `${instructorObj?.firstName || ''} ${instructorObj?.lastName || ''}`.trim() || 'Instructor'
                    : (instructorObj || 'Instructor');

                const progressVal = Math.min(100, Math.max(0, Math.round(
                    enrollment.progress?.overallProgress ??
                    (typeof enrollment.progress === 'number' ? enrollment.progress : 0)
                )));

                return {
                    id: enrollment.courseId || courseObj._id || enrollment._id,
                    title: enrollment.title || courseObj.title || 'Untitled Course',
                    instructor: instructorName,
                    instructorPhoto: typeof instructorObj === 'object' ? instructorObj?.photo : null,
                    progress: progressVal,
                    courseType: enrollment.courseType || courseObj.courseType || 'recorded',
                    category: enrollment.category || courseObj.category,
                    lastAccessed: enrollment.lastAccessedAt || enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
                    thumbnail: enrollment.thumbnail || courseObj.thumbnail,
                    status: enrollment.enrollmentStatus || enrollment.status || (progressVal >= 100 ? 'completed' : 'in-progress')
                };
            });

            setRecentCourses(formattedCourses);

            if (isManualRefresh) {
                toast.success(t('autoGenerated.dashboard_refreshed_successful', `Dashboard refreshed successfully`));
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(t('student.dashboard.error.loadFailed', 'تعذّر تحميل بيانات لوحة التحكم'));
            toast.error(t('student.dashboard.toast.loadFailed', 'تعذّر تحميل بيانات لوحة التحكم'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTimeRangeChange = (newRange) => {
        setTimeRange(newRange);
        fetchDashboardData(false, newRange);
    };

    // Filter courses based on active tab
    const filteredCourses = useMemo(() => {
        return recentCourses.filter(course => {
            if (filterTab === 'in-progress') return course.progress < 100 && course.status !== 'completed' && course.status !== 'finished';
            if (filterTab === 'completed') return course.progress >= 100 || course.status === 'completed' || course.status === 'finished';
            return true;
        });
    }, [recentCourses, filterTab]);

    // Most recent active course to highlight in hero
    const activeCourseToResume = useMemo(() => {
        return recentCourses.find(c => c.progress < 100) || recentCourses[0];
    }, [recentCourses]);

    // Dynamic stats calculations
    const totalEnrolled = stats?.enrolledCourses ?? recentCourses.length ?? 0;
    const totalFinished = stats?.finishedCourses ?? recentCourses.filter(c => c.progress >= 100).length ?? 0;
    const totalInProgress = stats?.inProgressCourses ?? recentCourses.filter(c => c.progress < 100).length ?? 0;
    const overallRate = totalEnrolled > 0 ? Math.round((totalFinished / totalEnrolled) * 100) : 0;
    const totalQuizzes = stats?.totalQuizzes ?? 0;
    const totalCertificates = stats?.totalCertificates ?? 0;
    const hoursLearned = stats?.totalWatchMinutes ? (stats.totalWatchMinutes / 60).toFixed(1) : (totalEnrolled > 0 ? (totalEnrolled * 1.5).toFixed(1) : 0);

    // Study streak & active days
    const activeDaysThisWeek = stats?.activeDaysThisWeek ?? (totalEnrolled > 0 ? 1 : 0);
    const weeklyGoalTarget = stats?.weeklyGoalTarget ?? 5;
    const goalPercentage = Math.min(100, Math.round((activeDaysThisWeek / weeklyGoalTarget) * 100));

    // Dynamic activities from backend
    const dynamicActivities = stats?.recentActivities || [];

    // Dynamic upcoming live or onsite sessions
    const upcomingSessions = stats?.upcomingSessions || [];

    // Greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('autoGenerated.good_morning', `Good Morning`);
        if (hour < 18) return t('autoGenerated.good_afternoon', `Good Afternoon`);
        return t('autoGenerated.good_evening', `Good Evening`);
    };

    const studentDisplayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : t('student.dashboard.welcomeDefaultName', 'طالبنا العزيز');

    // Skeleton Screen
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Hero Skeleton */}
                    <div className="h-48 md:h-56 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>

                    {/* Main Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error && !stats && recentCourses.length === 0) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 text-center shadow-lg border border-slate-200 dark:border-slate-800">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-8 ring-rose-50/50 dark:ring-rose-900/20">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {t('common.errors.somethingWentWrong', 'حدث خطأ أثناء تحميل البيانات')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => fetchDashboardData()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {t('common.tryAgain', 'إعادة المحاولة')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

                {/* 1. TOP HERO BANNER */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl shadow-indigo-950/20 border border-slate-800"
                >
                    {/* Glowing Decorative Orbs */}
                    <div className="absolute -top-24 -end-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -start-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative px-6 py-8 sm:px-8 sm:py-10 z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                            {/* Welcome & Info */}
                            <div className="space-y-3 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                                    <span>{t('student.dashboard.label', 'لوحة الطالب التعليمية')}</span>
                                    <span className="w-1 h-1 rounded-full bg-blue-300/60" />
                                    <span>{getGreeting()}</span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                                    {t('student.dashboard.welcomeBack', { name: studentDisplayName })} 👋
                                </h1>

                                <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
                                    {t('student.dashboard.subtitle', 'تابع من حيث توقفت وواصل تقدمك في التعلّم لتحقيق أهدافك الأكاديمية.')}
                                </p>

                                {/* Dynamic Resume Pill */}
                                {activeCourseToResume && (
                                    <div className="pt-2 flex flex-wrap items-center gap-3">
                                        <Link
                                            to={`/student/course/${activeCourseToResume.id}/study`}
                                            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Play className="h-4 w-4 fill-white" />
                                            <span>
                                                {t('autoGenerated.resume', `Resume:`)}{' '}
                                                <strong className="font-bold underline decoration-white/40">
                                                    {activeCourseToResume.title.slice(0, 32)}
                                                    {activeCourseToResume.title.length > 32 ? '...' : ''}
                                                </strong>
                                            </span>
                                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Time Range Filter & Refresh Button */}
                            <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
                                <div className="relative">
                                    <select
                                        id="dashboard-time-range"
                                        value={timeRange}
                                        onChange={(e) => handleTimeRangeChange(e.target.value)}
                                        className="appearance-none rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm outline-none hover:bg-white/15 focus:ring-2 focus:ring-white/30 transition-all pe-8 cursor-pointer"
                                    >
                                        <option value="thisWeek" className="text-slate-900 bg-white">{t('student.dashboard.timeRange.thisWeek', 'هذا الأسبوع')}</option>
                                        <option value="thisMonth" className="text-slate-900 bg-white">{t('student.dashboard.timeRange.thisMonth', 'هذا الشهر')}</option>
                                        <option value="thisYear" className="text-slate-900 bg-white">{t('student.dashboard.timeRange.thisYear', 'هذا العام')}</option>
                                        <option value="all" className="text-slate-900 bg-white">{t('autoGenerated.all_time', `All Time`)}</option>
                                    </select>
                                    <ChevronRight className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 rotate-90" />
                                </div>

                                <button
                                    onClick={() => fetchDashboardData(true, timeRange)}
                                    disabled={refreshing}
                                    title={t('autoGenerated.refresh_dashboard', `Refresh Dashboard`)}
                                    className="p-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* 2. DYNAMIC METRIC STATS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                    <StatCard
                        icon={<BookOpen className="h-6 w-6" />}
                        title={isRtl ? 'الدورات المسجّلة' : t('student.dashboard.stats.enrolledCourses', 'Enrolled Courses')}
                        value={totalEnrolled}
                        subtitle={isRtl ? `${totalInProgress} قيد الدراسة` : `${totalInProgress} in study`}
                        gradient="bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20"
                        accentColor="from-blue-600 to-indigo-600"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<Clock className="h-6 w-6" />}
                        title={isRtl ? 'ساعات التعلّم' : t('autoGenerated.learning_hours', 'Learning Hours')}
                        value={hoursLearned}
                        subtitle={isRtl ? 'إجمالي وقت المشاهدة' : t('autoGenerated.total_watch_time', 'Total watch time')}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                        accentColor="from-amber-500 to-orange-600"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<CheckCircle2 className="h-6 w-6" />}
                        title={isRtl ? 'مكتملة' : t('student.dashboard.stats.finished', 'Completed')}
                        value={totalFinished}
                        subtitle={isRtl ? `${overallRate}% معدل الإنجاز` : `${overallRate}% completion rate`}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                        accentColor="from-emerald-500 to-teal-600"
                        delay={0.3}
                    />
                    <StatCard
                        icon={<Award className="h-6 w-6" />}
                        title={isRtl ? 'الشهادات المعتمدة' : t('autoGenerated.certificates_earned', 'Certificates Earned')}
                        value={totalCertificates}
                        subtitle={isRtl ? `${totalQuizzes} اختبار منجز` : `${totalQuizzes} quizzes completed`}
                        gradient="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/20"
                        accentColor="from-purple-500 to-violet-600"
                        delay={0.4}
                    />
                </div>

                {/* 3. MAIN DASHBOARD CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

                    {/* LEFT COLUMN: ACTIVE COURSES & DYNAMIC PERFORMANCE (66% Width) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* CONTINUE LEARNING SECTION */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                            {t('student.dashboard.continueLearning.title', 'تابع التعلّم')}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {t('autoGenerated.resume_where_you_left_off', `Resume where you left off`)}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs Filter */}
                                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
                                    <button
                                        onClick={() => setFilterTab('all')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'all'
                                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {t('autoGenerated.all', `All`)} ({recentCourses.length})
                                    </button>
                                    <button
                                        onClick={() => setFilterTab('in-progress')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'in-progress'
                                            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {t('autoGenerated.in_progress', `In Progress`)} ({totalInProgress})
                                    </button>
                                    <button
                                        onClick={() => setFilterTab('completed')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'completed'
                                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {t('autoGenerated.completed', `Completed`)} ({totalFinished})
                                    </button>
                                </div>
                            </div>

                            {/* Courses List */}
                            {filteredCourses.length > 0 ? (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {filteredCourses.map((course, idx) => (
                                            <motion.div
                                                key={course.id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/90 transition-all duration-300 shadow-sm hover:shadow"
                                            >
                                                {/* Course Thumbnail */}
                                                <div className="relative w-full sm:w-28 sm:h-20 h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`${course.thumbnail ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white`}>
                                                        <BookOpen className="h-7 w-7 opacity-80" />
                                                    </div>
                                                    {course.progress >= 100 && (
                                                        <span className="absolute top-1.5 start-1.5 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                                                            <Check className="h-3 w-3" />
                                                            {t('autoGenerated.done', `Done`)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 w-full space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {course.title}
                                                        </h3>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                                                            {course.progress}%
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        <span>{t('student.dashboard.continueLearning.byInstructor', { name: course.instructor })}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                        <span className="capitalize">{course.courseType === 'live' ? (t('autoGenerated.live', `Live`)) : (course.courseType === 'onsite' ? (t('autoGenerated.onsite', `Onsite`)) : (t('autoGenerated.recorded', `Recorded`)))}</span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${course.progress}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className={`h-2 rounded-full ${course.progress >= 100
                                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Continue / Review Action */}
                                                <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                                                    <Link
                                                        to={`/student/course/${course.id}/study`}
                                                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${course.progress >= 100
                                                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                                                        }`}
                                                    >
                                                        <span>{course.progress >= 100 ? (t('autoGenerated.review', `Review`)) : t('common.continue', 'متابعة')}</span>
                                                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="text-center py-12 px-4">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-8 ring-blue-50/50 dark:ring-blue-900/10">
                                        <Compass className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                        {t('student.dashboard.continueLearning.emptyTitle', 'لم تسجّل في أي دورة بعد')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                                        {t('student.dashboard.continueLearning.emptySubtitle', 'استكشف الكتالوج وابدأ رحلة التعلّم اليوم واكتسب مهارات متقدمة.')}
                                    </p>
                                    <Link
                                        to="/explore"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span>{t('student.dashboard.quickActions.browseCourses', 'تصفح كل الدورات')}</span>
                                    </Link>
                                </div>
                            )}

                            {recentCourses.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <Link
                                        to="/student/my-courses"
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        <span>{t('common.viewAll', 'عرض جميع مقرراتي المسجلة')}</span>
                                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* UPCOMING SESSIONS (IF LIVE OR ONSITE COURSES EXIST) */}
                        {upcomingSessions.length > 0 && (
                            <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                            {t('autoGenerated.upcoming_classes_sessions', `Upcoming Classes & Sessions`)}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {t('autoGenerated.schedule_for_your_live_and_ons', `Schedule for your live and onsite programs`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {upcomingSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        session.courseType === 'live'
                                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    }`}>
                                                        {session.courseType === 'live' ? (t('autoGenerated.live_online', `Live Online`)) : (t('autoGenerated.onsite', `Onsite`))}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                        {session.courseTitle}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {session.instructorName && (
                                                        <span>{session.instructorName}</span>
                                                    )}
                                                    {session.sessionStartTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            {session.sessionStartTime} {session.sessionEndTime ? `- ${session.sessionEndTime}` : ''}
                                                        </span>
                                                    )}
                                                    {session.location && (
                                                        <span className="flex items-center gap-1 truncate max-w-xs">
                                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                            {session.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {session.meetingLink ? (
                                                <a
                                                    href={session.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 transition-all shrink-0"
                                                >
                                                    <Video className="h-4 w-4" />
                                                    <span>{t('autoGenerated.join_session', `Join Session`)}</span>
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            ) : (
                                                <Link
                                                    to={`/student/course/${session.courseId}/study`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors shrink-0"
                                                >
                                                    <span>{t('autoGenerated.session_details', `Session Details`)}</span>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DYNAMIC ACADEMIC PERFORMANCE */}
                        {stats?.performance && (
                            <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                                {t('autoGenerated.academic_performance', `Academic Performance`)}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {t('autoGenerated.breakdown_of_your_real_test_sc', `Breakdown of your real test scores`)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {totalQuizzes} {t('autoGenerated.quizzes', `Quizzes`)}
                                    </span>
                                </div>

                                {/* Score Distribution Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t('autoGenerated.excellent', `Excellent`)}</p>
                                        <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{stats.performance.excellent || 0}</p>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{t('autoGenerated.very_good', `Very Good`)}</p>
                                        <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">{stats.performance.good || 0}</p>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t('autoGenerated.average', `Average`)}</p>
                                        <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{stats.performance.average || 0}</p>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{t('autoGenerated.needs_review', `Needs Review`)}</p>
                                        <p className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">{stats.performance.poor || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: STUDY MOMENTUM, QUICK ACTIONS & DYNAMIC ACTIVITIES (34% Width) */}
                    <div className="space-y-6">

                        {/* DYNAMIC STUDY MOMENTUM CARD */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white p-6 shadow-md shadow-orange-500/15">
                            <div className="absolute -top-10 -end-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10 flex items-start gap-3.5">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-amber-100 shrink-0">
                                    <Flame className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-base text-white">
                                        {activeDaysThisWeek >= weeklyGoalTarget
                                            ? (t('autoGenerated.goal_achieved', `🎉 Goal Achieved!`))
                                            : (t('autoGenerated.keep_up_the_momentum', `Keep Up The Momentum!`))}
                                    </h3>
                                    <p className="text-xs text-white/90 leading-relaxed">
                                        {activeDaysThisWeek > 0
                                            ? (isRtl
                                                ? `أكملت ${activeDaysThisWeek} من أصل ${weeklyGoalTarget} أيام نشاط تعليمي هذا الأسبوع.`
                                                : `You have completed ${activeDaysThisWeek} of ${weeklyGoalTarget} active study days this week.`)
                                            : (isRtl
                                                ? 'ابدأ دراسة أول درس لك اليوم لتسجيل نشاطك وتحقيق تقدم في مسارك.'
                                                : t('autoGenerated.start_learning_your_first_less', 'Start learning your first lesson today to record your study momentum.'))}
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic progress bar */}
                            <div className="mt-4 pt-3 border-t border-white/20 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCheck className="h-4 w-4" />
                                        {t('autoGenerated.weekly_goal', `Weekly Goal`)}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                        {activeDaysThisWeek} / {weeklyGoalTarget} {t('autoGenerated.active_days', `Active Days`)}
                                    </span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-white h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${goalPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QUICK ACTIONS WIDGET WITH DYNAMIC BADGES */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>{t('student.dashboard.quickActions.title', 'إجراءات سريعة')}</span>
                            </h3>

                            <div className="space-y-2.5">
                                {/* Action 1: Browse Courses */}
                                <Link
                                    to="/explore"
                                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all group"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {t('student.dashboard.quickActions.browseCourses', 'تصفح كل الدورات')}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {t('student.dashboard.quickActions.browseCoursesDesc', 'اكتشف فرص تعلّم جديدة')}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                                </Link>

                                {/* Action 2: My Courses */}
                                <Link
                                    to="/student/my-courses"
                                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition-all group"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {t('student.dashboard.quickActions.myCourses', 'دوراتي التدريبية')}
                                            </p>
                                            {totalEnrolled > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                                    {totalEnrolled} {t('autoGenerated.courses', `courses`)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {t('student.dashboard.quickActions.myCoursesDesc', 'واصل رحلتك التعليمية')}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                                </Link>

                                {/* Action 3: Certificates */}
                                <Link
                                    to="/student/certificate"
                                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/50 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 transition-all group"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                {t('student.dashboard.quickActions.certificates', 'الشهادات والإنجازات')}
                                            </p>
                                            {totalCertificates > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                                    {totalCertificates}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {t('student.dashboard.quickActions.certificatesDesc', 'اطّلع على شهاداتك وحمّلها')}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                                </Link>

                                {/* Action 4: Assignments */}
                                <Link
                                    to="/student/assignments"
                                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 transition-all group"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {t('autoGenerated.assignments_tasks', `Assignments & Tasks`)}
                                            </p>
                                            {totalQuizzes > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                    {totalQuizzes}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {t('autoGenerated.view_your_pending_assignments', `View your pending assignments`)}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                                </Link>
                            </div>
                        </div>

                        {/* 100% REAL DYNAMIC ACTIVITIES TIMELINE */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span>{t('student.dashboard.recentActivity', 'سجل النشاطات الأخيرة')}</span>
                                </h3>
                                {dynamicActivities.length > 0 && (
                                    <span className="text-[11px] text-slate-400 font-semibold">
                                        {dynamicActivities.length} {t('autoGenerated.events', `events`)}
                                    </span>
                                )}
                            </div>

                            {dynamicActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {dynamicActivities.map((act) => {
                                        const theme = getActivityTheme(act.type);
                                        return (
                                            <div key={act.id} className="flex items-start gap-3">
                                                <div className={`p-2 rounded-xl shrink-0 ${theme.bg}`}>
                                                    {theme.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {act.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                        {act.description}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                                        {formatActivityTime(act.time, isRtl)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 px-3">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {t('autoGenerated.no_recent_activities_yet', `No recent activities yet`)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        {t('autoGenerated.completed_quizzes_certificates', `Completed quizzes, certificates, and alerts will appear here.`)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* TIP / ADVICE CARD */}
                        <div className="rounded-2xl p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3 text-xs">
                            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-bold text-blue-900 dark:text-blue-300">
                                    {t('autoGenerated.study_pro_tip', `Study Pro Tip:`)}
                                </span>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {t('autoGenerated.take_concise_notes_while_watch', `Take concise notes while watching lessons to make review much faster before quizzes.`)}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
