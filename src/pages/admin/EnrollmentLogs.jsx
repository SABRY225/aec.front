import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import { FileText, Search, Filter, Trash2, Eye, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';

const EnrollmentLogs = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const pageSize = 20;

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getEnrollmentLogs({ 
        page, 
        limit: pageSize,
        search: searchQuery,
        type: filterType
      });
      
      if (res?.success) {
        setLogs(res.logs || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalLogs(res.pagination?.totalLogs || 0);
        setCurrentPage(res.pagination?.currentPage || 1);
      }
    } catch (e) {
      console.error('Failed to fetch enrollment logs:', e);
      toast.error(t('admin.enrollmentLogs.fetchFailed', 'فشل في جلب سجلات التسجيل'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filterType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.enrollmentLogs.confirmDelete', 'هل أنت متأكد من حذف هذا التسجيل؟'))) return;
    try {
      await adminService.deleteEnrollment(id);
      toast.success(t('admin.enrollmentLogs.deleteSuccess', 'تم حذف التسجيل بنجاح'));
      fetchLogs(currentPage);
    } catch (error) {
      toast.error(t('admin.enrollmentLogs.deleteFailed', 'فشل في حذف التسجيل'));
    }
  };

  const getEnrollmentTypeBadgeClass = (type) => {
    switch (type) {
      case 'manual': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getEnrollmentTypeLabel = (type) => {
    switch (type) {
      case 'manual': return t('admin.enrollmentLogs.typeManual', 'يدوي');
      case 'paid': return t('admin.enrollmentLogs.typePaid', 'مدفوع');
      default: return type || '-';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'finished': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'passed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'enrolled': return t('admin.enrollmentLogs.statusEnrolled', 'مسجل');
      case 'in-progress': return t('admin.enrollmentLogs.statusInProgress', 'قيد التقدم');
      case 'finished': return t('admin.enrollmentLogs.statusFinished', 'منتهي');
      case 'passed': return t('admin.enrollmentLogs.statusPassed', 'ناجح');
      default: return status || '-';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('admin.enrollmentLogs.title', 'سجلات التسجيل')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('admin.enrollmentLogs.subtitle', 'متابعة كافة تفاصيل عمليات تسجيل الطلاب')}
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          إجمالي التسجيلات: <span className="font-bold text-slate-800 dark:text-white">{totalLogs}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.enrollmentLogs.searchPlaceholder', 'ابحث بالبريد الإلكتروني أو اسم الطالب...')}
            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div className="flex gap-4 min-w-[300px]">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="all">{t('admin.enrollmentLogs.filterAll', 'جميع التسجيلات')}</option>
            <option value="manual">{t('admin.enrollmentLogs.filterManual', 'تسجيل يدوي')}</option>
            <option value="paid">{t('admin.enrollmentLogs.filterPaid', 'تسجيل مدفوع')}</option>
          </select>
          <button
            onClick={() => fetchLogs(currentPage)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{t('admin.enrollmentLogs.refresh', 'تحديث')}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.enrollmentLogs.tableStudent', 'الطالب')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.enrollmentLogs.tableCourse', 'الدورة')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.enrollmentLogs.tableType', 'النوع')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.enrollmentLogs.tableStatus', 'الحالة')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.enrollmentLogs.tableDate', 'التاريخ')}</th>
                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="animate-spin text-blue-500" size={32} />
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p>{t('admin.enrollmentLogs.noLogs', 'لا توجد سجلات مطابقة للبحث')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">{log.student?.name || '-'}</span>
                        <span className="text-xs text-slate-500">{log.student?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-1">{log.course?.title || '-'}</div>
                      {log.course?.courseType && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 capitalize">
                          {log.course.courseType}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEnrollmentTypeBadgeClass(log.enrollmentType)}`}>
                        {getEnrollmentTypeLabel(log.enrollmentType)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                      {formatDate(log.enrolledAt)}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDelete(log._id)} 
                        className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        title="حذف التسجيل"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('admin.enrollmentLogs.page', 'صفحة')} {currentPage} {t('admin.enrollmentLogs.of', 'من')} {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
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

export default EnrollmentLogs;
