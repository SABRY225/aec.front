import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import { UserPlus, Search, User, BookOpen, Clock, FileText, CheckCircle, PlusCircle, RefreshCw, XCircle, FileClock } from 'lucide-react';

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

const ManualEnrollment = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [userQuery, setUserQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [reason, setReason] = useState('');

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
        reason: reason.trim() || undefined
      });

      if (res?.alreadyEnrolled) {
        toast.info(t('admin.manualEnrollment.alreadyEnrolled', 'المستخدم مسجل بالفعل في هذه الدورة'));
      } else if (res?.success) {
        toast.success(t('admin.manualEnrollment.success', 'تم تسجيل المستخدم بنجاح'));
        
        setUserQuery('');
        setCourseQuery('');
        setReason('');
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${showHistory ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        >
          <FileClock size={16} />
          <span>{showHistory ? t('admin.manualEnrollment.hideHistory', 'إخفاء السجل') : t('admin.manualEnrollment.viewHistory', 'سجل التسجيلات اليدوية')}</span>
        </button>
      </div>

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
                  <button onClick={() => { setSelectedCourse(null); setCourseQuery(''); }} className="text-slate-400 hover:text-red-500">
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

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <FileText size={16} className="text-amber-500" />
            {t('admin.manualEnrollment.reasonLabel', 'ملاحظات / سبب الإضافة')}
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.manualEnrollment.reasonPlaceholder', 'مثال: تعويض عن دورة سابقة، دعوة مجانية...')}
            className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/20 transition-shadow"
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setUserQuery('');
              setCourseQuery('');
              setReason('');
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

      {showHistory && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 mt-8">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileClock size={20} className="text-slate-400" />
              {t('admin.manualEnrollment.historyTitle', 'سجل التسجيلات اليدوية')}
            </h2>
            {loadingLogs && (
              <span className="text-sm text-purple-600 flex items-center gap-2 font-medium">
                <RefreshCw size={14} className="animate-spin" />
                {t('admin.manualEnrollment.loadingLogs', 'جاري التحديث...')}
              </span>
            )}
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
                            {log.course.courseType}
                          </span>
                        )}
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
    </div>
  );
};

export default ManualEnrollment;
