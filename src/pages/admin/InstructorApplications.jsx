import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Eye, 
    X, 
    Search, 
    FileText, 
    Award, 
    Image as ImageIcon, 
    Video, 
    ExternalLink, 
    User, 
    Calendar, 
    Layers, 
    Mail, 
    Phone, 
    MapPin, 
    GraduationCap, 
    Loader2 
} from 'lucide-react';

const InstructorApplications = ({ onCountChange, isRefreshingParent }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchApplications = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await adminService.getPendingInstructorApplications();
            const list = Array.isArray(response.applications) 
                ? response.applications 
                : (Array.isArray(response.data) ? response.data : []);

            setApplications(list);
            if (onCountChange) {
                onCountChange(list.length);
            }
        } catch (error) {
            toast.error(t('admin.instructorApplications.fetchFailed', 'تعذّر جلب طلبات الانضمام'));
            console.error(error);
            setApplications([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [onCountChange, t]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Parent trigger refresh
    useEffect(() => {
        if (isRefreshingParent) {
            fetchApplications(true);
        }
    }, [isRefreshingParent, fetchApplications]);

    const handleApplicationAction = async (applicationId, status) => {
        const confirmMsg = status === 'approved' 
            ? t('admin.instructors.confirmApprove', 'هل أنت متأكد من اعتماد طلب الانضمام هذا؟')
            : t('admin.instructors.confirmReject', 'هل أنت متأكد من رفض طلب الانضمام هذا؟');

        if (!window.confirm(confirmMsg)) return;

        setActionLoadingId(applicationId);
        try {
            await adminService.reviewInstructorApplication(applicationId, { status });
            toast.success(
                t('admin.instructorApplications.statusSuccess', { 
                    status: t(`admin.instructorApplications.${status === 'approved' ? 'approved' : 'rejected'}`) 
                })
            );
            if (selectedApplication?._id === applicationId) {
                setSelectedApplication(null);
            }
            fetchApplications();
        } catch (error) {
            toast.error(t('admin.instructorApplications.updateFailed', 'فشل في تحديث حالة الطلب'));
            console.error(error);
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filter applications by search term
    const filteredApplications = useMemo(() => {
        if (!searchTerm.trim()) return applications;
        const query = searchTerm.toLowerCase().trim();
        return applications.filter(app => {
            const fullName = `${app.firstName || ''} ${app.middleName || ''} ${app.lastName || ''}`.toLowerCase();
            const email = (app.email || '').toLowerCase();
            const phone = (app.phone || '').toLowerCase();
            const category = (app.category || '').toLowerCase();
            return fullName.includes(query) || 
                   email.includes(query) || 
                   phone.includes(query) || 
                   category.includes(query);
        });
    }, [applications, searchTerm]);

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ======================================================== */}
            {/* Search Filter Bar */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('admin.instructors.searchApplicationsPlaceholder', 'ابحث في الطلبات بالاسم أو البريد الإلكتروني أو التخصص...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-10 pe-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* Applications List Display */}
            {/* ======================================================== */}
            {loading ? (
                /* Skeleton Loader */
                <div className="grid gap-4">
                    {[...Array(4)].map((_, idx) => (
                        <div 
                            key={idx}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                                </div>
                                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredApplications.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t('admin.instructors.noApplications', 'لا توجد طلبات انضمام معلقة')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {searchTerm 
                            ? t('admin.courses.trySearch', 'لم يتم العثور على أي طلبات مطابقة لبحثك.') 
                            : t('admin.instructors.noApplicationsDesc', 'تمت مراجعة جميع طلبات الانضمام كمحاضر في الوقت الحالي.')}
                    </p>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>{t('admin.instructors.clearSearch', 'إلغاء البحث')}</span>
                        </button>
                    )}
                </div>
            ) : (
                /* Applications Cards */
                <div className="grid gap-4">
                    {filteredApplications.map((application) => {
                        const fullName = `${application.firstName || ''} ${application.middleName || ''} ${application.lastName || ''}`.trim() || t('admin.courses.unknownInstructor', 'متقدم');
                        const initials = `${application.firstName?.charAt(0) || ''}${application.lastName?.charAt(0) || ''}`.toUpperCase() || 'AP';
                        const isProcessing = actionLoadingId === application._id;

                        return (
                            <div 
                                key={application._id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                                {/* Left Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                                {fullName}
                                            </h3>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                {t('admin.instructors.pendingReview', 'قيد المراجعة')}
                                            </span>
                                            {application.category && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
                                                    <Layers className="w-3 h-3" />
                                                    {application.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {application.email}
                                            </span>
                                            {application.phone && (
                                                <span className="flex items-center gap-1" dir="ltr">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {application.phone}
                                                </span>
                                            )}
                                            {application.universityDegree && (
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                                    {application.universityDegree}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {t('admin.instructors.appliedOn', 'تاريخ التقديم')}: {new Date(application.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                                    {/* View Details Modal Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedApplication(application)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 text-slate-500" />
                                        <span>{t('admin.instructors.reviewApplication', 'مراجعة الطلب')}</span>
                                    </button>

                                    {/* Quick Reject Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleApplicationAction(application._id, 'rejected')}
                                        disabled={isProcessing}
                                        title={t('admin.instructors.quickReject', 'رفض')}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{t('admin.instructors.reject', 'رفض')}</span>
                                    </button>

                                    {/* Quick Approve Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleApplicationAction(application._id, 'approved')}
                                        disabled={isProcessing}
                                        title={t('admin.instructors.quickApprove', 'اعتماد')}
                                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-colors disabled:opacity-50"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        <span>{t('admin.instructors.approve', 'اعتماد')}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ======================================================== */}
            {/* Application Details Modal */}
            {/* ======================================================== */}
            {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('admin.detailLabels.applicationDetails', 'تفاصيل طلب الانضمام')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {selectedApplication.firstName} {selectedApplication.middleName || ''} {selectedApplication.lastName}
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSelectedApplication(null)}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Personal Information */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary-600" />
                                    <span>{t('admin.detailLabels.personalInformation', 'المعلومات الشخصية')}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.name', 'الاسم بالكامل')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.firstName} {selectedApplication.middleName || ''} {selectedApplication.lastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.email', 'البريد الإلكتروني')}:</span>
                                        <a href={`mailto:${selectedApplication.email}`} className="font-semibold text-primary-600 hover:underline">
                                            {selectedApplication.email}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.phone', 'رقم الهاتف')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
                                            {selectedApplication.phone || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.nationality', 'الجنسية')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.nationality || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.gender', 'الجنس')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.gender || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.age', 'العمر')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.age || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    <span>{t('admin.detailLabels.academicInformation', 'المؤهلات الأكاديمية والتخصص')}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.universityDegree', 'المؤهل الجامعي')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.universityDegree || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.place', 'الجهة / الجامعة')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.place || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.category', 'التصنيف الرئيسي')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.category || '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium block">{t('admin.detailLabels.subCategory', 'التخصص الدقيق')}:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedApplication.subCategory || '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Attached Documents */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-600" />
                                    <span>{t('admin.instructors.documentsAttached', 'المستندات المرفقة')}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* CV */}
                                    {selectedApplication.cv ? (
                                        <a 
                                            href={selectedApplication.cv}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                                        {t('admin.detailLabels.viewCv', 'السيرة الذاتية')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">PDF / Document</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors shrink-0" />
                                        </a>
                                    ) : null}

                                    {/* Certificate */}
                                    {selectedApplication.certificate ? (
                                        <a 
                                            href={selectedApplication.certificate}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                                    <Award className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                                        {t('admin.detailLabels.viewCertificate', 'الشهادة العلمية')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Certificate</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                                        </a>
                                    ) : null}

                                    {/* Photo */}
                                    {selectedApplication.photo ? (
                                        <a 
                                            href={selectedApplication.photo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                                        {t('admin.detailLabels.viewPhoto', 'الصورة الشخصية')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Image</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                                        </a>
                                    ) : null}

                                    {/* Video */}
                                    {selectedApplication.video ? (
                                        <a 
                                            href={selectedApplication.video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                                                        {t('admin.detailLabels.viewVideo', 'الفيديو التعريفي')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Video</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Footer */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedApplication(null)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {t('common.cancel', 'إغلاق')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplicationAction(selectedApplication._id, 'rejected')}
                                disabled={actionLoadingId === selectedApplication._id}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>{t('admin.instructors.reject', 'رفض الطلب')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplicationAction(selectedApplication._id, 'approved')}
                                disabled={actionLoadingId === selectedApplication._id}
                                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t('admin.instructors.approve', 'اعتماد المحاضر')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorApplications;
