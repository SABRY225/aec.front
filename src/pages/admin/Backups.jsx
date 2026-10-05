import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Database, Plus, RefreshCw, Trash2, Download, AlertCircle, FileJson, Clock, Server } from 'lucide-react';

const Backups = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');
    
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const data = await adminService.getBackups();
            setBackups(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching backups:', err);
            setError('حدث خطأ أثناء تحميل قائمة النسخ الاحتياطية');
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        try {
            setActionLoading(true);
            toast.info('جاري إنشاء النسخة الاحتياطية...');
            await adminService.createBackup();
            toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteBackup = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه النسخة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        
        try {
            setActionLoading(true);
            await adminService.deleteBackup(id);
            toast.success('تم حذف النسخة الاحتياطية');
            fetchBackups();
        } catch (error) {
            console.error('Error deleting backup:', error);
            toast.error('حدث خطأ أثناء الحذف');
        } finally {
            setActionLoading(false);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    if (loading && backups.length === 0) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-8"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && backups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">عذراً، حدث خطأ!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <button 
                    onClick={fetchBackups}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={18} /> إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">النسخ الاحتياطية</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">إنشاء وإدارة النسخ الاحتياطية لقاعدة بيانات المنصة.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchBackups}
                        disabled={actionLoading || loading}
                        className="p-3 text-slate-500 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-900/30 rounded-xl transition-colors disabled:opacity-50"
                        title="تحديث القائمة"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleCreateBackup}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md shadow-purple-500/20 disabled:opacity-70 font-medium"
                    >
                        <Plus size={18} />
                        {actionLoading ? 'جاري الإنشاء...' : 'إنشاء نسخة جديدة'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <Server className="text-slate-400" size={24} />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">سجل النسخ الاحتياطية</h2>
                </div>

                <div className="space-y-4">
                    {backups.length > 0 ? (
                        backups.map((backup) => (
                            <div key={backup.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-purple-500">
                                        <FileJson size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate" dir="ltr">{backup.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1 font-medium bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {formatBytes(backup.size)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(backup.createdAt).toLocaleString(t('autoGenerated.en_us', `en-US`))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button 
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium text-sm"
                                        onClick={() => toast.info('جاري تنزيل الملف... (سيتم ربطها بـ API التنزيل)')}
                                    >
                                        <Download size={16} />
                                        تحميل
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBackup(backup.id)}
                                        disabled={actionLoading}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                            <Database size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">لا توجد نسخ احتياطية</h3>
                            <p className="text-sm text-slate-400 max-w-md mx-auto">لم تقم بإنشاء أي نسخة احتياطية لقاعدة البيانات بعد. انقر على "إنشاء نسخة جديدة" للبدء.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Backups;
