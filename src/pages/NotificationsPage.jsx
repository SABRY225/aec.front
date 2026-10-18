import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/new-api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  Check,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

const NotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'success' | 'info' | 'warning'
  const [search, setSearch] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await userService.getMyNotifications();
      setNotifications(res.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ أثناء تحميل التنبيهات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await userService.markNotificationAsRead(id);
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('تم تحديد جميع التنبيهات كمقروءة');
      } else {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      toast.error('فشل في تحديث حالة التنبيه');
    }
  };

  const deleteNotification = async (id) => {
    if (id === 'all' && !window.confirm('هل أنت متأكد من رغبتك في حذف جميع التنبيهات؟')) return;
    try {
      await userService.deleteNotification(id);
      if (id === 'all') {
        setNotifications([]);
        toast.success('تم مسح جميع التنبيهات');
      } else {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.info('تم حذف التنبيه');
      }
    } catch (error) {
      toast.error('فشل في حذف التنبيه');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={22} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={22} />;
      case 'error':
        return <ShieldAlert className="text-rose-500" size={22} />;
      default:
        return <Info className="text-blue-500" size={22} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchMsg = (n.message || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }
    return true;
  });

  const unreadTotal = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Bell size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              مركز الإشعارات والتنبيهات
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة كافة تحديثات دوراتك، التسجيلات، المعاملات، وتنبيهات الأكاديمية
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchNotifications()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-500' : ''} />
            <span>تحديث</span>
          </button>

          {unreadTotal > 0 && (
            <button
              onClick={() => markAsRead('all')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Check size={14} />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => deleteNotification('all')}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-medium transition-colors"
            >
              <Trash2 size={14} />
              <span>مسح الكل</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في نص التنبيه أو العنوان..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              غير المقروءة ({unreadTotal})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'read'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              المقروءة
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">جاري تحميل التنبيهات...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Bell size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد تنبيهات</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {filter === 'unread' 
                ? 'لقد اطلعت على كافة التنبيهات ولا توجد إشعارات غير مقروءة حالياً.' 
                : 'ستظهر هنا كافة إشعارات التسجيلات، تحديثات الدورات، والرسائل الإدارية فور وصولها.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition-all hover:shadow-sm flex items-start gap-3.5 group relative ${
                !notif.isRead
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Type Icon */}
              <div className="mt-1">
                {getIcon(notif.type)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className={`text-sm font-bold truncate ${
                    !notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {notif.title}
                  </h4>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    <span className="text-[11px] text-slate-400 font-medium" dir="ltr">
                      {new Date(notif.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>الانتقال للتفاصيل</span>
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                        title="تعليم كمقروء"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors"
                      title="حذف هذا التنبيه"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
