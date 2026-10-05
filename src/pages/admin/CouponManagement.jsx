import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Check,
  Calendar,
  Percent,
  Coins,
  Power,
  RefreshCw,
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { couponService } from '../../services/new-api';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  isForever: true,
  expiresAt: '',
  status: 'active',
};

const CouponManagement = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getCoupons();
      setCoupons(data.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(t('admin.coupons.loadFailed', 'فشل في تحميل كوبونات الخصم'));
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code?.toLowerCase().includes(q));
  }, [coupons, search]);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [coupons]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingCoupon(null);
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue ?? '',
        isForever: coupon.isForever !== false,
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
          : '',
        status: coupon.status || 'active',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t('admin.coupons.codeCopied', 'تم نسخ الكوبون بنجاح!'));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        isForever: formData.isForever,
        expiresAt: formData.isForever ? null : formData.expiresAt,
        status: formData.status,
      };

      let data;
      if (editingCoupon) {
        data = await couponService.updateCoupon(editingCoupon._id, submitData);
      } else {
        data = await couponService.createCoupon(submitData);
      }

      toast.success(data.message || t('admin.coupons.saved', 'تم حفظ الكوبون بنجاح'));
      closeModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        t('admin.coupons.saveFailed', 'فشل في حفظ الكوبون');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.coupons.confirmDelete', 'هل أنت متأكد من رغبتك في حذف هذا الكوبون؟'))) {
      return;
    }

    try {
      const data = await couponService.deleteCoupon(id);
      toast.success(data.message || t('admin.coupons.deleted', 'تم حذف الكوبون بنجاح'));
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(
        error.response?.data?.message || t('admin.coupons.deleteFailed', 'فشل حذف الكوبون')
      );
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      const nextStatus = coupon.status === 'active' ? 'inactive' : 'active';
      const data = await couponService.updateCouponStatus(coupon._id, nextStatus);
      toast.success(data.message || t('admin.coupons.statusUpdated', 'تم تحديث حالة الكوبون'));
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error(
        error.response?.data?.message || t('admin.coupons.statusFailed', 'فشل تحديث الحالة')
      );
    }
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    const currency = isRTL ? 'ر.س' : 'SAR';
    return `${Number(coupon.discountValue).toFixed(2)} ${currency}`;
  };

  const formatValidity = (coupon) => {
    if (coupon.isForever) return t('admin.coupons.forever', 'صلاحية غير محدودة');
    if (!coupon.expiresAt) return '—';
    return new Date(coupon.expiresAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('admin.coupons.title', 'إدارة كوبونات الخصم')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {t('admin.coupons.subtitle', 'إنشاء وإدارة أكواد وقسائم الخصم وتحديد نسب أو مبالغ التخفيض')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
            title={t('common.refresh', 'تحديث')}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus size={18} />
            <span>{t('admin.coupons.addNew', 'إضافة كوبون جديد')}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            <Ticket size={22} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('admin.coupons.totalCoupons', 'إجمالي الكوبونات')}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
              {stats.total}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('admin.coupons.activeCoupons', 'الكوبونات الفعّالة')}
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.active}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <XCircle size={22} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('admin.coupons.inactiveCoupons', 'المعطلة أو المنتهية')}
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {stats.inactive}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search 
            size={18} 
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? 'right-3.5' : 'left-3.5'}`} 
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.coupons.searchPlaceholder', 'ابحث بكود الخصم...')}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm transition-all ${
              isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRTL ? 'left-3' : 'right-3'}`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t('admin.coupons.count', 'عدد النتائج:')}{' '}
          <span className="font-bold text-slate-800 dark:text-white">{filteredCoupons.length}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                  {t('admin.coupons.code', 'كود الخصم')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                  {t('admin.coupons.discount', 'قيمة الخصم')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                  {t('admin.coupons.validity', 'الصلاحية')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                  {t('admin.coupons.status', 'الحالة')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                  {t('admin.coupons.created', 'تاريخ الإنشاء')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  {t('admin.coupons.actions', 'الإجراءات')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="animate-spin text-emerald-600 dark:text-emerald-400" size={32} />
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {t('admin.coupons.loading', 'جاري تحميل الكوبونات...')}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                      <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                        <Ticket size={36} className="opacity-40 text-slate-500" />
                      </div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
                        {t('admin.coupons.noCoupons', 'لم يتم العثور على أي كوبونات')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {search 
                          ? t('admin.coupons.noMatch', 'لا يوجد كوبون يطابق كلمة البحث الحالية')
                          : t('admin.coupons.createFirst', 'ابدأ بإنشاء أول كوبون خصم لعملائك')}
                      </p>
                      <button
                        onClick={() => openModal()}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        {t('admin.coupons.addNew', 'إضافة كوبون جديد')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group">
                    {/* Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl border border-dashed border-emerald-400 dark:border-emerald-600/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-mono font-bold tracking-wider text-sm flex items-center gap-2">
                          <Ticket size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>{coupon.code}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title={t('admin.coupons.copy', 'نسخ الكود')}
                        >
                          {copiedCode === coupon.code ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                        {coupon.discountType === 'percentage' ? (
                          <Percent size={13} className="text-purple-500" />
                        ) : (
                          <Coins size={13} className="text-amber-500" />
                        )}
                        <span>{formatDiscount(coupon)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({coupon.discountType === 'percentage' ? t('admin.coupons.percentage', 'نسبة') : t('admin.coupons.fixed', 'مبلغ ثابت')})
                        </span>
                      </div>
                    </td>

                    {/* Validity */}
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{formatValidity(coupon)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          coupon.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${coupon.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>
                          {coupon.status === 'active'
                            ? t('admin.coupons.active', 'مفعّل')
                            : t('admin.coupons.inactive', 'معطّل')}
                        </span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(coupon.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleStatus(coupon)}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            coupon.status === 'active'
                              ? 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'border-emerald-200 dark:border-emerald-800/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={coupon.status === 'active' ? t('admin.coupons.deactivate', 'تعطيل') : t('admin.coupons.activate', 'تفعيل')}
                        >
                          <Power size={15} />
                        </button>

                        <button
                          onClick={() => openModal(coupon)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title={t('admin.coupons.edit', 'تعديل')}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('admin.coupons.delete', 'حذف')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Ticket size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {editingCoupon
                      ? t('admin.coupons.edit', 'تعديل كوبون الخصم')
                      : t('admin.coupons.addNew', 'إنشاء كوبون خصم جديد')}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('admin.coupons.code', 'كود الخصم (Promo Code)')} *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="مثال: AEC2026"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono uppercase tracking-wider text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    maxLength={50}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {t('admin.coupons.codeHelp', 'سيتم تحويل الأحرف تلقائياً إلى أحرف كبيرة')}
                  </span>
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('admin.coupons.discountType', 'نوع الخصم')} *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    >
                      <option value="percentage">{t('admin.coupons.percentage', 'نسبة مئوية (%)')}</option>
                      <option value="fixed">{t('admin.coupons.fixed', 'مبلغ ثابت (ر.س)')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('admin.coupons.discountValue', 'قيمة الخصم')} *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? 'مثال: 20' : 'مثال: 150'}
                      required
                      min="0"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Forever Checkbox */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isForever"
                      checked={formData.isForever}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                        {t('admin.coupons.forever', 'صلاحية غير محدودة')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t('admin.coupons.foreverHelp', 'الكوبون صالح دوماً دون تاريخ انتهاء')}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Expiry Date */}
                {!formData.isForever && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('admin.coupons.expiresAt', 'تاريخ الانتهاء')} *
                    </label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      required={!formData.isForever}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('admin.coupons.status', 'حالة الكوبون')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="active">{t('admin.coupons.active', 'مفعّل (جاهز للاستخدام)')}</option>
                    <option value="inactive">{t('admin.coupons.inactive', 'معطّل (موقوف مؤقتاً)')}</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    {t('common.cancel', 'إلغاء')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>{t('admin.coupons.saving', 'جاري الحفظ...')}</span>
                      </>
                    ) : (
                      <span>{editingCoupon ? t('admin.coupons.update', 'تحديث الكوبون') : t('admin.coupons.create', 'إنشاء الكوبون')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
