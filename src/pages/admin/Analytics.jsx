import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
    Activity, TrendingUp, Users, HardDrive, 
    Layers, BookOpen, AlertCircle, RefreshCw, BarChart
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
            setError(null);
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

    // ----------------------------------------------------------------------
    // RENDERING
    // ----------------------------------------------------------------------

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 animate-pulse bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0"></div>
                    <div className="space-y-3 w-full">
                        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-36 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-5 animate-pulse">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0"></div>
                            <div className="space-y-3 w-full">
                                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">عذراً، حدث خطأ!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg font-bold flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <RefreshCw size={20} />
                    <span>إعادة المحاولة</span>
                </button>
            </div>
        );
    }

    const maxUserGrowth = Math.max(...(analyticsData?.userGrowth?.map(d => d.count) || [0, 1]));
    const maxCategory = Math.max(...(analyticsData?.categoryDistribution?.map(d => d.count) || [0, 1]));

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto"
        >
            {/* ---------------- HEADER ---------------- */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner shrink-0">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">التحليلات والإحصائيات</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">نظرة عامة على أداء المنصة ونمو المستخدمين.</p>
                    </div>
                </div>
                
                <button 
                    onClick={fetchAnalytics}
                    className="p-3.5 text-slate-500 hover:text-white bg-slate-50 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group shrink-0"
                    title="تحديث البيانات"
                >
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                </button>
            </motion.div>

            {/* ---------------- SYSTEM HEALTH CARDS ---------------- */}
            {systemHealth && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Active Users */}
                    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-emerald-500/20" />
                        
                        <div className="relative flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                <Users size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">الجلسات النشطة (24 ساعة)</p>
                                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                                    {systemHealth.activeUsers || 0}
                                </h3>
                            </div>
                        </div>
                    </div>
                    
                    {/* Storage */}
                    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-orange-500/20" />
                        
                        <div className="relative flex items-center gap-6">
                            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                <HardDrive size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">مساحة التخزين المستخدمة</p>
                                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white" dir="ltr">
                                    {systemHealth.storageUsed || '0 MB'}
                                </h3>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ---------------- CHARTS SECTION ---------------- */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                
                {/* 1. User Growth Chart */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 pb-5 border-b border-slate-100 dark:border-slate-800 relative z-10">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner border border-blue-100 dark:border-blue-800/30">
                                <TrendingUp size={22} />
                            </div>
                            نمو تسجيلات الطلاب
                        </h2>
                    </div>
                    
                    <div className="h-72 flex items-end justify-between gap-2 sm:gap-4 flex-1 mt-4 relative z-10">
                        
                        {/* Grid Lines Background */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 mt-8 z-0">
                            <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700/50 flex items-end"><span className="text-[10px] text-slate-400 -mt-4 mr-1">{maxUserGrowth}</span></div>
                            <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700/50 flex items-end"><span className="text-[10px] text-slate-400 -mt-4 mr-1">{Math.floor(maxUserGrowth / 2)}</span></div>
                            <div className="w-full h-px border-t border-solid border-slate-200 dark:border-slate-700/50"></div>
                        </div>

                        {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                            analyticsData.userGrowth.slice(-12).map((item, idx) => {
                                const heightPercent = Math.max((item.count / maxUserGrowth) * 100, 3);
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group/bar relative z-10">
                                        
                                        <div className="w-full flex-1 flex items-end justify-center relative mt-8">
                                            {/* Tooltip absolutely positioned at the top of the bar column */}
                                            <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 translate-y-4 group-hover/bar:translate-y-0 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 px-3 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap border border-slate-700 dark:border-slate-600 flex flex-col items-center">
                                                <span className="text-blue-300 mb-0.5 text-[10px] uppercase tracking-wider block">{item.period}</span>
                                                <span className="text-base">{item.count}</span>
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-700 rotate-45 border-b border-r border-slate-700 dark:border-slate-600"></div>
                                            </div>
                                            
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ duration: 1.2, delay: idx * 0.05, type: 'spring', bounce: 0.2 }}
                                                className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-400 rounded-t-xl relative overflow-hidden group-hover/bar:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300"
                                            >
                                                {/* Glass Reflection */}
                                                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-xl"></div>
                                            </motion.div>
                                        </div>
                                        
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-3 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full group-hover/bar:text-slate-800 dark:group-hover/bar:text-blue-400 transition-colors shrink-0">
                                            {item.period.split('-')[1] || item.period}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 relative z-10">
                                <TrendingUp size={48} className="opacity-20" />
                                <span className="font-medium">لا تتوفر بيانات كافية لعرض النمو</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 2. Category Distribution */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col group hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl shadow-inner">
                                <Layers size={22} />
                            </div>
                            توزيع الدورات حسب القسم
                        </h2>
                    </div>
                    
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {analyticsData?.categoryDistribution && analyticsData.categoryDistribution.length > 0 ? (
                            analyticsData.categoryDistribution.map((cat, idx) => {
                                const widthPercent = Math.max((cat.count / maxCategory) * 100, 2);
                                return (
                                    <div key={idx} className="group/row">
                                        <div className="flex justify-between items-end text-sm font-medium mb-3">
                                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-3 font-bold group-hover/row:text-slate-900 dark:group-hover/row:text-white transition-colors">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover/row:text-orange-500 group-hover/row:border-orange-200 dark:group-hover/row:border-orange-500/30 transition-all shadow-sm">
                                                    <BookOpen size={14} />
                                                </div>
                                                {cat._id || 'غير مصنف'}
                                            </span>
                                            <span className="text-orange-600 dark:text-orange-400 font-black text-lg">
                                                {cat.count} <span className="text-xs font-medium text-slate-500 ml-1">دورة</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-3.5 overflow-hidden shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${widthPercent}%` }}
                                                transition={{ duration: 1.2, delay: idx * 0.1, type: 'spring', bounce: 0.1 }}
                                                className="bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-amber-500 h-full rounded-full relative group-hover/row:brightness-110 transition-all overflow-hidden"
                                            >
                                                {/* Animated shine line */}
                                                <div className="absolute inset-0 bg-white/30 w-1/4 skew-x-12 -translate-x-[200%] group-hover/row:animate-[shimmer_1.5s_infinite]"></div>
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 py-10">
                                <Layers size={48} className="opacity-20" />
                                <span className="font-medium">لا توجد دورات مضافة للأقسام بعد</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
            
            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(500%); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background-color: #cbd5e1; 
                    border-radius: 10px; 
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background-color: #334155; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background-color: #94a3b8; 
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background-color: #475569; 
                }
            `}</style>
        </motion.div>
    );
};

export default Analytics;
