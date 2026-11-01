import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';
import {
  TrendingUp,
  Search,
  RefreshCw,
  CheckCircle2,
  Calendar,
  BookOpen,
  DollarSign,
  ArrowDownLeft,
  ArrowDownRight
} from 'lucide-react';
import { affiliatePortalService } from '../../services/affiliate.service';

const AffiliateConversions = () => {
  const { affiliate } = useOutletContext();
  const { isRTL } = useLanguage();
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchConversions(page);
  }, [page]);

  const fetchConversions = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await affiliatePortalService.getMyConversions(currentPage, 15);
      if (res.success) {
        setConversions(res.data.conversions || []);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching conversions:', err);
      toast.error(isRTL ? 'فشل في تحميل سجل المبيعات' : 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const CommissionArrow = isRTL ? ArrowDownLeft : ArrowDownRight;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isRTL ? 'سجل المبيعات والتحويلات' : 'Sales & Conversions History'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isRTL 
                  ? `كافة عمليات الشراء التي تمت بنجاح عبر كودك الترويجي (${affiliate?.code})`
                  : `All purchases completed using your referral promo code (${affiliate?.code})`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchConversions(page)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isRTL ? 'تحديث السجل' : 'Refresh History'}</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-sm">
              {isRTL ? 'جاري تحميل سجل المبيعات...' : 'Loading sales conversions...'}
            </p>
          </div>
        ) : conversions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isRTL ? 'لا توجد عمليات مسجلة بعد' : 'No conversions recorded yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isRTL 
                ? 'شارك كود الخصم الخاص بك مع جمهورك أو أصدقائك، وستظهر كل عملية شراء وعمولتك هنا فوراً.' 
                : 'Share your discount code with your audience or colleagues, and all referral purchases and commissions will appear here immediately.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'تاريخ الشراء' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'الدورات المشتراة' : 'Purchased Courses'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'قيمة الطلب' : 'Order Amount'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'الخصم الممنوح' : 'Discount Given'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'عمولتك المكتسبة' : 'Your Commission'}</th>
                  <th className="py-3.5 px-4 text-start">{isRTL ? 'حالة العملية' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {conversions.map((conv) => (
                  <tr key={conv._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/25 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{conv.orderId}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      <div>{new Date(conv.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(conv.createdAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[240px] truncate">
                        {conv.courseIds?.map((c) => c.title).join(', ') || (isRTL ? 'دورة تعليمية' : 'Course')}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {(conv.orderAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </td>

                    <td className="py-4 px-4 text-xs font-bold text-rose-600 dark:text-rose-400">
                      -{(conv.discountAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-black text-sm text-emerald-600 dark:text-emerald-400">
                        <CommissionArrow className="w-3.5 h-3.5" />
                        <span>+{(conv.commissionAmount || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isRTL 
                ? `صفحة ${page} من ${totalPages} (إجمالي ${totalCount} عملية)`
                : `Page ${page} of ${totalPages} (${totalCount} conversions)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateConversions;
