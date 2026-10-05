import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { 
    Mail, 
    MailCheck, 
    MailWarning, 
    Calendar, 
    TrendingUp, 
    Trash2, 
    Eye, 
    Reply, 
    Archive, 
    Clock, 
    User, 
    Phone, 
    Inbox, 
    Search, 
    RefreshCw, 
    X,
    CheckCircle2,
    MessageSquare,
    ExternalLink,
    Filter
} from 'lucide-react';
import { contactService } from '../../services/new-api';
import { formatDateTime } from '../../utils/formatDate';

const ContactMessages = () => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 10
    });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchMessages();
        fetchStats();
    }, [filters]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await contactService.getMessages(filters);
            if (response.success) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(t('admin.contactMessages.loadFailed', 'فشل تحميل رسائل التواصل'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await contactService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleStatusUpdate = async (messageId, newStatus) => {
        try {
            setUpdating(true);
            const response = await contactService.updateMessageStatus(messageId, newStatus);
            if (response.success) {
                toast.success(t('admin.contactMessages.updated', 'تم تحديث حالة الرسالة بنجاح'));
                fetchMessages();
                fetchStats();
                if (selectedMessage && selectedMessage._id === messageId) {
                    setSelectedMessage(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (error) {
            console.error('Error updating message:', error);
            toast.error(t('admin.contactMessages.updateFailed', 'فشل في تحديث حالة الرسالة'));
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (messageId) => {
        if (!window.confirm(t('admin.contactMessages.confirmDelete', 'هل أنت متأكد من حذف هذه الرسالة؟'))) return;
        
        try {
            const response = await contactService.deleteMessage(messageId);
            if (response.success) {
                toast.success(t('admin.contactMessages.deleted', 'تم حذف الرسالة بنجاح'));
                if (selectedMessage?._id === messageId) {
                    setShowModal(false);
                    setSelectedMessage(null);
                }
                fetchMessages();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error(t('admin.contactMessages.deleteFailed', 'فشل حذف الرسالة'));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'unread':
                return {
                    label: t('admin.contactMessages.unreadStatus', 'غير مقروءة'),
                    class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
                    dot: 'bg-rose-500 animate-pulse'
                };
            case 'read':
                return {
                    label: t('admin.contactMessages.read', 'تمت القراءة'),
                    class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
                    dot: 'bg-blue-500'
                };
            case 'replied':
                return {
                    label: t('admin.contactMessages.replied', 'تم الرد'),
                    class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
                    dot: 'bg-emerald-500'
                };
            case 'archived':
                return {
                    label: t('admin.contactMessages.archived', 'مؤرشفة'),
                    class: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
                    dot: 'bg-slate-400'
                };
            default:
                return {
                    label: status || '-',
                    class: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
                    dot: 'bg-slate-400'
                };
        }
    };

    const formatMessageDate = (dateString) => formatDateTime(dateString, language);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('admin.contactMessages.title', 'رسائل التواصل والاستفسارات')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            {t('admin.contactMessages.subtitle', 'متابعة رسائل الزوار والطلاب الواردة عبر نموذج الاتصال والرد عليها')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                    <button
                        onClick={() => { fetchMessages(); fetchStats(); }}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                        title={t('common.refresh', 'تحديث')}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Mail size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.contactMessages.total', 'إجمالي الرسائل')}</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stats.total || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                            <MailWarning size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.contactMessages.unread', 'غير المقروءة')}</p>
                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{stats.unread || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Calendar size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.contactMessages.today', 'رسائل اليوم')}</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.today || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('admin.contactMessages.thisMonth', 'هذا الشهر')}</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{stats.thisMonth || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search 
                        size={18} 
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? 'right-3.5' : 'left-3.5'}`} 
                    />
                    <input
                        type="text"
                        placeholder={t('admin.contactMessages.searchPlaceholder', 'ابحث باسم المرسل، البريد، أو نص الرسالة...')}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all ${
                            isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                    />
                    {filters.search && (
                        <button 
                            onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <Filter size={16} className="text-slate-400 flex-shrink-0" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        >
                            <option value="all">{t('admin.contactMessages.allStatus', 'جميع الحالات')}</option>
                            <option value="unread">{t('admin.contactMessages.unreadStatus', 'غير مقروءة فقط')}</option>
                            <option value="read">{t('admin.contactMessages.read', 'تمت القراءة')}</option>
                            <option value="replied">{t('admin.contactMessages.replied', 'تم الرد')}</option>
                            <option value="archived">{t('admin.contactMessages.archived', 'المؤرشفة')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.contactMessages.tableHeaders.contactInfo', 'بيانات المرسل')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.contactMessages.tableHeaders.message', 'نص الرسالة')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.contactMessages.tableHeaders.status', 'الحالة')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.contactMessages.tableHeaders.date', 'تاريخ الإرسال')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    {t('admin.contactMessages.tableHeaders.actions', 'الإجراءات')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
                                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {t('admin.contactMessages.loading', 'جاري تحميل الرسائل...')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                                                <Inbox size={36} className="opacity-40 text-slate-500" />
                                            </div>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
                                                {t('admin.contactMessages.noMessagesFilter', 'صندوق الرسائل فارغ')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {t('admin.contactMessages.noMessagesMatch', 'لا توجد رسائل مطابقة لخيارات التصفية المحددة')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                messages.map((message) => {
                                    const badge = getStatusBadge(message.status);
                                    return (
                                        <tr 
                                            key={message._id} 
                                            className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group ${
                                                message.status === 'unread' ? 'bg-indigo-50/20 dark:bg-indigo-950/10 font-medium' : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedMessage(message);
                                                setShowModal(true);
                                                if (message.status === 'unread') {
                                                    handleStatusUpdate(message._id, 'read');
                                                }
                                            }}
                                        >
                                            {/* Sender Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${
                                                        message.status === 'unread' 
                                                            ? 'bg-indigo-600 text-white' 
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                        {message.name?.slice(0, 2).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {message.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                            {message.email}
                                                        </div>
                                                        {message.phone && (
                                                            <div className="text-[11px] text-slate-400 mt-0.5" dir="ltr">
                                                                {message.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Message Content */}
                                            <td className="px-6 py-4 max-w-md">
                                                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                                    {message.message}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.class}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                                                    <span>{badge.label}</span>
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-slate-400" />
                                                    <span>{formatMessageDate(message.createdAt)}</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMessage(message);
                                                            setShowModal(true);
                                                            if (message.status === 'unread') {
                                                                handleStatusUpdate(message._id, 'read');
                                                            }
                                                        }}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                                                        title={t('common.view', 'عرض')}
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(message._id)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                        title={t('common.delete', 'حذف')}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Modal */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {t('admin.contactMessages.messageDetails', 'تفاصيل الرسالة')}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {formatMessageDate(selectedMessage.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Sender Info Card */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs">
                                    <User size={15} className="text-indigo-500 flex-shrink-0" />
                                    <span className="text-slate-400 font-medium">{t('admin.detailLabels.name', 'اسم المرسل:')}</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">{selectedMessage.name}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                    <Mail size={15} className="text-blue-500 flex-shrink-0" />
                                    <span className="text-slate-400 font-medium">{t('admin.detailLabels.email', 'البريد الإلكتروني:')}</span>
                                    <a 
                                        href={`mailto:${selectedMessage.email}`}
                                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <span>{selectedMessage.email}</span>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>

                                {selectedMessage.phone && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Phone size={15} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-slate-400 font-medium">{t('admin.contactMessages.phone', 'رقم الهاتف:')}</span>
                                        <span className="font-semibold text-slate-800 dark:text-white" dir="ltr">{selectedMessage.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Message Body */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                    {t('admin.detailLabels.message', 'محتوى الرسالة')}
                                </label>
                                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Current Status Badge */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {t('admin.contactMessages.currentStatus', 'الحالة الحالية:')}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(selectedMessage.status).class}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusBadge(selectedMessage.status).dot}`}></span>
                                    <span>{getStatusBadge(selectedMessage.status).label}</span>
                                </span>
                            </div>

                            {/* Quick Status Update */}
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('admin.contactMessages.updateStatus', 'تغيير حالة الرسالة')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'unread', label: t('admin.contactMessages.unreadStatus', 'غير مقروءة'), icon: MailWarning, color: 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50' },
                                        { id: 'read', label: t('admin.contactMessages.read', 'تمت القراءة'), icon: MailCheck, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50' },
                                        { id: 'replied', label: t('admin.contactMessages.replied', 'تم الرد'), icon: Reply, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50' },
                                        { id: 'archived', label: t('admin.contactMessages.archived', 'أرشفة'), icon: Archive, color: 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800' },
                                    ].map(({ id, label, icon: Icon, color }) => (
                                        <button
                                            key={id}
                                            onClick={() => handleStatusUpdate(selectedMessage._id, id)}
                                            disabled={updating || selectedMessage.status === id}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                                                selectedMessage.status === id 
                                                    ? 'opacity-40 cursor-not-allowed border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400' 
                                                    : color
                                            }`}
                                        >
                                            <Icon size={13} />
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
                            <button
                                onClick={() => handleDelete(selectedMessage._id)}
                                className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 size={15} />
                                <span>{t('common.delete', 'حذف')}</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: Your message to AEC Academy`}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                    <Reply size={15} />
                                    <span>{t('admin.contactMessages.replyEmail', 'الرد عبر البريد')}</span>
                                </a>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {t('common.close', 'إغلاق')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;