import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { 
    Bell, Mail, Smartphone, MessageSquare, Send, Settings, Save, 
    AlertCircle, Users, GraduationCap, UserCheck, Link as LinkIcon, RefreshCw 
} from 'lucide-react';

const AdminNotificationsSettings = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    // Notification toggles
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
    });
    
    // Broadcast Form State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');
    const [targetRole, setTargetRole] = useState('all'); // 'all' | 'student' | 'instructor'
    const [broadcastLink, setBroadcastLink] = useState('');

    // Initialize from user settings
    useEffect(() => {
        if (user?.settings?.notifications) {
            setNotifications({
                emailNotifications: user.settings.notifications.emailNotifications ?? true,
                pushNotifications: user.settings.notifications.pushNotifications ?? true,
                messageNotifications: user.settings.notifications.messageNotifications ?? true,
            });
        }
    }, [user]);

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            await adminService.updateAdminSettings({ notifications });
            toast.success('تم حفظ إعدادات الإشعارات بنجاح');
        } catch (error) {
            console.error('Error updating notifications:', error);
            toast.error('حدث خطأ أثناء حفظ الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            toast.warning('يرجى كتابة عنوان التنبيه ونص الرسالة');
            return;
        }

        try {
            setSendingBroadcast(true);
            const res = await adminService.sendBroadcastNotification({
                targetRole,
                title: broadcastTitle.trim(),
                message: broadcastMessage.trim(),
                type: broadcastType,
                link: broadcastLink.trim() || undefined
            });

            if (res && res.success) {
                toast.success(res.message || 'تم إرسال التنبيه العام بنجاح لجميع المستخدمين المستهدفين! 🚀');
                setBroadcastTitle('');
                setBroadcastMessage('');
                setBroadcastLink('');
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            toast.error(error.response?.data?.message || 'فشل إرسال التنبيه العام');
        } finally {
            setSendingBroadcast(false);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn p-4 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <Bell size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">نظام التنبيهات العام</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تخصيص إعدادات إشعارات النظام وتفعيل رسائل البث العام للطلاب والمحاضرين.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 font-medium"
                >
                    <Save size={18} />
                    {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notification Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings className="text-slate-400" size={24} />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">تفعيل قنوات التنبيه</h2>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-blue-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">إشعارات البريد الإلكتروني</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تلقي تأكيدات الدفع وسجلات المبيعات والتنبيهات عبر الإيميل.</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleToggle('emailNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.emailNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ${notifications.emailNotifications ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </button>
                        </div>

                        {/* Push Notifications */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-500">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">إشعارات جرس النظام الفورية</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تلقي التنبيهات المباشرة مع نغمة صوتية في شريط النظام.</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleToggle('pushNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.pushNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ${notifications.pushNotifications ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </button>
                        </div>

                        {/* Message Notifications */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-orange-500">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">إشعارات رسائل التواصل والاستفسارات</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تنبيهات فورية عند إرسال أي عميل رسالة عبر نموذج اتصل بنا.</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleToggle('messageNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.messageNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ${notifications.messageNotifications ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Broadcast System Alerts */}
                <div className="bg-indigo-600 dark:bg-indigo-950 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden border border-indigo-500/20">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-indigo-200" size={26} />
                            <h2 className="text-xl font-bold">بث إشعار عام (Broadcast)</h2>
                        </div>
                        
                        <p className="text-indigo-100 mb-6 text-xs sm:text-sm leading-relaxed">
                            إرسال إشعار فوري وحقيقي يظهر في جرس التنبيهات الخاص بالمستخدمين المستهدفين (طلاب، محاضرين، أو الجميع).
                        </p>

                        <form onSubmit={handleSendBroadcast} className="space-y-4">
                            {/* Target Audience Selector */}
                            <div>
                                <label className="block text-indigo-100 text-xs mb-1.5 font-bold">الفئة المستهدفة</label>
                                <div className="grid grid-cols-3 gap-2 p-1 bg-indigo-800/60 rounded-xl">
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetRole('all')} 
                                        className={`py-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${targetRole === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}
                                    >
                                        <Users size={14} />
                                        <span>الجميع</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetRole('student')} 
                                        className={`py-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${targetRole === 'student' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}
                                    >
                                        <GraduationCap size={14} />
                                        <span>الطلاب</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetRole('instructor')} 
                                        className={`py-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${targetRole === 'instructor' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}
                                    >
                                        <UserCheck size={14} />
                                        <span>المحاضرين</span>
                                    </button>
                                </div>
                            </div>

                            {/* Notification Type Selector */}
                            <div>
                                <label className="block text-indigo-100 text-xs mb-1.5 font-bold">نوع الإشعار</label>
                                <div className="flex gap-2 p-1 bg-indigo-800/60 rounded-xl">
                                    <button type="button" onClick={() => setBroadcastType('info')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${broadcastType === 'info' ? 'bg-indigo-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>معلومة</button>
                                    <button type="button" onClick={() => setBroadcastType('warning')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${broadcastType === 'warning' ? 'bg-amber-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>تنبيه هام</button>
                                    <button type="button" onClick={() => setBroadcastType('success')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${broadcastType === 'success' ? 'bg-emerald-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>عرض / نجاح</button>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-indigo-100 text-xs mb-1 font-bold">عنوان الإشعار</label>
                                <input
                                    type="text"
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="مثال: خصم خاص 20% على جميع الدورات بمناسبة العيد 🎉"
                                    className="w-full bg-indigo-800/60 border border-indigo-400/30 rounded-xl px-3.5 py-2.5 text-white placeholder-indigo-300/50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                                />
                            </div>

                            {/* Message Body */}
                            <div>
                                <label className="block text-indigo-100 text-xs mb-1 font-bold">نص الإشعار</label>
                                <textarea 
                                    rows={3}
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    placeholder="اكتب تفاصيل التنبيه أو التعليمات هنا..."
                                    className="w-full bg-indigo-800/60 border border-indigo-400/30 rounded-xl p-3 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none text-xs"
                                />
                            </div>

                            {/* Optional Redirect Link */}
                            <div>
                                <label className="block text-indigo-100 text-xs mb-1 font-bold">رابط التوجيه (اختياري)</label>
                                <div className="relative">
                                    <LinkIcon size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                                    <input
                                        type="text"
                                        value={broadcastLink}
                                        onChange={(e) => setBroadcastLink(e.target.value)}
                                        placeholder="مثال: /explore أو /course/64bf..."
                                        className="w-full bg-indigo-800/60 border border-indigo-400/30 rounded-xl pr-9 pl-3.5 py-2.5 text-white placeholder-indigo-300/50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-indigo-50 text-indigo-800 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {sendingBroadcast ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        <span>جاري إرسال البث للجميع...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>إرسال التنبيه الآن</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsSettings;
