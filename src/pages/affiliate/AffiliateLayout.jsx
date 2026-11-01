import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  LogOut,
  Coins,
  Copy,
  Check,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  Wallet,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { affiliatePortalService } from '../../services/affiliate.service';

const AffiliateLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const [affiliate, setAffiliate] = useState(affiliatePortalService.getStoredAffiliate());
  const [loading, setLoading] = useState(!affiliate);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      navigate('/affiliate/login');
      return;
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const fetchProfile = async () => {
    try {
      const res = await affiliatePortalService.getProfile();
      if (res.success) {
        setAffiliate(res.data);
      }
    } catch (err) {
      console.error('Failed to load affiliate profile:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        affiliatePortalService.logout();
        navigate('/affiliate/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!affiliate?.code) return;
    navigator.clipboard.writeText(affiliate.code);
    setCopied(true);
    toast.success(isRTL ? 'تم نسخ كود الترويج بنجاح!' : 'Promo code copied successfully!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    affiliatePortalService.logout();
    toast.info(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    navigate('/affiliate/login');
  };

  const navItems = [
    {
      to: '/affiliate/dashboard',
      label: isRTL ? 'لوحة التحكم والإحصائيات' : 'Dashboard & Analytics',
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      to: '/affiliate/conversions',
      label: isRTL ? 'سجل المبيعات والعمولات' : 'Sales & Commissions',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      to: '/affiliate/payouts',
      label: isRTL ? 'سحب الأرباح والحساب البنكي' : 'Payouts & Bank Info',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-slate-900 flex items-center justify-center font-arabic" 
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col items-center gap-3 text-white">
          <Coins className="w-10 h-10 animate-bounce text-primary-500" />
          <p className="text-sm font-bold">
            {isRTL ? 'جاري تحميل بوابة المسوّق...' : 'Loading affiliate portal...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex font-arabic transition-colors duration-300 ${isDark ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-950 flex flex-col transition-transform duration-300 ${
          isRTL ? 'right-0 border-l border-slate-200/80 dark:border-slate-800' : 'left-0 border-r border-slate-200/80 dark:border-slate-800'
        } ${
          isSidebarOpen 
            ? 'translate-x-0' 
            : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/25">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white text-base leading-tight">
                {isRTL ? 'أكاديمية AEC' : 'AEC Academy'}
              </div>
              <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400">
                {isRTL ? 'بوابة المسوقين بالعمولة' : 'Affiliate Portal'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Affiliate Quick Profile Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-gradient-to-br from-primary-50/80 via-slate-50 to-indigo-50/50 dark:from-primary-950/40 dark:via-slate-900 dark:to-indigo-950/30 border border-primary-200/50 dark:border-primary-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {affiliate?.firstName?.[0] || 'M'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {affiliate?.firstName} {affiliate?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{affiliate?.email}</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title={isRTL ? 'حساب نشط' : 'Active Account'}></span>
          </div>

          {/* Promo code badge with copy */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">
                {isRTL ? 'كودك الترويجي:' : 'Your Promo Code:'}
              </span>
              <span className="font-mono font-black text-sm text-primary-600 dark:text-primary-400 tracking-wider">
                {affiliate?.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors"
              title={isRTL ? 'نسخ الكود' : 'Copy code'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <span>
              {isDark ? (isRTL ? 'الوضع المضيء' : 'Light Mode') : (isRTL ? 'الوضع الليلي' : 'Dark Mode')}
            </span>
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isRTL ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isRTL ? 'lg:mr-72' : 'lg:ml-72'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-400">
                {isRTL ? 'مرحباً بك،' : 'Welcome,'}
              </span>
              <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                {affiliate?.firstName} {affiliate?.lastName} 🌟
              </span>
            </div>
          </div>

          {/* Quick Header Balances */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block leading-none">
                  {isRTL ? 'الرصيد المتاح:' : 'Available Balance:'}
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  {(affiliate?.availableBalance || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

            <NavLink
              to="/affiliate/payouts"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isRTL ? 'طلب سحب أرباح' : 'Request Payout'}</span>
            </NavLink>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ affiliate, refreshProfile: fetchProfile }} />
        </main>
      </div>
    </div>
  );
};

export default AffiliateLayout;
