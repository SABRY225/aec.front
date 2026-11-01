import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
    Users, BookOpen, GraduationCap, DollarSign,
    TrendingUp, TrendingDown, Activity, AlertCircle, Clock,
    Video, MapPin, CheckCircle, Radio, BarChart3,
    Calendar, Filter, FileText, ChevronRight, HardDrive,
    Layers, RefreshCw
} from 'lucide-react';

const DashboardCard = ({ icon, title, value, subtitle, subtitleColor, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                {icon}
            </div>
            {subtitle && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${subtitleColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {subtitle}
                </span>
            )}
        </div>
        <div className="mt-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const getCategoryLabel = (cat) => {
    const map = {
        'medical-courses': 'دورات طبية',
        'engineering-courses': 'دورات هندسية',
        'computer-science-and-programming-courses': 'علوم الحاسب والبرمجة',
        'creative-arts-and-design-courses': 'الفنون والتصميم',
        'language-courses': 'اللغات',
        'accounting': 'المحاسبة والمالية',
        'law-courses': 'القانون',
        'business-administration': 'إدارة الأعمال',
        'tourism-and-hospitality-courses': 'السياحة والفندقة',
        'marketing-and-e-commerce-courses': 'التسويق الإلكتروني',
        'statistics': 'الإحصاء',
        'human-resources': 'الموارد البشرية',
        'humanities-and-applied-sciences-courses': 'العلوم الإنسانية والتطبيقية',
        'personal-care-and-fitness-courses': 'العناية واللياقة',
        'human-development-courses': 'تطوير الذات والتنمية',
        'aec-services': 'خدمات AEC'
    };
    return map[cat] || cat;
};

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const isRTL = i18n.language?.startsWith('ar');

    const [timeRange, setTimeRange] = useState('all');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats({ timeRange });
            setStats(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(t('admin.dashboard.error.loadFailed', 'حدث خطأ أثناء تحميل البيانات'));
            toast.error(t('admin.dashboard.toast.loadFailed', 'فشل تحميل الإحصائيات'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse lg:col-span-2"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">عذراً، حدث خطأ!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    // Growth calculation
    const growth = stats?.monthlyGrowth;
    const hasGrowth = growth !== undefined && growth !== null;
    const isPositiveGrowth = hasGrowth && growth > 0;
    const isNegativeGrowth = hasGrowth && growth < 0;
    const growthSubtitle = hasGrowth ? `${isPositiveGrowth ? '+' : ''}${growth}%` : null;
    const growthSubtitleColor = isPositiveGrowth
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
        : isNegativeGrowth
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

    // Course Type counts (supports courseTypeStats object or flat fields)
    const recordedCourses = stats?.courseTypeStats?.recorded ?? stats?.recordedCourses ?? 0;
    const liveCourses = stats?.courseTypeStats?.live ?? stats?.courseTypeStats?.online ?? stats?.liveCourses ?? 0;
    const onsiteCourses = stats?.courseTypeStats?.onsite ?? stats?.courseTypeStats?.offline ?? stats?.onsiteCourses ?? 0;

    // Enrollment Type counts (supports enrollmentTypeStats object or flat fields)
    const recordedEnrollments = stats?.enrollmentTypeStats?.recorded ?? stats?.recordedEnrollments ?? 0;
    const liveEnrollments = stats?.enrollmentTypeStats?.live ?? stats?.enrollmentTypeStats?.online ?? stats?.liveEnrollments ?? 0;
    const onsiteEnrollments = stats?.enrollmentTypeStats?.onsite ?? stats?.enrollmentTypeStats?.offline ?? stats?.onsiteEnrollments ?? 0;

    // Revenue by Course Type
    const recordedRevenue = stats?.revenueByCourseType?.recorded ?? 0;
    const liveRevenue = stats?.revenueByCourseType?.live ?? stats?.revenueByCourseType?.online ?? 0;
    const onsiteRevenue = stats?.revenueByCourseType?.onsite ?? stats?.revenueByCourseType?.offline ?? 0;

    // Recent activity list (supports recentActivity or recentEnrollments)
    const recentActivityList = stats?.recentActivity || stats?.recentEnrollments || [];

    // Category distribution
    const categoryDistribution = (stats?.analytics?.categoryDistribution || [])
        .slice()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 6);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">لوحة القيادة</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        مرحباً بك، {user?.firstName || 'المدير'} 👋 - نظرة شاملة على أداء المنصة
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm">
                        {[
                            { id: 'thisWeek', label: 'هذا الأسبوع' },
                            { id: 'thisMonth', label: 'هذا الشهر' },
                            { id: 'thisYear', label: 'هذا العام' },
                            { id: 'all', label: 'الكل' }
                        ].map(range => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                    timeRange === range.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchDashboardData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="تحديث البيانات"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    icon={<DollarSign size={24} />}
                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    title="إجمالي الإيرادات"
                    value={`${Number(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`}
                    subtitle={growthSubtitle}
                    subtitleColor={growthSubtitleColor}
                />
                <DashboardCard
                    icon={<Users size={24} />}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    title="الطلاب المسجلين"
                    value={stats?.totalStudents !== undefined ? stats.totalStudents.toLocaleString() : '0'}
                />
                <DashboardCard
                    icon={<GraduationCap size={24} />}
                    colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    title="إجمالي المحاضرين"
                    value={stats?.totalInstructors !== undefined ? stats.totalInstructors.toLocaleString() : '0'}
                />
                <DashboardCard
                    icon={<CheckCircle size={24} />}
                    colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    title="إجمالي التسجيلات (عمليات الشراء)"
                    value={stats?.totalEnrollments !== undefined ? stats.totalEnrollments.toLocaleString() : '0'}
                />
            </div>

            {/* Courses & Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Courses Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookOpen size={20} className="text-blue-500" />
                            توزيع الدورات التدريبية
                        </h2>
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            الإجمالي: {stats?.totalCourses || 0} دورة
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                <Video size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">مسجلة</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{recordedCourses.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Radio size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">بث مباشر (Live)</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{liveCourses.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">حضوري (Onsite)</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{onsiteCourses.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue & Enrollments breakdown summary */}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Enrollments by course type */}
                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                                <CheckCircle size={14} className="text-orange-500" />
                                التسجيلات حسب نوع الدورة
                            </h3>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">مسجلة</p>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{recordedEnrollments}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">مباشر</p>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{liveEnrollments}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">حضوري</p>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{onsiteEnrollments}</p>
                                </div>
                            </div>
                        </div>

                        {/* Revenue by course type */}
                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                                <DollarSign size={14} className="text-emerald-500" />
                                الإيرادات حسب نوع الدورة
                            </h3>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">مسجلة</p>
                                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                        {Number(recordedRevenue).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">مباشر</p>
                                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                        {Number(liveRevenue).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] text-slate-400 mb-0.5">حضوري</p>
                                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                        {Number(onsiteRevenue).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                            <AlertCircle size={20} className="text-amber-500" />
                            مهام بانتظار المراجعة
                        </h2>

                        <div className="space-y-4">
                            <Link to="/admin/courses" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <BookOpen size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">دورات قيد المراجعة</span>
                                </div>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${stats?.pendingCourses > 0 ? 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                                    {stats?.pendingCourses || 0}
                                </span>
                            </Link>

                            <Link to="/admin/instructors" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <GraduationCap size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">طلبات انضمام مدربين</span>
                                </div>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${stats?.pendingInstructors > 0 ? 'text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                                    {stats?.pendingInstructors || 0}
                                </span>
                            </Link>

                            <Link to="/admin/contact-messages" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">بلاغات ورسائل تواصل</span>
                                </div>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${stats?.activeReports > 0 ? 'text-rose-700 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                                    {stats?.activeReports || 0}
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span>الدورات المعتمدة والنشطة:</span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">{stats?.activeCourses || 0}</strong>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity / Enrollments */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            أحدث عمليات التسجيل (النشاط الأخير)
                        </h2>
                        <Link to="/admin/enrollment-logs" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                            عرض الكل <ChevronRight size={16} className="rtl:rotate-180 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="space-y-3.5">
                        {recentActivityList.length > 0 ? (
                            recentActivityList.map((enrollment, idx) => {
                                const studentName = `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`.trim() || 'طالب';
                                const initial = enrollment.student?.firstName?.[0] || 'U';
                                const dateVal = enrollment.enrolledAt || enrollment.createdAt;
                                const formattedDate = dateVal
                                    ? new Date(dateVal).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : '—';
                                
                                const type = enrollment.courseType;
                                const typeLabel = type === 'live' || type === 'online'
                                    ? 'بث مباشر'
                                    : type === 'onsite' || type === 'offline'
                                    ? 'حضوري'
                                    : 'مسجلة';
                                
                                const typeBadgeColor = type === 'live' || type === 'online'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                    : type === 'onsite' || type === 'offline'
                                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300';

                                return (
                                    <div key={enrollment._id || idx} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border border-slate-100 dark:border-slate-800">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                                            {initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                    {studentName}
                                                </p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadgeColor}`}>
                                                    {typeLabel}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={enrollment.course?.title}>
                                                {enrollment.course?.title || 'دورة غير محددة'}
                                            </p>
                                        </div>
                                        <div className="text-left rtl:text-left whitespace-nowrap">
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                {enrollment.paymentAmount !== undefined ? `${Number(enrollment.paymentAmount).toLocaleString()} SAR` : '0 SAR'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {formattedDate}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                لا توجد تسجيلات حديثة
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Stats Overview & System Health */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                            <BarChart3 size={20} className="text-blue-500" />
                            نظرة عامة على حالة النظام
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <Activity size={18} className="text-emerald-500" />
                                    <span className="text-xs font-medium">الجلسات النشطة (24س)</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {(stats?.activeSessions ?? stats?.systemHealth?.activeUsers ?? 0).toLocaleString()}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <HardDrive size={18} className="text-purple-500" />
                                    <span className="text-xs font-medium">المساحة المستهلكة</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {stats?.systemHealth?.storageUsed || '20.55 MB'}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <BookOpen size={18} className="text-blue-500" />
                                    <span className="text-xs font-medium">الدورات النشطة حالياً</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {(stats?.activeCourses || 0).toLocaleString()}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <Users size={18} className="text-amber-500" />
                                    <span className="text-xs font-medium">المستخدمون النشطون</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {(stats?.systemHealth?.activeUsers || stats?.activeSessions || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Top Categories Distribution */}
                        {categoryDistribution.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Layers size={14} className="text-blue-500" />
                                        أبرز مجالات وتصنيفات الدورات
                                    </span>
                                    <Link to="/admin/courses" className="text-[11px] text-blue-600 hover:underline">
                                        عرض الكل
                                    </Link>
                                </h3>
                                <div className="space-y-2">
                                    {categoryDistribution.map((cat) => {
                                        const total = stats?.totalCourses || 1;
                                        const pct = Math.round(((cat.count || 0) / total) * 100);
                                        return (
                                            <div key={cat._id} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                        {getCategoryLabel(cat._id)}
                                                    </span>
                                                    <span className="text-slate-400 font-mono">
                                                        {cat.count} دورة ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
