import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import { useLanguage } from '../../hooks/useLanguage';
import { 
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    BookOpen,
    Calendar,
    X,
    GraduationCap,
    CreditCard,
    MapPin,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    CheckCircle2,
    Clock,
    RefreshCw,
    Award
} from 'lucide-react';

const StudentManagement = () => {
    const { t, i18n } = useTranslation();
    const { isRTL } = useLanguage();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchStudents();
    }, [currentPage, debouncedSearch, sortBy, sortOrder]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await adminService.getStudents({
                page: currentPage,
                limit: 20,
                search: debouncedSearch,
                sortBy,
                sortOrder
            });
            
            const list = response?.students || response?.data?.students || (Array.isArray(response) ? response : []);
            const pagination = response?.pagination || response?.data?.pagination;
            setStudents(list);
            setTotalPages(pagination?.totalPages || 1);
            setTotalStudents(pagination?.totalStudents || list.length);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error(t('admin.students.fetchError', 'Failed to load students data'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            setDetailsLoading(true);
            const response = await adminService.getStudentDetails(studentId);
            setStudentDetails(response?.student ? response : (response?.data || response));
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast.error(t('admin.students.detailsError', 'Failed to load student details'));
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        fetchStudentDetails(student._id);
    };

    const handleCloseModal = () => {
        setSelectedStudent(null);
        setStudentDetails(null);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '-';
        const currencyLabel = isRTL ? 'ر.س' : 'SAR';
        return `${Number(amount).toLocaleString()} ${currencyLabel}`;
    };

    const getInitials = (firstName, lastName) =>
        ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'U';

    const getStatusBadge = (status) => {
        const map = {
            passed: { 
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40', 
                label: t('admin.students.passed', 'اجتاز الدورة') 
            },
            finished: { 
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40', 
                label: t('admin.students.completed', 'مكتمل') 
            },
            'in-progress': { 
                color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40', 
                label: t('admin.students.inProgress', 'قيد التعلم') 
            },
            enrolled: { 
                color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40', 
                label: t('admin.students.enrolled', 'مسجل') 
            },
        };
        return map[status] || { 
            color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800', 
            label: status 
        };
    };

    const SortTh = ({ field, children }) => (
        <th
            onClick={() => handleSort(field)}
            className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none group hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors"
        >
            <div className="flex items-center gap-1.5">
                <span>{children}</span>
                {sortBy === field ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                        <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                    )
                ) : (
                    <ArrowUpDown size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                )}
            </div>
        </th>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('admin.students.title', 'إدارة بيانات الطلاب')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            {t('admin.students.subtitle', 'عرض تفاصيل الطلاب المسجلين ومتابعة مسارهم التعليمي ومشترياتهم')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                    <div className="bg-white dark:bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t('admin.students.totalStudents', 'إجمالي الطلاب')}
                        </div>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {totalStudents.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={fetchStudents}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                        title={t('common.refresh', 'تحديث')}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search 
                        size={18} 
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? 'right-3.5' : 'left-3.5'}`} 
                    />
                    <input
                        type="text"
                        placeholder={t('admin.students.searchPlaceholder', 'ابحث باسم الطالب، البريد الإلكتروني أو الهاتف...')}
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all ${
                            isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center">
                    <span>{t('admin.students.sortBy', 'الترتيب:')}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sortBy === 'createdAt' ? t('admin.students.table.registrationDate', 'تاريخ التسجيل') :
                         sortBy === 'firstName' ? t('admin.students.table.student', 'الاسم') :
                         sortBy === 'enrollmentCount' ? t('admin.students.table.courses', 'عدد الدورات') :
                         sortBy === 'totalSpent' ? t('admin.students.table.totalSpent', 'إجمالي الإنفاق') : sortBy}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">({sortOrder === 'asc' ? '↑' : '↓'})</span>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <SortTh field="firstName">{t('admin.students.table.student', 'الطالب')}</SortTh>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.students.table.contact', 'بيانات التواصل')}
                                </th>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.students.table.location', 'الموقع')}
                                </th>
                                <SortTh field="enrollmentCount">{t('admin.students.table.courses', 'الدورات')}</SortTh>
                                <SortTh field="totalSpent">{t('admin.students.table.totalSpent', 'المصروفات')}</SortTh>
                                <SortTh field="createdAt">{t('admin.students.table.registrationDate', 'تاريخ الانضمام')}</SortTh>
                                <th className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    {t('admin.students.table.actions', 'الإجراءات')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
                                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {t('admin.students.loading', 'جاري تحميل بيانات الطلاب...')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                                                <Users size={36} className="opacity-50 text-slate-500" />
                                            </div>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
                                                {t('admin.students.noResults', 'لم يتم العثور على أي طلاب')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {searchTerm ? t('admin.students.tryOtherSearch', 'جرّب البحث بكلمات أخرى أو تحقق من كتابة الاسم أو البريد') : t('admin.students.noStudentsYet', 'لا توجد بيانات طلاب مسجلين في النظام حالياً')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr 
                                        key={student._id} 
                                        className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group cursor-pointer"
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        {/* Student Info */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                    {getInitials(student.firstName, student.lastName)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <GraduationCap size={13} className="text-blue-500" />
                                                        <span>{t('admin.students.role', 'طالب')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                                                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[190px]" title={student.email}>{student.email}</span>
                                                </div>
                                                {student.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                        <Phone size={13} className="text-slate-400 flex-shrink-0" />
                                                        <span dir="ltr">{student.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-5 py-4">
                                            {student.city || student.country ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                    <MapPin size={13} className="text-rose-500 flex-shrink-0" />
                                                    <span className="truncate max-w-[140px]">{[student.city, student.country].filter(Boolean).join(', ')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Courses */}
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                                (student.enrollmentCount || 0) > 0
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                                            }`}>
                                                <BookOpen size={13} />
                                                <span>{student.enrollmentCount || 0}</span>
                                            </span>
                                        </td>

                                        {/* Total Spent */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                                {formatCurrency(student.totalSpent)}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                <span>{formatDate(student.createdAt)}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleStudentClick(student)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-medium border border-blue-200 dark:border-blue-900/60 transition-all shadow-sm"
                                            >
                                                <Eye size={14} />
                                                <span>{t('admin.students.viewDetails', 'التفاصيل')}</span>
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
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {t('admin.students.paginationInfo', 'صفحة {{current}} من {{total}}', { current: currentPage, total: totalPages })}
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-sm"
                            >
                                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors shadow-sm"
                            >
                                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex items-center justify-between text-white flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
                                    {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <span>{selectedStudent.firstName} {selectedStudent.lastName}</span>
                                    </h3>
                                    <p className="text-blue-100 text-xs mt-1 flex items-center gap-1.5 opacity-90">
                                        <Calendar size={13} />
                                        <span>{t('admin.students.registeredSince', 'تاريخ التسجيل:')} {formatDate(selectedStudent.createdAt)}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {detailsLoading ? (
                                <div className="flex flex-col justify-center items-center py-16 gap-3">
                                    <RefreshCw className="animate-spin text-blue-600" size={32} />
                                    <span className="text-xs text-slate-500 font-medium">
                                        {t('admin.students.loadingDetails', 'جاري جلب تفاصيل الطالب...')}
                                    </span>
                                </div>
                            ) : studentDetails ? (
                                <>
                                    {/* Info Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                                <Mail size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] text-slate-400 font-medium">{t('admin.students.email', 'البريد الإلكتروني')}</div>
                                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{studentDetails.student?.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                                <Phone size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] text-slate-400 font-medium">{t('admin.students.phone', 'رقم الهاتف')}</div>
                                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" dir="ltr">
                                                    {studentDetails.student?.phone || '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] text-slate-400 font-medium">{t('admin.students.location', 'المدينة والدولة')}</div>
                                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {[studentDetails.student?.city, studentDetails.student?.country].filter(Boolean).join(', ') || '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                                <CreditCard size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] text-slate-400 font-medium">{t('admin.students.totalPurchases', 'إجمالي المشتريات')}</div>
                                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {formatCurrency(studentDetails.stats?.totalSpent)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Strip */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 text-center">
                                            <GraduationCap className="mx-auto mb-1 text-blue-600 dark:text-blue-400" size={20} />
                                            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
                                                {studentDetails.stats?.totalCourses || 0}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                {t('admin.students.totalCourses', 'إجمالي الدورات')}
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 text-center">
                                            <CheckCircle2 className="mx-auto mb-1 text-emerald-600 dark:text-emerald-400" size={20} />
                                            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                                {studentDetails.stats?.completedCourses || 0}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                {t('admin.students.completedCourses', 'دورات مكتملة')}
                                            </div>
                                        </div>

                                        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 text-center">
                                            <Clock className="mx-auto mb-1 text-amber-600 dark:text-amber-400" size={20} />
                                            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                                                {studentDetails.stats?.inProgressCourses || 0}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                {t('admin.students.inProgress', 'قيد التعلم')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purchased Courses */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-600" />
                                                <span>{t('admin.students.purchasedCourses', 'الدورات التدريبية المشترك بها')}</span>
                                            </h4>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                                                {studentDetails.enrollments?.length || 0}
                                            </span>
                                        </div>

                                        {!studentDetails.enrollments?.length ? (
                                            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                                                <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
                                                <p className="text-xs">{t('admin.students.noCourses', 'لم يقم الطالب بالتسجيل في أي دورات بعد')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                                {studentDetails.enrollments.map((enrollment) => {
                                                    const badge = getStatusBadge(enrollment.status);
                                                    return (
                                                        <div 
                                                            key={enrollment._id}
                                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
                                                        >
                                                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                                {enrollment.course?.thumbnail ? (
                                                                    <img 
                                                                        src={enrollment.course.thumbnail} 
                                                                        alt={enrollment.course?.title} 
                                                                        className="h-full w-full object-cover" 
                                                                    />
                                                                ) : (
                                                                    <BookOpen size={20} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                    {enrollment.course?.title || t('admin.students.unknownCourse', 'دورة تعليمية')}
                                                                </h5>
                                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar size={11} />
                                                                        <span>{formatDate(enrollment.enrolledAt)}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                                        <CreditCard size={11} />
                                                                        <span>{formatCurrency(enrollment.paymentAmount)}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-slate-400 py-8 text-xs">{t('admin.students.noDetails', 'لا تتوفر تفاصيل إضافية')}</p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                            >
                                {t('common.close', 'إغلاق')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
