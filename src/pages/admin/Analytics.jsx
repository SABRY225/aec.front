import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { 
    Activity, TrendingUp, Users, HardDrive, 
    Layers, BookOpen, AlertCircle, RefreshCw
} from 'lucide-react';

const Analytics = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            // Fetch stats from admin dashboard API, which includes analytics & systemHealth
            const data = await adminService.getDashboardStats({ timeRange: 'all' });
            setAnalyticsData(data?.analytics || null);
            setSystemHealth(data?.systemHealth || null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('حدث خطأ أثناء تحميل بيانات التحليلات');
            toast.error('فشل تحميل بيانات التحليلات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                </div>
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
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
                    onClick={fetchAnalytics}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={18} /> إعادة المحاولة
                </button>
            </div>
        );
    }

    // Helper to find the max count for scaling bars
    const maxUserGrowth = Math.max(...(analyticsData?.userGrowth?.map(d => d.count) || [0, 1]));
    const maxCategory = Math.max(...(analyticsData?.categoryDistribution?.map(d => d.count) || [0, 1]));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">تتبع الزيارات والتحليلات</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">إحصائيات متقدمة لنمو المستخدمين وأداء النظام.</p>
                    </div>
                </div>
                
                <button 
                    onClick={fetchAnalytics}
                    className="p-2 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow transition-all"
                    title="تحديث البيانات"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* System Health */}
            {systemHealth && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">الجلسات النشطة (آخر 24 ساعة)</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{systemHealth.activeUsers || 0}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                            <HardDrive size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">مساحة التخزين المستخدمة (تقريباً)</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{systemHealth.storageUsed || '0 MB'}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart (Tailwind Flex Bars) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            نمو تسجيلات الطلاب (شهرياً)
                        </h2>
                    </div>
                    
                    <div className="h-64 flex items-end justify-between gap-2">
                        {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                            analyticsData.userGrowth.slice(-12).map((item, idx) => {
                                const heightPercent = Math.max((item.count / maxUserGrowth) * 100, 5); // min 5% height
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 group">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {item.count}
                                        </div>
                                        <div 
                                            className="w-full max-w-[40px] bg-blue-500/80 hover:bg-blue-600 dark:bg-blue-600/80 dark:hover:bg-blue-500 rounded-t-md transition-all duration-300 relative overflow-hidden"
                                            style={{ height: `${heightPercent}%` }}
                                        >
                                            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-700/20 to-transparent"></div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-slate-500 mt-3 rotate-45 sm:rotate-0 origin-left truncate w-full text-center">
                                            {item.period}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                لا تتوفر بيانات كافية لعرض النمو
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Layers size={20} className="text-indigo-500" />
                            توزيع الدورات حسب القسم
                        </h2>
                    </div>
                    
                    <div className="space-y-5">
                        {analyticsData?.categoryDistribution && analyticsData.categoryDistribution.length > 0 ? (
                            analyticsData.categoryDistribution.map((cat, idx) => {
                                const widthPercent = Math.max((cat.count / maxCategory) * 100, 2);
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <BookOpen size={14} className="text-slate-400" />
                                                {cat._id || 'غير مصنف'}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{cat.count} دورة</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-indigo-500 h-3 rounded-full transition-all duration-700" 
                                                style={{ width: `${widthPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                لا توجد دورات مضافة للأقسام بعد
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
