import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { authService } from '../services/new-api';
import { useLanguage } from '../hooks/useLanguage';
import {
    Mail,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    Check,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    GraduationCap,
    BookOpen,
    Loader2,
    TrendingUp,
    Globe
} from 'lucide-react';

function ForgotPassword() {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(55);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const codeValue = useMemo(() => verificationCode.join(''), [verificationCode]);

    useEffect(() => {
        document.title = `${t('auth.forgotPassword.titlePassword', 'استعادة كلمة المرور')} | ${t('common.meta.siteTitle', 'أكاديمية AEC')}`;
    }, [t]);

    useEffect(() => {
        let interval;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            await authService.forgotPassword(email.trim());
            toast.success(t('auth.toast.forgotCodeSent', 'تم إرسال رمز التحقق إلى بريدك'));
            setVerificationCode(['', '', '', '', '', '']);
            setStep(2);
            setTimer(55);
            setIsTimerRunning(true);
            setTimeout(() => inputRefs[0]?.current?.focus?.(), 100);
        } catch (err) {
            toast.error(err?.response?.data?.message || t('auth.toast.forgotCodeSendFailed', 'تعذّر إرسال رمز التحقق'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCodeChange = (index, value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 1) {
            const digits = cleaned.slice(0, 6).split('');
            const newCode = [...verificationCode];
            digits.forEach((d, i) => {
                if (index + i < 6) newCode[index + i] = d;
            });
            setVerificationCode(newCode);
            const nextIdx = Math.min(5, index + digits.length);
            inputRefs[nextIdx]?.current?.focus();
            return;
        }

        if (cleaned.length <= 1) {
            const newCode = [...verificationCode];
            newCode[index] = cleaned;
            setVerificationCode(newCode);

            if (cleaned !== '' && index < 5) {
                inputRefs[index + 1]?.current?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
        if (pasted.length >= 6) {
            const digits = pasted.slice(0, 6).split('');
            setVerificationCode(digits);
            inputRefs[5]?.current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
            inputRefs[index - 1]?.current?.focus();
        }
    };

    const handleResendCode = async () => {
        if (!email.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await authService.forgotPassword(email.trim());
            toast.success(t('auth.toast.forgotCodeResent', 'تم إعادة إرسال رمز التحقق'));
            setTimer(55);
            setIsTimerRunning(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || t('auth.toast.forgotResendFailed', 'تعذّر إعادة إرسال الرمز'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        if (codeValue.length !== 6) {
            toast.error(t('auth.toast.forgotEnterSixDigit', 'يرجى إدخال الرمز المكوّن من 6 أرقام'));
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.verifyCode(email.trim(), codeValue);
            toast.success(t('auth.toast.forgotCodeVerified', 'تم التحقق من الرمز'));
            setStep(3);
        } catch (err) {
            toast.error(err?.response?.data?.message || t('auth.toast.forgotInvalidCode', 'رمز التحقق غير صالح أو منتهي الصلاحية'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error(t('auth.toast.forgotPasswordsMismatch', 'كلمتا المرور غير متطابقتين'));
            return;
        }
        if (newPassword.length < 6) {
            toast.error(t('auth.validation.passwordMinLength', 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'));
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.resetPassword(email.trim(), newPassword, confirmPassword);
            toast.success(t('auth.toast.forgotResetSuccess', 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.'));
            navigate('/login');
        } catch (err) {
            toast.error(err?.response?.data?.message || t('auth.toast.forgotResetFailed', 'تعذّر إعادة تعيين كلمة المرور'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen lg:h-screen w-full flex bg-[#F4F7FC] font-arabic overflow-x-hidden lg:overflow-hidden" dir={t('autoGenerated.ltr', `ltr`)}>
            
            {/* ========================================================================= */}
            {/* LEFT HERO BANNER: Visible on lg screens (AEC Brand Showcase)              */}
            {/* ========================================================================= */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] bg-gradient-to-br from-[#071942] via-[#091f52] to-[#004C97] relative flex-col justify-between p-8 xl:p-12 text-white overflow-hidden h-full">
                {/* Decorative Glowing Rings */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#F7931E]/15 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

                {/* Ambient Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

                {/* Top Brand Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="inline-block bg-white px-3.5 py-2 rounded-2xl shadow-xl hover:scale-105 transition-transform">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-8 object-contain" />
                    </Link>
                    <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
                        {t('autoGenerated.secure_account_recovery', `Secure Account Recovery`)}
                    </span>
                </div>

                {/* Middle Content Section */}
                <div className="relative z-10 my-auto py-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F7931E]/20 text-[#F7931E] border border-[#F7931E]/30 mb-4 backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t('autoGenerated.your_security_is_our_priority', `Your Security is Our Priority`)}</span>
                    </div>

                    <h2 className="text-2xl xl:text-3xl font-black text-white leading-tight mb-3">
                        {t('autoGenerated.regain_access_to_your_account', `Regain Access to Your Account`)}<br />
                        <span className="text-blue-200">{t('autoGenerated.in_simple_fully_secure_steps', `In simple, fully secure steps`)}</span>
                    </h2>

                    <p className="text-blue-100/90 text-xs xl:text-sm mb-6 leading-relaxed">
                        {t('autoGenerated.we_help_you_reset_your_credent', `We help you reset your credentials and resume your educational tracks smoothly and reliably.`)}
                    </p>

                    {/* Security Highlights Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl space-y-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <span className="text-xs xl:text-sm text-blue-50 font-semibold">
                                {t('autoGenerated.one_time_secure_verification_c', `One-time secure verification code sent to email`)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="text-xs xl:text-sm text-blue-50 font-semibold">
                                {t('autoGenerated.end_to_end_credential_encrypti', `End-to-end credential encryption and safety`)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs xl:text-sm text-blue-50 font-semibold">
                                {t('autoGenerated.instant_return_to_your_courses', `Instant return to your courses and certificates`)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Trust Line */}
                <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/80 pt-4 border-t border-white/10">
                    <span>© {new Date().getFullYear()} أكاديمية AEC. جميع الحقوق محفوظة.</span>
                    <Link to="/contact" className="hover:text-white transition">
                        {t('autoGenerated.need_help', `Need help?`)}
                    </Link>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT FORM CONTAINER: Multi-step Recovery Form                            */}
            {/* ========================================================================= */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
                
                {/* Mobile Header / Brand Logo */}
                <div className="flex items-center justify-between mb-8 lg:mb-4">
                    <Link to="/" className="lg:hidden flex items-center gap-2">
                        <img src="/assets/logo.png" alt="AEC Logo" className="h-8 object-contain" />
                    </Link>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#004C97] hover:text-[#071942] transition ms-auto"
                    >
                        <span>{t('auth.forgotPassword.login', 'تسجيل الدخول')}</span>
                        <ArrowIcon className="w-4 h-4" />
                    </Link>
                </div>

                {/* Form Card Content */}
                <div className="max-w-md w-full mx-auto my-auto">
                    
                    {/* Visual 3-Step Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative mb-2">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 inset-x-0 h-0.5 bg-slate-200 -z-0 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 start-0 h-0.5 bg-[#004C97] -z-0 -translate-y-1/2 transition-all duration-500"
                                style={{
                                    width: step === 1 ? '0%' : step === 2 ? '50%' : '100%'
                                }}
                            />

                            {/* Step 1 Pill */}
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                                    step > 1
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : step === 1
                                        ? 'bg-[#004C97] text-white ring-4 ring-blue-100 shadow-md'
                                        : 'bg-white border-2 border-slate-300 text-slate-400'
                                }`}>
                                    {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${step === 1 ? 'text-[#004C97]' : 'text-slate-400'}`}>
                                    {t('autoGenerated.email', `Email`)}
                                </span>
                            </div>

                            {/* Step 2 Pill */}
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                                    step > 2
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : step === 2
                                        ? 'bg-[#004C97] text-white ring-4 ring-blue-100 shadow-md'
                                        : 'bg-white border-2 border-slate-300 text-slate-400'
                                }`}>
                                    {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${step === 2 ? 'text-[#004C97]' : 'text-slate-400'}`}>
                                    {t('autoGenerated.code', `Code`)}
                                </span>
                            </div>

                            {/* Step 3 Pill */}
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                                    step === 3
                                        ? 'bg-[#004C97] text-white ring-4 ring-blue-100 shadow-md'
                                        : 'bg-white border-2 border-slate-300 text-slate-400'
                                }`}>
                                    3
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${step === 3 ? 'text-[#004C97]' : 'text-slate-400'}`}>
                                    {t('autoGenerated.password', `Password`)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* STEP 1: Email Form                                       */}
                    {/* ========================================================= */}
                    {step === 1 && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004C97] flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    {t('autoGenerated.forgot_password', `Forgot Password?`)}
                                </h1>
                                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                                    {t('auth.forgotPassword.emailStep.description', 'أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق لاستعادة الحساب.')}
                                </p>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-2">
                                        {t('auth.forgotPassword.emailStep.emailLabel', 'البريد الإلكتروني المسجل')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            dir="ltr"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full ps-11 pe-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:border-[#004C97] focus:ring-4 focus:ring-blue-500/10 shadow-sm transition"
                                            placeholder={t('auth.forgotPassword.emailStep.emailPlaceholder', 'you@example.com')}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email.trim()}
                                    className="w-full py-3.5 px-6 bg-[#004C97] hover:bg-[#071942] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg shadow-blue-900/15 hover:shadow-xl transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('auth.forgotPassword.emailStep.sending', 'جاري إرسال الرمز...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('auth.forgotPassword.emailStep.continue', 'إرسال رمز التحقق')}</span>
                                            <ArrowIcon className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 2: 6-Digit OTP Verification Form                    */}
                    {/* ========================================================= */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7931E] flex items-center justify-center mb-4 shadow-sm border border-amber-100">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    {t('autoGenerated.enter_verification_code', `Enter Verification Code`)}
                                </h1>
                                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                                    {t('auth.forgotPassword.codeStep.description', 'أدخل الرمز المكوّن من 6 أرقام المرسل إلى:')}
                                </p>
                                
                                {/* Target Email Badge & Edit Link */}
                                <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                                    <span dir="ltr">{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[#004C97] hover:underline text-[11px]"
                                    >
                                        {t('autoGenerated.change', `(Change)`)}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCodeSubmit} className="space-y-6">
                                {/* 6 OTP Boxes with full Paste Support */}
                                <div className="flex justify-center gap-2 sm:gap-3" dir="ltr" onPaste={handlePaste}>
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-black text-slate-900 bg-white border-2 border-slate-200 focus:border-[#004C97] rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                                        />
                                    ))}
                                </div>

                                {/* Resend Timer & Action */}
                                <div className="text-center text-xs">
                                    {isTimerRunning ? (
                                        <div className="text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                            <span>{t('auth.forgotPassword.codeStep.resendIn', 'إعادة الإرسال خلال')} </span>
                                            <span className="text-[#004C97] font-black font-mono text-sm">{timer}</span>
                                            <span>{t('auth.forgotPassword.codeStep.seconds', 'ثانية')}</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#004C97] hover:text-[#071942] hover:underline"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>{t('auth.forgotPassword.codeStep.resendCode', 'إعادة إرسال رمز التحقق')}</span>
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || codeValue.length !== 6}
                                    className="w-full py-3.5 px-6 bg-[#004C97] hover:bg-[#071942] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg shadow-blue-900/15 hover:shadow-xl transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('auth.forgotPassword.codeStep.verifying', 'جاري التحقق...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('auth.forgotPassword.codeStep.verify', 'التحقق والمتابعة')}</span>
                                            <ArrowIcon className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* STEP 3: Reset New Password Form                           */}
                    {/* ========================================================= */}
                    {step === 3 && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    {t('autoGenerated.set_new_password', `Set New Password`)}
                                </h1>
                                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                                    {t('auth.forgotPassword.newPasswordStep.description', 'يرجى إدخال كلمة مرور جديدة وقوية لحماية حسابك.')}
                                </p>
                            </div>

                            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                                {/* New Password Input */}
                                <div>
                                    <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                                        {t('auth.forgotPassword.newPasswordStep.newPassword', 'كلمة المرور الجديدة')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            dir="ltr"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full ps-11 pe-11 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:border-[#004C97] focus:ring-4 focus:ring-blue-500/10 shadow-sm transition"
                                            placeholder={t('auth.forgotPassword.newPasswordStep.newPasswordPlaceholder', '••••••••')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                                        {t('auth.forgotPassword.newPasswordStep.confirmPassword', 'تأكيد كلمة المرور')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            dir="ltr"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full ps-11 pe-11 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:border-[#004C97] focus:ring-4 focus:ring-blue-500/10 shadow-sm transition"
                                            placeholder={t('auth.forgotPassword.newPasswordStep.confirmPasswordPlaceholder', '••••••••')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Match feedback */}
                                    {confirmPassword && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold">
                                            {newPassword === confirmPassword ? (
                                                <span className="text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>{t('autoGenerated.passwords_match', `Passwords match`)}</span>
                                                </span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>{t('autoGenerated.passwords_do_not_match', `Passwords do not match`)}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
                                    className="w-full mt-2 py-3.5 px-6 bg-[#004C97] hover:bg-[#071942] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg shadow-blue-900/15 hover:shadow-xl transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('auth.forgotPassword.newPasswordStep.resetting', 'جاري حفظ كلمة المرور...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 stroke-[2.5]" />
                                            <span>{t('auth.forgotPassword.newPasswordStep.resetPassword', 'حفظ كلمة المرور وتأكيد الدخول')}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Bottom Back-to-Login Link */}
                    <div className="mt-8 pt-6 border-t border-slate-200/80 text-center text-xs sm:text-sm">
                        <span className="text-slate-500">{t('auth.forgotPassword.rememberPassword', 'تذكّرت كلمة المرور؟')} </span>
                        <Link to="/login" className="font-bold text-[#004C97] hover:underline ms-1">
                            {t('auth.forgotPassword.login', 'تسجيل الدخول')}
                        </Link>
                    </div>

                </div>

                {/* Footer Notes on Mobile */}
                <div className="mt-6 text-center text-[11px] text-slate-400">
                    <span>© {new Date().getFullYear()} أكاديمية AEC • جميع الحقوق محفوظة</span>
                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;
