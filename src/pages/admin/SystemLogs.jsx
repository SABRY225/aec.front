import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Activity, Search, RefreshCw, User, Calendar, ShieldAlert, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SystemLogs = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalLogs: 0 });
    const [filters, setFilters] = useState({ action: '', entityType: '' });

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const res = await adminService.getSystemLogs({ page, limit: 20, ...filters });
            setLogs(res.logs || []);
            setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalLogs: 0 });
        } catch (error) {
            console.error('Error fetching system logs:', error);
            toast.error('حدث خطأ أثناء جلب سجلات النظام');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchLogs(1);
    };

    const getActionIcon = (action) => {
        const act = action.toLowerCase();
        if (act.includes('delete') || act.includes('remove') || act.includes('error')) return <ShieldAlert className="text-red-500" size={20} />;
        if (act.includes('create') || act.includes('add') || act.includes('success')) return <CheckCircle className="text-emerald-500" size={20} />;
        return <Info className="text-blue-500" size={20} />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">سجلات النظام (Logs)</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">مراقبة وتسجيل جميع الحركات والأحداث داخل النظام.</p>
                    </div>
                </div>
                
                <div className="flex gap-4 items-center">
                    <div className="text-center px-4">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">إجمالي السجلات</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{pagination.totalLogs}</p>
                    </div>
                    <button 
                        onClick={() => fetchLogs(pagination.currentPage)}
                        disabled={loading}
                        className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
                        title="تحديث"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            placeholder="ابحث عن حدث (مثال: إنشاء، تحديث...)"
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            name="entityType"
                            value={filters.entityType}
                            onChange={handleFilterChange}
                            placeholder="القسم (مثال: Course, User...)"
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex justify-center items-center gap-2"
                    >
                        بحث وتصفية
                    </button>
                </form>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">الحدث</th>
                                <th className="px-6 py-4">القسم / التفاصيل</th>
                                <th className="px-6 py-4">المستخدم (المسؤول)</th>
                                <th className="px-6 py-4">التاريخ والوقت</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading && logs.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getActionIcon(log.action)}
                                                <span className="font-bold text-slate-800 dark:text-white capitalize">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {log.entityType}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono" dir="ltr">{log.entityId}</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.details || 'لا توجد تفاصيل'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-3">
                                                    {log.user.profileImage ? (
                                                        <img src={log.user.profileImage} alt={log.user.firstName} className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <User size={14} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{log.user.firstName} {log.user.lastName}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{log.user.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">مستخدم غير معروف</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span dir="ltr">{new Date(log.createdAt).toLocaleString(t('autoGenerated.en_us', `en-US`))}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs" dir="ltr">
                                                {log.ipAddress || '127.0.0.1'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">لا توجد سجلات حالياً</p>
                                        <p className="text-sm text-slate-500 mt-1">لم يتم تسجيل أي حركة في النظام أو لا توجد نتائج للبحث.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            صفحة {pagination.currentPage} من {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchLogs(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1 || loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                            </button>
                            <button
                                onClick={() => fetchLogs(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages || loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;
