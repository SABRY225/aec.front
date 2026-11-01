import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Check,
  Percent,
  Coins,
  Power,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  Building,
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { adminAffiliateService } from '../../services/affiliate.service';

const AffiliateManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('affiliates'); // 'affiliates' | 'conversions' | 'payouts'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Affiliates state
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesSearch, setAffiliatesSearch] = useState('');
  const [affiliatesStatusFilter, setAffiliatesStatusFilter] = useState('');

  // Conversions state
  const [conversions, setConversions] = useState([]);
  const [conversionsLoading, setConversionsLoading] = useState(false);
  const [conversionsSearch, setConversionsSearch] = useState('');

  // Payouts state
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsStatusFilter, setPayoutsStatusFilter] = useState('');

  const [copiedCode, setCopiedCode] = useState(null);

  // Process Payout Modal
  const [payoutModal, setPayoutModal] = useState({
    isOpen: false,
    payout: null,
    action: 'approve', // 'approve' | 'reject'
    adminNotes: '',
    transactionRef: '',
    isSubmitting: false,
  });

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    affiliate: null,
    isDeleting: false,
  });

  useEffect(() => {
    fetchStats();
    fetchAffiliates();
  }, []);

  useEffect(() => {
    if (activeTab === 'conversions') {
      fetchConversions();
    } else if (activeTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await adminAffiliateService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching affiliate stats:', err);
    }
  };

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const res = await adminAffiliateService.getAllAffiliates({
        search: affiliatesSearch,
        status: affiliatesStatusFilter,
      });
      if (res.success) {
        setAffiliates(res.data.affiliates || []);
      }
    } catch (err) {
      console.error('Error fetching affiliates:', err);
      toast.error(isRTL ? 'فشل في تحميل قائمة المسوقين' : 'Failed to load affiliates list');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversions = async () => {
    try {
      setConversionsLoading(true);
      const res = await adminAffiliateService.getAllConversions({
        search: conversionsSearch,
      });
      if (res.success) {
        setConversions(res.data.conversions || []);
      }
    } catch (err) {
      console.error('Error fetching conversions:', err);
      toast.error(isRTL ? 'فشل في تحميل سجل المبيعات' : 'Failed to load sales log');
    } finally {
      setConversionsLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      setPayoutsLoading(true);
      const res = await adminAffiliateService.getAllPayouts({
        status: payoutsStatusFilter,
      });
      if (res.success) {
        setPayouts(res.data.payouts || []);
      }
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error(isRTL ? 'فشل في تحميل طلبات السحب' : 'Failed to load payout requests');
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success(isRTL ? 'تم نسخ الكود للحافظة' : 'Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (affiliate) => {
    try {
      const newStatus = affiliate.status === 'active' ? 'inactive' : 'active';
      await adminAffiliateService.updateAffiliate(affiliate._id, { status: newStatus });
      toast.success(
        newStatus === 'active'
          ? (isRTL ? 'تم تفعيل حساب المسوق' : 'Affiliate account activated')
          : (isRTL ? 'تم تعطيل حساب المسوق' : 'Affiliate account deactivated')
      );
      fetchAffiliates();
      fetchStats();
    } catch (err) {
      toast.error(isRTL ? 'فشل في تغيير حالة المسوق' : 'Failed to update affiliate status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.affiliate) return;
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await adminAffiliateService.deleteAffiliate(deleteModal.affiliate._id);
      toast.success(isRTL ? 'تم حذف المسوق بنجاح' : 'Affiliate deleted successfully');
      setDeleteModal({ isOpen: false, affiliate: null, isDeleting: false });
      fetchAffiliates();
      fetchStats();
    } catch (err) {
      toast.error(isRTL ? 'فشل في حذف المسوق' : 'Failed to delete affiliate');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleProcessPayout = async () => {
    const { payout, action, adminNotes, transactionRef } = payoutModal;
    if (!payout) return;

    try {
      setPayoutModal((prev) => ({ ...prev, isSubmitting: true }));
      await adminAffiliateService.processPayout(payout._id, {
        action,
        adminNotes,
        transactionRef,
      });

      toast.success(
        action === 'approve'
          ? (isRTL ? 'تمت الموافقة على طلب السحب واعتماده' : 'Payout approved and marked as completed')
          : (isRTL ? 'تم رفض طلب السحب واستعادة الرصيد للمسوق' : 'Payout rejected and balance refunded to affiliate')
      );
      setPayoutModal({
        isOpen: false,
        payout: null,
        action: 'approve',
        adminNotes: '',
        transactionRef: '',
        isSubmitting: false,
      });
      fetchPayouts();
      fetchStats();
      fetchAffiliates();
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل في معالجة طلب السحب' : 'Failed to process payout'));
      setPayoutModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isRTL ? 'نظام التسويق بالعمولة (Affiliate Marketing)' : 'Affiliate Marketing Management'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isRTL
                  ? 'إدارة المسوقين، تحديد العمولات والخصومات، ومتابعة سجل المبيعات وطلبات سحب الأرباح'
                  : 'Manage affiliates, commissions, promo discounts, sales conversions, and payout requests'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/affiliates/create')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-600/25 transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'إضافة مسوّق جديد' : 'Add New Affiliate'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Affiliates */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'إجمالي المسوقين' : 'Total Affiliates'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalAffiliates || 0}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRTL ? `${stats?.activeAffiliates || 0} نشط حالياً` : `${stats?.activeAffiliates || 0} Active`}</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sales Generated */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'مبيعات تم جلبها' : 'Sales Generated'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(stats?.totalSales || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {isRTL ? `عبر ${stats?.totalConversions || 0} طلب شراء` : `Across ${stats?.totalConversions || 0} orders`}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Commissions Paid */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'عمولات مستحقة / مدفوعة' : 'Commissions Earned / Paid'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(stats?.totalCommissions || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {isRTL ? `تم صرف ${(stats?.totalPaidOut || 0).toLocaleString()} ر.س` : `Paid out ${(stats?.totalPaidOut || 0).toLocaleString()} SAR`}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRTL ? 'سحوبات معلقة للمراجعة' : 'Pending Withdrawals'}
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {(stats?.pendingPayoutsAmount || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRTL ? `${stats?.pendingPayoutsCount || 0} طلبات معلقة` : `${stats?.pendingPayoutsCount || 0} Pending`}</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('affiliates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'affiliates'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isRTL ? 'قائمة المسوقين' : 'Affiliates List'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'affiliates' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            {affiliates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('conversions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'conversions'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isRTL ? 'سجل المبيعات والتحويلات' : 'Sales & Conversions'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'conversions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            {conversions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
            activeTab === 'payouts'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isRTL ? 'طلبات سحب الأرباح' : 'Payout Requests'}</span>
          {stats?.pendingPayoutsCount > 0 && (
            <span className={`w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}></span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'payouts' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}`}>
            {payouts.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AFFILIATES LIST */}
      {/* ======================================================== */}
      {activeTab === 'affiliates' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-slate-400`} />
              <input
                type="text"
                placeholder={isRTL ? 'البحث بالاسم، الكود، الإيميل أو الجوال...' : 'Search by name, code, email, or phone...'}
                value={affiliatesSearch}
                onChange={(e) => setAffiliatesSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAffiliates()}
                className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={affiliatesStatusFilter}
                onChange={(e) => {
                  setAffiliatesStatusFilter(e.target.value);
                }}
                className="px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{isRTL ? 'نشط فقط' : 'Active Only'}</option>
                <option value="inactive">{isRTL ? 'معطل' : 'Inactive'}</option>
                <option value="suspended">{isRTL ? 'موقوف' : 'Suspended'}</option>
              </select>

              <button
                onClick={fetchAffiliates}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={isRTL ? 'تحديث' : 'Refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Affiliates Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                <p>{isRTL ? 'جاري تحميل المسوقين...' : 'Loading affiliates...'}</p>
              </div>
            ) : affiliates.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'لا يوجد مسوقين مسجلين' : 'No affiliates registered'}
                </p>
                <p className="text-xs text-slate-400">
                  {isRTL ? 'انقر على "إضافة مسوّق جديد" لإنشاء أول حساب مسوق بالعمولة' : 'Click "Add New Affiliate" to create the first affiliate partner'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase">
                    <tr>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'المسوّق' : 'Affiliate'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'كود الترويج' : 'Promo Code'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'خصم المشتري' : 'Buyer Discount'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'عمولة المسوّق' : 'Commission'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'المبيعات المحققة' : 'Sales Done'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الأرباح والرصيد' : 'Earnings & Balance'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                      <th className="py-3.5 px-4 text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {affiliates.map((affiliate) => (
                      <tr key={affiliate._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {affiliate.firstName} {affiliate.lastName}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{affiliate.email}</div>
                            <div className="text-xs text-slate-400 font-mono">{affiliate.phone}</div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 font-mono font-bold text-primary-600 dark:text-primary-400 text-xs">
                            <span>{affiliate.code}</span>
                            <button
                              onClick={() => handleCopy(affiliate.code, affiliate._id)}
                              className="text-slate-400 hover:text-primary-600 transition-colors"
                              title={isRTL ? 'نسخ الكود' : 'Copy Code'}
                            >
                              {copiedCode === affiliate._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                            {affiliate.discountType === 'percentage' ? `${affiliate.discountValue}%` : `${affiliate.discountValue} ${isRTL ? 'ر.س' : 'SAR'}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40">
                            {affiliate.commissionType === 'percentage'
                              ? (isRTL ? `${affiliate.commissionValue}% من الطلب` : `${affiliate.commissionValue}% per order`)
                              : (isRTL ? `${affiliate.commissionValue} ر.س لكل طلب` : `${affiliate.commissionValue} SAR per order`)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {(affiliate.totalSalesAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {affiliate.totalSalesCount || 0} {isRTL ? 'طلب شراء' : 'orders'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              {(affiliate.totalEarned || 0).toLocaleString()} {isRTL ? 'ر.س مكتسب' : 'SAR earned'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              {isRTL ? 'المتاح: ' : 'Available: '}
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {(affiliate.availableBalance || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              affiliate.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${affiliate.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>
                              {affiliate.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                            </span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(affiliate)}
                              title={
                                affiliate.status === 'active'
                                  ? (isRTL ? 'تعطيل الحساب' : 'Deactivate')
                                  : (isRTL ? 'تفعيل الحساب' : 'Activate')
                              }
                              className={`p-1.5 rounded-lg border transition-colors ${
                                affiliate.status === 'active'
                                  ? 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-amber-600 dark:border-slate-700 dark:hover:bg-slate-700'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => navigate(`/admin/affiliates/${affiliate._id}/edit`)}
                              title={isRTL ? 'تعديل بيانات المسوّق' : 'Edit affiliate'}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-primary-400 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteModal({ isOpen: true, affiliate, isDeleting: false })}
                              title={isRTL ? 'حذف المسوّق' : 'Delete affiliate'}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CONVERSIONS & ORDERS */}
      {/* ======================================================== */}
      {activeTab === 'conversions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-slate-400`} />
              <input
                type="text"
                placeholder={isRTL ? 'البحث برقم الطلب أو كود الأفلييت...' : 'Search by order ID or affiliate code...'}
                value={conversionsSearch}
                onChange={(e) => setConversionsSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchConversions()}
                className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none`}
              />
            </div>

            <button
              onClick={fetchConversions}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isRTL ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${conversionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            {conversionsLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                <p>{isRTL ? 'جاري تحميل سجل التحويلات...' : 'Loading conversions...'}</p>
              </div>
            ) : conversions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'لا توجد عمليات بيع مسجلة عبر الأفلييت بعد' : 'No affiliate conversions yet'}
                </p>
                <p className="text-xs text-slate-400">
                  {isRTL
                    ? 'عندما يقوم الطلاب بشراء دورات باستخدام كود المسوق، ستظهر العمليات هنا تلقائياً'
                    : 'When students purchase courses using affiliate promo codes, conversions will automatically appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase">
                    <tr>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'رقم الطلب / التاريخ' : 'Order ID / Date'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'المسوّق والكود' : 'Affiliate & Code'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الطالب المشتري' : 'Buyer Student'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الدورات' : 'Courses'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'قيمة الطلب' : 'Order Value'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الخصم الممنوح' : 'Discount Given'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'عمولة المسوّق' : 'Commission'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {conversions.map((conv) => (
                      <tr key={conv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            #{conv.orderId}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(conv.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} - {new Date(conv.createdAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {conv.affiliateId ? `${conv.affiliateId.firstName} ${conv.affiliateId.lastName}` : (isRTL ? 'مسوق محذوف' : 'Deleted Affiliate')}
                          </div>
                          <span className="inline-block mt-0.5 font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200/60 dark:border-primary-800/60">
                            {conv.affiliateCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {conv.userId ? `${conv.userId.firstName} ${conv.userId.lastName}` : (isRTL ? 'مستخدم' : 'Student')}
                          </div>
                          <div className="text-xs text-slate-400">{conv.userId?.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                            {conv.courseIds?.map((c) => c.title).join(', ') || (isRTL ? 'دورة تدريبية' : 'Course')}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {(conv.orderAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-bold text-rose-600 dark:text-rose-400">
                          -{(conv.discountAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            +{(conv.commissionAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isRTL ? 'مكتمل ومحتسب' : 'Completed'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PAYOUT / WITHDRAWAL REQUESTS */}
      {/* ======================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center gap-2">
              <select
                value={payoutsStatusFilter}
                onChange={(e) => setPayoutsStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="pending">{isRTL ? 'المعلقة فقط (بانتظار التحويل)' : 'Pending Transfer Only'}</option>
                <option value="approved">{isRTL ? 'المكتملة والمحولة' : 'Completed & Transferred'}</option>
                <option value="rejected">{isRTL ? 'المرفوضة' : 'Rejected'}</option>
              </select>
            </div>

            <button
              onClick={fetchPayouts}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isRTL ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${payoutsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            {payoutsLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                <p>{isRTL ? 'جاري تحميل طلبات السحب...' : 'Loading payout requests...'}</p>
              </div>
            ) : payouts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'لا توجد طلبات سحب أرباح' : 'No payout requests'}
                </p>
                <p className="text-xs text-slate-400">
                  {isRTL
                    ? 'ستظهر طلبات السحب المرسلة من قبل المسوقين هنا لمراجعتها واعتماد التحويل'
                    : 'Payout requests submitted by affiliates will appear here for review and execution'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase">
                    <tr>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'المسوّق' : 'Affiliate'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'المبلغ المطلوب' : 'Amount'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'بيانات الحساب البنكي (IBAN)' : 'Bank Details (IBAN)'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'تاريخ الطلب' : 'Request Date'}</th>
                      <th className="py-3.5 px-4 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                      <th className="py-3.5 px-4 text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {payouts.map((payout) => (
                      <tr key={payout._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {payout.affiliateId ? `${payout.affiliateId.firstName} ${payout.affiliateId.lastName}` : (isRTL ? 'مسوق محذوف' : 'Deleted Affiliate')}
                          </div>
                          <div className="text-xs text-slate-400">{payout.affiliateId?.email}</div>
                          <span className="font-mono text-[11px] text-primary-600 dark:text-primary-400 font-bold">
                            {payout.affiliateId?.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-black text-lg text-slate-900 dark:text-white">
                          {payout.amount?.toLocaleString()} <span className="text-xs font-bold text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-xs">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {payout.bankDetails?.bankName || (isRTL ? 'اسم البنك غير محدد' : 'Bank not specified')}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              {isRTL ? 'اسم المستفيد: ' : 'Account Holder: '}
                              {payout.bankDetails?.accountHolderName || '-'}
                            </div>
                            <div className="font-mono font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1">
                              <span>{payout.bankDetails?.iban || '-'}</span>
                              {payout.bankDetails?.iban && (
                                <button
                                  onClick={() => handleCopy(payout.bankDetails.iban, payout._id)}
                                  className="text-slate-400 hover:text-primary-600"
                                  title={isRTL ? 'نسخ الآيبان' : 'Copy IBAN'}
                                >
                                  {copiedCode === payout._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(payout.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              payout.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : payout.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {payout.status === 'approved' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isRTL ? 'تم التحويل' : 'Transferred'}</span>
                              </>
                            ) : payout.status === 'rejected' ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>{isRTL ? 'مرفوض' : 'Rejected'}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>{isRTL ? 'بانتظار التحويل' : 'Pending Transfer'}</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {payout.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  setPayoutModal({
                                    isOpen: true,
                                    payout,
                                    action: 'approve',
                                    adminNotes: '',
                                    transactionRef: '',
                                    isSubmitting: false,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                              >
                                {isRTL ? 'تحويل واعتماد' : 'Approve & Pay'}
                              </button>
                              <button
                                onClick={() =>
                                  setPayoutModal({
                                    isOpen: true,
                                    payout,
                                    action: 'reject',
                                    adminNotes: '',
                                    transactionRef: '',
                                    isSubmitting: false,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-xs font-bold transition-colors"
                              >
                                {isRTL ? 'رفض' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {payout.transactionRef
                                ? `${isRTL ? 'مرجع:' : 'Ref:'} ${payout.transactionRef}`
                                : (isRTL ? 'تمت المعالجة' : 'Processed')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROCESS PAYOUT (APPROVE / REJECT) */}
      {/* ======================================================== */}
      {payoutModal.isOpen && payoutModal.payout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    payoutModal.action === 'approve'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  {payoutModal.action === 'approve' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {payoutModal.action === 'approve'
                      ? (isRTL ? 'اعتماد تحويل الأرباح للمسوّق' : 'Approve & Confirm Payout')
                      : (isRTL ? 'رفض طلب سحب الأرباح' : 'Reject Payout Request')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRTL ? 'المبلغ المطلوب: ' : 'Requested Amount: '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {payoutModal.payout.amount} {isRTL ? 'ر.س' : 'SAR'}
                    </span>
                  </p>
                </div>
              </div>

              {payoutModal.action === 'approve' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {isRTL ? 'البنك: ' : 'Bank: '}
                      {payoutModal.payout.bankDetails?.bankName || '-'}
                    </p>
                    <p className="text-slate-500">
                      {isRTL ? 'المستفيد: ' : 'Account Holder: '}
                      {payoutModal.payout.bankDetails?.accountHolderName || '-'}
                    </p>
                    <p className="font-mono font-bold text-primary-600">
                      {payoutModal.payout.bankDetails?.iban || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRTL ? 'رقم مرجع الحوالة البنكية (اختياري)' : 'Bank Reference Number (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="REF-98432"
                      value={payoutModal.transactionRef}
                      onChange={(e) => setPayoutModal((p) => ({ ...p, transactionRef: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRTL ? 'ملاحظة للمسوّق (اختياري)' : 'Note for Affiliate (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRTL ? 'تم التحويل بنجاح لحسابك البنكي' : 'Successfully transferred to your bank account'}
                      value={payoutModal.adminNotes}
                      onChange={(e) => setPayoutModal((p) => ({ ...p, adminNotes: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRTL ? 'سبب الرفض (سيتم إعادته لرصيد المسوّق المتاح)' : 'Rejection Reason (Funds will return to available balance)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isRTL
                        ? 'مثال: رقم الآيبان غير صحيح، يرجى تحديثه وإعادة الطلب...'
                        : 'e.g. IBAN details mismatch, please update your bank info...'
                    }
                    value={payoutModal.adminNotes}
                    onChange={(e) => setPayoutModal((p) => ({ ...p, adminNotes: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() =>
                    setPayoutModal({
                      isOpen: false,
                      payout: null,
                      action: 'approve',
                      adminNotes: '',
                      transactionRef: '',
                      isSubmitting: false,
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={payoutModal.isSubmitting}
                  onClick={handleProcessPayout}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all ${
                    payoutModal.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {payoutModal.isSubmitting
                    ? (isRTL ? 'جاري المعالجة...' : 'Processing...')
                    : payoutModal.action === 'approve'
                    ? (isRTL ? 'تأكيد التحويل' : 'Confirm Transfer')
                    : (isRTL ? 'تأكيد الرفض' : 'Confirm Rejection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteModal.isOpen && deleteModal.affiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isRTL ? 'هل أنت متأكد من حذف هذا المسوّق؟' : 'Are you sure you want to delete this affiliate?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isRTL
                  ? `سيتم حذف حساب المسوّق (${deleteModal.affiliate.firstName} ${deleteModal.affiliate.lastName}) وتعطيل كود الخصم (${deleteModal.affiliate.code})`
                  : `This will delete affiliate (${deleteModal.affiliate.firstName} ${deleteModal.affiliate.lastName}) and deactivate code (${deleteModal.affiliate.code})`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, affiliate: null, isDeleting: false })}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleteModal.isDeleting ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'نعم، حذف' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateManagement;
