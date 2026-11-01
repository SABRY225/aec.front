import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import {
  UserPlus,
  Search,
  User,
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  XCircle,
  FileClock,
  Coins,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  X
} from 'lucide-react';

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

const getTodayFormatted = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFirstDayOfMonthFormatted = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getCurrentMonthName = (isRtl = true) => {
  return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });
};

const formatCourseType = (type) => {
  switch (type) {
    case 'live':
      return 'تفاعلية (أونلاين)';
    case 'onsite':
      return 'حضورية';
    case 'recorded':
      return 'مسجلة';
    default:
      return type || '—';
  }
};

const formatPhoneForCSV = (phone) => {
  if (!phone) return '—';
  const clean = String(phone).trim();
  if (!clean) return '—';
  return `="${clean}"`;
};

const ManualEnrollment = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [userQuery, setUserQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [reason, setReason] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  const debouncedUserQuery = useDebouncedValue(userQuery, 250);
  const debouncedCourseQuery = useDebouncedValue(courseQuery, 250);

  const [userResults, setUserResults] = useState([]);
  const [courseResults, setCourseResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Excel Export States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('current_month'); // 'current_month' | 'custom' | 'all'
  const [customStartDate, setCustomStartDate] = useState(getFirstDayOfMonthFormatted());
  const [customEndDate, setCustomEndDate] = useState(getTodayFormatted());
  const [isExporting, setIsExporting] = useState(false);

  const canSearchUsers = useMemo(() => debouncedUserQuery.trim().length >= 2, [debouncedUserQuery]);
  const canSearchCourses = useMemo(() => debouncedCourseQuery.trim().length >= 2, [debouncedCourseQuery]);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await adminService.getManualEnrollmentLogs();
      if (res?.success) {
        setLogs(res.logs || []);
      }
    } catch (e) {
      console.error("Failed to fetch logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchLogs();
    }
  }, [showHistory]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!canSearchUsers) {
        setUserResults([]);
        return;
      }
      try {
        setLoadingUsers(true);
        const data = await adminService.searchUsers(debouncedUserQuery.trim(), 10);
        if (cancelled) return;
        setUserResults(data?.results || []);
      } catch (e) {
        if (!cancelled) toast.error(t('admin.manualEnrollment.searchUsersFailed', 'فشل البحث عن المستخدمين'));
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [canSearchUsers, debouncedUserQuery]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!canSearchCourses) {
        setCourseResults([]);
        return;
      }
      try {
        setLoadingCourses(true);
        const data = await adminService.searchCourses(debouncedCourseQuery.trim(), 10);
        if (cancelled) return;
        setCourseResults(data?.results || []);
      } catch (e) {
        if (!cancelled) toast.error(t('admin.manualEnrollment.searchCoursesFailed', 'فشل البحث عن الدورات'));
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [canSearchCourses, debouncedCourseQuery]);

  const onEnroll = async () => {
    if (!selectedUser?._id || !selectedCourse?._id) {
      toast.error(t('admin.manualEnrollment.selectBoth', 'الرجاء اختيار المستخدم والدورة'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.manualEnrollUserToCourse({
        userId: selectedUser._id,
        courseId: selectedCourse._id,
        reason: reason.trim() || undefined,
        paymentAmount: paidAmount !== '' ? Number(paidAmount) : (selectedCourse?.price || 0)
      });

      if (res?.alreadyEnrolled) {
        toast.info(t('admin.manualEnrollment.alreadyEnrolled', 'المستخدم مسجل بالفعل في هذه الدورة'));
      } else if (res?.success) {
        toast.success(t('admin.manualEnrollment.success', 'تم تسجيل المستخدم بنجاح'));
        
        setUserQuery('');
        setCourseQuery('');
        setReason('');
        setPaidAmount('');
        setSelectedUser(null);
        setSelectedCourse(null);
        setUserResults([]);
        setCourseResults([]);
        
        if (showHistory) {
          fetchLogs();
        }
      } else {
        toast.error(res?.message || t('admin.manualEnrollment.failed', 'فشل التسجيل'));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || t('admin.manualEnrollment.failed', 'فشل التسجيل'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      let filterStart = null;
      let filterEnd = null;
      let periodFileLabel = 'all';

      const now = new Date();

      if (exportPeriod === 'current_month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        filterStart = new Date(year, month, 1, 0, 0, 0, 0);
        filterEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        periodFileLabel = `month_${year}_${String(month + 1).padStart(2, '0')}`;
      } else if (exportPeriod === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error(t('admin.manualEnrollment.dateRangeRequired', 'يرجى تحديد تاريخ البداية وتاريخ النهاية'));
          setIsExporting(false);
          return;
        }
        filterStart = new Date(`${customStartDate}T00:00:00`);
        filterEnd = new Date(`${customEndDate}T23:59:59.999`);
        if (filterStart > filterEnd) {
          toast.error(t('admin.manualEnrollment.invalidDateRange', 'تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية'));
          setIsExporting(false);
          return;
        }
        periodFileLabel = `${customStartDate}_to_${customEndDate}`;
      } else {
        periodFileLabel = 'all_records';
      }

      toast.info(t('admin.manualEnrollment.preparingExport', 'جاري تجهيز وتصدير البيانات...'));

      const queryParams = {};
      if (filterStart) queryParams.startDate = filterStart.toISOString();
      if (filterEnd) queryParams.endDate = filterEnd.toISOString();

      const res = await adminService.getManualEnrollmentLogs(queryParams);
      let items = res?.logs || [];

      // Double-check client-side filter
      if (filterStart || filterEnd) {
        items = items.filter((log) => {
          if (!log.enrolledAt) return false;
          const d = new Date(log.enrolledAt);
          if (filterStart && d < filterStart) return false;
          if (filterEnd && d > filterEnd) return false;
          return true;
        });
      }

      if (items.length === 0) {
        toast.warning(t('admin.manualEnrollment.noLogsToExport', 'لا توجد سجلات مطابقة للفترة المحددة'));
        setIsExporting(false);
        return;
      }

      const headers = [
        'معرف التسجيل (ID)',
        'اسم الطالب',
        'البريد الإلكتروني للطالب',
        'رقم هاتف الطالب',
        'عنوان الدورة التدريبية',
        'نوع الدورة',
        'سعر الدورة الأساسي (ر.س)',
        'المبلغ المدفوع المحصل (ر.س)',
        'المسؤول المنفذ للتسجيل',
        'بريد المسؤول',
        'تاريخ ووقت الإضافة',
        'سبب الإضافة / ملاحظات الإدارة'
      ];

      const rows = items.map((log) => {
        const studentName = log.student?.name || '—';
        const studentEmail = log.student?.email || '—';
        const studentPhone = formatPhoneForCSV(log.student?.phone);
        const courseTitle = log.course?.title || '—';
        const courseType = formatCourseType(log.course?.courseType);
        const coursePrice = log.course?.price !== undefined ? Number(log.course.price).toFixed(2) : '0.00';
        const paidAmt = log.paymentAmount !== undefined && log.paymentAmount !== null ? Number(log.paymentAmount).toFixed(2) : '0.00';
        const adminName = log.enrolledBy?.name || '—';
        const adminEmail = log.enrolledBy?.email || '—';
        const enrolledAtStr = log.enrolledAt
          ? new Date(log.enrolledAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '—';
        const reasonStr = log.reason || '—';

        return [
          log._id || '—',
          studentName,
          studentEmail,
          studentPhone,
          courseTitle,
          courseType,
          coursePrice,
          paidAmt,
          adminName,
          adminEmail,
          enrolledAtStr,
          reasonStr
        ];
      });

      const escapeCSV = (value) => {
        const str = String(value ?? '').replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvContent = '\uFEFF' + [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.map(escapeCSV).join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `manual_enrollments_${periodFileLabel}_${getTodayFormatted()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        t('admin.manualEnrollment.exportSuccess', `تم تصدير ملف الإكسيل بنجاح (${items.length} سجل)`),
        { autoClose: 3500 }
      );
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Failed to export manual enrollment logs:', error);
      toast.error(t('admin.manualEnrollment.exportFailed', 'حدث خطأ أثناء تصدير البيانات'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t('admin.manualEnrollment.title', 'التسجيل اليدوي')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('admin.manualEnrollment.pageSubtitle', 'إضافة الطلاب إلى الدورات يدوياً وصلاحيات الوصول الإداري')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
            title={t('admin.manualEnrollment.exportExcelTooltip', 'تصدير شيت إكسيل مع تحديد الفترة')}
          >
            <FileSpreadsheet size={16} />
            <span>{t('admin.manualEnrollment.exportExcel', 'تصدير إكسيل')}</span>
          </button>

          {/* Toggle History Button */}
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              showHistory
                ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <FileClock size={16} />
            <span>{showHistory ? t('admin.manualEnrollment.hideHistory', 'إخفاء السجل') : t('admin.manualEnrollment.viewHistory', 'سجل التسجيلات اليدوية')}</span>
          </button>
        </div>
      </div>

      {/* Main Card: Add Student Form */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <User size={16} className="text-purple-500" />
              {t('admin.manualEnrollment.searchUser', 'الطالب المستهدف')}
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder={t('admin.manualEnrollment.searchUserPlaceholder', 'ابحث بالاسم أو البريد الإلكتروني...')}
                className={`w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-shadow ${selectedUser ? 'border-purple-300 bg-purple-50/50 dark:border-purple-500/30 dark:bg-purple-900/10' : 'border-slate-200 bg-slate-50 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-purple-900/20'} text-slate-800 dark:text-white`}
              />
              {selectedUser && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <button onClick={() => { setSelectedUser(null); setUserQuery(''); }} className="text-slate-400 hover:text-red-500">
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>
            
            {!selectedUser && loadingUsers && (
              <div className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                <RefreshCw size={14} className="animate-spin" /> {t('admin.manualEnrollment.searching', 'جاري البحث...')}
              </div>
            )}
            
            {!selectedUser && userResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-10 relative">
                {userResults.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setUserQuery(u.email || u.name || '');
                      setUserResults([]);
                    }}
                    className="w-full text-start px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col gap-1"
                  >
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{u.name || u.email}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {u.email} {u.phone ? ` • ${u.phone}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <BookOpen size={16} className="text-blue-500" />
              {t('admin.manualEnrollment.searchCourse', 'الدورة التدريبية')}
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={courseQuery}
                onChange={(e) => {
                  setCourseQuery(e.target.value);
                  setSelectedCourse(null);
                }}
                placeholder={t('admin.manualEnrollment.searchCoursePlaceholder', 'ابحث باسم الدورة...')}
                className={`w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-shadow ${selectedCourse ? 'border-blue-300 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-900/10' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/20'} text-slate-800 dark:text-white`}
              />
              {selectedCourse && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <button onClick={() => { setSelectedCourse(null); setCourseQuery(''); setPaidAmount(''); }} className="text-slate-400 hover:text-red-500">
                    <XCircle size={18} />
                  </button>
                </div>
              )}
            </div>

            {!selectedCourse && loadingCourses && (
              <div className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                <RefreshCw size={14} className="animate-spin" /> {t('admin.manualEnrollment.searching', 'جاري البحث...')}
              </div>
            )}

            {!selectedCourse && courseResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-10 relative">
                {courseResults.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(c);
                      setCourseQuery(c.title || '');
                      setCourseResults([]);
                      if (paidAmount === '' || paidAmount === '0' || Number(paidAmount) === 0) {
                        setPaidAmount(c.price !== undefined ? c.price : 0);
                      }
                    }}
                    className="w-full text-start px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col gap-1"
                  >
                    <span className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{c.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium capitalize">{c.courseType}</span>
                      <span>{c.price > 0 ? `${c.price} SAR` : 'مجانًا'}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Financial & Notes Grid */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paid Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Coins size={16} className="text-emerald-500" />
                {t('admin.manualEnrollment.paidAmountLabel', 'المبلغ المدفوع')}
              </label>
              {selectedCourse && (
                <span className="text-xs text-slate-500 font-normal">
                  سعر الدورة الأساسي: <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedCourse.price || 0} ر.س</strong>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={selectedCourse ? String(selectedCourse.price || 0) : '0.00'}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 pl-14 rtl:pl-4 rtl:pr-4 text-slate-800 dark:text-white font-mono font-bold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 transition-shadow"
              />
              <span className="absolute left-4 rtl:left-auto rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                ر.س
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('admin.manualEnrollment.paidAmountHint', 'أدخل المبلغ المحصل من الطالب (أو 0 في حال المنحة أو التسجيل المجاني).')}
            </p>
          </div>

          {/* Reason / Notes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText size={16} className="text-amber-500" />
              {t('admin.manualEnrollment.reasonLabel', 'ملاحظات / سبب الإضافة')}
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.manualEnrollment.reasonPlaceholder', 'مثال: سداد نقدي، تحويل بنكي، تعويض عن دورة سابقة...')}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-shadow"
            />
            <p className="text-xs text-slate-400">
              {t('admin.manualEnrollment.reasonHint', 'ملاحظة إدارية مرجعية توثق تفاصيل السداد أو سبب الإضافة.')}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setUserQuery('');
              setCourseQuery('');
              setReason('');
              setPaidAmount('');
              setSelectedUser(null);
              setSelectedCourse(null);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            disabled={submitting}
          >
            {t('admin.manualEnrollment.reset', 'إعادة ضبط')}
          </button>
          <button
            type="button"
            onClick={onEnroll}
            disabled={submitting || !selectedUser || !selectedCourse}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {submitting ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <PlusCircle size={18} />
            )}
            <span>{submitting ? t('admin.manualEnrollment.enrolling', 'جاري التسجيل...') : t('admin.manualEnrollment.enrollUser', 'تأكيد تسجيل الطالب')}</span>
          </button>
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 mt-8">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileClock size={20} className="text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('admin.manualEnrollment.historyTitle', 'سجل التسجيلات اليدوية')}
              </h2>
              {logs.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {logs.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span>{t('admin.manualEnrollment.exportExcel', 'تصدير إلى Excel')}</span>
              </button>

              <button
                type="button"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="تحديث السجل"
              >
                <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingLogs && logs.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <RefreshCw className="animate-spin text-purple-500" size={32} />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                <FileText size={48} className="opacity-30 mb-4" />
                <p>{t('admin.manualEnrollment.noLogs', 'لا يوجد سجلات للتسجيلات اليدوية بعد')}</p>
              </div>
            ) : (
              <table className="w-full text-right">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-sm">
                  <tr>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tableStudent', 'الطالب')}</th>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tableCourse', 'الدورة')}</th>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tablePaidAmount', 'المبلغ المدفوع')}</th>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tableAdmin', 'بواسطة')}</th>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tableDate', 'تاريخ الإضافة')}</th>
                    <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{t('admin.manualEnrollment.tableReason', 'السبب')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-medium text-slate-900 dark:text-white">{log.student?.name || '-'}</div>
                        <div className="text-xs text-slate-500">{log.student?.email || '-'}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-2">{log.course?.title || '-'}</div>
                        {log.course?.courseType && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 capitalize">
                            {formatCourseType(log.course.courseType)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-top whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {log.paymentAmount !== undefined && log.paymentAmount !== null ? Number(log.paymentAmount).toFixed(2) : '0.00'}
                        </span>
                        <span className="text-xs text-slate-400 font-sans mr-1">ر.س</span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-medium text-slate-900 dark:text-white">{log.enrolledBy?.name || '-'}</div>
                        <div className="text-xs text-slate-500">{log.enrolledBy?.email || '-'}</div>
                      </td>
                      <td className="p-4 align-top text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.enrolledAt ? new Date(log.enrolledAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="p-4 align-top text-slate-600 dark:text-slate-400 max-w-xs break-words">
                        {log.reason ? <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-block text-xs">{log.reason}</span> : <span className="text-slate-400 italic">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Export to Excel Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {t('admin.manualEnrollment.exportModalTitle', 'تصدير شيت إكسيل (Excel Export)')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('admin.manualEnrollment.exportModalSubtitle', 'حدد الفترة الزمنية المراد تصدير بياناتها')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isExporting && setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                {t('admin.manualEnrollment.selectPeriodLabel', 'اختر الفترة الزمنية المطلوبة:')}
              </label>

              {/* Option 1: Current Month */}
              <div
                onClick={() => setExportPeriod('current_month')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  exportPeriod === 'current_month'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="exportPeriod"
                  checked={exportPeriod === 'current_month'}
                  onChange={() => setExportPeriod('current_month')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Calendar size={15} className="text-emerald-500" />
                      {t('admin.manualEnrollment.currentMonthOption', 'الشهر الحالي')}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {t('admin.manualEnrollment.recommended', 'موصى به')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    تصدير عمليات التسجيل لشهر <strong>{getCurrentMonthName(isRTL)}</strong> (من أول الشهر حتى نهايته)
                  </p>
                </div>
              </div>

              {/* Option 2: Custom Period */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  exportPeriod === 'custom'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  onClick={() => setExportPeriod('custom')}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="exportPeriod"
                    checked={exportPeriod === 'custom'}
                    onChange={() => setExportPeriod('custom')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Filter size={15} className="text-purple-500" />
                      {t('admin.manualEnrollment.customPeriodOption', 'فترة زمنية محددة')}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('admin.manualEnrollment.customPeriodHint', 'تحديد تاريخ البداية والنهاية حسب رغبتك')}
                    </p>
                  </div>
                </div>

                {exportPeriod === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {t('admin.manualEnrollment.fromDate', 'من تاريخ:')}
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {t('admin.manualEnrollment.toDate', 'إلى تاريخ:')}
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: All Records */}
              <div
                onClick={() => setExportPeriod('all')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  exportPeriod === 'all'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="exportPeriod"
                  checked={exportPeriod === 'all'}
                  onChange={() => setExportPeriod('all')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                    <FileText size={15} className="text-blue-500" />
                    {t('admin.manualEnrollment.allRecordsOption', 'كافة السجلات (بدون حد زمني)')}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('admin.manualEnrollment.allRecordsHint', 'تصدير جميع عمليات التسجيل اليدوي المسجلة بالكامل')}
                  </p>
                </div>
              </div>

              {/* Info notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                <FileSpreadsheet size={16} className="text-emerald-500 shrink-0" />
                <span>
                  {t(
                    'admin.manualEnrollment.exportFormatNote',
                    'يتم استخراج ملف إكسيل بتنسيق CSV مع ترميز UTF-8 معتمد لقراءة النصوص العربية والأرقام مباشرة بدون أي تشويه.'
                  )}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
              >
                {t('common.cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors text-sm font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{t('admin.manualEnrollment.exportingBtn', 'جاري التصدير...')}</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{t('admin.manualEnrollment.downloadExcelBtn', 'تصدير وتحميل الإكسيل')}</span>
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

export default ManualEnrollment;
