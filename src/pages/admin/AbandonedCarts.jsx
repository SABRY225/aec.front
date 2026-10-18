import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import {
  ShoppingCart,
  Search,
  Filter,
  Trash2,
  Send,
  MessageCircle,
  Mail,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
  Sparkles,
  ExternalLink,
  RefreshCw,
  BookOpen,
  DollarSign,
  Tag,
  Copy,
  Check,
  ChevronDown,
  X,
  Users,
  ShieldAlert
} from 'lucide-react';
import { adminCartService, couponService } from '../../services/new-api';

// Format phone with country code properly
const formatFullPhone = (phone, phoneCode) => {
  if (!phone) return '';
  const cleanPhone = String(phone).trim();
  if (!phoneCode) return cleanPhone;
  const cleanCode = String(phoneCode).trim();
  if (cleanPhone.startsWith('+')) return cleanPhone;
  if (cleanPhone.startsWith(cleanCode.replace('+', ''))) return `+${cleanPhone}`;
  const formattedCode = cleanCode.startsWith('+') ? cleanCode : `+${cleanCode}`;
  const normalizedNumber = cleanPhone.replace(/^0+/, '');
  return `${formattedCode} ${normalizedNumber}`;
};

// WhatsApp clean phone number (numeric digits only with international code)
const getWhatsAppPhoneDigits = (phone, phoneCode) => {
  if (!phone) return '';
  let full = formatFullPhone(phone, phoneCode);
  return full.replace(/[^\d]/g, '');
};

// Format currency
const formatSAR = (amount) => {
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Format relative time in Arabic
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 5) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours === 1) return 'منذ ساعة واحدة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'منذ يوم';
  if (diffDays === 2) return 'منذ يومين';
  return `منذ ${diffDays} أيام`;
};

const AbandonedCarts = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // State
  const [carts, setCarts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalCarts: 0,
    totalPotentialRevenue: 0,
    abandonedCartsCount: 0,
    activeCartsCount: 0,
    registeredCartsCount: 0,
    guestCartsCount: 0,
    topCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'abandoned' | 'active'
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all' | 'registered' | 'guest'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Recovery Email Modal
  const [emailModalCart, setEmailModalCart] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Delete Cart State
  const [deletingId, setDeletingId] = useState(null);

  // Copied text notification
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Carts & Analytics
  const fetchCarts = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        status: statusFilter,
        userType: userTypeFilter,
        search: search.trim(),
        page,
        limit: 15
      };

      const res = await adminCartService.getCarts(params);
      if (res && res.success) {
        setCarts(res.carts || []);
        if (res.analytics) setAnalytics(res.analytics);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalItems(res.pagination.total || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching admin carts:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات السلات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch active coupons for quick selection in email reminder
  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const res = await couponService.getCoupons();
        const activeList = (res?.data || []).filter(c => c.status === 'active');
        setCoupons(activeList);
      } catch (err) {
        console.warn('Could not load coupons for cart reminder:', err);
      }
    };
    fetchActiveCoupons();
  }, []);

  useEffect(() => {
    fetchCarts();
  }, [statusFilter, userTypeFilter, page]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCarts();
  };

  // Open Email Modal
  const openEmailModal = (cart) => {
    setEmailModalCart(cart);
    setSelectedCoupon('');
    setCustomMessage('');
  };

  // Send Recovery Email
  const handleSendReminder = async () => {
    if (!emailModalCart) return;
    try {
      setSendingEmail(true);
      await adminCartService.sendCartReminder(emailModalCart._id, {
        couponCode: selectedCoupon || undefined,
        customMessage: customMessage.trim() || undefined
      });
      toast.success('تم إرسال بريد التذكير والعرض الترويجي للعميل بنجاح 🚀');
      setEmailModalCart(null);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      toast.error(error.response?.data?.message || 'فشل إرسال بريد التذكير');
    } finally {
      setSendingEmail(false);
    }
  };

  // Delete Cart
  const handleDeleteCart = async (cartId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه السلة نهائياً؟')) return;
    try {
      setDeletingId(cartId);
      await adminCartService.deleteCart(cartId);
      toast.success('تم حذف السلة بنجاح');
      setCarts(prev => prev.filter(c => c._id !== cartId));
      fetchCarts();
    } catch (error) {
      console.error('Delete cart error:', error);
      toast.error('فشل في حذف السلة');
    } finally {
      setDeletingId(null);
    }
  };

  // Generate WhatsApp Direct URL
  const generateWhatsAppUrl = (cart) => {
    const u = cart.user;
    if (!u || !u.phone) return null;
    const phoneDigits = getWhatsAppPhoneDigits(u.phone, u.phoneCode);
    if (!phoneDigits) return null;

    const studentName = `${u.firstName || ''}`.trim() || 'عزيزنا العميل';
    const courseTitles = (cart.items || []).map(i => `"${i.title}"`).join(' و ');

    const message = `مرحباً ${studentName} 👋\nمعك فريق أكاديمية إيس (AEC).\n\nلاحظنا اهتمامك بالتسجيل في دورة: ${courseTitles}، وأنك تركتها في سلة مشترياتك.\n\nيسعدنا مساعدتك في أي استفسار أو تزويدك بكود خصم استثنائي لإتمام تسجيلك الآن! هل تود البدء معنا؟ ✨`;

    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info('تم نسخ الرقم إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20">
              <ShoppingCart size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                تتبع سلات الشراء واستعادة المبيعات
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                تتبع السلات المعلقة والمتروكة وتواصل مباشرة مع الطلاب المهتمين عبر واتساب والبريد لزيادة نسبة التحويل.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCarts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm disabled:opacity-60 text-sm font-medium"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-amber-500' : ''} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Potential Revenue */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              قيمة المبيعات المحتملة في السلات
            </span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatSAR(analytics.totalPotentialRevenue)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">ر.س</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            إجمالي قيمة الدورات المتروكة في سلات العملاء الحالية
          </p>
        </div>

        {/* Abandoned Carts (>24h) */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 dark:border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
              سلات متروكة (أكثر من 24 ساعة)
            </span>
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {analytics.abandonedCartsCount}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">سلة متروكة</span>
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-2 font-medium">
            فرص بيعية ملحة تتطلب تذكير مباشر أو كود خصم
          </p>
        </div>

        {/* Active Carts (<24h) */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              سلات نشطة حديثاً (&lt; 24 ساعة)
            </span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <Flame size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics.activeCartsCount}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">سلة نشطة</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            طلاب يتصفحون ويضيفون دورات حالياً
          </p>
        </div>

        {/* Registered Leads */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 dark:border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
              عملاء مسجلين بمعلومات اتصال
            </span>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics.registeredCartsCount}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              من أصل {analytics.totalCarts}
            </span>
          </div>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-2 font-medium">
            يمكن مراسلتهم فوراً عبر واتساب أو البريد
          </p>
        </div>
      </div>

      {/* Top Added Courses Widget (High Purchase Intent) */}
      {analytics.topCourses && analytics.topCourses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                أكثر الدورات إضافة في السلات (اهتمام شرائي عالي)
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50">
              Top 5 High-Intent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.topCourses.map((c, idx) => (
              <div
                key={c._id || idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-amber-400/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={c.title}>
                    {c.title}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {c.count} {c.count === 1 ? 'سلة' : 'سلات'}
                    </span>
                    <span>{formatSAR(c.totalValue)} ر.س</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطالب، البريد الإلكتروني، رقم الهاتف، أو اسم الدورة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </form>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => { setStatusFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => { setStatusFilter('abandoned'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  statusFilter === 'abandoned'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                <AlertTriangle size={13} />
                <span>متروكة (&gt;24 س)</span>
              </button>
              <button
                onClick={() => { setStatusFilter('active'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  statusFilter === 'active'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <Flame size={13} />
                <span>نشطة (&lt;24 س)</span>
              </button>
            </div>

            {/* User Type Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => { setUserTypeFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userTypeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                جميع الحسابات
              </button>
              <button
                onClick={() => { setUserTypeFilter('registered'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  userTypeFilter === 'registered'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                }`}
              >
                <User size={13} />
                <span>مسجلين فقط</span>
              </button>
              <button
                onClick={() => { setUserTypeFilter('guest'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userTypeFilter === 'guest'
                    ? 'bg-slate-300 dark:bg-slate-650 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                زوار
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Carts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw size={36} className="animate-spin text-amber-500 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">جاري فحص وتحديث سلات العملاء...</p>
          </div>
        ) : carts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <ShoppingCart size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">لا توجد سلات مشتريات مطابقة</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              لم يتم العثور على أي سلات مشتريات تطابق معايير البحث الحالية. يمكنك تغيير الفلتر أو تجربة كلمة بحث أخرى.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {carts.map((cart) => {
              const u = cart.user;
              const hasPhone = Boolean(u && u.phone);
              const hasEmail = Boolean(u && u.email);
              const whatsAppUrl = generateWhatsAppUrl(cart);
              const formattedPhone = u ? formatFullPhone(u.phone, u.phoneCode) : '';

              return (
                <div
                  key={cart._id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
                    cart.isAbandoned
                      ? 'border-rose-200 dark:border-rose-900/40 bg-gradient-to-r from-rose-50/20 via-transparent to-transparent'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Customer Info */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                        {u?.photo ? (
                          <img src={u.photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : u ? (
                          <span>{(u.firstName?.[0] || 'U').toUpperCase()}</span>
                        ) : (
                          <User size={22} className="text-slate-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'زائر مؤقت (Guest)'}
                          </h3>

                          {/* Status Badge */}
                          {cart.isAbandoned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                              <AlertTriangle size={12} />
                              متروكة ({cart.hoursSinceUpdate} ساعة)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                              <Flame size={12} />
                              نشطة حديثاً
                            </span>
                          )}

                          {u ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                              حساب مسجل
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              جلسة متصفح #{cart.sessionId?.slice?.(0, 8)}
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                          {hasEmail && (
                            <div className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200">
                              <Mail size={13} className="text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          )}

                          {hasPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400" />
                              <span dir="ltr">{formattedPhone}</span>
                              <button
                                onClick={() => copyToClipboard(formattedPhone, cart._id)}
                                title="نسخ رقم الهاتف"
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                              >
                                {copiedId === cart._id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>آخر نشاط: {formatTimeAgo(cart.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cart Summary & Direct Conversion Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Price & Items Count */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-xs text-slate-400 font-medium">الإجمالي:</span>
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                            {formatSAR(cart.subtotal)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">ر.س</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cart.itemsCount} {cart.itemsCount === 1 ? 'دورة تدريبية' : 'دورات تدريبية'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* WhatsApp Retargeting Button */}
                        {hasPhone ? (
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-600/20"
                            title="مراسلة العميل فوراً عبر واتساب مع رسالة مجهزة باسم الدورة"
                          >
                            <MessageCircle size={15} />
                            <span>مراسلة واتساب</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed opacity-60"
                            title="رقم الهاتف غير متوفر لهذا الزائر"
                          >
                            <MessageCircle size={15} />
                            <span>واتساب غير متاح</span>
                          </button>
                        )}

                        {/* Email Reminder Button */}
                        {/* {hasEmail ? (
                          <button
                            onClick={() => openEmailModal(cart)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-amber-500/20"
                            title="إرسال إيميل تذكير بالسلة مع كود خصم ترويجي"
                          >
                            <Mail size={15} />
                            <span>إرسال تذكير</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed opacity-60"
                            title="البريد الإلكتروني غير متوفر لهذا الزائر"
                          >
                            <Mail size={15} />
                            <span>تذكير</span>
                          </button>
                        )} */}

                        {/* Delete Cart Button */}
                        <button
                          onClick={() => handleDeleteCart(cart._id)}
                          disabled={deletingId === cart._id}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                          title="حذف هذه السلة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Courses in this Cart */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <BookOpen size={14} className="text-amber-500" />
                      <span>الدورات الموجودة في السلة:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {cart.items.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.title}>
                              {item.title}
                            </p>
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              {formatSAR(item.displayPrice ?? item.price ?? 0)} ر.س
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              عرض الصفحة {page} من أصل {totalPages} (إجمالي {totalItems} سلة)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recovery Email Modal */}
      {emailModalCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setEmailModalCart(null)}
              className="absolute top-5 left-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <Send size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  إرسال تذكير استعادة السلة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  توجيه بريد إلكتروني تفاعلي وفاخر للعميل مع رابط مباشر للدفع.
                </p>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">المستلم:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {emailModalCart.user?.firstName} {emailModalCart.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البريد الإلكتروني:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300" dir="ltr">
                  {emailModalCart.user?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد الدورات:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {emailModalCart.itemsCount} (بقيمة {formatSAR(emailModalCart.subtotal)} ر.س)
                </span>
              </div>
            </div>

            {/* Select Coupon Incentive */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                إرفاق كود خصم تحفيزي (اختياري)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCoupon}
                  onChange={(e) => setSelectedCoupon(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">بدون كود خصم (تذكير بالدورة فقط)</option>
                  {coupons.map((c) => (
                    <option key={c._id} value={c.code}>
                      كود: {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ر.س`} خصم)
                    </option>
                  ))}
                </select>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Tag size={18} />
                </div>
              </div>
            </div>

            {/* Custom Friendly Message */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                رسالة مخصصة للعميل (اختياري)
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="أهلاً بك! لقد حجزنا مقعدك في الدورة ويمكنك استخدام الكود للحصول على خصم خاص ينتهي قريباً..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEmailModalCart(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sendingEmail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-60"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>إرسال بريد التذكير الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedCarts;
