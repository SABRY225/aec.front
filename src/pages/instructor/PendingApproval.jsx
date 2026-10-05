import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { instructorService, userService } from '../../services/new-api';
import { toast } from 'react-toastify';
import { 
    Clock, 
    ShieldCheck, 
    CheckCircle2, 
    FileText, 
    Mail, 
    Phone, 
    LogOut, 
    RefreshCw, 
    Sparkles,
    Briefcase,
    Award,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';

const PendingApproval = () => {
    const { t } = useTranslation();
    const { user, logout, updateUser, getUserData } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(false);
    const [applicationData, setApplicationData] = useState(user?.instructorApplication || null);

    // If user is already verified, redirect to dashboard
    useEffect(() => {
        if (user?.role === 'instructor' && user?.isVerified) {
            navigate('/instructor/dashboard', { replace: true });
        } else if (user?.role === 'instructor' && !user?.hasInstructorApplication && user?.instructorApplicationStatus !== 'pending') {
            // If they haven't applied yet, take them to the application page
            navigate('/instructor/apply', { replace: true });
        }
    }, [user, navigate]);

    // Fetch latest application data on mount
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await instructorService.getMyApplication();
                if (res?.application) {
                    setApplicationData(res.application);
                }
            } catch (err) {
                console.error('Error fetching application status:', err);
            }
        };
        fetchStatus();
    }, []);

    const handleCheckStatus = async () => {
        setIsChecking(true);
        try {
            const profile = await userService.getProfile();
            if (profile) {
                updateUser(profile);
                if (profile.isVerified) {
                    toast.success('تهانينا! تم اعتماد حسابك كمحاضر بنجاح. جاري نقلك إلى لوحة التحكم...');
                    navigate('/instructor/dashboard', { replace: true });
                    return;
                }
                if (profile.instructorApplication) {
                    setApplicationData(profile.instructorApplication);
                }
            }

            const appRes = await instructorService.getMyApplication();
            if (appRes?.application) {
                setApplicationData(appRes.application);
                if (appRes.application.status === 'approved') {
                    toast.success('تمت الموافقة على طلبك! يرجى إعادة تسجيل الدخول أو الانتقال للوحة التحكم.');
                    navigate('/instructor/dashboard', { replace: true });
                    return;
                } else if (appRes.application.status === 'rejected') {
                    toast.error('نأسف، تم رفض الطلب من قبل الإدارة. يمكنك مراجعة الملاحظات أو تقديم طلب جديد.');
                    return;
                }
            }

            toast.info('طلبك لا يزال قيد التدقيق والمراجعة من قبل الإدارة المختصة.');
        } catch (error) {
            console.error('Error refreshing status:', error);
            toast.error('تعذر تحديث حالة الطلب حالياً. يرجى المحاولة لاحقاً.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            navigate('/login');
        }
    };

    const submittedDate = applicationData?.submittedAt || applicationData?.createdAt;
    const formattedDate = submittedDate 
        ? new Date(submittedDate).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'اليوم';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 font-arabic py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200" dir="rtl">
            <div className="max-w-3xl mx-auto">
                
                {/* Header Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-block bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-10 object-contain mx-auto" />
                    </Link>
                </div>

                {/* Main Review Status Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Top Decorative Banner */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 start-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-center sm:text-start">
                                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <Clock className="w-8 h-8 text-amber-300 animate-pulse" />
                                </div>
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 mb-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>طلب انضمام قيد المراجعة</span>
                                    </span>
                                    <h1 className="text-xl sm:text-2xl font-black text-white">
                                        جاري مراجعة بياناتك من قبل الإدارة
                                    </h1>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckStatus}
                                disabled={isChecking}
                                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs sm:text-sm font-bold text-white border border-white/30 transition-all flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                                <span>{isChecking ? 'جاري التحقق...' : 'تحديث الحالة'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8 space-y-6">
                        
                        {/* Welcome message */}
                        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 text-slate-800 dark:text-slate-200">
                            <h3 className="font-bold text-sm sm:text-base text-blue-950 dark:text-blue-300 mb-1">
                                أهلاً بك، {user?.firstName} {user?.lastName} 👋
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                نشكرك على اهتمامك بالانضمام إلى فريق المدربين في <strong className="text-blue-700 dark:text-blue-400">أكاديمية AEC</strong>. لقد تم استلام ملفك التدريبي ومستنداتك بنجاح، ويقوم فريق الإدارة الأكاديمية حالياً بمراجعة وتدقيق المؤهلات والبيانات لضمان أعلى معايير الجودة التعليمية.
                            </p>
                        </div>

                        {/* Review Timeline */}
                        <div className="space-y-3">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>مراحل مراجعة واعتماد الحساب</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Step 1: Completed */}
                                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-emerald-950 dark:text-emerald-300">1. تقديم الطلب</h5>
                                        <p className="text-[11px] text-emerald-800 dark:text-emerald-400/90 mt-0.5">تم استلام المستندات</p>
                                    </div>
                                </div>

                                {/* Step 2: In Progress */}
                                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/70 flex items-start gap-3 shadow-sm">
                                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-amber-950 dark:text-amber-300">2. تدقيق ومراجعة</h5>
                                        <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5 font-semibold">قيد الإجراء حالياً ⏳</p>
                                    </div>
                                </div>

                                {/* Step 3: Pending */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 opacity-70">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">3. تفعيل الحساب</h5>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">بدء تقديم الدورات</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Summary Box */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <span>ملخص بيانات الطلب</span>
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80">
                                    <span className="text-slate-500 dark:text-slate-400">حالة الطلب:</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                        قيد المراجعة والاعتماد
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80">
                                    <span className="text-slate-500 dark:text-slate-400">تاريخ التقديم:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">{formattedDate}</span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80">
                                    <span className="text-slate-500 dark:text-slate-400">البريد الإلكتروني:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">{user?.email}</span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80">
                                    <span className="text-slate-500 dark:text-slate-400">التخصص التدريبي:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {applicationData?.category || user?.category || 'عام'}
                                    </span>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>تستغرق المراجعة عادةً من 24 إلى 48 ساعة عمل. سيتم إشعارك فور اعتماد الحساب عبر البريد الإلكتروني.</span>
                            </p>
                        </div>

                        {/* Contact Support Hotline */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-center sm:text-start">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-blue-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-xs sm:text-sm text-white">هل لديك استفسار عاجل؟</h5>
                                    <p className="text-[11px] text-slate-300">فريق الدعم الأكاديمي جاهز لمساعدتك عبر الهاتف والواتساب</p>
                                </div>
                            </div>
                            <a
                                href="tel:+966540098736"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/30 whitespace-nowrap"
                                dir="ltr"
                            >
                                +966 54 009 8736
                            </a>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Link 
                                to="/" 
                                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>العودة للصفحة الرئيسية</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PendingApproval;
