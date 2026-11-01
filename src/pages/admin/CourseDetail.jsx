import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Pencil, 
    ArrowLeft,
    ArrowRight,
    Star, 
    Play, 
    FileText, 
    User, 
    Calendar, 
    Globe, 
    UserPlus,
    BookOpen,
    GraduationCap,
    DollarSign,
    Share2,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    FileDown,
    MapPin,
    Layers,
    Sparkles,
    ShieldCheck,
    Video,
    Check,
    Copy,
    CheckCheck,
    AlertTriangle,
    Loader2,
    ExternalLink,
    Users,
    Search,
    Mail,
    Phone,
    Download,
    RefreshCw,
    MessageCircle,
    UserCheck,
    Award
} from 'lucide-react';
import { adminService } from '../../services/new-api';
import RichTextDisplay from '../../components/RichTextDisplay/RichTextDisplay';
import ManualEnrollmentModal from '../../components/admin/ManualEnrollmentModal';

const CourseDetail = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [imgError, setImgError] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ 0: true });

    // Enrolled students state
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsStats, setStudentsStats] = useState({ total: 0, enrolled: 0, inProgress: 0, completed: 0 });
    const [studentSearch, setStudentSearch] = useState('');
    const [studentStatusFilter, setStudentStatusFilter] = useState('all');
    const [studentPage, setStudentPage] = useState(1);
    const [studentPagination, setStudentPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
    const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
    const [isDeletingEnrollment, setIsDeletingEnrollment] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        fetchStudents(1);
    }, [id]);

    useEffect(() => {
        if (activeTab === 'students') {
            const timer = setTimeout(() => {
                fetchStudents(1, studentSearch, studentStatusFilter);
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [studentSearch, studentStatusFilter, activeTab]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminService.getCourseDetails(id);
            setCourse(response);
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError(isRTL ? 'فشل تحميل بيانات الدورة التدريبية' : 'Failed to load course details');
            toast.error(isRTL ? 'فشل في جلب تفاصيل الدورة' : 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (page = 1, search = studentSearch, status = studentStatusFilter) => {
        if (!id) return;
        try {
            setStudentsLoading(true);
            const res = await adminService.getCourseStudents(id, {
                page,
                limit: 50,
                search: (search || '').trim(),
                status: status === 'all' ? '' : status
            });
            if (res?.success) {
                setStudents(res.students || []);
                if (res.stats) setStudentsStats(res.stats);
                if (res.pagination) setStudentPagination(res.pagination);
                setStudentPage(page);
            }
        } catch (err) {
            console.error('Error fetching course students:', err);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleDeleteEnrollment = async () => {
        if (!enrollmentToDelete) return;
        try {
            setIsDeletingEnrollment(true);
            await adminService.deleteEnrollment(enrollmentToDelete._id);
            toast.success(isRTL ? 'تم إلغاء تسجيل الطالب بنجاح' : 'Student enrollment deleted successfully');
            setEnrollmentToDelete(null);
            fetchStudents(studentPage);
            fetchCourseDetails();
        } catch (err) {
            console.error('Error deleting enrollment:', err);
            toast.error(isRTL ? 'فشل في إلغاء تسجيل الطالب' : 'Failed to delete enrollment');
        } finally {
            setIsDeletingEnrollment(false);
        }
    };

    const handleExportCSV = () => {
        if (!students.length) {
            toast.info(isRTL ? 'لا يوجد طلاب لتصديرهم' : 'No students to export');
            return;
        }
        const headers = [
            isRTL ? 'اسم الطالب' : 'Student Name',
            isRTL ? 'البريد الإلكتروني' : 'Email',
            isRTL ? 'رقم الهاتف' : 'Phone',
            isRTL ? 'تاريخ التسجيل' : 'Enrolled At',
            isRTL ? 'طريقة التسجيل' : 'Enrollment Type',
            isRTL ? 'الحالة' : 'Status',
            isRTL ? 'نسبة الإنجاز %' : 'Progress %',
            isRTL ? 'الرقم التسلسلي' : 'Serial Number',
            isRTL ? 'كود الدخول' : 'Access Code'
        ];

        const rows = students.map(s => [
            `"${s.student?.name || ''}"`,
            `"${s.student?.email || ''}"`,
            `"${s.student?.phone || ''}"`,
            `"${s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : ''}"`,
            `"${s.isManual ? (isRTL ? 'تسجيل يدوي' : 'Manual') : (isRTL ? 'دفع إلكتروني' : 'Online Paid')}"`,
            `"${s.status || ''}"`,
            `"${s.progress?.overallProgress || 0}%"`,
            `"${s.serialNumber || ''}"`,
            `"${s.accessCode || ''}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `course_${course?.title || id}_students.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(isRTL ? 'تم تصدير قائمة الطلاب بنجاح' : 'Students exported to CSV successfully');
    };

    const handleStatusChange = async (newStatus) => {
        setActionLoading(true);
        try {
            await adminService.updateCourseStatus(id, { status: newStatus });
            setCourse(prev => ({ ...prev, status: newStatus }));
            const statusLabels = {
                approved: isRTL ? 'تم اعتماد الدورة بنجاح' : 'Course approved successfully',
                pending: isRTL ? 'تم تحويل الدورة إلى قيد المراجعة' : 'Course set to pending review',
                rejected: isRTL ? 'تم رفض الدورة' : 'Course rejected',
            };
            toast.success(statusLabels[newStatus] || (isRTL ? 'تم تحديث حالة الدورة' : 'Status updated'));
        } catch (err) {
            console.error('Error updating course status:', err);
            toast.error(isRTL ? 'فشل في تحديث حالة الدورة' : 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleFeatured = async () => {
        setActionLoading(true);
        try {
            await adminService.toggleCourseFeatured(id);
            const nextFeatured = !course.featured;
            setCourse(prev => ({ ...prev, featured: nextFeatured }));
            toast.success(
                nextFeatured 
                    ? (isRTL ? 'تمت إضافة الدورة إلى الدورات المميزة ⭐' : 'Added to featured courses ⭐')
                    : (isRTL ? 'تمت إزالة الدورة من الدورات المميزة' : 'Removed from featured courses')
            );
        } catch (err) {
            console.error('Error toggling featured status:', err);
            toast.error(isRTL ? 'فشل في تعديل حالة التمييز' : 'Failed to update featured status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await adminService.deleteCourse(id);
            toast.success(isRTL ? 'تم حذف الدورة بنجاح' : 'Course deleted successfully');
            setShowDeleteModal(false);
            navigate('/admin/courses');
        } catch (err) {
            console.error('Error deleting course:', err);
            toast.error(isRTL ? 'فشل في حذف الدورة' : 'Failed to delete course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCopyId = () => {
        if (!course?._id && !id) return;
        navigator.clipboard.writeText(course?._id || id);
        setCopiedId(true);
        toast.info(isRTL ? 'تم نسخ معرف الدورة' : 'Course ID copied to clipboard');
        setTimeout(() => setCopiedId(false), 2000);
    };

    const formatDuration = (minutes) => {
        if (!minutes || isNaN(minutes)) return isRTL ? '0 دقيقة' : '0m';
        const num = Number(minutes);
        const hours = Math.floor(num / 60);
        const mins = Math.round(num % 60);
        if (hours > 0 && mins > 0) {
            return isRTL ? `${hours} س ${mins} د` : `${hours}h ${mins}m`;
        }
        if (hours > 0) {
            return isRTL ? `${hours} ساعة` : `${hours}h`;
        }
        return isRTL ? `${mins} دقيقة` : `${mins}m`;
    };

    const formatPrice = (price) => {
        const val = Number(price || 0);
        return isRTL ? `${val.toLocaleString()} ر.س` : `${val.toLocaleString()} SAR`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return isRTL ? 'غير محدد' : 'Not specified';
        try {
            return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved':
                return {
                    label: isRTL ? 'معتمدة' : 'Approved',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
                    dot: 'bg-emerald-500',
                    icon: CheckCircle2
                };
            case 'pending':
                return {
                    label: isRTL ? 'قيد المراجعة' : 'Pending Review',
                    badge: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
                    dot: 'bg-amber-500 animate-pulse',
                    icon: Clock
                };
            case 'rejected':
                return {
                    label: isRTL ? 'مرفوضة' : 'Rejected',
                    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
                    dot: 'bg-rose-500',
                    icon: XCircle
                };
            default:
                return {
                    label: isRTL ? 'مسودة' : 'Draft',
                    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                    dot: 'bg-slate-400',
                    icon: Clock
                };
        }
    };

    const totalLecturesCount = useMemo(() => {
        if (!course?.sections || !Array.isArray(course.sections)) return 0;
        return course.sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0);
    }, [course]);

    const totalCalculatedDuration = useMemo(() => {
        if (course?.duration) return course.duration;
        if (!course?.sections || !Array.isArray(course.sections)) return 0;
        let sum = 0;
        course.sections.forEach(s => {
            if (s.lectures) {
                s.lectures.forEach(l => {
                    const dur = Number(l.video?.duration || l.duration || 0);
                    if (!isNaN(dur)) sum += dur;
                });
            }
        });
        return sum;
    }, [course]);

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const expandAllSections = () => {
        if (!course?.sections) return;
        const all = {};
        course.sections.forEach((_, idx) => { all[idx] = true; });
        setExpandedSections(all);
    };

    const collapseAllSections = () => {
        setExpandedSections({});
    };

    const getLevelLabel = (level) => {
        const map = {
            beginner: isRTL ? 'مبتدئ' : 'Beginner',
            intermediate: isRTL ? 'متوسط' : 'Intermediate',
            advanced: isRTL ? 'متقدم' : 'Advanced',
            all_levels: isRTL ? 'جميع المستويات' : 'All Levels'
        };
        return map[level] || level || (isRTL ? 'عام' : 'General');
    };

    const getTypeLabel = (type) => {
        const map = {
            recorded: isRTL ? 'مسجلة أونلاين' : 'Recorded Online',
            live: isRTL ? 'بث مباشر تفاعلي' : 'Live Interactive',
            onsite: isRTL ? 'حضورية' : 'On-Site'
        };
        return map[type] || type || (isRTL ? 'أونلاين' : 'Online');
    };

    const instructorFullName = course?.instructor 
        ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() 
        : (isRTL ? 'غير محدد' : 'Not assigned');

    const instructorInitials = instructorFullName 
        ? instructorFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
        : 'IN';

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary-600/10 dark:bg-primary-500/10 flex items-center justify-center animate-pulse">
                        <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                    {isRTL ? 'جاري تحميل تفاصيل الدورة...' : 'Loading course details...'}
                </h3>
            </div>
        );
    }

    // Error State
    if (error || !course) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {isRTL ? 'لم يتم العثور على الدورة' : 'Course Not Found'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        {error || (isRTL ? 'تعذر جلب تفاصيل الدورة المطلوبة.' : 'The requested course could not be loaded.')}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={fetchCourseDetails}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-sm font-semibold transition"
                        >
                            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                        </button>
                        <Link
                            to="/admin/courses"
                            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition"
                        >
                            {isRTL ? 'العودة للدورات' : 'Back to Courses'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusStyle = getStatusStyle(course.status);

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* ======================================================== */}
            {/* STICKY GLASSMORPHIC HEADER */}
            {/* ======================================================== */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-3.5 gap-3">
                        
                        {/* Left: Back & Breadcrumb */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => navigate('/admin/courses')}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title={isRTL ? 'العودة للدورات' : 'Back to courses'}
                            >
                                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                            </button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Link to="/admin/courses" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
                                        {isRTL ? 'الدورات' : 'Courses'}
                                    </Link>
                                    <span>/</span>
                                    <span className="truncate">{course.category || (isRTL ? 'تفاصيل الدورة' : 'Details')}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                                        {course.title}
                                    </h1>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${statusStyle.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                        {statusStyle.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Action Controls */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Switch to Students Tab Button */}
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                                    activeTab === 'students'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                                }`}
                                title={isRTL ? 'عرض الطلاب المشاركين' : 'View enrolled students'}
                            >
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>{isRTL ? 'الطلاب المشاركون' : 'Students'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    activeTab === 'students'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                }`}>
                                    {course.enrolledStudentsCount ?? studentsStats.total ?? course.enrolledStudents?.length ?? 0}
                                </span>
                            </button>

                            {/* Manual Enrollment Button */}
                            <button
                                onClick={() => setIsEnrollModalOpen(true)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>{isRTL ? 'تسجيل طالب' : 'Enroll Student'}</span>
                            </button>

                            {/* Status Change Buttons */}
                            {course.status !== 'approved' && (
                                <button
                                    onClick={() => handleStatusChange('approved')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition active:scale-95"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isRTL ? 'اعتماد' : 'Approve'}</span>
                                </button>
                            )}

                            {course.status !== 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('pending')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-amber-600/20 disabled:opacity-50 transition active:scale-95"
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>{isRTL ? 'مراجعة' : 'Pending'}</span>
                                </button>
                            )}

                            {course.status !== 'rejected' && (
                                <button
                                    onClick={() => handleStatusChange('rejected')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-rose-600/20 disabled:opacity-50 transition active:scale-95"
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>{isRTL ? 'رفض' : 'Reject'}</span>
                                </button>
                            )}

                            {/* Public Preview Button */}
                            <a
                                href={`/course/${course._id || id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs sm:text-sm font-semibold transition"
                                title={isRTL ? 'معاينة كطالب' : 'Preview as student'}
                            >
                                <Eye className="w-4 h-4 text-slate-500" />
                                <span className="hidden md:inline">{isRTL ? 'معاينة' : 'Preview'}</span>
                            </a>

                            {/* Edit Course Button */}
                            <Link
                                to={`/admin/courses/${id}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs sm:text-sm font-semibold transition"
                            >
                                <Pencil className="w-4 h-4 text-slate-500" />
                                <span className="hidden md:inline">{isRTL ? 'تعديل' : 'Edit'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ======================================================== */}
            {/* MAIN CONTENT BODY */}
            {/* ======================================================== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                
                {/* 1. HERO SHOWCASE CARD */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-6"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* Course Media Banner - 16:9 on Left / Top */}
                        <div className="lg:col-span-5 relative aspect-video lg:aspect-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center group">
                            {course.thumbnail && !imgError ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    onError={() => setImgError(true)}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                                        <BookOpen className="w-10 h-10 text-white/80" />
                                    </div>
                                    <span className="text-white/60 font-semibold text-sm">
                                        {course.category || (isRTL ? 'دورة تدريبية' : 'Course')}
                                    </span>
                                </div>
                            )}

                            {/* Floating Overlay Badges */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                            <div className="absolute top-3.5 start-3.5 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md border ${statusStyle.badge}`}>
                                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
                                    {statusStyle.label}
                                </span>

                                {course.featured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-md border border-amber-400/50">
                                        <Star className="w-3.5 h-3.5 fill-white" />
                                        {isRTL ? 'دورة مميزة' : 'Featured'}
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-3.5 start-3.5 end-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                                        {getLevelLabel(course.courseLevel || course.level)}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                                        {getTypeLabel(course.courseType)}
                                    </span>
                                </div>

                                {course.promotionalVideo && (
                                    <a 
                                        href={course.promotionalVideo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl bg-primary-600/90 hover:bg-primary-600 text-white backdrop-blur-md transition shadow-lg flex items-center gap-1 text-xs font-semibold"
                                        title={isRTL ? 'مشاهدة الفيديو التعريفي' : 'Watch Promo Video'}
                                    >
                                        <Play className="w-4 h-4 fill-white" />
                                        <span>{isRTL ? 'فيديو ترويجي' : 'Promo'}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Course Hero Info - Right / Bottom */}
                        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                {/* Category & Subcategory tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {course.category && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800 text-xs font-semibold">
                                            <Layers className="w-3.5 h-3.5" />
                                            {course.category}
                                        </span>
                                    )}
                                    {course.subCategory && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-xs font-semibold">
                                            {course.subCategory}
                                        </span>
                                    )}
                                    {course.language && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                                            {course.language}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                                    {course.title}
                                </h1>

                                {/* Instructor & Timestamps */}
                                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pb-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                            {instructorInitials}
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-200 font-semibold">
                                            {instructorFullName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{isRTL ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(course.createdAt)}</span>
                                    </div>
                                    <button 
                                        onClick={handleCopyId}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition text-xs"
                                        title={isRTL ? 'نسخ معرف الدورة' : 'Copy Course ID'}
                                    >
                                        {copiedId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span className="font-mono text-[11px]">{course._id?.slice(0, 8)}...</span>
                                    </button>
                                </div>
                            </div>

                            {/* Stat Metrics Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                {/* Metric 1: Students */}
                                <div 
                                    onClick={() => setActiveTab('students')}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group"
                                    title={isRTL ? 'انقر لعرض قائمة الطلاب' : 'Click to view students list'}
                                >
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition" />
                                            <span>{isRTL ? 'الطلاب المسجلون' : 'Students'}</span>
                                        </div>
                                        <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold opacity-0 group-hover:opacity-100 transition">
                                            {isRTL ? 'عرض القائمة ←' : 'View list →'}
                                        </span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{course.enrolledStudentsCount ?? studentsStats.total ?? course.enrolledStudents?.length ?? 0}</span>
                                        <span className="text-xs font-normal text-slate-400">{isRTL ? 'طالب' : 'enrolled'}</span>
                                    </p>
                                </div>

                                {/* Metric 2: Duration */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                                        <span>{isRTL ? 'المدة الإجمالية' : 'Duration'}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">
                                        {formatDuration(totalCalculatedDuration)}
                                    </p>
                                </div>

                                {/* Metric 3: Lectures */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{isRTL ? 'المحتوى' : 'Curriculum'}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">
                                        {totalLecturesCount} {isRTL ? 'درس' : 'lectures'}
                                    </p>
                                </div>

                                {/* Metric 4: Price */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                        <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{isRTL ? 'السعر الأساسي' : 'Base Price'}</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">
                                        {formatPrice(course.price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. MAIN GRID (TABS + SIDEBAR) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT / CENTER CONTENT AREA (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Modern Tab Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'overview'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>{isRTL ? 'نظرة عامة والوصف' : 'Overview & Details'}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('curriculum')}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'curriculum'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>{isRTL ? 'المنهج الدراسي' : 'Curriculum'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${activeTab === 'curriculum' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    {totalLecturesCount}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('students')}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'students'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>{isRTL ? 'الطلاب المشاركون' : 'Enrolled Students'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    activeTab === 'students' 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                }`}>
                                    {course.enrolledStudentsCount ?? studentsStats.total ?? course.enrolledStudents?.length ?? 0}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('pricing')}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'pricing'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <DollarSign className="w-4 h-4" />
                                <span>{isRTL ? 'التسعير والاشتراك' : 'Pricing & Enrollment'}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('meta')}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'meta'
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{isRTL ? 'معلومات إضافية' : 'Specifications'}</span>
                            </button>
                        </div>

                        {/* TAB 1: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Course Description Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <span>{isRTL ? 'وصف ومحتوى الدورة' : 'Course Description'}</span>
                                    </h3>
                                    
                                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                                        <RichTextDisplay 
                                            content={course.description || (isRTL ? 'لا يوجد وصف مدخل لهذه الدورة حتى الآن.' : 'No description provided yet.')} 
                                            showFull={true}
                                        />
                                    </div>

                                    {/* Topics Badges */}
                                    {((course.topics && Array.isArray(course.topics) && course.topics.length > 0) || course.topic) && (
                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
                                                {isRTL ? 'المواضيع والوسوم' : 'Topics & Tags'}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {course.topics && Array.isArray(course.topics) ? (
                                                    course.topics.map((tp, idx) => (
                                                        <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                                            #{tp}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                                        #{course.topic}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Learning Outcomes (What You'll Learn) */}
                                {(course.whatYouWillLearn || course.learningOutcomes) && (course.whatYouWillLearn?.length > 0 || course.learningOutcomes?.length > 0) && (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            <span>{isRTL ? 'ماذا سيتعلم الطالب في هذه الدورة' : 'What You Will Learn'}</span>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(course.whatYouWillLearn || course.learningOutcomes).map((outcome, idx) => {
                                                const mainText = typeof outcome === 'string' ? outcome : (outcome?.main || '');
                                                const subPoints = typeof outcome === 'string' ? [] : (outcome?.subPoints || []);

                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3"
                                                    >
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                                            <Check className="w-4 h-4 stroke-[3]" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                                                {mainText}
                                                            </p>
                                                            {subPoints && subPoints.length > 0 && (
                                                                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                                                    {subPoints.map((sub, sIdx) => (
                                                                        <li key={sIdx} className="flex items-center gap-1.5">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                                            <span>{sub}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                {course.requirements && course.requirements.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <span>{isRTL ? 'المتطلبات الأساسية للالتحاق' : 'Course Requirements'}</span>
                                        </h3>

                                        <div className="space-y-2.5">
                                            {course.requirements.map((req, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                                    <span>{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Course Brochure Download */}
                                {course.brochure && (
                                    <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
                                                <FileDown className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                                                    {isRTL ? 'كتيب المنهاج التعريفي (Brochure)' : 'Course Brochure & Syllabus'}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {isRTL ? 'ملف المنهاج والتفاصيل المرفق من قبل المدرب' : 'Official course brochure and detailed syllabus'}
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={course.brochure}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition shrink-0"
                                        >
                                            <FileDown className="w-4 h-4" />
                                            <span>{isRTL ? 'تحميل الكتيب' : 'Download PDF'}</span>
                                        </a>
                                    </div>
                                )}

                                {/* Copyright Notice */}
                                <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                                            {isRTL ? 'إشعار حقوق النشر والملكية الفكرية' : 'Copyright & Ownership Notice'}
                                        </p>
                                        <p>
                                            {isRTL 
                                                ? 'جميع محتويات ومواد الدورة التدريبية هي ملك للمنصة أو المدرب المرخص. حقوق الدورة محفوظة وفق الشروط والأحكام.' 
                                                : 'All course content and materials are property of the platform or the licensed instructor. All rights reserved.'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: CURRICULUM */}
                        {activeTab === 'curriculum' && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Curriculum Summary & Controls */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {isRTL ? 'منهاج الدورة والدروس' : 'Curriculum Structure'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {course.sections?.length || 0} {isRTL ? 'أقسام رئيسية' : 'sections'} • {totalLecturesCount} {isRTL ? 'محاضرة / درس' : 'lectures'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={expandAllSections}
                                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                                        >
                                            {isRTL ? 'توسيع الكل' : 'Expand All'}
                                        </button>
                                        <button
                                            onClick={collapseAllSections}
                                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                                        >
                                            {isRTL ? 'طي الكل' : 'Collapse All'}
                                        </button>
                                    </div>
                                </div>

                                {/* Sections Accordion */}
                                {course.sections && course.sections.length > 0 ? (
                                    course.sections.map((section, sIdx) => {
                                        const isExpanded = !!expandedSections[sIdx];
                                        const sectionDuration = section.lectures?.reduce((acc, lec) => {
                                            const dur = Number(lec.video?.duration || lec.duration || 0);
                                            return acc + (isNaN(dur) ? 0 : dur);
                                        }, 0) || 0;

                                        return (
                                            <div 
                                                key={sIdx}
                                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
                                            >
                                                {/* Section Header */}
                                                <button
                                                    onClick={() => toggleSection(sIdx)}
                                                    className="w-full p-5 flex items-center justify-between text-start hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition gap-4"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0">
                                                            {sIdx + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                                {section.name || section.title || `${isRTL ? 'القسم' : 'Section'} ${sIdx + 1}`}
                                                            </h4>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                {section.lectures?.length || 0} {isRTL ? 'دروس' : 'lectures'}
                                                                {sectionDuration > 0 && ` • ${formatDuration(sectionDuration)}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </div>
                                                </button>

                                                {/* Section Lectures List */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40"
                                                        >
                                                            {section.lectures && section.lectures.length > 0 ? (
                                                                section.lectures.map((lecture, lIdx) => (
                                                                    <div 
                                                                        key={lIdx} 
                                                                        className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-white dark:hover:bg-slate-800/40 transition text-xs sm:text-sm"
                                                                    >
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                                                                <Video className="w-3.5 h-3.5 text-primary-500" />
                                                                            </div>
                                                                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                                                {lecture.name || lecture.title || `${isRTL ? 'درس' : 'Lecture'} ${lIdx + 1}`}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                            {(lecture.isFree || lecture.isPreview) && (
                                                                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                                                                                    {isRTL ? 'معاينة مجانية' : 'Free Preview'}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                                                {formatDuration(lecture.video?.duration || lecture.duration)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-center text-xs text-slate-400">
                                                                    {isRTL ? 'لا توجد دروس مضافة في هذا القسم' : 'No lectures in this section yet.'}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                                        <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                            {isRTL ? 'لم تتم إضافة منهج دراسي بعد' : 'No curriculum added yet'}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {isRTL ? 'يمكن للمدرب أو الأدمن إضافة أقسام ودروس من خلال صفحة التعديل.' : 'Add sections and lectures via the course editor.'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: PRICING & ENROLLMENT */}
                        {activeTab === 'pricing' && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Base Price Showcase */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {isRTL ? 'السعر الافتراضي للدورة' : 'Standard Base Price'}
                                        </span>
                                        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
                                            {formatPrice(course.price)}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {isRTL ? 'يطبق هذا السعر لجميع الطلاب والبلدان ما لم تكن هناك تسعيرة مخصصة.' : 'Applies to all students unless regional overrides exist.'}
                                        </p>
                                    </div>

                                    {/* Action to enroll */}
                                    <button
                                        onClick={() => setIsEnrollModalOpen(true)}
                                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition shrink-0"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>{isRTL ? 'تسجيل طالب يدوياً الآن' : 'Manually Enroll Student'}</span>
                                    </button>
                                </div>

                                {/* Regional Pricing Overrides */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <span>{isRTL ? 'تسعير الدول المخصص (Country Pricing)' : 'Regional Country Pricing'}</span>
                                        </h3>

                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            course.hasPricingOverride && course.coursePricing?.length > 0
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {course.hasPricingOverride && course.coursePricing?.length > 0 
                                                ? (isRTL ? 'مفعل' : 'Enabled') 
                                                : (isRTL ? 'غير مفعل' : 'Disabled')}
                                        </span>
                                    </div>

                                    {course.hasPricingOverride && course.coursePricing?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {course.coursePricing.map((rule, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {rule.groupName || (rule.countries && rule.countries.join(', ')) || (isRTL ? 'مجموعة دول' : 'Country Group')}
                                                        </p>
                                                        <span className="text-xs text-slate-500">
                                                            {rule.countries?.length || 0} {isRTL ? 'دول' : 'countries'}
                                                        </span>
                                                    </div>
                                                    <div className="text-base font-extrabold text-primary-600 dark:text-primary-400">
                                                        {formatPrice(rule.price)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {isRTL 
                                                ? 'لا توجد قواعد تسعير إقليمية خاصة بهذه الدورة. السعر موحد لجميع البلدان.' 
                                                : 'No regional price overrides configured for this course. Standard pricing applies everywhere.'}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 4: METADATA & SPECIFICATIONS */}
                        {activeTab === 'meta' && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                                        {isRTL ? 'المواصفات الفنية والجدول' : 'Specifications & Details'}
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Course Type */}
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'نوع الدورة' : 'Course Type'}</span>
                                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                {getTypeLabel(course.courseType)}
                                            </p>
                                        </div>

                                        {/* Level */}
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'المستوى' : 'Level'}</span>
                                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                {getLevelLabel(course.courseLevel || course.level)}
                                            </p>
                                        </div>

                                        {/* Language */}
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'لغة الشرح' : 'Primary Language'}</span>
                                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                {course.language || (isRTL ? 'العربية' : 'Arabic')}
                                            </p>
                                            {course.subtitleLanguage && (
                                                <span className="text-xs text-slate-500 mt-1 block">
                                                    {isRTL ? 'الترجمة:' : 'Subtitles:'} {course.subtitleLanguage}
                                                </span>
                                            )}
                                        </div>

                                        {/* Enrolled Students Count */}
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'الطلاب المسجلين' : 'Enrolled Students'}</span>
                                            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                {course.enrolledStudents?.length || 0} {isRTL ? 'طالب' : 'students'}
                                            </p>
                                        </div>

                                        {/* Dates for live / onsite */}
                                        {(course.startDate || course.endDate) && (
                                            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'فترة الانعقاد' : 'Schedule Window'}</span>
                                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                    {course.startDate && formatDate(course.startDate)}
                                                    {course.startDate && course.endDate && ' - '}
                                                    {course.endDate && formatDate(course.endDate)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Location for onsite */}
                                        {course.courseType === 'onsite' && course.location && (
                                            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'موقع ومقر الدورة' : 'Location & Venue'}</span>
                                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                                    {course.location}
                                                </p>
                                                {course.address && (
                                                    <span className="text-xs text-slate-500 mt-1 block">
                                                        {course.address}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 5: ENROLLED STUDENTS */}
                        {activeTab === 'students' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 8 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* KPI Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
                                            <Users className="w-4 h-4" />
                                            <span>{isRTL ? 'إجمالي الطلاب' : 'Total Students'}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {studentsStats.total}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{isRTL ? 'قيد التعلم والتقدم' : 'In Progress'}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {studentsStats.inProgress}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                                            <Award className="w-4 h-4" />
                                            <span>{isRTL ? 'أتموا الدورة بنجاح' : 'Completed'}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {studentsStats.completed}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
                                            <UserCheck className="w-4 h-4" />
                                            <span>{isRTL ? 'مسجلون حديثاً' : 'Newly Enrolled'}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {studentsStats.enrolled}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls: Search, Filter & Actions */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                                        {/* Search Input */}
                                        <div className="relative flex-1">
                                            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                                            <input
                                                type="text"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                placeholder={isRTL ? 'ابحث بالاسم، البريد الإلكتروني، الهاتف، أو الرقم التسلسلي...' : 'Search by name, email, phone, or serial...'}
                                                className="w-full ps-9 pe-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                                            />
                                            {studentSearch && (
                                                <button
                                                    onClick={() => setStudentSearch('')}
                                                    className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => setIsEnrollModalOpen(true)}
                                                className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-sm shadow-primary-500/20"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                <span>{isRTL ? 'تسجيل طالب جديد' : 'Enroll Student'}</span>
                                            </button>

                                            <button
                                                onClick={handleExportCSV}
                                                disabled={students.length === 0}
                                                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                                title={isRTL ? 'تصدير كملف CSV' : 'Export CSV'}
                                            >
                                                <Download className="w-4 h-4 text-slate-500" />
                                                <span className="hidden sm:inline">{isRTL ? 'تصدير' : 'Export'}</span>
                                            </button>

                                            <button
                                                onClick={() => fetchStudents(studentPage)}
                                                disabled={studentsLoading}
                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                                                title={isRTL ? 'تحديث البيانات' : 'Refresh list'}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${studentsLoading ? 'animate-spin text-primary-500' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Filter Chips */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {isRTL ? 'الحالة:' : 'Filter:'}
                                        </span>
                                        {[
                                            { id: 'all', label: isRTL ? 'الكل' : 'All', count: studentsStats.total },
                                            { id: 'enrolled', label: isRTL ? 'مسجل حديثاً' : 'Enrolled', count: studentsStats.enrolled },
                                            { id: 'in-progress', label: isRTL ? 'قيد التعلم' : 'In Progress', count: studentsStats.inProgress },
                                            { id: 'finished', label: isRTL ? 'أتموا الدورة' : 'Completed', count: studentsStats.completed }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setStudentStatusFilter(f.id)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                                                    studentStatusFilter === f.id
                                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                                                }`}
                                            >
                                                <span>{f.label}</span>
                                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                                    studentStatusFilter === f.id
                                                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                                                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {f.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Students List / Cards */}
                                {studentsLoading && students.length === 0 ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                            {studentSearch 
                                                ? (isRTL ? 'لا توجد نتائج مطابقة لبحثك' : 'No students matching your search')
                                                : (isRTL ? 'لا يوجد طلاب مسجلون في هذه الدورة حتى الآن' : 'No students enrolled in this course yet')}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                            {studentSearch
                                                ? (isRTL ? 'جرب البحث باسم آخر أو إزالة تصفيات البحث.' : 'Try adjusting your search criteria.')
                                                : (isRTL ? 'يمكنك إضافة طلاب وتسجيلهم يدوياً عبر زر "تسجيل طالب جديد".' : 'You can manually enroll students using the button above.')}
                                        </p>
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            {studentSearch ? (
                                                <button
                                                    onClick={() => setStudentSearch('')}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                                                >
                                                    {isRTL ? 'مسح البحث' : 'Clear search'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEnrollModalOpen(true)}
                                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    <span>{isRTL ? 'تسجيل أول طالب الآن' : 'Enroll First Student'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {students.map((item) => {
                                            const studentName = item.student?.name || (isRTL ? 'طالب' : 'Student');
                                            const studentInitials = studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
                                            const cleanPhone = (item.student?.phone || '').replace(/[^0-9+]/g, '');
                                            const whatsappNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('0') ? '966' + cleanPhone.slice(1) : cleanPhone);
                                            const progressPercent = Math.min(100, Math.max(0, item.progress?.overallProgress || 0));

                                            return (
                                                <div 
                                                    key={item._id}
                                                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                                                >
                                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                        
                                                        {/* Student Identity */}
                                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                                            {item.student?.avatar ? (
                                                                <img 
                                                                    src={item.student.avatar} 
                                                                    alt={studentName} 
                                                                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                                                                    {studentInitials}
                                                                </div>
                                                            )}

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {item.student?._id ? (
                                                                        <Link 
                                                                            to={`/admin/students/${item.student._id}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition truncate flex items-center gap-1.5"
                                                                        >
                                                                            <span>{studentName}</span>
                                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline" />
                                                                        </Link>
                                                                    ) : (
                                                                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                                            {studentName}
                                                                        </h4>
                                                                    )}

                                                                    {/* Enrollment Type Badge */}
                                                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                                                        item.isManual
                                                                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                                                    }`}>
                                                                        {item.isManual ? (isRTL ? 'تسجيل يدوي (أدمن)' : 'Manual Admin') : (isRTL ? 'دفع إلكتروني' : 'Paid Online')}
                                                                    </span>

                                                                    {/* Status Badge */}
                                                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                                                        item.status === 'finished' || item.status === 'passed'
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                                                            : item.status === 'in-progress'
                                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                                                                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                                                                    }`}>
                                                                        {item.status === 'finished' || item.status === 'passed'
                                                                            ? (isRTL ? 'أتم الدورة' : 'Completed')
                                                                            : item.status === 'in-progress'
                                                                            ? (isRTL ? 'قيد التعلم' : 'In Progress')
                                                                            : (isRTL ? 'مسجل' : 'Enrolled')}
                                                                    </span>
                                                                </div>

                                                                {/* Contact Info Row */}
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                    {item.student?.email && (
                                                                        <a 
                                                                            href={`mailto:${item.student.email}`}
                                                                            className="flex items-center gap-1 hover:text-primary-600 transition truncate max-w-xs"
                                                                        >
                                                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                            <span className="truncate">{item.student.email}</span>
                                                                        </a>
                                                                    )}

                                                                    {item.student?.phone && (
                                                                        <a 
                                                                            href={`tel:${item.student.phone}`}
                                                                            className="flex items-center gap-1 hover:text-primary-600 transition"
                                                                            dir="ltr"
                                                                        >
                                                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                            <span>{item.student.phone}</span>
                                                                        </a>
                                                                    )}

                                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                                        <span>{isRTL ? 'سجل في:' : 'Enrolled:'} {formatDate(item.enrolledAt)}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Onsite / Offline specific info */}
                                                                {(item.serialNumber || item.accessCode || item.attendanceStatus) && (
                                                                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                                                                        {item.serialNumber && (
                                                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                                                                                {isRTL ? 'الرقم:' : 'Serial:'} {item.serialNumber}
                                                                            </span>
                                                                        )}
                                                                        {item.accessCode && (
                                                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                                                                                {isRTL ? 'كود الدخول:' : 'Code:'} {item.accessCode}
                                                                            </span>
                                                                        )}
                                                                        {item.checkedIn ? (
                                                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold">
                                                                                {isRTL ? '✓ تم الحضور' : '✓ Checked in'}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Progress & Actions */}
                                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                                            {/* Progress Bar Widget */}
                                                            <div className="w-28 sm:w-32">
                                                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                                    <span>{isRTL ? 'الإنجاز' : 'Progress'}</span>
                                                                    <span>{progressPercent}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                                    <div 
                                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                                            progressPercent >= 100 
                                                                                ? 'bg-emerald-500' 
                                                                                : progressPercent > 0 
                                                                                ? 'bg-blue-600' 
                                                                                : 'bg-slate-300 dark:bg-slate-700'
                                                                        }`}
                                                                        style={{ width: `${progressPercent}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                                                                    {item.progress?.completedLecturesCount || 0} {isRTL ? 'درس مكتمل' : 'lectures done'}
                                                                </span>
                                                            </div>

                                                            {/* Action Icons */}
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {whatsappNumber && (
                                                                    <a 
                                                                        href={`https://wa.me/${whatsappNumber}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                                                                        title={isRTL ? 'مراسلة عبر واتساب' : 'WhatsApp'}
                                                                    >
                                                                        <MessageCircle className="w-4 h-4" />
                                                                    </a>
                                                                )}

                                                                {item.student?._id && (
                                                                    <Link
                                                                        to={`/admin/students/${item.student._id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                                        title={isRTL ? 'عرض ملف الطالب' : 'View profile'}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </Link>
                                                                )}

                                                                <button
                                                                    onClick={() => setEnrollmentToDelete(item)}
                                                                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                                    title={isRTL ? 'إلغاء تسجيل الطالب' : 'Remove enrollment'}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT / SIDEBAR (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. INSTRUCTOR CARD */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
                                {isRTL ? 'المحاضر والمدرب' : 'Instructor'}
                            </span>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
                                    {instructorInitials}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                        {instructorFullName}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                        {course.instructor?.email || (isRTL ? 'لا يوجد بريد إلكتروني' : 'No email')}
                                    </p>
                                </div>
                            </div>

                            {course.instructor?._id && (
                                <Link
                                    to={`/profile/${course.instructor._id}`}
                                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>{isRTL ? 'عرض الملف الشخصي للمدرب' : 'View Instructor Profile'}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </Link>
                            )}
                        </div>

                        {/* 2. ADMIN ACTIONS CONTROL CENTER */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary-500" />
                                <span>{isRTL ? 'إجراءات الإدارة السريعة' : 'Admin Control Center'}</span>
                            </h3>

                            <div className="space-y-3">
                                {/* Toggle Featured */}
                                <button
                                    onClick={handleToggleFeatured}
                                    disabled={actionLoading}
                                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                                        course.featured
                                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    <Star className={`w-4 h-4 ${course.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                    <span>
                                        {course.featured 
                                            ? (isRTL ? 'إلغاء التمييز' : 'Remove from Featured') 
                                            : (isRTL ? 'تمييز الدورة ⭐' : 'Mark as Featured ⭐')}
                                    </span>
                                </button>

                                {/* Edit Course */}
                                <Link
                                    to={`/admin/courses/${id}/edit`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                                >
                                    <Pencil className="w-4 h-4" />
                                    <span>{isRTL ? 'تعديل تفاصيل الدورة' : 'Edit Course Details'}</span>
                                </Link>

                                {/* Manual Enroll Button */}
                                <button
                                    onClick={() => setIsEnrollModalOpen(true)}
                                    className="w-full py-3 px-4 rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>{isRTL ? 'تسجيل طالب يدوياً' : 'Manual Student Enrollment'}</span>
                                </button>

                                {/* Delete Course */}
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={actionLoading}
                                    className="w-full py-3 px-4 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{isRTL ? 'حذف هذه الدورة' : 'Delete Course'}</span>
                                </button>
                            </div>
                        </div>

                        {/* 3. SYSTEM META INFO */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs space-y-3">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block">
                                {isRTL ? 'بيانات النظام' : 'System Meta'}
                            </span>

                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">{isRTL ? 'معرف الدورة:' : 'ID:'}</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{course._id}</span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                                <span className="text-slate-700 dark:text-slate-300">{formatDate(course.createdAt)}</span>
                            </div>

                            <div className="flex items-center justify-between py-1">
                                <span className="text-slate-500">{isRTL ? 'آخر تحديث:' : 'Updated:'}</span>
                                <span className="text-slate-700 dark:text-slate-300">{formatDate(course.updatedAt)}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MANUAL ENROLLMENT MODAL */}
            {/* ======================================================== */}
            <ManualEnrollmentModal 
                isOpen={isEnrollModalOpen} 
                onClose={() => setIsEnrollModalOpen(false)} 
                courseId={id} 
                onEnrollSuccess={(user) => {
                    toast.success(
                        isRTL 
                            ? `تم تسجيل الطالب ${user?.name || user?.firstName || ''} بنجاح!` 
                            : `Student ${user?.name || user?.firstName || ''} enrolled successfully!`
                    );
                    fetchCourseDetails();
                    fetchStudents(1);
                }} 
            />

            {/* ======================================================== */}
            {/* DELETE ENROLLMENT MODAL */}
            {/* ======================================================== */}
            <AnimatePresence>
                {enrollmentToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
                                {isRTL ? 'تأكيد إلغاء تسجيل الطالب' : 'Confirm Unenrollment'}
                            </h3>

                            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                                {isRTL 
                                    ? `هل أنت متأكد من رغبتك في إلغاء تسجيل الطالب "${enrollmentToDelete.student?.name || (isRTL ? 'هذا الطالب' : 'this student')}" من دورة "${course.title}"؟`
                                    : `Are you sure you want to remove student "${enrollmentToDelete.student?.name || 'this student'}" from "${course.title}"?`}
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setEnrollmentToDelete(null)}
                                    disabled={isDeletingEnrollment}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleDeleteEnrollment}
                                    disabled={isDeletingEnrollment}
                                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeletingEnrollment && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{isRTL ? 'تأكيد الإلغاء' : 'Unenroll'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
                                {isRTL ? 'تأكيد حذف الدورة التدريبية' : 'Confirm Course Deletion'}
                            </h3>

                            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                                {isRTL 
                                    ? `هل أنت متأكد من رغبتك في حذف دورة "${course.title}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`
                                    : `Are you sure you want to permanently delete "${course.title}"? This action cannot be undone.`}
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{isRTL ? 'تأكيد الحذف' : 'Delete Now'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseDetail;
