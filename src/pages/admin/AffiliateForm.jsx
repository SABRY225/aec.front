import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import {
  ArrowRight,
  ArrowLeft,
  Coins,
  User,
  Mail,
  Phone,
  Lock,
  Tag,
  Percent,
  Calendar,
  Building,
  CreditCard,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Key,
  Info,
  DollarSign
} from 'lucide-react';
import { adminAffiliateService } from '../../services/affiliate.service';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  code: '',
  discountType: 'percentage',
  discountValue: 15,
  commissionType: 'fixed',
  commissionValue: 50,
  isForever: true,
  expiresAt: '',
  status: 'active',
  notes: '',
  bankDetails: {
    bankName: '',
    accountHolderName: '',
    iban: '',
    accountNumber: '',
  },
};

const AffiliateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Simulation test amount
  const [simAmount, setSimAmount] = useState(500);

  useEffect(() => {
    if (isEdit) {
      fetchAffiliateDetails();
    }
  }, [id]);

  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAffiliateService.getAffiliateById(id);
      if (res.success && res.data?.affiliate) {
        const aff = res.data.affiliate;
        setFormData({
          firstName: aff.firstName || '',
          lastName: aff.lastName || '',
          email: aff.email || '',
          password: '',
          phone: aff.phone || '',
          code: aff.code || '',
          discountType: aff.discountType || 'percentage',
          discountValue: aff.discountValue ?? '',
          commissionType: aff.commissionType || 'fixed',
          commissionValue: aff.commissionValue ?? '',
          isForever: aff.isForever !== false,
          expiresAt: aff.expiresAt ? new Date(aff.expiresAt).toISOString().slice(0, 10) : '',
          status: aff.status || 'active',
          notes: aff.notes || '',
          bankDetails: {
            bankName: aff.bankDetails?.bankName || '',
            accountHolderName: aff.bankDetails?.accountHolderName || '',
            iban: aff.bankDetails?.iban || '',
            accountNumber: aff.bankDetails?.accountNumber || '',
          },
        });
      } else {
        toast.error(isRTL ? 'لم يتم العثور على المسوق' : 'Affiliate not found');
        navigate('/admin/affiliates');
      }
    } catch (err) {
      console.error('Error fetching affiliate:', err);
      toast.error(isRTL ? 'فشل في جلب بيانات المسوق' : 'Failed to fetch affiliate details');
      navigate('/admin/affiliates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('bank_')) {
      const field = name.replace('bank_', '');
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: result }));
    setShowPassword(true);
    toast.info(isRTL ? 'تم توليد كلمة مرور جديدة' : 'New password generated');
  };

  const generateSuggestedCode = () => {
    const namePart = (formData.firstName || 'AFF').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'CODE';
    const randNum = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${namePart}${randNum}` }));
  };

  // Dynamic simulation calculations
  const simulatedDiscount = formData.discountType === 'percentage'
    ? Math.round(((Number(simAmount) * Number(formData.discountValue || 0)) / 100) * 100) / 100
    : Math.min(Number(simAmount), Number(formData.discountValue || 0));

  const simulatedPaid = Math.max(0, Number(simAmount) - simulatedDiscount);

  const simulatedCommission = formData.commissionType === 'percentage'
    ? Math.round(((Number(simAmount) * Number(formData.commissionValue || 0)) / 100) * 100) / 100
    : Number(formData.commissionValue || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.code.trim()) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول الإلزامية' : 'Please fill all required fields');
      return;
    }

    if (!isEdit && !formData.password.trim()) {
      toast.error(isRTL ? 'يرجى إدخال كلمة المرور للمسوق' : 'Please enter a password for the affiliate');
      return;
    }

    if (formData.discountValue === '' || Number(formData.discountValue) < 0) {
      toast.error(isRTL ? 'يرجى إدخال قيمة خصم صالحة للمشتري' : 'Please enter a valid customer discount');
      return;
    }

    if (formData.commissionValue === '' || Number(formData.commissionValue) < 0) {
      toast.error(isRTL ? 'يرجى إدخال عمولة صالحة للمسوق' : 'Please enter a valid affiliate commission');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        commissionValue: Number(formData.commissionValue),
        expiresAt: formData.isForever ? null : formData.expiresAt || null,
      };

      if (isEdit) {
        if (!payload.password) delete payload.password;
        await adminAffiliateService.updateAffiliate(id, payload);
        toast.success(isRTL ? 'تم تحديث بيانات المسوّق بنجاح' : 'Affiliate updated successfully');
      } else {
        await adminAffiliateService.createAffiliate(payload);
        toast.success(isRTL ? 'تمت إضافة المسوّق الجديد بنجاح' : 'New affiliate added successfully');
      }

      navigate('/admin/affiliates');
    } catch (err) {
      console.error('Error saving affiliate:', err);
      toast.error(err.response?.data?.message || (isRTL ? 'حدث خطأ أثناء حفظ المسوق' : 'Error saving affiliate'));
    } finally {
      setSubmitting(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm font-bold">
          {isRTL ? 'جاري تحميل بيانات المسوّق...' : 'Loading affiliate data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 font-arabic max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/affiliates')}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <BackIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          <span>{isRTL ? 'العودة لقائمة المسوقين' : 'Back to Affiliates'}</span>
        </button>

        <span className="text-xs font-semibold text-slate-400">
          {isRTL 
            ? `لوحة التحكم / نظام الأفلييت / ${isEdit ? 'تعديل مسوق' : 'إضافة مسوق'}`
            : `Dashboard / Affiliates / ${isEdit ? 'Edit Affiliate' : 'Add Affiliate'}`}
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit 
                ? (isRTL ? `تعديل المسوّق: ${formData.firstName} ${formData.lastName}` : `Edit Affiliate: ${formData.firstName} ${formData.lastName}`)
                : (isRTL ? 'إضافة مسوّق جديد (Affiliate Marketer)' : 'Add New Affiliate Marketer')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEdit
                ? (isRTL ? 'تحديث بيانات الحساب، كود الترويج، نسب الخصومات والعمولات المكتسبة' : 'Update account info, promo code, discounts and commission rates')
                : (isRTL ? 'أنشئ حساباً للمسوق، وحدد كود الخصم الترويجي وقيمة ربحه من كل عملية بيع' : 'Create an affiliate account, assign a promo code, and set commission values')}
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
              {formData.code}
            </span>
          </div>
        )}
      </div>

      {/* The Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PERSONAL & LOGIN CREDENTIALS */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRTL ? '1. البيانات الشخصية وبيانات الدخول للبوابة' : '1. Personal Info & Portal Credentials'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRTL 
                  ? 'سيستخدم المسوق هذا البريد وكلمة المرور للدخول إلى بوابة المسوقين (/affiliate/login)' 
                  : 'The affiliate will use this email and password to log in at (/affiliate/login)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الاسم الأول' : 'First Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={isRTL ? 'مثال: أحمد' : 'e.g. John'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الاسم الأخير (العائلة)' : 'Last Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={isRTL ? 'مثال: الغامدي' : 'e.g. Doe'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'البريد الإلكتروني (لتسجيل الدخول)' : 'Email (Login)'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="affiliate@example.com"
                  className="w-full ps-4 pe-10 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'رقم الجوال / الواتساب' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="05xxxxxxxx"
                  className="w-full ps-4 pe-10 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'كلمة المرور' : 'Password'}{' '}
                  {isEdit 
                    ? (isRTL ? '(اتركها فارغة إذا لم ترغب بالتغيير)' : '(leave empty to keep unchanged)') 
                    : <span className="text-rose-500">*</span>}
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Key className="w-3 h-3" />
                  <span>{isRTL ? 'توليد كلمة مرور' : 'Generate'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEdit ? '••••••••' : (isRTL ? 'كلمة المرور' : 'Password')}
                  className="w-full ps-4 pe-10 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'حالة الحساب' : 'Account Status'}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-bold"
              >
                <option value="active">
                  {isRTL ? 'نشط (Active) - الكود يعمل والمسوق يستقبل عمولات' : 'Active - Code active & earning commissions'}
                </option>
                <option value="inactive">
                  {isRTL ? 'معطل مؤقتاً (Inactive)' : 'Inactive'}
                </option>
                <option value="suspended">
                  {isRTL ? 'موقوف (Suspended)' : 'Suspended'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROMO CODE & COMMISSION RULES */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRTL ? '2. إعدادات الكود، خصم المشتري، وعمولة المسوّق' : '2. Promo Code, Customer Discount & Commission'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRTL 
                  ? 'حدد الكود الترويجي، ونسبة أو قيمة الخصم للطالب، وقيمة الربح المالي للمسوق' 
                  : 'Define promo code string, student discount percentage or fixed amount, and affiliate payout earnings'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Promo Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'كود الخصم الترويجي (Promo Code)' : 'Promo Code'} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSuggestedCode}
                  className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {isRTL ? 'اقتراح كود تلقائي' : 'Suggest Code'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder={isRTL ? 'مثال: AHMED20' : 'e.g. CODE20'}
                  className="w-full ps-4 pe-10 py-3 rounded-xl text-base font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 font-black tracking-wider focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isRTL 
                  ? 'هذا هو الكود الذي يدخله الطالب في صفحة الدفع (Checkout) ليحصل على الخصم' 
                  : 'This code is entered by students at checkout to receive the discount'}
              </p>
            </div>

            {/* Discount and Commission Side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
              {/* Buyer Discount */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <Percent className="w-4 h-4" />
                  <span>{isRTL ? 'خصم المشتري (العميل)' : 'Student Discount'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRTL ? 'القيمة التي ستُخصم من إجمالي فاتورة الطالب عند إدخال الكود' : 'Amount deducted from the total cart for student'}
                </p>

                <div className="flex gap-2">
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="percentage">{isRTL ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{isRTL ? 'مبلغ ثابت (ر.س)' : 'Fixed (SAR)'}</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      name="discountValue"
                      required
                      min="0"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '15' : '50'}
                      className="w-full ps-4 pe-10 py-2.5 rounded-xl text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {formData.discountType === 'percentage' ? '%' : (isRTL ? 'ر.س' : 'SAR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Marketer Commission */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>{isRTL ? 'ربح / عمولة المسوّق' : 'Affiliate Commission'}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRTL ? 'المبلغ الذي سيُضاف لرصيد المسوّق عند إتمام عملية الشراء بنجاح' : 'Earnings credited to affiliate balance per order'}
                </p>

                <div className="flex gap-2">
                  <select
                    name="commissionType"
                    value={formData.commissionType}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="fixed">{isRTL ? 'مبلغ ثابت بالريال (ر.س)' : 'Fixed Amount (SAR)'}</option>
                    <option value="percentage">{isRTL ? 'نسبة مئوية من الفاتورة (%)' : 'Order Percentage (%)'}</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      name="commissionValue"
                      required
                      min="0"
                      value={formData.commissionValue}
                      onChange={handleInputChange}
                      placeholder={formData.commissionType === 'fixed' ? '50' : '10'}
                      className="w-full ps-4 pe-10 py-2.5 rounded-xl text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {formData.commissionType === 'fixed' ? (isRTL ? 'ر.س' : 'SAR') : '%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isRTL ? 'محاكاة عملية شراء لدورة بقيمة: ' : 'Simulation on course price: '}
                  </span>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-20 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700 text-xs font-bold bg-white dark:bg-slate-800 mx-1"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{isRTL ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
                <span className="text-emerald-700 dark:text-emerald-400">
                  {isRTL 
                    ? `خصم الطالب: ${simulatedDiscount} ر.س (يدفع ${simulatedPaid} ر.س)`
                    : `Student Discount: ${simulatedDiscount} SAR (pays ${simulatedPaid} SAR)`}
                </span>
                <span className="text-indigo-700 dark:text-indigo-400">
                  {isRTL ? `ربح المسوّق: ${simulatedCommission} ر.س` : `Affiliate Commission: ${simulatedCommission} SAR`}
                </span>
              </div>
            </div>

            {/* Validity Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="isForever"
                  checked={formData.isForever}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>{isRTL ? 'كود الخصم صالح ومستمر دائماً (Forever)' : 'Promo code is permanently active (Forever)'}</span>
              </label>

              {!formData.isForever && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{isRTL ? 'تاريخ انتهاء الصلاحية:' : 'Expiration Date:'}</span>
                  <input
                    type="date"
                    name="expiresAt"
                    required={!formData.isForever}
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: BANK DETAILS (OPTIONAL) */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/80">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRTL ? '3. بيانات الحساب البنكي لتحويل الأرباح (اختياري)' : '3. Bank Account Information (Optional)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRTL ? 'يمكن للمسوق إضافتها لاحقاً من بوابته الخاصة عند تقديم طلب سحب الأرباح' : 'Affiliate can also add or update this later in their portal'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'اسم البنك' : 'Bank Name'}
              </label>
              <input
                type="text"
                name="bank_bankName"
                value={formData.bankDetails.bankName}
                onChange={handleInputChange}
                placeholder={isRTL ? 'مثال: مصرف الراجحي / البنك الأهلي' : 'e.g. Al Rajhi Bank / SNB'}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'اسم صاحب الحساب البنكي (المستفيد)' : 'Account Beneficiary Name'}
              </label>
              <input
                type="text"
                name="bank_accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder={isRTL ? 'الاسم المطابق لبطاقة الحساب' : 'Beneficiary Name'}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'رقم الآيبان الدولي (IBAN)' : 'IBAN'}
              </label>
              <input
                type="text"
                name="bank_iban"
                value={formData.bankDetails.iban}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    bankDetails: { ...p.bankDetails, iban: e.target.value.toUpperCase() },
                  }))
                }
                placeholder="SA0000000000000000000000"
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ADMIN NOTES (INTERNAL) */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-700/80">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isRTL ? '4. ملاحظات داخلية للإدارة (اختياري)' : '4. Internal Admin Notes (Optional)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRTL ? 'ملاحظات مرجعية خاصة بإدارة المنصة لا تظهر للمسوق' : 'Internal reference notes for admins (hidden from affiliate)'}
              </p>
            </div>
          </div>

          <textarea
            rows={3}
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder={isRTL ? 'أي ملاحظة مرجعية خاصة بالاتفاق أو الحملة...' : 'Any internal notes regarding campaign or agreement...'}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/affiliates')}
            className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isRTL ? 'إلغاء والعودة' : 'Cancel & Return'}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-600/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting 
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
              : isEdit 
                ? (isRTL ? 'حفظ التعديلات' : 'Save Changes') 
                : (isRTL ? 'إضافة المسوّق وتفعيل الكود' : 'Add Affiliate & Activate Code')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AffiliateForm;
