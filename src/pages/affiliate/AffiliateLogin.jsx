import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';
import {
  Coins,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Share2
} from 'lucide-react';
import { affiliatePortalService } from '../../services/affiliate.service';

const AffiliateLogin = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error(isRTL ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await affiliatePortalService.login(email.trim(), password.trim());
      if (res.success) {
        toast.success(isRTL ? 'أهلاً بك مجدداً في بوابة المسوقين!' : 'Welcome back to the Affiliate Portal!');
        navigate('/affiliate/dashboard');
      }
    } catch (err) {
      console.error('Affiliate login failed:', err);
      toast.error(err.response?.data?.message || (isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
    } finally {
      setLoading(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const SubmitIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-arabic relative overflow-hidden" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3.5 rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-500/25 ring-1 ring-white/20">
            <Coins className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex text-white items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRTL ? 'بوابة الشركاء والمسوقين' : 'Partner & Affiliate Portal'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isRTL ? 'أكاديمية AEC | نظام الأفلييت' : 'AEC Academy | Affiliate Portal'}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {isRTL 
                ? 'سجل دخولك لمتابعة مبيعاتك، إحصائيات كود الخصم، وسحب أرباحك بكل سهولة' 
                : 'Log in to track your sales, promo code statistics, and withdraw earnings seamlessly'}
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-800 ring-1 ring-white/5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 ps-4 pe-10 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 ps-10 pe-10 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? (isRTL ? 'إخفاء كلمة المرور' : 'Hide password') : (isRTL ? 'عرض كلمة المرور' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-primary-600/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}</span>
              ) : (
                <>
                  <span>{isRTL ? 'دخول إلى لوحة المسوّق' : 'Sign in to Affiliate Portal'}</span>
                  <SubmitIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              {isRTL 
                ? 'هل أنت مسوق جديد وترغب بالانضمام لبرنامج الأفلييت؟' 
                : 'New affiliate interested in joining our program?'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isRTL 
                ? 'يتم إنشاء حسابات المسوقين وتحديد نسب العمولات عبر إدارة المنصة. تواصل مع الدعم الفني لتفعيل حسابك.' 
                : 'Affiliate accounts and commission rates are configured by platform administrators. Contact support to register.'}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <BackIcon className="w-3.5 h-3.5" />
            <span>{isRTL ? 'العودة للموقع الرئيسي' : 'Back to main website'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLogin;
