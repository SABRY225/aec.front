import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
    Users, BookOpen, GraduationCap, DollarSign,
    TrendingUp, Activity, AlertCircle, Clock,
    Video, MapPin, CheckCircle, Radio, BarChart3,
    Calendar, Filter, FileText, ChevronRight
} from 'lucide-react';

const DashboardCard = ({ icon, title, value, subtitle, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                {icon}
            </div>
            {subtitle && (
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const isRTL = i18n.language?.startsWith('ar');
    
    const [timeRange, setTimeRange] = useState('all');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

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
            <div className="p-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">عذراً، حدث خطأ!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const totalRevenue = stats?.revenue?.[0]?.total || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">لوحة القيادة</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">مرحباً بك، {user?.firstName} 👋 - نظرة عامة على أداء المنصة</p>
                </div>
                
                <div className="flex items-center gap-2">
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
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${timeRange === range.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    icon={<DollarSign size={24} />}
                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    title="إجمالي الإيرادات"
                    value={`${stats?.totalRevenue?.toLocaleString()} SAR`}
                    subtitle={stats?.totalRevenue > 0 ? `+${stats?.monthlyGrowth}%` : `${stats?.monthlyGrowth || 0}%`}
                />
                <DashboardCard
                    icon={<Users size={24} />}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    title="الطلاب المسجلين"
                    value={stats?.totalStudents?.toLocaleString() || '0'}
                />
                <DashboardCard
                    icon={<GraduationCap size={24} />}
                    colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    title="إجمالي المحاضرين"
                    value={stats?.totalInstructors?.toLocaleString() || '0'}
                />
                <DashboardCard
                    icon={<CheckCircle size={24} />}
                    colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    title="إجمالي التسجيلات (عمليات الشراء)"
                    value={stats?.totalEnrollments?.toLocaleString() || '0'}
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
                            الإجمالي: {stats?.totalCourses || 0}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><Video size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">مسجلة</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{stats?.recordedCourses || 0}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Radio size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">بث مباشر (Live)</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{stats?.liveCourses || 0}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg"><MapPin size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">حضوري (Onsite)</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">{stats?.onsiteCourses || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                        <AlertCircle size={20} className="text-amber-500" />
                        مهام بانتظار المراجعة
                    </h2>
                    
                    <div className="space-y-4">
                        <Link to="/admin/courses" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><BookOpen size={18} /></div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">دورات قيد المراجعة</span>
                            </div>
                            <span className="font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{stats?.pendingCourses || 0}</span>
                        </Link>
                        
                        <Link to="/admin/instructors" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><GraduationCap size={18} /></div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">طلبات انضمام مدربين</span>
                            </div>
                            <span className="font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{stats?.pendingInstructors || 0}</span>
                        </Link>
                        
                        <Link to="/admin/contact-messages" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><FileText size={18} /></div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">بلاغات ورسائل تواصل</span>
                            </div>
                            <span className="font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{stats?.activeReports || 0}</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Enrollments */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" />
                            أحدث عمليات التسجيل
                        </h2>
                        <Link to="/admin/enrollment-logs" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            عرض الكل <ChevronRight size={16} className={t('autoGenerated.text_pgi14', ``)} />
                        </Link>
                    </div>
                    
                    <div className="space-y-4">
                        {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                            stats.recentEnrollments.map((enrollment, idx) => (
                                <div key={enrollment._id || idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border border-slate-100 dark:border-slate-800">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                                        {enrollment.student?.firstName?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                            {enrollment.student?.firstName} {enrollment.student?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            اشترك في: {enrollment.course?.title}
                                        </p>
                                    </div>
                                    <div className="text-left whitespace-nowrap">
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{enrollment.paymentAmount} SAR</p>
                                        <p className="text-xs text-slate-400">{new Date(enrollment.createdAt).toLocaleDateString(t('autoGenerated.en_us', `en-US`))}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                لا توجد تسجيلات حديثة
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Stats Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                        <BarChart3 size={20} className="text-blue-500" />
                        نظرة عامة إضافية
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <Activity size={18} />
                                <span className="text-sm font-medium">الجلسات النشطة (24س)</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.activeSessions || 0}</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                <BookOpen size={18} />
                                <span className="text-sm font-medium">الدورات النشطة حالياً</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.activeCourses || 0}</p>
                        </div>
                        
                        <div className="col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">التسجيلات حسب نوع الدورة</h3>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">مسجلة</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{stats?.recordedEnrollments || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">بث مباشر</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{stats?.liveEnrollments || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">حضوري</p>
                                    <p className="font-bold text-slate-800 dark:text-white">{stats?.onsiteEnrollments || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
