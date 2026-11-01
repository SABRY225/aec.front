import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import {
  Award,
  Coins,
  Settings,
  History,
  UserPlus,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  UserCheck,
  GraduationCap,
  Sparkles,
  Gift,
  Star,
  Users,
  Check,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  DollarSign,
  Calculator,
  ShieldCheck,
  Zap,
  User,
  AlertCircle,
  RotateCcw,
  Receipt,
  CheckCheck
} from 'lucide-react';
import { adminRewardsService } from '../../services/rewards.service';

const RewardsManagement = () => {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'transactions' | 'manual' | 'simulator'
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    sarPerPoint: 0.1,
    minPointsToRedeem: 50,
    maxDiscountPercentage: 50,
    studentRules: {
      welcomeBonus: { enabled: true, points: 50 },
      referralSignup: { enabled: true, points: 30 },
      friendFirstPurchase: { enabled: true, points: 60 },
      enrollmentPointsPer100Sar: { enabled: true, points: 10 },
      courseCompletion: { enabled: true, points: 50 },
      courseReview: { enabled: true, points: 15 },
    },
    instructorRules: {
      coursePublished: { enabled: true, points: 100 },
      studentEnrolled: { enabled: true, points: 15 },
      peerInstructorReferral: { enabled: true, points: 150 },
      crossCourseReferral: { enabled: true, points: 40 },
    },
  });

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalCount, setTxTotalCount] = useState(0);
  const [txRoleFilter, setTxRoleFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // Manual Adjustment State
  const [manualForm, setManualForm] = useState({
    userEmailOrId: '',
    type: 'credit',
    points: 50,
    reason: '',
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Simulator Calculator State
  const [calcOrderAmount, setCalcOrderAmount] = useState(350);
  const [calcPointsToUse, setCalcPointsToUse] = useState(100);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, statsRes] = await Promise.all([
        adminRewardsService.getSettings(),
        adminRewardsService.getStats(),
      ]);

      if (settingsRes?.data) {
        setSettings(settingsRes.data);
      }
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching rewards data:', err);
      toast.error(isRTL ? 'فشل تحميل بيانات المكافآت والإعدادات' : 'Failed to load rewards settings & stats');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transactions on tab switch or filters
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, txPage, txRoleFilter, txTypeFilter]);

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const res = await adminRewardsService.getAllTransactions({
        page: txPage,
        limit: 15,
        role: txRoleFilter || undefined,
        type: txTypeFilter || undefined,
        search: txSearch || undefined,
      });

      if (res?.data) {
        setTransactions(res.data.transactions || []);
        setTxTotalPages(res.data.pagination?.totalPages || 1);
        setTxTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error(isRTL ? 'فشل في جلب سجل الحركات' : 'Failed to fetch transaction ledger');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setTxPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setTxSearch('');
    setTxRoleFilter('');
    setTxTypeFilter('');
    setTxPage(1);
  };

  // Update Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await adminRewardsService.updateSettings(settings);
      if (res?.success) {
        toast.success(isRTL ? 'تم حفظ إعدادات وقيم المكافآت بنجاح' : 'Rewards settings updated successfully');
        if (res.data) setSettings(res.data);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error(err.response?.data?.message || (isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
    } finally {
      setSavingSettings(false);
    }
  };

  // Submit Manual Adjustment
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.userEmailOrId.trim()) {
      toast.error(isRTL ? 'يرجى إدخال البريد الإلكتروني أو معرف المستخدم' : 'Please provide user email or ID');
      return;
    }
    if (!manualForm.points || Number(manualForm.points) <= 0) {
      toast.error(isRTL ? 'يرجى تحديد عدد نقاط صالح أكبر من صفر' : 'Please enter a valid points amount greater than 0');
      return;
    }
    if (!manualForm.reason.trim()) {
      toast.error(isRTL ? 'يرجى كتابة سبب التعديل' : 'Please enter an adjustment reason');
      return;
    }

    setManualSubmitting(true);
    try {
      const res = await adminRewardsService.adjustPointsManually({
        userId: manualForm.userEmailOrId.trim(),
        points: Number(manualForm.points),
        reason: manualForm.reason.trim(),
        type: manualForm.type,
      });

      if (res?.success) {
        toast.success(res.message || (isRTL ? 'تم تعديل النقاط بنجاح' : 'Points adjusted successfully'));
        setManualForm({
          userEmailOrId: '',
          type: 'credit',
          points: 50,
          reason: '',
        });
        // Refresh stats
        const statsRes = await adminRewardsService.getStats();
        if (statsRes?.data) setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Manual adjustment error:', err);
      toast.error(err.response?.data?.message || (isRTL ? 'فشل في تعديل النقاط للمستخدم' : 'Failed to adjust user points'));
    } finally {
      setManualSubmitting(false);
    }
  };

  // Presets for manual reason
  const REASON_PRESETS = isRTL
    ? [
        'مكافأة تميز وإنجاز استثنائي 🌟',
        'هدية ترحيبية خاصة من الإدارة 🎁',
        'تسوية رصيد دعم فني ⚙️',
        'مكافأة الفوز في مسابقة المنصة 🏆',
        'تصحيح رصيد بعد إلغاء طلب 💳',
      ]
    : [
        'Exceptional Performance Award 🌟',
        'Special Admin Welcome Gift 🎁',
        'Support Ticket Settlement ⚙️',
        'Platform Contest Winner 🏆',
        'Balance Correction on Refund 💳',
      ];

  const QUICK_POINT_PRESETS = [25, 50, 100, 250, 500];

  return (
    <div className="space-y-7 pb-14 font-arabic max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ======================================================== */}
      {/* 1. HERO HEADER WITH AMBIENT GLOW */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Ambient Gradient Highlights */}
        <div className={`absolute top-0 ${isRTL ? 'right-0 -mr-20' : 'left-0 -ml-20'} w-96 h-96 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mt-20`}></div>
        <div className={`absolute bottom-0 ${isRTL ? 'left-0 -ml-20' : 'right-0 -mr-20'} w-80 h-80 bg-gradient-to-tr from-primary-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mb-20`}></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 ring-4 ring-amber-500/10">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isRTL ? 'نظام المكافآت ونقاط الولاء' : 'Rewards & Loyalty Points System'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isRTL ? 'نظام نشط وتلقائي' : 'Active & Automated'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {isRTL
                  ? 'إدارة شاملة لأسعار صرف النقاط، ضوابط الاكتساب والاستبدال للطلاب والمحاضرين، وتدقيق العمليات المالية لحظياً'
                  : 'Manage point exchange values, student & instructor earning/redemption rules, and live financial audit trails'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 disabled:opacity-50"
              title={isRTL ? 'تحديث البيانات' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isRTL ? 'تحديث' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-500" />
              <span>{isRTL ? 'منح يدوي سريع' : 'Manual Adjustment'}</span>
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${savingSettings ? 'animate-spin' : ''}`} />
              <span>{savingSettings ? (isRTL ? 'جارِ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS KPI CARDS STRIP */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Points Awarded */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? 'إجمالي النقاط الممنوحة' : 'Total Points Awarded'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{(stats?.totalPointsAwarded || 0).toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 font-sans">{isRTL ? 'نقطة' : 'pts'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isRTL
                  ? `${stats?.totalCreditTransactions || 0} عملية اكتساب مسجلة`
                  : `${stats?.totalCreditTransactions || 0} credited activities`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Points Redeemed */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? 'النقاط المستبدلة بخصم' : 'Points Redeemed'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{(stats?.totalPointsRedeemed || 0).toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 font-sans">{isRTL ? 'نقطة' : 'pts'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isRTL
                  ? `وفّرت ${(stats?.totalDiscountProvidedSar || 0).toFixed(2)} ر.س للعملاء`
                  : `Saved ${(stats?.totalDiscountProvidedSar || 0).toFixed(2)} SAR for students`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Current Conversion Rate */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? 'سعر الصرف الحالي' : 'Exchange Rate'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{((settings.sarPerPoint || 0.1) * 100).toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-400 font-sans">
                {isRTL ? 'ر.س / 100 نقطة' : 'SAR / 100 pts'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-2">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isRTL
                  ? `أقصى خصم للسلة: ${settings.maxDiscountPercentage || 50}%`
                  : `Cart Discount Cap: ${settings.maxDiscountPercentage || 50}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Ledger Transactions */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? 'سجل حركات النظام' : 'Ledger Entries'}
            </span>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{(stats?.totalTransactions || 0).toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 font-sans">{isRTL ? 'حركة' : 'tx'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold mt-2">
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>{isRTL ? 'سجل تدقيق مالي وقانوني كامل' : 'Audit trail & transaction history'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MODERN TAB NAVIGATION BAR */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
            activeTab === 'rules'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isRTL ? 'قواعد وقيم المكافآت' : 'Reward Rules & Values'}</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isRTL ? 'سجل الحركات المالي' : 'Financial Ledger'}</span>
          {txTotalCount > 0 && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'transactions'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {txTotalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
            activeTab === 'manual'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRTL ? 'منح وخصم استثنائي' : 'Manual Grant / Deduct'}</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{isRTL ? 'حاسبة ومحاكي الفاتورة' : 'Cart Simulator'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RULES CONFIGURATION */}
      {/* ======================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1.1 Financial Conversion & Safeguards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {isRTL ? 'إعدادات التحويل المالي وسعر الصرف' : 'Financial Conversion & Exchange Rate'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRTL
                      ? 'التحكم بالقيمة النقدية للنقاط وشروط وضوابط استبدالها عند سداد الفاتورة'
                      : 'Control monetary value of points and rules for redeeming them at checkout'}
                  </p>
                </div>
              </div>

              {/* Live Equation Badge */}
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {isRTL
                    ? `المعادلة المطبقة: 100 نقطة = ${((settings.sarPerPoint || 0) * 100).toFixed(1)} ريال سعودي`
                    : `Applied Formula: 100 pts = ${((settings.sarPerPoint || 0) * 100).toFixed(1)} SAR`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Field 1: SAR per point */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'سعر صرف النقطة بالريال (SAR)' : 'SAR per Point Rate'}
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    {((settings.sarPerPoint || 0) * 100).toFixed(0)} {isRTL ? 'ر.س / 100 نقطة' : 'SAR / 100 pts'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={settings.sarPerPoint ?? 0.1}
                    onChange={(e) =>
                      setSettings({ ...settings, sarPerPoint: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full ${isRTL ? 'pl-20 pr-4' : 'pr-20 pl-4'} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} text-xs font-bold text-slate-400 pointer-events-none`}>
                    {isRTL ? 'ر.س / نقطة' : 'SAR / pt'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isRTL
                    ? 'مثال: قيمة 0.10 تعني أن كل 10 نقاط تمنح خصم 1 ريال سعودي حقيقي.'
                    : 'Example: 0.10 means 10 points grant a real 1 SAR checkout discount.'}
                </p>
              </div>

              {/* Field 2: Min points to redeem */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'الحد الأدنى للنقاط للاستبدال' : 'Min Points to Redeem'}
                  </label>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    = {((settings.minPointsToRedeem || 50) * (settings.sarPerPoint || 0.1)).toFixed(1)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={settings.minPointsToRedeem ?? 50}
                    onChange={(e) =>
                      setSettings({ ...settings, minPointsToRedeem: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`w-full ${isRTL ? 'pl-16 pr-4' : 'pr-16 pl-4'} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} text-xs font-bold text-slate-400 pointer-events-none`}>
                    {isRTL ? 'نقطة' : 'pts'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isRTL
                    ? 'لن يظهر خيار خصم النقاط للطالب في صفحة الدفع ما لم يصل رصيده لهذا الحد.'
                    : 'Points discount will not be offered at checkout unless the student reaches this minimum.'}
                </p>
              </div>

              {/* Field 3: Max discount percentage */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'الحد الأقصى لنسبة خصم الفاتورة' : 'Max Order Discount Cap'}
                  </label>
                  <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    {isRTL ? 'سقف الأمان المالي' : 'Margin Safeguard'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxDiscountPercentage ?? 50}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxDiscountPercentage: Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 50)),
                      })
                    }
                    className={`w-full ${isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} text-xs font-bold text-slate-400 pointer-events-none`}>
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isRTL
                    ? 'أعلى نسبة يمكن خصمها من سلة المشتريات بواسطة النقاط لحماية هوامش الربح.'
                    : 'Highest percentage that can be discounted on a cart using loyalty points.'}
                </p>
              </div>
            </div>
          </div>

          {/* 1.2 Student Rewards Rules */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {isRTL ? 'قواعد مكافآت ونقاط الطلاب' : 'Student Reward Points Rules'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRTL
                      ? 'تحفيز التسجيل، دعوة الأصدقاء، إتمام المساقات، والتقييم الإيجابي'
                      : 'Incentivize registrations, referrals, course completions, and reviews'}
                  </p>
                </div>
              </div>

              <span className="text-xs px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/50 dark:border-amber-800/50 w-fit">
                {isRTL ? '6 قواعد نشطة للطلاب' : '6 Active Student Rules'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-6">
              {/* 1. Welcome Bonus */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'مكافأة تسجيل حساب جديد' : 'Welcome Signup Bonus'}
                description={
                  isRTL
                    ? 'نقاط ترحيبية فورية تودع في محفظة الطالب بمجرد إنشاء وتأكيد حسابه.'
                    : 'Instant welcome points credited upon creating and verifying a student account.'
                }
                icon={<Gift className="w-5 h-5 text-amber-500" />}
                badge={isRTL ? 'ترحيب' : 'Welcome'}
                badgeColor="amber"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.welcomeBonus?.enabled}
                points={settings.studentRules?.welcomeBonus?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      welcomeBonus: { ...settings.studentRules.welcomeBonus, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      welcomeBonus: { ...settings.studentRules.welcomeBonus, points: pts },
                    },
                  })
                }
              />

              {/* 2. Referral Signup */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'دعوة صديق وإنشاء حسابه' : 'Friend Referral Registration'}
                description={
                  isRTL
                    ? 'مكافأة للطالب الداعي عندما يسجل صديقه عبر كود الإحالة الخاص به.'
                    : 'Reward given to the referrer when a friend registers using their invite code.'
                }
                icon={<Users className="w-5 h-5 text-indigo-500" />}
                badge={isRTL ? 'إحالة تسجيل' : 'Referral'}
                badgeColor="indigo"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.referralSignup?.enabled}
                points={settings.studentRules?.referralSignup?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      referralSignup: { ...settings.studentRules.referralSignup, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      referralSignup: { ...settings.studentRules.referralSignup, points: pts },
                    },
                  })
                }
              />

              {/* 3. Friend First Purchase */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'أول عملية شراء للصديق المدعو' : 'Friend First Purchase'}
                description={
                  isRTL
                    ? 'مكافأة إضافية مجزية تمنح للداعي عند اشتراك صديقه في أول دورة مدفوعة.'
                    : 'Generous bonus for the referrer when the invited friend completes their first purchase.'
                }
                icon={<Sparkles className="w-5 h-5 text-emerald-500" />}
                badge={isRTL ? 'شراء صديق' : 'Purchase'}
                badgeColor="emerald"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.friendFirstPurchase?.enabled}
                points={settings.studentRules?.friendFirstPurchase?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      friendFirstPurchase: { ...settings.studentRules.friendFirstPurchase, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      friendFirstPurchase: { ...settings.studentRules.friendFirstPurchase, points: pts },
                    },
                  })
                }
              />

              {/* 4. Enrollment Points per 100 SAR */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'نقاط الشراء (عن كل 100 ر.س)' : 'Purchase Cashback (per 100 SAR)'}
                description={
                  isRTL
                    ? 'كاش باك بالنقاط يكتسبه الطالب تلقائياً بناءً على صافي قيمة مدفوعاته.'
                    : 'Automatic cashback points earned based on net checkout payment.'
                }
                icon={<Coins className="w-5 h-5 text-blue-500" />}
                badge={isRTL ? 'كاش باك' : 'Cashback'}
                badgeColor="blue"
                unitLabel={isRTL ? 'نقطة / 100 ر.س' : 'pts / 100 SAR'}
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.enrollmentPointsPer100Sar?.enabled}
                points={settings.studentRules?.enrollmentPointsPer100Sar?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      enrollmentPointsPer100Sar: { ...settings.studentRules.enrollmentPointsPer100Sar, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      enrollmentPointsPer100Sar: { ...settings.studentRules.enrollmentPointsPer100Sar, points: pts },
                    },
                  })
                }
              />

              {/* 5. Course Completion */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'إتمام دورة وإصدار الشهادة' : 'Course Completion & Certificate'}
                description={
                  isRTL
                    ? 'مكافأة إنجاز تمنح للطالب فور إكماله كامل محتوى الدورة واختباراتها بنجاح.'
                    : 'Achievement reward granted upon completing all course lessons and passing tests.'
                }
                icon={<Award className="w-5 h-5 text-purple-500" />}
                badge={isRTL ? 'شهادة وإنجاز' : 'Completion'}
                badgeColor="purple"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.courseCompletion?.enabled}
                points={settings.studentRules?.courseCompletion?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      courseCompletion: { ...settings.studentRules.courseCompletion, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      courseCompletion: { ...settings.studentRules.courseCompletion, points: pts },
                    },
                  })
                }
              />

              {/* 6. Course Review */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'تقييم الدورة والمحاضر' : 'Course & Instructor Review'}
                description={
                  isRTL
                    ? 'مكافأة فورية تودع بمحفظة الطالب لمشاركته رأيه وتجربته في تقييم الدورة.'
                    : 'Reward credited when a student writes a constructive course review.'
                }
                icon={<Star className="w-5 h-5 text-amber-500" />}
                badge={isRTL ? 'مراجعة وتقييم' : 'Review'}
                badgeColor="amber"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.studentRules?.courseReview?.enabled}
                points={settings.studentRules?.courseReview?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      courseReview: { ...settings.studentRules.courseReview, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    studentRules: {
                      ...settings.studentRules,
                      courseReview: { ...settings.studentRules.courseReview, points: pts },
                    },
                  })
                }
              />
            </div>
          </div>

          {/* 1.3 Instructor Rewards Rules */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {isRTL ? 'قواعد مكافآت ونقاط المحاضرين' : 'Instructor Reward Points Rules'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRTL
                      ? 'تحفيز نشر الدورات، استقطاب المتدربين، ودعوة المحاضرين المعتمدين'
                      : 'Incentivize publishing courses, attracting trainees, and referring instructors'}
                  </p>
                </div>
              </div>

              <span className="text-xs px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/50 w-fit">
                {isRTL ? '4 قواعد نشطة للمحاضرين' : '4 Active Instructor Rules'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-6">
              {/* 1. Course Published */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'اعتماد ونشر دورة جديدة' : 'New Course Published'}
                description={
                  isRTL
                    ? 'تمنح للمحاضر فور موافقة الإدارة واعتماد دورته التدريبية ونشرها في المنصة.'
                    : 'Awarded to instructor once their course is approved and published.'
                }
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                badge={isRTL ? 'نشر دورة' : 'Publishing'}
                badgeColor="emerald"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.instructorRules?.coursePublished?.enabled}
                points={settings.instructorRules?.coursePublished?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      coursePublished: { ...settings.instructorRules.coursePublished, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      coursePublished: { ...settings.instructorRules.coursePublished, points: pts },
                    },
                  })
                }
              />

              {/* 2. Student Enrolled */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'تسجيل طالب في دورة المحاضر' : 'Student Enrollment in Course'}
                description={
                  isRTL
                    ? 'نقاط إضافية تلقائية للمحاضر عن كل طالب جديد يلتحق بإحدى دوراته التدريبية.'
                    : 'Extra points for each new student enrolling in one of the instructor\'s courses.'
                }
                icon={<GraduationCap className="w-5 h-5 text-blue-500" />}
                badge={isRTL ? 'طالب مسجل' : 'Enrollment'}
                badgeColor="blue"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.instructorRules?.studentEnrolled?.enabled}
                points={settings.instructorRules?.studentEnrolled?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      studentEnrolled: { ...settings.instructorRules.studentEnrolled, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      studentEnrolled: { ...settings.instructorRules.studentEnrolled, points: pts },
                    },
                  })
                }
              />

              {/* 3. Peer Instructor Referral */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'دعوة محاضر زميل واعتماده' : 'Peer Instructor Referral'}
                description={
                  isRTL
                    ? 'مكافأة استقطاب زميل معتمد ينضم للأكاديمية وتوافق الإدارة على اعتماده.'
                    : 'Recruitment bonus when a peer instructor joins and gets platform accreditation.'
                }
                icon={<Users className="w-5 h-5 text-indigo-500" />}
                badge={isRTL ? 'دعوة زميل' : 'Instructor Referral'}
                badgeColor="indigo"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.instructorRules?.peerInstructorReferral?.enabled}
                points={settings.instructorRules?.peerInstructorReferral?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      peerInstructorReferral: { ...settings.instructorRules.peerInstructorReferral, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      peerInstructorReferral: { ...settings.instructorRules.peerInstructorReferral, points: pts },
                    },
                  })
                }
              />

              {/* 4. Cross-Course Referral */}
              <RuleItemCard
                isRTL={isRTL}
                title={isRTL ? 'تسويق دورة أخرى عبر كوده' : 'Cross-Course Referral'}
                description={
                  isRTL
                    ? 'نقاط للمحاضر عندما يشتري متدرب دورة أخرى في المنصة باستخدام كوده الترويجي.'
                    : 'Points awarded when a student buys another course using the instructor\'s promo code.'
                }
                icon={<Sparkles className="w-5 h-5 text-amber-500" />}
                badge={isRTL ? 'تسويق متبادل' : 'Cross-Promo'}
                badgeColor="amber"
                sarPerPoint={settings.sarPerPoint}
                enabled={settings.instructorRules?.crossCourseReferral?.enabled}
                points={settings.instructorRules?.crossCourseReferral?.points}
                onToggle={(val) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      crossCourseReferral: { ...settings.instructorRules.crossCourseReferral, enabled: val },
                    },
                  })
                }
                onChangePoints={(pts) =>
                  setSettings({
                    ...settings,
                    instructorRules: {
                      ...settings.instructorRules,
                      crossCourseReferral: { ...settings.instructorRules.crossCourseReferral, points: pts },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRANSACTIONS LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث باسم المستخدم، البريد، أو عنوان المعاملة...' : 'Search by username, email, or transaction reason...'}
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                />
              </div>

              {/* Role Filter */}
              <select
                value={txRoleFilter}
                onChange={(e) => {
                  setTxRoleFilter(e.target.value);
                  setTxPage(1);
                }}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              >
                <option value="">{isRTL ? 'جميع فئات المستخدمين' : 'All User Roles'}</option>
                <option value="student">{isRTL ? 'الطلاب فقط' : 'Students Only'}</option>
                <option value="instructor">{isRTL ? 'المحاضرين فقط' : 'Instructors Only'}</option>
              </select>

              {/* Type Filter */}
              <select
                value={txTypeFilter}
                onChange={(e) => {
                  setTxTypeFilter(e.target.value);
                  setTxPage(1);
                }}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              >
                <option value="">{isRTL ? 'جميع أنواع الحركات' : 'All Action Types'}</option>
                <option value="credit">{isRTL ? 'إيداع واكتساب (+)' : 'Credit / Earned (+)'}</option>
                <option value="debit">{isRTL ? 'استبدال وخصم (-)' : 'Debit / Redeemed (-)'}</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-sm active:scale-95"
              >
                {isRTL ? 'بحث وتطبيق' : 'Filter'}
              </button>

              {(txSearch || txRoleFilter || txTypeFilter) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                  title={isRTL ? 'إلغاء الفلاتر' : 'Reset Filters'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isRTL ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              )}
            </form>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-black uppercase border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-start">{isRTL ? 'المستخدم' : 'User'}</th>
                    <th className="px-6 py-4 text-start">{isRTL ? 'النوع والسبب' : 'Type & Reason'}</th>
                    <th className="px-6 py-4 text-center">{isRTL ? 'النقاط' : 'Points'}</th>
                    <th className="px-6 py-4 text-start">{isRTL ? 'القيمة المالية (SAR)' : 'Value (SAR)'}</th>
                    <th className="px-6 py-4 text-start">{isRTL ? 'الرصيد بعدها' : 'Balance After'}</th>
                    <th className="px-6 py-4 text-start">{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16">
                        <div className="inline-flex items-center gap-2 text-slate-500">
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                          <span className="font-bold">{isRTL ? 'جارِ تحميل الحركات المالية...' : 'Loading transactions...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                          <History className="w-10 h-10 stroke-[1.5]" />
                          <p className="font-bold text-slate-600 dark:text-slate-300 text-base">
                            {isRTL ? 'لا توجد حركات مطابقة' : 'No matching transactions'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isRTL ? 'لم يتم تسجيل أي عمليات نقاط بهذه الفلاتر حتى الآن' : 'No points activity recorded with current filters'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isCredit = tx.type === 'credit';
                      const userRole = tx.user?.role || 'student';

                      return (
                        <tr
                          key={tx._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* User */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs shadow-inner uppercase shrink-0">
                                {tx.user?.name ? tx.user.name.charAt(0) : 'U'}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                  {tx.user?.name || (isRTL ? 'مستخدم غير معروف' : 'Unknown User')}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {tx.user?.email || tx.user?._id || '-'}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  userRole === 'instructor'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200'
                                }`}
                              >
                                {userRole === 'instructor' ? (isRTL ? 'محاضر' : 'Instructor') : (isRTL ? 'طالب' : 'Student')}
                              </span>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                              {tx.reason}
                            </div>
                            {tx.metadata?.ruleCode && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {isRTL ? 'كود القاعدة:' : 'Rule Code:'} {tx.metadata.ruleCode}
                              </div>
                            )}
                          </td>

                          {/* Points Pill */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-black border ${
                                isCredit
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300/60 shadow-sm shadow-emerald-500/10'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300/60 shadow-sm shadow-rose-500/10'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                              <span>{isCredit ? `+${tx.points}` : `-${Math.abs(tx.points)}`}</span>
                            </span>
                          </td>

                          {/* SAR Equivalent */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-black font-mono text-xs">
                            {tx.discountValueSar
                              ? `${tx.discountValueSar.toFixed(2)} ${isRTL ? 'ر.س' : 'SAR'}`
                              : `${(Math.abs(tx.points) * (settings.sarPerPoint || 0.1)).toFixed(2)} ${isRTL ? 'ر.س' : 'SAR'}`}
                          </td>

                          {/* Balance After */}
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-800 dark:text-slate-200 font-bold text-xs">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                              {tx.balanceAfter} {isRTL ? 'نقطة' : 'pts'}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {txTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL
                    ? `عرض صفحة ${txPage} من ${txTotalPages} (إجمالي ${txTotalCount} حركة)`
                    : `Page ${txPage} of ${txTotalPages} (Total ${txTotalCount} transactions)`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition shadow-sm"
                  >
                    {isRTL ? 'السابق' : 'Previous'}
                  </button>
                  <button
                    disabled={txPage >= txTotalPages}
                    onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition shadow-sm"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MANUAL ADJUSTMENT */}
      {/* ======================================================== */}
      {activeTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Form Card (2 Columns on large screens) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isRTL ? 'منح أو خصم نقاط يدوياً' : 'Manual Points Adjustment'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRTL
                    ? 'إجراء استثنائي مباشر لتعديل رصيد النقاط لأي طالب أو محاضر مسجل في المنصة'
                    : 'Direct administrative action to adjust points for any registered student or instructor'}
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* User Email or ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRTL ? 'البريد الإلكتروني للمستخدم أو معرفه (User ID) *' : 'User Email or ID *'}
                </label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3.5 w-4 h-4 text-slate-400`} />
                  <input
                    type="text"
                    required
                    placeholder={isRTL ? 'مثال: student@example.com أو 64f1e5...' : 'e.g. student@example.com or 64f1e5...'}
                    value={manualForm.userEmailOrId}
                    onChange={(e) => setManualForm({ ...manualForm, userEmailOrId: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                  />
                </div>
              </div>

              {/* Adjustment Type Segmented */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRTL ? 'نوع الإجراء المطلوب *' : 'Action Type *'}
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, type: 'credit' })}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                      manualForm.type === 'credit'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'منح وإيداع نقاط (+)' : 'Grant / Credit (+)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, type: 'debit' })}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                      manualForm.type === 'debit'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Minus className="w-4 h-4 text-rose-600" />
                    <span>{isRTL ? 'خصم واسترجاع نقاط (-)' : 'Deduct / Debit (-)'}</span>
                  </button>
                </div>
              </div>

              {/* Points Amount & Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRTL
                      ? `عدد النقاط المراد ${manualForm.type === 'credit' ? 'منحها' : 'خصمها'} *`
                      : `Points amount to ${manualForm.type === 'credit' ? 'grant' : 'deduct'} *`}
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {isRTL ? 'تعادل:' : 'Equals:'} {((Number(manualForm.points) || 0) * (settings.sarPerPoint || 0.1)).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <div className="relative">
                  <Coins className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3.5 w-4 h-4 text-slate-400`} />
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualForm.points}
                    onChange={(e) => setManualForm({ ...manualForm, points: parseInt(e.target.value, 10) || 0 })}
                    className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono font-black text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-bold">{isRTL ? 'خيارات سريعة:' : 'Quick Presets:'}</span>
                  {QUICK_POINT_PRESETS.map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, points: pts })}
                      className={`text-xs px-2.5 py-1 rounded-xl font-mono font-bold transition border ${
                        manualForm.points === pts
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {manualForm.type === 'credit' ? `+${pts}` : `-${pts}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRTL ? 'سبب التعديل (سيظهر للمستخدم في كشف حسابه) *' : 'Reason (Will be visible to user in ledger) *'}
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={isRTL ? 'اكتب توضيحاً صريحاً لسبب المنح أو الخصم...' : 'Provide an explicit explanation for this manual adjustment...'}
                  value={manualForm.reason}
                  onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
                />

                {/* Reason Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-bold block">
                    {isRTL ? 'عبارات جاهزة شائعة:' : 'Common templates:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {REASON_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setManualForm({ ...manualForm, reason: preset })}
                        className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition border border-slate-200/60 dark:border-slate-700/60 text-start"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className={`w-full py-3.5 px-6 rounded-2xl text-white font-black text-sm transition shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    manualForm.type === 'credit'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/20'
                  }`}
                >
                  {manualSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? 'جارِ تطبيق العملية...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>
                        {manualForm.type === 'credit'
                          ? (isRTL ? 'تأكيد منح النقاط للمستخدم' : 'Confirm Points Grant')
                          : (isRTL ? 'تأكيد خصم النقاط للمستخدم' : 'Confirm Points Deduction')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview & Info Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-slate-900 dark:to-slate-800/80 border border-amber-500/20 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                {isRTL ? 'معاينة الحركة قبل الاعتماد' : 'Transaction Preview'}
              </h3>

              <div className="space-y-3 text-xs bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-amber-500/10 dark:border-slate-800">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{isRTL ? 'نوع الحركة:' : 'Action Type:'}</span>
                  <span className={`font-black ${manualForm.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {manualForm.type === 'credit'
                      ? (isRTL ? 'إيداع رصيد (+)' : 'Credit (+)')
                      : (isRTL ? 'خصم رصيد (-)' : 'Debit (-)')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{isRTL ? 'عدد النقاط:' : 'Points:'}</span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {manualForm.points || 0} {isRTL ? 'نقطة' : 'pts'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{isRTL ? 'القيمة التقديرية بالريال:' : 'Estimated Value:'}</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {((Number(manualForm.points) || 0) * (settings.sarPerPoint || 0.1)).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">{isRTL ? 'المستفيد:' : 'Beneficiary:'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {manualForm.userEmailOrId.trim() || (isRTL ? 'لم يتم تحديده' : 'Not specified')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{isRTL ? 'تنبيه أمان مالي:' : 'Security Notice:'}</span>
                </div>
                <p>
                  {isRTL
                    ? 'يتم تسجيل جميع عمليات التعديل اليدوي في سجل التدقيق المالي مع هوية المسؤول وتوقيت العملية بدقة لمنع التلاعب.'
                    : 'All manual adjustments are permanently logged in the audit ledger with administrator ID and precise timestamps.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: INTERACTIVE SIMULATOR */}
      {/* ======================================================== */}
      {activeTab === 'simulator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isRTL ? 'حاسبة ومحاكي سيناريوهات الدفع' : 'Checkout & Points Simulator'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRTL
                  ? 'أداة تفاعلية حية لاختبار سيناريوهات اكتساب واستبدال النقاط وحساب تأثيرها المالي على سلة الشراء'
                  : 'Interactive tool to test earning & redemption mechanics and verify cart financial impact'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Interactive Inputs */}
            <div className="space-y-6">
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'قيمة سلة الشراء الافتراضية (بالريال السعودي)' : 'Cart Total Amount (SAR)'}
                  </label>
                  <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400">
                    {calcOrderAmount} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={calcOrderAmount}
                  onChange={(e) => setCalcOrderAmount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50 {isRTL ? 'ر.س' : 'SAR'}</span>
                  <span>500 {isRTL ? 'ر.س' : 'SAR'}</span>
                  <span>1000 {isRTL ? 'ر.س' : 'SAR'}</span>
                  <span>2000 {isRTL ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'رصيد نقاط الطالب المراد استبداله' : 'Student Points to Redeem'}
                  </label>
                  <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {calcPointsToUse} {isRTL ? 'نقطة' : 'pts'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={calcPointsToUse}
                  onChange={(e) => setCalcPointsToUse(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 {isRTL ? 'نقطة' : 'pts'}</span>
                  <span>250 {isRTL ? 'نقطة' : 'pts'}</span>
                  <span>500 {isRTL ? 'نقطة' : 'pts'}</span>
                  <span>1000 {isRTL ? 'نقطة' : 'pts'}</span>
                </div>
              </div>
            </div>

            {/* Simulation Result Receipt */}
            {(() => {
              const sarPerPoint = settings.sarPerPoint || 0.1;
              const minReq = settings.minPointsToRedeem || 50;
              const maxPercent = settings.maxDiscountPercentage || 50;
              const earnRule = settings.studentRules?.enrollmentPointsPer100Sar?.points || 10;

              const earnedPointsOnPurchase = Math.round((calcOrderAmount / 100) * earnRule);

              const rawDiscount = calcPointsToUse * sarPerPoint;
              const maxAllowedDiscount = (calcOrderAmount * maxPercent) / 100;
              const actualDiscount = calcPointsToUse >= minReq ? Math.min(rawDiscount, maxAllowedDiscount) : 0;
              const pointsActuallyUsed = sarPerPoint > 0 ? Math.ceil(actualDiscount / sarPerPoint) : 0;
              const netAmount = Math.max(0, calcOrderAmount - actualDiscount);
              const isEligible = calcPointsToUse >= minReq;

              return (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-amber-50/50 dark:from-slate-800/60 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700/80 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-500" />
                      {isRTL ? 'نتائج المحاكاة وفق الإعدادات الحالية' : 'Simulation Output'}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200'
                      }`}
                    >
                      {isEligible
                        ? (isRTL ? '✓ مؤهل للاستبدال' : '✓ Eligible for Discount')
                        : (isRTL ? `✗ أقل من الحد الأدنى (${minReq})` : `✗ Below Minimum (${minReq})`)}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">{isRTL ? 'قيمة السلة قبل الخصم:' : 'Cart value before discount:'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {calcOrderAmount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">{isRTL ? 'نقاط سيكتسبها الطالب كاش باك:' : 'Cashback points earned:'}</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        +{earnedPointsOnPurchase} {isRTL ? 'نقطة' : 'pts'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">
                        {isRTL ? `قيمة الخصم بالريال (سقف ${maxPercent}%):` : `Discount amount (Cap ${maxPercent}%):`}
                      </span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        -{actualDiscount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">{isRTL ? 'النقاط المستهلكة فعلياً:' : 'Points actually consumed:'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {pointsActuallyUsed} {isRTL ? 'نقطة' : 'pts'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {isRTL ? 'المبلغ النهائي المطلوب سداده:' : 'Final Payable Amount:'}
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        {netAmount.toFixed(2)} <span className="text-xs font-bold text-slate-400 font-sans">{isRTL ? 'ر.س' : 'SAR'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: RULE ITEM CARD
// ==========================================
const RuleItemCard = ({
  isRTL = true,
  title,
  description,
  icon,
  badge,
  badgeColor = 'amber',
  sarPerPoint = 0.1,
  enabled = true,
  points = 0,
  unitLabel = 'نقطة',
  onToggle,
  onChangePoints,
}) => {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
  };

  const handleIncrement = () => {
    onChangePoints((points || 0) + 5);
  };

  const handleDecrement = () => {
    onChangePoints(Math.max(0, (points || 0) - 5));
  };

  const sarValue = ((points || 0) * (sarPerPoint || 0.1)).toFixed(2);

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 border ${
        enabled
          ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-amber-500/30'
          : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/60 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap[badgeColor] || colorMap.amber}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Modern Reliable Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          dir="ltr"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
            enabled ? 'bg-amber-500 shadow-sm' : 'bg-slate-300 dark:bg-slate-700'
          }`}
          title={enabled ? (isRTL ? 'تعطيل القاعدة' : 'Disable Rule') : (isRTL ? 'تفعيل القاعدة' : 'Enable Rule')}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Points Stepper Input & Real-Time SAR Equivalent */}
      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
            {isRTL ? 'النقاط الممنوحة:' : 'Points Awarded:'}
          </span>
          {enabled && sarPerPoint > 0 && (
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
              {isRTL ? `تساوي ${sarValue} ر.س` : `Equals ${sarValue} SAR`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            disabled={!enabled || (points || 0) <= 0}
            onClick={handleDecrement}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-30 transition border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
            title={isRTL ? 'تقليل 5 نقاط' : 'Decrease 5 points'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            min="0"
            disabled={!enabled}
            value={points ?? 0}
            onChange={(e) => onChangePoints(parseInt(e.target.value, 10) || 0)}
            className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono text-center font-black disabled:opacity-40 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-inner transition"
          />

          <button
            type="button"
            disabled={!enabled}
            onClick={handleIncrement}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-30 transition border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
            title={isRTL ? 'زيادة 5 نقاط' : 'Increase 5 points'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1 font-sans">
            {unitLabel === 'نقطة' ? (isRTL ? 'نقطة' : 'pts') : unitLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RewardsManagement;
