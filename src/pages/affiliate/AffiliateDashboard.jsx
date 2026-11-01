import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';
import {
  Wallet,
  Coins,
  TrendingUp,
  ShoppingCart,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { affiliatePortalService } from '../../services/affiliate.service';

const AffiliateDashboard = () => {
  const { affiliate, refreshProfile } = useOutletContext();
  const { isRTL } = useLanguage();
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Payout Request Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [bankForm, setBankForm] = useState({
    bankName: affiliate?.bankDetails?.bankName || '',
    accountHolderName: affiliate?.bankDetails?.accountHolderName || '',
    iban: affiliate?.bankDetails?.iban || '',
  });
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const siteUrl = window.location.origin;
  const referralLink = `${siteUrl}/explore?ref=${affiliate?.code || ''}`;

  useEffect(() => {
    fetchRecentConversions();
  }, []);

  const fetchRecentConversions = async () => {
    try {
      setLoading(true);
      const res = await affiliatePortalService.getMyConversions(1, 5);
      if (res.success) {
        setConversions(res.data.conversions || []);
      }
    } catch (err) {
      console.error('Error fetching recent conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      toast.success(isRTL ? 'تم نسخ كود الترويج بنجاح!' : 'Promo code copied successfully!');
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      toast.success(isRTL ? 'تم نسخ رابط الإحالة المباشر!' : 'Referral link copied successfully!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error(isRTL ? 'يرجى إدخال مبلغ سحب صحيح' : 'Please enter a valid payout amount');
      return;
    }

    if (amount > (affiliate?.availableBalance || 0)) {
      toast.error(
        isRTL 
          ? `المبلغ المطلوب يتجاوز رصيدك المتاح (${affiliate?.availableBalance || 0} ر.س)`
          : `Requested amount exceeds available balance (${affiliate?.availableBalance || 0} SAR)`
      );
      return;
    }

    if (!bankForm.iban.trim()) {
      toast.error(isRTL ? 'يرجى إدخال رقم الآيبان (IBAN) لاستلام الحوالة البنكية' : 'Please enter your IBAN for bank transfer');
      return;
    }

    try {
      setSubmittingPayout(true);
      const res = await affiliatePortalService.requestPayout({
        amount,
        requestNotes: withdrawNotes,
        bankDetails: bankForm,
      });

      if (res.success) {
        toast.success(res.message || (isRTL ? 'تم إرسال طلب السحب بنجاح!' : 'Payout request submitted successfully!'));
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawNotes('');
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل في إرسال طلب السحب' : 'Failed to submit payout request'));
    } finally {
      setSubmittingPayout(false);
    }
  };

  const ArrowNavIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-8 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Welcome & Promotion Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 border border-primary-500/20 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRTL ? 'لوحة تحكم المسوّق بالعمولة' : 'Affiliate Marketer Dashboard'}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isRTL ? `أهلاً بك، ${affiliate?.firstName} ${affiliate?.lastName}` : `Welcome back, ${affiliate?.firstName} ${affiliate?.lastName}`} 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isRTL ? (
                <>
                  شارك كود الخصم أو رابط الإحالة الخاص بك مع متابعيك، وسيحصلون على{' '}
                  <strong className="text-emerald-400 font-bold">
                    خصم {affiliate?.discountType === 'percentage' ? `${affiliate?.discountValue}%` : `${affiliate?.discountValue} ر.س`}
                  </strong>{' '}
                  على الدورات، بينما تربح أنت{' '}
                  <strong className="text-amber-400 font-bold">
                    {affiliate?.commissionType === 'percentage' ? `${affiliate?.commissionValue}% من قيمة الطلب` : `${affiliate?.commissionValue} ر.س عن كل عملية شراء`}
                  </strong>
                  !
                </>
              ) : (
                <>
                  Share your discount code or referral link with your audience. They get{' '}
                  <strong className="text-emerald-400 font-bold">
                    {affiliate?.discountType === 'percentage' ? `${affiliate?.discountValue}% discount` : `${affiliate?.discountValue} SAR off`}
                  </strong>{' '}
                  on courses, while you earn{' '}
                  <strong className="text-amber-400 font-bold">
                    {affiliate?.commissionType === 'percentage' ? `${affiliate?.commissionValue}% commission` : `${affiliate?.commissionValue} SAR per purchase`}
                  </strong>
                  !
                </>
              )}
            </p>
          </div>

          {/* Quick Actions / Balance Badge */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-4">
            <div>
              <span className="text-xs text-slate-300 block">
                {isRTL ? 'الرصيد المتاح للسحب الآن' : 'Available for Withdrawal'}
              </span>
              <div className="text-3xl font-black text-emerald-400 mt-0.5">
                {(affiliate?.availableBalance || 0).toLocaleString()} <span className="text-sm font-bold text-white">{isRTL ? 'ر.س' : 'SAR'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setWithdrawAmount(affiliate?.availableBalance || '');
                setShowWithdrawModal(true);
              }}
              disabled={(affiliate?.availableBalance || 0) <= 0}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isRTL ? 'طلب سحب الأرباح 💰' : 'Withdraw Earnings 💰'}
            </button>
          </div>
        </div>
      </div>

      {/* Shareable Promo Code & Referral Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Promo Code Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isRTL ? 'كود الخصم الترويجي' : 'Promotional Discount Code'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRTL ? 'شاركه ليستخدمه الطلاب في صفحة الدفع' : 'Share with students to use during checkout'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              {affiliate?.discountType === 'percentage' 
                ? (isRTL ? `خصم ${affiliate?.discountValue}%` : `${affiliate?.discountValue}% OFF`) 
                : (isRTL ? `خصم ${affiliate?.discountValue} ر.س` : `${affiliate?.discountValue} SAR OFF`)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xl font-black text-primary-600 dark:text-primary-400 tracking-wider">
              {affiliate?.code}
            </span>
            <button
              onClick={() => handleCopy(affiliate?.code, 'code')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ الكود' : 'Copy Code')}</span>
            </button>
          </div>
        </div>

        {/* Direct Referral Link Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isRTL ? 'رابط الإحالة المباشر' : 'Direct Referral Link'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRTL ? 'رابط مباشر للدورات مع كود الإحالة' : 'Direct link to courses with your referral attached'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
              {isRTL ? 'رابط جاهز' : 'Ready Link'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 gap-2">
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate max-w-[240px]">
              {referralLink}
            </span>
            <button
              onClick={() => handleCopy(referralLink, 'link')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ الرابط' : 'Copy Link')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'إجمالي الأرباح المكتسبة' : 'Total Earnings'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(affiliate?.totalEarned || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {isRTL ? 'جميع العمولات من تاريخ الانضمام' : 'All-time earned commissions'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'الرصيد المتاح للسحب' : 'Available Balance'}
            </p>
            <h3 className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-1">
              {(affiliate?.availableBalance || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isRTL ? 'جاهز للتحويل لحسابك البنكي' : 'Ready for bank payout'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders / Conversions */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'عدد عمليات الشراء' : 'Total Sales / Orders'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {affiliate?.totalSalesCount || 0}
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isRTL ? 'طالب اشتروا عبر كودك' : 'Students enrolled via code'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'الأرباح المسحوبة بنجاح' : 'Total Paid Out'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(affiliate?.totalPaid || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isRTL ? 'حوالات بنكية مكتملة' : 'Completed bank transfers'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Sales / Conversions Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRTL ? 'آخر المبيعات والعمولات المحققة' : 'Recent Sales & Earned Commissions'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRTL ? 'سجل حي بالعمليات التي تمت باستخدام كود الخصم الخاص بك' : 'Live record of recent orders generated via your code'}
            </p>
          </div>

          <Link
            to="/affiliate/conversions"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>{isRTL ? 'عرض كل المبيعات' : 'View all sales'}</span>
            <ArrowNavIcon className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : conversions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {isRTL ? 'لم يتم تسجيل مبيعات حتى الآن' : 'No sales recorded yet'}
            </p>
            <p className="text-xs text-slate-400">
              {isRTL ? 'ابدأ بنشر كودك الترويجي لجني أرباحك الأولى!' : 'Start sharing your promo code to earn your first commission!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 text-start">{isRTL ? 'رقم الطلب / التاريخ' : 'Order ID / Date'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'الدورات المشتراة' : 'Purchased Courses'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'قيمة الطلب' : 'Order Amount'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'ربحك (العمولة)' : 'Commission'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {conversions.map((conv) => (
                  <tr key={conv._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{conv.orderId}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(conv.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[220px] truncate">
                      {conv.courseIds?.map((c) => c.title).join(', ') || (isRTL ? 'دورة تدريبية' : 'Course')}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {(conv.orderAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </td>

                    <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      +{(conv.commissionAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isRTL ? 'محتسبة ومضافة لرصيدك' : 'Credited to balance'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: REQUEST PAYOUT / WITHDRAWAL */}
      {/* ======================================================== */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isRTL ? 'طلب سحب الأرباح' : 'Withdraw Earnings'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRTL ? 'رصيدك المتاح:' : 'Available balance:'}{' '}
                    <strong className="text-emerald-500 font-bold">{affiliate?.availableBalance || 0} {isRTL ? 'ر.س' : 'SAR'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRTL ? 'المبلغ المراد سحبه بالريال السعودي' : 'Payout Amount (SAR)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={affiliate?.availableBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={isRTL ? 'مثال: 500' : 'e.g. 500'}
                    className="w-full px-4 py-2.5 rounded-xl text-lg font-black bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 ${isRTL ? 'left-3.5' : 'right-3.5'}`}>
                    {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>

              {/* Bank Details Confirmation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-primary-500" />
                  <span>{isRTL ? 'بيانات الحساب البنكي لاستلام الحوالة' : 'Receiving Bank Account Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">
                      {isRTL ? 'اسم البنك' : 'Bank Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                      placeholder={isRTL ? 'مثال: الراجحي / الأهلي' : 'e.g. Al Rajhi Bank'}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">
                      {isRTL ? 'اسم صاحب الحساب' : 'Beneficiary Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm((p) => ({ ...p, accountHolderName: e.target.value }))}
                      placeholder={isRTL ? 'الاسم الثلاثي' : 'Full Name'}
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">
                    {isRTL ? 'رقم الآيبان (IBAN)' : 'IBAN'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.iban}
                    onChange={(e) => setBankForm((p) => ({ ...p, iban: e.target.value.toUpperCase() }))}
                    placeholder="SA0000000000000000000000"
                    className="w-full px-3 py-1.5 rounded-xl text-xs font-mono uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {isRTL ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder={isRTL ? 'أي ملاحظة تود إرفاقها للإدارة...' : 'Any note to administrators...'}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submittingPayout ? (isRTL ? 'جاري إرسال الطلب...' : 'Submitting...') : (isRTL ? 'تأكيد إرسال طلب السحب' : 'Confirm Payout Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateDashboard;
