import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  Check,
  CheckCheck,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  Send,
  SlidersHorizontal,
  MailCheck,
  Sparkles,
  Inbox,
  Filter,
  X
} from 'lucide-react';
import { userService } from '../../services/new-api';

const AdminNotifications = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'info' | 'success' | 'warning' | 'error'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications from backend
  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const res = await userService.getMyNotifications();
      setNotifications(res?.notifications || []);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      toast.error('حدث خطأ أثناء تحميل الإشعارات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single or all as read
  const markAsRead = async (id) => {
    try {
      await userService.markNotificationAsRead(id);
      if (id === 'all') {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('تم تحديد جميع الإشعارات كمقروءة');
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('فشل في تحديث حالة الإشعار');
    }
  };

  // Delete single or all notifications
  const deleteNotification = async (id) => {
    if (id === 'all' && !window.confirm('هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟')) {
      return;
    }

    try {
      await userService.deleteNotification(id);
      if (id === 'all') {
        setNotifications([]);
        toast.success('تم مسح جميع الإشعارات بنجاح');
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.info('تم حذف الإشعار');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('فشل في حذف الإشعار');
    }
  };

  // Format date and relative time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `منذ ${diffDays} أيام`;

      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  // Stats calculation
  const totalCount = notifications.length;
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const warningCount = useMemo(() => notifications.filter((n) => n.type === 'warning' || n.type === 'error').length, [notifications]);
  const successCount = useMemo(() => notifications.filter((n) => n.type === 'success').length, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Read / Unread Filter
      if (filter === 'unread' && item.isRead) return false;
      if (filter === 'read' && !item.isRead) return false;

      // Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchMsg = (item.message || '').toLowerCase().includes(q);
        if (!matchTitle && !matchMsg) return false;
      }

      return true;
    });
  }, [notifications, filter, typeFilter, searchQuery]);

  // Visual helper for type styling
  const getTypeConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="text-emerald-500" size={20} />,
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          cardBorder: 'border-l-4 border-l-emerald-500',
          label: 'نجاح'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          cardBorder: 'border-l-4 border-l-amber-500',
          label: 'تنبيه'
        };
      case 'error':
        return {
          icon: <ShieldAlert className="text-rose-500" size={20} />,
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          cardBorder: 'border-l-4 border-l-rose-500',
          label: 'هام'
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-blue-500" size={20} />,
          badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          cardBorder: 'border-l-4 border-l-blue-500',
          label: 'معلومة'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Top Banner / Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/25">
              <Bell size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  مركز إشعارات الإدارة
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">
                    {unreadCount} غير مقروء
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                سجل إشعارات وتنبيهات النظام، التسجيلات الجديدة، طلبات الدورات، والعمليات المالية
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchNotifications(false)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
              <span>تحديث</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead('all')}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs font-bold transition-all"
              >
                <CheckCheck size={15} />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}

            {totalCount > 0 && (
              <button
                onClick={() => deleteNotification('all')}
                className="flex items-center gap-2 px-3.5 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 size={14} />
                <span>مسح السجل</span>
              </button>
            )}

            <Link
              to="/admin/notifications-setting"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <Send size={14} />
              <span>إرسال تعميم / الإعدادات</span>
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي التنبيهات</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">غير المقروءة</span>
            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{unreadCount}</p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">إشعارات النجاح</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{successCount}</p>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">تنبيهات وتحديثات هامة</span>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{warningCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عنوان أو محتوى الإشعار..."
              className="w-full pr-10 pl-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Read / Unread Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              غير المقروءة ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'read'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              المقروءة
            </button>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter size={12} />
            <span>تصنيف النوع:</span>
          </span>

          {[
            { id: 'all', label: 'الجميع' },
            { id: 'info', label: 'معلومات عامة' },
            { id: 'success', label: 'عمليات ناجحة' },
            { id: 'warning', label: 'تنبيهات ومراجعات' },
            { id: 'error', label: 'تنبيهات حرجة' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                typeFilter === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <RefreshCw size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              جاري مزامنة الإشعارات...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center p-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Inbox size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد إشعارات حالياً'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {searchQuery
                ? 'جرب البحث بكلمات مفتاحية أخرى أو إلغاء فلاتر التصفية.'
                : filter === 'unread'
                ? 'رائع! لا توجد إشعارات جديدة غير مقروءة لديك في الوقت الحالي.'
                : 'ستظهر هنا كافة إشعارات النظام، عمليات الشراء، تسجيلات الطلاب وتنبيهات الأكاديمية فور حدوثها.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const conf = getTypeConfig(notif.type);
            return (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-md flex items-start gap-4 group relative ${
                  conf.cardBorder
                } ${
                  !notif.isRead
                    ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Type Icon */}
                <div className="mt-0.5 shrink-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    {conf.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          !notif.isRead
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${conf.badgeBg}`}
                      >
                        {conf.label}
                      </span>

                      {!notif.isRead && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white">
                          جديد
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[11px] font-medium" dir="rtl">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Body Message */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {notif.message}
                  </p>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {notif.link ? (
                        <Link
                          to={notif.link}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                        >
                          <span>الانتقال للتفاصيل والمعاينة</span>
                          <ExternalLink size={12} />
                        </Link>
                      ) : (
                        <div />
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-colors"
                          title="تحديد كمقروء"
                        >
                          <Check size={13} />
                          <span>تحديد كمقروء</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors"
                        title="حذف الإشعار"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
