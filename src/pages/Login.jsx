import { useMemo, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    MoveLeft, 
    MoveRight,
    Globe, 
    TrendingUp, 
    BookOpen, 
    GraduationCap, 
    Loader2 
} from 'lucide-react';
import i18n from '../i18n';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState('login');
    const [verificationCode, setVerificationCode] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const isRtl = i18n.language === 'ar';

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setVerificationCode(newOtp.join(''));

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const redirectParam = useMemo(() => {
        const redirect = new URLSearchParams(location.search).get('redirect');
        return redirect && redirect.startsWith('/') ? redirect : null;
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const { login, verifyAdminLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                if (result.requires2FA) {
                    toast.success(result.message || 'Verification code sent to your email.');
                    setStep('verify');
                    return;
                }
                toast.success(t('auth.toast.loginSuccess'));
                const destination = redirectParam || result.redirectTo || '/';
                navigate(destination);
            } else {
                if (result.error === 'Invalid credentials') {
                    toast.error(t('auth.toast.loginInvalidCredentials'));
                } else {
                    toast.error(result.error || t('auth.toast.loginFailed'));
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            if (errorMessage === 'Invalid credentials') {
                toast.error(t('auth.toast.loginInvalidCredentials'));
            } else {
                toast.error(errorMessage || t('auth.toast.loginNetworkError'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await verifyAdminLogin(formData.email, verificationCode);
            if (result.success) {
                toast.success(t('auth.toast.loginSuccess'));
                const destination = redirectParam || result.redirectTo || '/';
                navigate(destination);
            } else {
                toast.error(result.error || t('auth.toast.loginFailed', 'Login failed'));
            }
        } catch (error) {
            toast.error(error.message || t('auth.toast.loginNetworkError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] font-arabic overflow-x-hidden relative selection:bg-blue-500 selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-0" />
            
            {/* Decorative Corner Geometric Accent */}
            <div className="absolute bottom-0 end-0 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none z-0 opacity-80">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    <path d="M200,40 C110,40 40,110 40,200 L200,200 Z" fill="#ef4444" opacity="0.85" />
                    <path d="M200,90 C140,90 90,140 90,200 L200,200 Z" fill="#2563eb" />
                </svg>
            </div>

            {/* Left Hero Section (Brand & Highlights) - Visible on lg screens */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-e border-slate-800 shadow-2xl">
                {/* Background Patterns & Glows */}
                <div className="absolute -top-32 -start-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -end-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#60a5fa_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

                {/* Top Brand Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3 hover:bg-white/15 transition-all shadow-lg hover:scale-105 duration-200">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                    </Link>
                    <div className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide flex items-center gap-2 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        {t('auth.login.portalBadge', 'بوابة تسجيل الدخول')}
                    </div>
                </div>

                {/* Middle Content Section */}
                <div className="relative z-10 my-auto py-6 max-w-lg mx-auto w-full">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-200 text-xs font-semibold mb-4">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        <span>{t('auth.login.smartLearning', 'منصة التدريب والتعليم الرائدة')}</span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                        {t('auth.login.academyAec', 'مع أكاديمية AEC')} <br />
                        <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                            {t('auth.login.learnEasier', 'تتعلم بطريقة أسهل وأكثر فعالية')}
                        </span>
                    </h2>
                    
                    <p className="text-slate-300 text-sm xl:text-base mb-8 leading-relaxed">
                        {t('auth.login.platformDesc', 'منصة تدريبية متكاملة لتطوير مهاراتك في كافة المجالات والمسارات المهنية المعتمدة مع نخبة من أفضل المدربين.')}
                    </p>

                    {/* Academy Building Card */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-800/80 mb-7 group">
                        <img 
                            src="/assets/aec-building.jpg" 
                            alt="AEC Campus" 
                            className="w-full h-44 xl:h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                        <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/60">
                                    <img src="/assets/logo.png" alt="AEC" className="h-6 object-contain" />
                                </div>
                                <span className="text-white text-xs font-bold drop-shadow">{t('auth.login.campusMain', 'AEC Campus • المقر الرئيسي')}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/80 text-white text-[11px] font-bold backdrop-blur-xs">
                                {t('auth.login.accreditedBadge', 'معتمد دولياً')}
                            </span>
                        </div>
                    </div>

                    {/* 4 Feature Badges Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="text-start">
                                <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.login.featureFlexibleLearn', 'تعلم مرن')}</h4>
                                <p className="text-[11px] text-slate-300">{t('auth.login.featureFlexibleLearnDesc', 'من أي مكان وفي أي وقت')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="text-start">
                                <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.login.featureTrackLevel', 'تتبع مستواك')}</h4>
                                <p className="text-[11px] text-slate-300">{t('auth.login.featureTrackLevelDesc', 'بتقييم وتدريب متطور')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="text-start">
                                <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.login.featureAccredited', 'مناهج معتمدة')}</h4>
                                <p className="text-[11px] text-slate-300">{t('auth.login.featureAccreditedDesc', 'بأحدث المعايير المهنية')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="text-start">
                                <h4 className="font-bold text-xs xl:text-sm text-white">{t('auth.login.featureExpertTutors', 'مدربون خبراء')}</h4>
                                <p className="text-[11px] text-slate-300">{t('auth.login.featureExpertTutorsDesc', 'دعم ومتابعة مستمرة')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 pt-4 border-t border-white/10 text-start flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>American English Center &copy; {new Date().getFullYear()}</span>
                    <span className="text-blue-300 font-bold tracking-wider">Build Your Future</span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="w-full lg:w-[54%] xl:w-[56%] min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
                {/* Card Container */}
                <div className="w-full max-w-[520px] xl:max-w-[560px] bg-white rounded-3xl p-6 sm:p-10 xl:p-12 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-100 my-auto transition-all">
                    
                    {/* Centered Logo */}
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="hover:scale-105 transition-transform duration-200" title="العودة للرئيسية">
                            <img src="/assets/logo.png" alt="AEC American English Center" className="h-12 sm:h-14 object-contain" />
                        </Link>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                            {step === 'login' ? t('auth.login.welcomeAec', 'مرحباً بك مجدداً') : t('auth.login.twoFactorAdmin', 'التحقق الثنائي')}
                        </h1>
                        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                            {step === 'login' 
                                ? t('auth.login.loginSubtitle', 'أدخل بيانات حسابك للمتابعة والوصول إلى لوحة التحكم') 
                                : t('auth.login.enterOtp', 'يرجى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني.')}
                        </p>
                    </div>

                    {/* Form Component */}
                    {step === 'login' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                    {t('auth.login.email', 'البريد الإلكتروني')}
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full ps-11 pe-4 py-3.5 sm:py-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                        placeholder={t('auth.login.emailPlaceholder', 'you@example.com')}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-slate-700 text-start">
                                    {t('auth.login.password', 'كلمة المرور')}
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full ps-11 pe-12 py-3.5 sm:py-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-2xs"
                                        placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 end-0 pe-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        title={showPassword ? t('auth.login.hidePassword', 'إخفاء كلمة المرور') : t('auth.login.showPassword', 'إظهار كلمة المرور')}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password Row */}
                            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none group">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 transition-all"
                                    />
                                    <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                                        {t('auth.login.rememberMe', 'تذكرني')}
                                    </span>
                                </label>

                                <Link 
                                    to="/forgot-password" 
                                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline"
                                >
                                    {t('auth.login.forgotPassword', 'نسيت كلمة المرور؟')}
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base group mt-3 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{t('auth.login.submitting', 'جاري تسجيل الدخول...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('auth.login.submit', 'تسجيل الدخول')}</span>
                                        {isRtl ? (
                                            <MoveLeft className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" />
                                        ) : (
                                            <MoveRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
                                        )}
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label htmlFor="verificationCode" className="block text-xs sm:text-sm font-bold text-slate-700 text-center">
                                    {t('auth.login.verificationCode', 'أدخل رمز التحقق (OTP)')}
                                </label>
                                <div className="flex justify-center gap-2 sm:gap-3 my-3" dir="ltr">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl sm:text-2xl font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 transition-all outline-none shadow-2xs"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base group cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('auth.login.verifyAndLogin', 'تأكيد ودخول')}</span>
                                        {isRtl ? (
                                            <MoveLeft className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" />
                                        ) : (
                                            <MoveRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
                                        )}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                            >
                                {t('auth.login.backToLogin', 'العودة لتسجيل الدخول')}
                            </button>
                        </form>
                    )}

                    {/* Create Account Link */}
                    <div className="mt-8 text-center text-sm sm:text-base text-slate-600 border-t border-slate-150 pt-6">
                        <span>{t('auth.login.noAccount', 'ليس لديك حساب؟')} </span>
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline ms-1">
                            {t('auth.login.createAccount', 'إنشاء حساب جديد')}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;