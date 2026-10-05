import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import { useLanguage } from '../../hooks/useLanguage';
import { Wifi, WifiOff, Search, RefreshCw, ChevronLeft, ChevronRight, FileText, CheckCircle, Clock } from 'lucide-react';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const COMM_STATUSES = [
  { value: 'needs_contact', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'contacted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'added_to_group', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'ready', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'new', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
];

const ManagedEnrollments = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const courseType = location.pathname.includes('offline') ? 'onsite' : 'live';
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [communicationStatus, setCommunicationStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminService.getManagedEnrollments({
        courseType,
        page,
        limit: 20,
        search: search || undefined,
        communicationStatus: communicationStatus || undefined,
      });
      setRows(data.enrollments || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
      toast.error(t('admin.managedEnrollments.loadFailed', 'فشل في جلب التسجيلات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [courseType]);

  useEffect(() => {
    load();
  }, [courseType, page, communicationStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const updateRow = async (id, patch) => {
    try {
      setSavingId(id);
      await adminService.updateEnrollmentManagement(id, patch);
      toast.success(t('admin.managedEnrollments.updated', 'تم التحديث بنجاح'));
      load();
    } catch (err) {
      console.error(err);
      toast.error(t('admin.managedEnrollments.updateFailed', 'فشل التحديث'));
    } finally {
      setSavingId(null);
    }
  };

  const getStatusColor = (status) => {
    const st = COMM_STATUSES.find(s => s.value === status);
    return st ? st.color : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
  };

  if (loading && rows.length === 0) return <LoadingNew />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${courseType === 'onsite' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
            {courseType === 'onsite' ? <WifiOff size={24} /> : <Wifi size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {courseType === 'onsite'
                ? t('admin.managedEnrollments.offlineTitle', 'إدارة تسجيلات الحضور (أوفلاين)')
                : t('admin.managedEnrollments.onlineTitle', 'إدارة تسجيلات البث (أونلاين)')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('admin.managedEnrollments.subtitle', 'متابعة التواصل وإرسال روابط المجموعات للطلاب المسجلين')}
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          إجمالي التسجيلات: <span className="font-bold text-slate-800 dark:text-white">{pagination.total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.managedEnrollments.searchPlaceholder', 'ابحث باسم الطالب، الإيميل، الهاتف، الكورس...')}
            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div className="flex gap-4 min-w-[200px]">
          <select
            value={communicationStatus}
            onChange={(e) => { setCommunicationStatus(e.target.value); setPage(1); }}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="">{t('admin.managedEnrollments.allStatuses', 'جميع الحالات')}</option>
            {COMM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.value.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            onClick={() => load()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{t('common.search', 'تحديث')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.student', 'الطالب')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.course', 'الدورة')}</th>
                {courseType === 'onsite' && <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.serial', 'السيريال')}</th>}
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.paid', 'المدفوع')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.contactStatus', 'حالة التواصل')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.managedEnrollments.notes', 'روابط وملاحظات (تحديث تلقائي)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={courseType === 'onsite' ? 6 : 5} className="p-8 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="animate-spin text-blue-500" size={32} />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={courseType === 'onsite' ? 6 : 5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p>{t('admin.managedEnrollments.empty', 'لا توجد تسجيلات مطابقة')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900 dark:text-white">{row.student?.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{row.student?.email}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400" dir="ltr">{row.student?.phone}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-2">{row.course?.title}</div>
                      {row.course?.startDate && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(row.course.startDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                        </div>
                      )}
                    </td>
                    {courseType === 'onsite' && (
                      <td className="p-4 align-top">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                          {row.serialNumber || '—'}
                        </span>
                      </td>
                    )}
                    <td className="p-4 align-top font-medium text-slate-900 dark:text-white">
                      {Number(row.paymentAmount || 0).toLocaleString()} <span className="text-xs text-slate-500">SAR</span>
                      <div className="text-[10px] text-slate-400 mt-1 font-normal">
                        {row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : ''}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <select
                        disabled={savingId === row._id}
                        value={row.communicationStatus || 'needs_contact'}
                        onChange={(e) => updateRow(row._id, { communicationStatus: e.target.value })}
                        className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium appearance-none ${getStatusColor(row.communicationStatus || 'needs_contact')}`}
                      >
                        {COMM_STATUSES.map((s) => (
                          <option key={s.value} value={s.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            {s.value.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      {savingId === row._id && <div className="text-[10px] text-blue-500 mt-1 flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> جاري الحفظ...</div>}
                    </td>
                    <td className="p-4 align-top space-y-2 min-w-[250px]">
                      <input
                        defaultValue={row.groupLink || ''}
                        placeholder={t('admin.managedEnrollments.groupLinkPlaceholder', 'رابط مجموعة الواتساب / التليجرام')}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        onBlur={(e) => {
                          if (e.target.value !== (row.groupLink || '')) {
                            updateRow(row._id, { groupLink: e.target.value });
                          }
                        }}
                      />
                      <textarea
                        defaultValue={row.adminNotes || ''}
                        placeholder={t('admin.managedEnrollments.notesPlaceholder', 'ملاحظات إدارية')}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                        onBlur={(e) => {
                          if (e.target.value !== (row.adminNotes || '')) {
                            updateRow(row._id, { adminNotes: e.target.value });
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('admin.managedEnrollments.page', 'صفحة')} {page} {t('admin.managedEnrollments.of', 'من')} {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagedEnrollments;
