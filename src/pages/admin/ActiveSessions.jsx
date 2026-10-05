import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Radio, AlertCircle, RefreshCw, User as UserIcon, Clock, Activity, Search } from 'lucide-react';

const ActiveSessions = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ count: 0, sessions: [] });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await adminService.getActiveSessions({ limit: 100 });
            setData(res);
        } catch (err) {
            console.error('Error fetching active sessions:', err);
            setError('حدث خطأ أثناء تحميل بيانات الجلسات النشطة');
            toast.error('فشل تحميل الجلسات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        // Setup polling every 60 seconds
        const interval = setInterval(fetchSessions, 60000);
        return () => clearInterval(interval);
    }, []);

    const getTimeAgo = (dateString) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        return 'منذ أكثر من يوم';
    };

    const getStatusColor = (dateString) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 15) return 'bg-emerald-500 shadow-emerald-500/50';
        if (minutes < 60) return 'bg-amber-500 shadow-amber-500/50';
        return 'bg-slate-400';
    };

    const filteredSessions = data.sessions.filter(session => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = `${session.firstName || ''} ${session.lastName || ''}`.toLowerCase();
        return name.includes(q) || session.email?.toLowerCase().includes(q) || session.role?.toLowerCase().includes(q);
    });

    if (loading && !data.sessions.length) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-8"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && !data.sessions.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">عذراً، حدث خطأ!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <button 
                    onClick={fetchSessions}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={18} /> إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <Radio size={32} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            الجلسات النشطة
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            مراقبة المستخدمين المتصلين بالمنصة خلال الـ 24 ساعة الماضية. يتم التحديث تلقائياً.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="text-center px-6 py-2 border-r border-slate-200 dark:border-slate-800 last:border-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">الإجمالي</p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.count}</p>
                    </div>
                    <button 
                        onClick={fetchSessions}
                        disabled={loading}
                        className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors disabled:opacity-50"
                        title="تحديث فوري"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم، البريد أو الدور..."
                    className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm text-slate-800 dark:text-white placeholder-slate-400"
                />
            </div>

            {/* Users List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                        <div key={session._id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all flex items-start gap-4">
                            <div className="relative">
                                {session.profileImage ? (
                                    <img src={session.profileImage} alt={session.firstName} className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <UserIcon size={24} />
                                    </div>
                                )}
                                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full shadow-sm ${getStatusColor(session.lastActivity)}`}></span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white truncate">
                                        {session.firstName} {session.lastName}
                                    </h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">
                                        {session.role}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">{session.email}</p>
                                
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    <Clock size={12} />
                                    نشط {getTimeAgo(session.lastActivity)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Activity size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">لا توجد جلسات تطابق بحثك</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveSessions;
