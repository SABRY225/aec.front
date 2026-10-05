import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { Bell, Mail, Smartphone, MessageSquare, Send, Settings, Save, AlertCircle } from 'lucide-react';

const AdminNotifications = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        messageNotifications: true,
    });
    
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');

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

    const handleSendBroadcast = (e) => {
        e.preventDefault();
        if (!broadcastMessage.trim()) return;
        
        // Mock function
        toast.success('تم إرسال الإشعار العام لجميع المستخدمين بنجاح!');
        setBroadcastMessage('');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <Bell size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">نظام التنبيهات العام</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تخصيص إعدادات إشعارات النظام وتفعيل رسائل البث العام.</p>
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
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">تفعيل التنبيهات</h2>
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
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تلقي التقارير الهامة والتنبيهات عبر الإيميل.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggle('emailNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.emailNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300`} style={{ transform: notifications.emailNotifications ? (t('autoGenerated.translatex_24px', `translateX(24px)`)) : (t('autoGenerated.translatex_2px', `translateX(2px)`)) }}></span>
                            </button>
                        </div>

                        {/* Push Notifications */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-500">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">إشعارات المتصفح (Push)</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تلقي التنبيهات المباشرة أثناء تصفح لوحة التحكم.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggle('pushNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.pushNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300`} style={{ transform: notifications.pushNotifications ? (t('autoGenerated.translatex_24px', `translateX(24px)`)) : (t('autoGenerated.translatex_2px', `translateX(2px)`)) }}></span>
                            </button>
                        </div>

                        {/* Message Notifications */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-orange-500">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">إشعارات الرسائل النظامية</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تنبيهات البلاغات ورسائل التواصل الجديدة.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggle('messageNotifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notifications.messageNotifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300`} style={{ transform: notifications.messageNotifications ? (t('autoGenerated.translatex_24px', `translateX(24px)`)) : (t('autoGenerated.translatex_2px', `translateX(2px)`)) }}></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Broadcast System Alerts */}
                <div className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertCircle className="text-indigo-200" size={28} />
                            <h2 className="text-xl font-bold">بث إشعار عام (Broadcast)</h2>
                        </div>
                        
                        <p className="text-indigo-100 mb-8 text-sm leading-relaxed">
                            استخدم هذه الأداة لإرسال إشعار فوري وعام يظهر لجميع المتواجدين على المنصة. يمكنك استخدامه للإعلان عن الصيانة، أو العروض الجديدة.
                        </p>

                        <form onSubmit={handleSendBroadcast} className="mt-auto space-y-4">
                            <div>
                                <label className="block text-indigo-100 text-sm mb-2 font-medium">نوع الإشعار</label>
                                <div className="flex gap-2 p-1 bg-indigo-800/50 rounded-lg">
                                    <button type="button" onClick={() => setBroadcastType('info')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${broadcastType === 'info' ? 'bg-indigo-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>معلومة</button>
                                    <button type="button" onClick={() => setBroadcastType('warning')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${broadcastType === 'warning' ? 'bg-amber-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>تنبيه هام</button>
                                    <button type="button" onClick={() => setBroadcastType('success')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${broadcastType === 'success' ? 'bg-emerald-500 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-700/50'}`}>عرض خاص</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-indigo-100 text-sm mb-2 font-medium">نص الإشعار</label>
                                <textarea 
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="w-full bg-indigo-800/50 border border-indigo-500/30 rounded-xl p-4 text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none h-28"
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={!broadcastMessage.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} className={t('autoGenerated.text_p8k38', ``)} />
                                إرسال الإشعار الآن
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
