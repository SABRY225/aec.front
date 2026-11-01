import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';
import {
  CreditCard,
  Building,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { affiliatePortalService } from '../../services/affiliate.service';

const AffiliatePayouts = () => {
  const { affiliate, refreshProfile } = useOutletContext();
  const { isRTL } = useLanguage();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bank Form State
  const [bankData, setBankData] = useState({
    bankName: affiliate?.bankDetails?.bankName || '',
    accountHolderName: affiliate?.bankDetails?.accountHolderName || '',
    iban: affiliate?.bankDetails?.iban || '',
    accountNumber: affiliate?.bankDetails?.accountNumber || '',
  });
  const [savingBank, setSavingBank] = useState(false);

  // Withdraw Modal State
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await affiliatePortalService.getMyPayouts();
      if (res.success) {
        setPayouts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error(isRTL ? 'فشل في تحميل سجل طلبات السحب' : 'Failed to load payout history');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSave = async (e) => {
    e.preventDefault();
    if (!bankData.iban.trim()) {
      toast.error(isRTL ? 'يرجى إدخال رقم الآيبان (IBAN)' : 'Please enter your IBAN');
      return;
    }

    try {
      setSavingBank(true);
      const res = await affiliatePortalService.updateProfile({
        bankDetails: {
          ...bankData,
          iban: bankData.iban.trim().toUpperCase(),
        },
      });

      if (res.success) {
        toast.success(isRTL ? 'تم حفظ وتحديث بيانات الحساب البنكي بنجاح' : 'Bank account details saved successfully');
        refreshProfile();
      }
    } catch (err) {
      toast.error(isRTL ? 'فشل في حفظ البيانات البنكية' : 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error(isRTL ? 'يرجى إدخال مبلغ سحب صحيح' : 'Please enter a valid payout amount');
      return;
    }

    if (withdrawAmount > (affiliate?.availableBalance || 0)) {
      toast.error(
        isRTL 
          ? `المبلغ المطلوب يتجاوز رصيدك المتاح (${affiliate?.availableBalance || 0} ر.س)`
          : `Requested amount exceeds available balance (${affiliate?.availableBalance || 0} SAR)`
      );
      return;
    }

    if (!bankData.iban.trim()) {
      toast.error(isRTL ? 'يرجى حفظ رقم الآيبان أولاً قبل إرسال طلب السحب' : 'Please save your IBAN before requesting a payout');
      return;
    }

    try {
      setSubmittingPayout(true);
      const res = await affiliatePortalService.requestPayout({
        amount: withdrawAmount,
        requestNotes: notes,
        bankDetails: bankData,
      });

      if (res.success) {
        toast.success(res.message || (isRTL ? 'تم إرسال طلب السحب بنجاح!' : 'Payout request submitted successfully!'));
        setShowModal(false);
        setAmount('');
        setNotes('');
        fetchPayouts();
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل في إرسال طلب السحب' : 'Failed to submit payout request'));
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isRTL ? 'سحب الأرباح والحساب البنكي' : 'Payouts & Bank Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isRTL 
                ? 'إدارة بيانات حسابك البنكي وتقديم ومتابعة طلبات تحويل العمولات' 
                : 'Manage your bank transfer details and request commission withdrawals'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setAmount(affiliate?.availableBalance || '');
            setShowModal(true);
          }}
          disabled={(affiliate?.availableBalance || 0) <= 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'طلب سحب أرباح جديد' : 'New Payout Request'}</span>
        </button>
      </div>

      {/* Grid: Bank Info Card & Balance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bank Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isRTL ? 'بيانات الحساب البنكي للحوالات' : 'Bank Transfer Information'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {isRTL ? 'يتم تحويل الأرباح على هذا الحساب' : 'Earnings will be deposited to this account'}
            </span>
          </div>

          <form onSubmit={handleBankSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRTL ? 'اسم البنك' : 'Bank Name'}
                </label>
                <input
                  type="text"
                  required
                  value={bankData.bankName}
                  onChange={(e) => setBankData((p) => ({ ...p, bankName: e.target.value }))}
                  placeholder={isRTL ? 'مثال: مصرف الراجحي' : 'e.g. Al Rajhi Bank'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRTL ? 'اسم صاحب الحساب (المستفيد)' : 'Account Beneficiary Name'}
                </label>
                <input
                  type="text"
                  required
                  value={bankData.accountHolderName}
                  onChange={(e) => setBankData((p) => ({ ...p, accountHolderName: e.target.value }))}
                  placeholder={isRTL ? 'الاسم كما هو مسجل في البنك' : 'Name as registered with the bank'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRTL ? 'رقم الآيبان الدولي (IBAN)' : 'International IBAN'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bankData.iban}
                onChange={(e) => setBankData((p) => ({ ...p, iban: e.target.value.toUpperCase() }))}
                placeholder="SA00 0000 0000 0000 0000 0000"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isRTL ? 'يبدأ بـ SA ويتكون من 24 حرف ورقم' : 'Starts with SA and consists of 24 characters'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingBank}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 disabled:opacity-50 transition-colors"
              >
                {savingBank ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ البيانات البنكية' : 'Save Bank Details')}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Balance Cards */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <span className="text-xs text-emerald-100 block">
              {isRTL ? 'الرصيد المتاح للسحب الآن' : 'Available for Withdrawal'}
            </span>
            <div className="text-3xl font-black">
              {(affiliate?.availableBalance || 0).toLocaleString()} <span className="text-base font-bold">{isRTL ? 'ر.س' : 'SAR'}</span>
            </div>

            <div className="pt-3 border-t border-white/20 text-xs text-emerald-50 flex items-center justify-between">
              <span>{isRTL ? 'قيد المراجعة والتحويل:' : 'Pending payout:'}</span>
              <span className="font-bold">{(affiliate?.pendingPayoutAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
            </div>

            <button
              onClick={() => {
                setAmount(affiliate?.availableBalance || '');
                setShowModal(true);
              }}
              disabled={(affiliate?.availableBalance || 0) <= 0}
              className="w-full py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              {isRTL ? 'طلب تحويل المبلغ' : 'Request Payout Now'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary-500" />
              <span>{isRTL ? 'معلومات هامة عن التحويلات' : 'Payout Information'}</span>
            </p>
            <p className="leading-relaxed">
              {isRTL 
                ? 'تتم معالجة وإيداع المبالغ في حسابك البنكي خلال 24 - 48 ساعة عمل من تاريخ تقديم الطلب. تأكد من دقة الآيبان لتفادي أي تأخير.' 
                : 'Payouts are processed and transferred within 24 - 48 business hours. Please ensure your IBAN is accurate to avoid transfer delays.'}
            </p>
          </div>
        </div>
      </div>

      {/* Payout Requests History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {isRTL ? 'سجل طلبات السحب والحوالات' : 'Payouts History'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRTL ? 'تتبع حالة طلباتك والحوالات الصادرة لحسابك' : 'Track the status of your payout requests'}
            </p>
          </div>
          <button
            onClick={fetchPayouts}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            title={isRTL ? 'تحديث السجل' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isRTL ? 'لا توجد طلبات سحب سابقة' : 'No payout requests yet'}
            </p>
            <p className="text-xs text-slate-400">
              {isRTL ? 'عندما تطلب سحب أرباحك، ستتمكن من متابعة حالة الحوالة هنا' : 'Your payout requests will appear here once submitted'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 text-start">{isRTL ? 'تاريخ الطلب' : 'Request Date'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'البنك والآيبان' : 'Bank & IBAN'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'حالة الحوالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-start">{isRTL ? 'ملاحظات الإدارة' : 'Admin Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </td>

                    <td className="py-4 px-4 font-black text-base text-slate-900 dark:text-white">
                      {p.amount?.toLocaleString()} <span className="text-xs font-bold text-slate-400">{isRTL ? 'ر.س' : 'SAR'}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.bankDetails?.bankName || '-'}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {p.bankDetails?.iban || '-'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {p.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isRTL ? 'تم التحويل' : 'Transferred'}</span>
                          </>
                        ) : p.status === 'rejected' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>{isRTL ? 'مرفوض' : 'Rejected'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{isRTL ? 'قيد المراجعة' : 'Pending'}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      {p.transactionRef && (
                        <div className="font-mono text-[11px] text-primary-600 font-bold">
                          {isRTL ? 'مرجع:' : 'Ref:'} {p.transactionRef}
                        </div>
                      )}
                      <div>{p.adminNotes || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Request Payout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isRTL ? 'تقديم طلب سحب أرباح' : 'Submit Payout Request'}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRTL ? 'المبلغ المطلوب بالريال السعودي' : 'Requested Amount (SAR)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={affiliate?.availableBalance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={isRTL ? 'المبلغ' : 'Amount'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-lg font-black bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  {isRTL ? 'الرصيد المتاح:' : 'Available Balance:'} {affiliate?.availableBalance || 0} {isRTL ? 'ر.س' : 'SAR'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRTL ? 'ملاحظة...' : 'Note...'}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'التحويل سيتم إلى:' : 'Transfer will be sent to:'}
                </p>
                <p className="text-slate-500">{bankData.bankName} - {bankData.accountHolderName}</p>
                <p className="font-mono font-bold text-primary-600">
                  {bankData.iban || (isRTL ? 'لم يتم حفظ آيبان بعد' : 'No IBAN saved yet')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submittingPayout ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'تأكيد إرسال الطلب' : 'Confirm Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliatePayouts;
