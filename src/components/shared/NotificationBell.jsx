import React, { useState, useEffect, useRef } from 'react';
import { 
    Bell, Check, Circle, ExternalLink, Info, AlertTriangle, 
    CheckCircle2, ShieldAlert, Trash2, X, Sparkles, Volume2, VolumeX 
} from 'lucide-react';
import { userService } from '../../services/new-api';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

// Synthesize pleasant gentle notification chime via Web Audio API (zero asset dependency)
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Note progression: E6 to A6
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760.00, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        // AudioContext may be blocked before first user interaction
    }
};

const NotificationBell = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('aec_notif_sound') !== 'false';
    });
    const [alignLeft, setAlignLeft] = useState(Boolean(isRTL));

    const dropdownRef = useRef(null);
    const prevCountRef = useRef(0);

    // Compute optimal placement (opens rightward if near left edge, opens leftward if near right edge)
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const isLeftHalf = (rect.left + rect.width / 2) < (window.innerWidth / 2);
            setAlignLeft(isLeftHalf);
        }
    }, [isOpen, isRTL]);

    const fetchNotifications = async (silent = false) => {
        if (!isAuthenticated) return;
        try {
            if (!silent) setLoading(true);
            const res = await userService.getMyNotifications();
            const list = res.notifications || [];
            const count = res.unreadCount || 0;

            // If new unread notifications arrived while user is browsing, play chime
            if (count > prevCountRef.current && prevCountRef.current > 0 && soundEnabled) {
                playNotificationSound();
            }
            prevCountRef.current = count;

            setNotifications(list);
            setUnreadCount(count);
        } catch (error) {
            console.warn('Error fetching notifications:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 25 seconds for real-time responsiveness
        const interval = setInterval(() => fetchNotifications(true), 25000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        localStorage.setItem('aec_notif_sound', String(next));
        if (next) playNotificationSound();
    };

    const markAsRead = async (id) => {
        try {
            await userService.markNotificationAsRead(id);
            if (id === 'all') {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                prevCountRef.current = 0;
            } else {
                setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                prevCountRef.current = Math.max(0, prevCountRef.current - 1);
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث التنبيه');
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await userService.deleteNotification(id);
            if (id === 'all') {
                setNotifications([]);
                setUnreadCount(0);
                prevCountRef.current = 0;
            } else {
                const target = notifications.find(n => n._id === id);
                if (target && !target.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    prevCountRef.current = Math.max(0, prevCountRef.current - 1);
                }
                setNotifications(notifications.filter(n => n._id !== id));
            }
        } catch (error) {
            toast.error('فشل في حذف التنبيه');
        }
    };

    const handleNotificationClick = (notif) => {
        if (!notif.isRead) {
            markAsRead(notif._id);
        }
        setIsOpen(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />;
            case 'warning':
                return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
            case 'error':
                return <ShieldAlert className="text-rose-500 shrink-0" size={18} />;
            default:
                return <Info className="text-blue-500 shrink-0" size={18} />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        return true;
    });

    const fullHistoryPath = user?.role === 'admin' 
        ? '/admin/notifications' 
        : user?.role === 'instructor' 
            ? '/instructor/notifications' 
            : '/student/notifications';

    if (!isAuthenticated) return null;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications(true);
                }}
                className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
                title="التنبيهات والإشعارات"
                aria-label="Notifications"
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center min-w-[19px] h-[19px] text-[10px] font-extrabold text-white bg-gradient-to-tr from-rose-600 to-red-500 rounded-full border-2 border-white dark:border-slate-900 px-1 shadow-md shadow-rose-500/30 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Drawer */}
            {isOpen && (
                <div 
                    className={`absolute top-full mt-2.5 w-[calc(100vw-2rem)] sm:w-96 max-w-[24rem] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fadeIn ${
                        alignLeft ? 'left-0 right-auto' : 'right-0 left-auto'
                    }`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                التنبيهات
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                    {unreadCount} جديد
                                </span>
                            )}
                        </div>

                        {/* Controls: Sound toggle & Mark all */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={toggleSound}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={soundEnabled ? 'كتم صوت التنبيه' : 'تشغيل صوت التنبيه'}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => markAsRead('all')}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                    title="تعليم كل التنبيهات كمقروءة"
                                >
                                    تعليم الكل كمقروء
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-2 bg-slate-100/60 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-1.5 rounded-xl transition-all ${
                                filter === 'all'
                                    ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-white shadow-xs font-bold'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            جميع الإشعارات ({notifications.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-1.5 rounded-xl transition-all ${
                                filter === 'unread'
                                    ? 'bg-white dark:bg-slate-750 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            غير مقروءة ({unreadCount})
                        </button>
                    </div>

                    {/* Notifications Scroll List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-xs text-slate-400">جاري تحميل التنبيهات...</span>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-300 dark:text-slate-600">
                                    <Bell size={24} />
                                </div>
                                <p className="text-xs font-medium">
                                    {filter === 'unread' ? 'لا توجد تنبيهات جديدة غير مقروءة' : 'لا توجد أي تنبيهات حالياً'}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3.5 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group relative ${
                                        !notif.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className="mt-0.5">
                                        {getIcon(notif.type)}
                                    </div>

                                    {/* Text Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs font-bold truncate ${
                                                !notif.isRead 
                                                    ? 'text-slate-900 dark:text-white' 
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {notif.title}
                                            </p>
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </p>

                                        <div className="flex items-center justify-between mt-2 pt-1">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium" dir="ltr">
                                                {new Date(notif.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>

                                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                                                {notif.link && (
                                                    <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                                                        <span>عرض</span>
                                                        <ExternalLink size={10} />
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => deleteNotification(notif._id, e)}
                                                    className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                    title="حذف التنبيه"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Full Page Link */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link
                            to={fullHistoryPath}
                            onClick={() => setIsOpen(false)}
                            className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors py-1"
                        >
                            عرض سجل الإشعارات بالكامل ←
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
