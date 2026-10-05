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
        <div className="min-h-screen w-full flex bg-[#f8fafc] font-arabic overflow-x-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Decorative Accent */}
            <div className="absolute bottom-0 end-0 w-36 sm:w-52 h-36 sm:h-52 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    <path d="M200,50 C120,50 50,120 50,200 L200,200 Z" fill="#ef4444" opacity="0.8" />
                    <path d="M200,100 C150,100 100,150 100,200 L200,200 Z" fill="#2563eb" />
                </svg>
            </div>

            {/* Left Hero Section (Design Banner) - Visible on lg screens */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40 relative flex-col justify-between p-6 xl:p-8 overflow-hidden border-e border-slate-200/70">
                {/* Background dot pattern */}
                <div className="absolute top-0 start-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Brand Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200/80 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-8 object-contain" />
                    </Link>
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                        {t('auth.login.portalBadge', 'بوابة تسجيل الدخول')}
                    </div>
                </div>

                {/* Middle Content Section */}
                <div className="relative z-10 my-auto py-4 max-w-md mx-auto w-full">
                    <h2 className="text-2xl xl:text-3xl font-black text-slate-900 leading-snug mb-2">
                        {t('auth.login.academyAec', 'مع أكاديمية AEC')} <br />
                        <span className="text-blue-600">{t('auth.login.learnEasier', 'تتعلم بطريقة أسهل وأكثر فعالية')}</span>
                    </h2>
                    <p className="text-slate-600 text-xs xl:text-sm mb-5 leading-relaxed">
                        {t('auth.login.platformDesc', 'منصة تدريبية متكاملة لتطوير مهاراتك في كافة المجالات والمسارات المهنية المعتمدة.')}
                    </p>

                    {/* Academy Building Card */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white mb-5">
                        <img 
                            src="/assets/aec-building.jpg" 
                            alt="AEC Campus" 
                            className="w-full h-36 object-cover object-center"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-md border border-white/60">
                            <img src="/assets/logo.png" alt="AEC" className="h-6 object-contain" />
                        </div>
                    </div>

                    {/* 4 Feature Badges Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                                <Globe className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-slate-800 mb-0.5">{t('auth.login.featureFlexibleLearn', 'تعلم مرن')}</h4>
                            <p className="text-[9px] text-slate-500 leading-tight">{t('auth.login.featureFlexibleLearnDesc', 'من أي مكان')}</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-slate-800 mb-0.5">{t('auth.login.featureTrackLevel', 'تتبع مستواك')}</h4>
                            <p className="text-[9px] text-slate-500 leading-tight">{t('auth.login.featureTrackLevelDesc', 'بتقييم متطور')}</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-slate-800 mb-0.5">{t('auth.login.featureAccredited', 'مناهج معتمدة')}</h4>
                            <p className="text-[9px] text-slate-500 leading-tight">{t('auth.login.featureAccreditedDesc', 'بأحدث الأساليب')}</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-xs">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-slate-800 mb-0.5">{t('auth.login.featureExpertTutors', 'مدربون خبراء')}</h4>
                            <p className="text-[9px] text-slate-500 leading-tight">{t('auth.login.featureExpertTutorsDesc', 'دعم مستمر')}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <div className="relative z-10 pt-3 border-t border-slate-200/70 text-start font-sans text-xs text-slate-500 font-medium">
                    Master Skills &bull; <span className="text-blue-600 font-bold">Build Your Future</span>
                </div>
            </div>

            {/* Right Form Container */}
            <div className="w-full lg:w-[55%] xl:w-[58%] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                {/* White Card Container */}
                <div className="w-full max-w-[440px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(15,82,186,0.06)] border border-slate-100 my-auto animate-in fade-in duration-200">
                    
                    {/* Centered Logo */}
                    <div className="flex justify-center mb-3">
                        <Link to="/" className="hover:opacity-80 transition-opacity" title="العودة للرئيسية">
                            <img src="/assets/logo.png" alt="AEC American English Center" className="h-10 sm:h-11 object-contain" />
                        </Link>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="text-center mb-5">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                            {step === 'login' ? t('auth.login.welcomeAec', 'مرحباً بك مجدداً') : t('auth.login.twoFactorAdmin', 'التحقق الثنائي')}
                        </h1>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                            {step === 'login' 
                                ? t('auth.login.loginSubtitle', 'أدخل بيانات حسابك للمتابعة إلى لوحة التحكم') 
                                : t('auth.login.enterOtp', 'يرجى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني.')}
                        </p>
                    </div>

                    {/* Form Component */}
                    {step === 'login' ? (
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Email Field */}
                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 text-start">
                                    {t('auth.login.email')}
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full ps-9 pe-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                        placeholder={t('auth.login.emailPlaceholder', 'you@example.com')}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 text-start">
                                    {t('auth.login.password')}
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full ps-9 pe-9 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium transition-all"
                                        placeholder={t('auth.login.passwordPlaceholder', 'كلمة المرور')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password Row */}
                            <div className="flex items-center justify-between text-xs pt-0.5">
                                <label htmlFor="remember-me" className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-[11px] text-slate-600 font-medium">{t('auth.login.rememberMe')}</span>
                                </label>

                                <Link 
                                    to="/forgot-password" 
                                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold transition-colors"
                                >
                                    {t('auth.login.forgotPassword')}
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm group mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t('auth.login.submitting')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('auth.login.submit')}</span>
                                        {isRtl ? (
                                            <MoveLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
                                        ) : (
                                            <MoveRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                                        )}
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="verificationCode" className="block text-[11px] font-bold text-slate-700 text-center">
                                    {t('auth.login.verificationCode', 'أدخل رمز التحقق (OTP)')}
                                </label>
                                <div className="flex justify-center gap-1.5 sm:gap-2 my-2" dir="ltr">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-9 h-11 sm:w-11 sm:h-12 bg-slate-50 border border-slate-200 rounded-lg text-center text-lg sm:text-xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm group"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('auth.login.verifyAndLogin', 'تأكيد ودخول')}</span>
                                        {isRtl ? (
                                            <MoveLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
                                        ) : (
                                            <MoveRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                                        )}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="w-full py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors"
                            >
                                {t('auth.login.backToLogin', 'العودة لتسجيل الدخول')}
                            </button>
                        </form>
                    )}

                    {/* Create Account Link */}
                    <div className="mt-4 text-center text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <span>{t('auth.login.noAccount')} </span>
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            {t('auth.login.createAccount')}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;