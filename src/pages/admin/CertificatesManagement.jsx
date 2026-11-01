import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { certificateService, courseService, adminService } from '../../services/new-api';
import CertificateTemplate from '../../components/shared/Certificate/CertificateTemplate';
import { ACCREDITATION_BODIES, getAccreditationById } from '../../data/accreditationBodies';
import {
    Award,
    Plus,
    Search,
    Printer,
    Share2,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle,
    QrCode,
    RefreshCw,
    Calendar,
    Clock,
    User,
    BookOpen,
    Shield,
    Sparkles,
    FileText,
    ExternalLink,
    X
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const CertificatesManagement = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();

    // Data states
    const [certificates, setCertificates] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal states
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [selectedViewCert, setSelectedViewCert] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manual Generator Form State
    const [formData, setFormData] = useState({
        studentName: '',
        studentEmail: '',
        courseId: '',
        courseTitle: '',
        courseDurationHours: 10,
        issueDate: new Date().toISOString().split('T')[0],
        trainerName: isRTL ? 'مدرب معتمد بالأكاديمية' : 'Certified Academy Instructor',
        ceoName: isRTL ? 'أكاديمية التعليم المتطور AEC' : 'Advanced Education Center (AEC)',
        issuedLocation: 'الرياض • Riyadh',
        hasAccreditation: true,
        accreditations: ['tvtc', 'american_board', 'british_board'],
        licenseNotice: isRTL 
            ? 'مرخصة من المؤسسة العامة للتدريب التقني والمهني • رقم الاعتماد: 212001000344'
            : 'Licensed by TVTC (Technical and Vocational Training Corp) • Accreditation No: 212001000344',
        customCertificateNumber: ''
    });

    useEffect(() => {
        fetchCertificates();
        fetchCoursesList();
    }, [page, statusFilter]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await certificateService.adminGetAllCertificates({
                search: search.trim(),
                status: statusFilter,
                page,
                limit: 15
            });
            if (res?.success) {
                setCertificates(res.certificates || []);
                setTotalPages(res.pages || 1);
                setTotalCount(res.total || 0);
            }
        } catch (error) {
            console.error('Error fetching admin certificates:', error);
            toast.error(isRTL ? 'تعذر جلب سجلات الشهادات' : 'Failed to fetch certificates');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoursesList = async () => {
        try {
            const res = await courseService.getAllCourses({ limit: 100 });
            if (res?.courses) {
                setCourses(res.courses);
            }
        } catch (err) {
            console.error('Error fetching courses for selector:', err);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCertificates();
    };

    // Auto-fill course title and accreditations when selecting a course
    const handleCourseSelect = (courseId) => {
        if (!courseId) {
            setFormData(prev => ({ ...prev, courseId: '', courseTitle: '' }));
            return;
        }
        const selected = courses.find(c => c._id === courseId);
        if (selected) {
            const hours = selected.duration > 0 ? Math.max(1, Math.round(selected.duration / 60)) : 10;
            const instructorName = selected.instructor?.name || 
                (selected.instructor?.firstName ? `${selected.instructor.firstName} ${selected.instructor.lastName || ''}`.trim() : formData.trainerName);

            setFormData(prev => ({
                ...prev,
                courseId: selected._id,
                courseTitle: selected.title,
                courseDurationHours: hours,
                trainerName: instructorName || prev.trainerName,
                hasAccreditation: selected.hasAccreditation !== false,
                accreditations: Array.isArray(selected.accreditations) && selected.accreditations.length > 0 
                    ? selected.accreditations 
                    : ['tvtc', 'american_board', 'british_board']
            }));
        }
    };

    // Toggle accreditation in manual generator
    const toggleAccreditation = (id) => {
        setFormData(prev => {
            const current = [...prev.accreditations];
            const idx = current.indexOf(id);
            if (idx > -1) {
                current.splice(idx, 1);
            } else {
                current.push(id);
            }
            return {
                ...prev,
                accreditations: current,
                hasAccreditation: current.length > 0
            };
        });
    };

    // Submit manual generation
    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentName.trim() || !formData.courseTitle.trim()) {
            toast.error(isRTL ? 'يرجى كتابة اسم المتدرب وعنوان الدورة' : 'Please provide student name and course title');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await certificateService.adminGenerateCertificate(formData);
            if (res?.success) {
                toast.success(isRTL ? 'تم توليد وحفظ الشهادة بنجاح 🎉' : 'Certificate generated and registered successfully 🎉');
                setIsGenerateModalOpen(false);
                // Reset form
                setFormData({
                    studentName: '',
                    studentEmail: '',
                    courseId: '',
                    courseTitle: '',
                    courseDurationHours: 10,
                    issueDate: new Date().toISOString().split('T')[0],
                    trainerName: isRTL ? 'مدرب معتمد بالأكاديمية' : 'Certified Academy Instructor',
                    ceoName: isRTL ? 'أكاديمية التعليم المتطور AEC' : 'Advanced Education Center (AEC)',
                    issuedLocation: 'الرياض • Riyadh',
                    hasAccreditation: true,
                    accreditations: ['tvtc', 'american_board', 'british_board'],
                    licenseNotice: isRTL 
                        ? 'مرخصة من المؤسسة العامة للتدريب التقني والمهني • رقم الاعتماد: 212001000344'
                        : 'Licensed by TVTC • Accreditation No: 212001000344',
                    customCertificateNumber: ''
                });
                fetchCertificates();
                // Optionally open the newly generated cert
                if (res.certificate) {
                    setSelectedViewCert(res.certificate);
                }
            }
        } catch (error) {
            console.error('Error generating certificate:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ أثناء توليد الشهادة' : 'Failed to generate certificate'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle status (active / revoked)
    const handleToggleStatus = async (id) => {
        try {
            const res = await certificateService.adminToggleCertificateStatus(id);
            if (res?.success) {
                toast.success(res.message || (isRTL ? 'تم تعديل حالة الشهادة' : 'Status updated'));
                fetchCertificates();
            }
        } catch (err) {
            toast.error(isRTL ? 'تعذر تعديل الحالة' : 'Failed to update status');
        }
    };

    // Delete certificate
    const handleDeleteCertificate = async (id, certNo) => {
        if (!window.confirm(isRTL ? `هل أنت متأكد من حذف الشهادة رقم (${certNo}) نهائياً؟` : `Delete certificate ${certNo} permanently?`)) {
            return;
        }
        try {
            const res = await certificateService.adminDeleteCertificate(id);
            if (res?.success) {
                toast.success(isRTL ? 'تم حذف الشهادة بنجاح' : 'Certificate deleted successfully');
                fetchCertificates();
            }
        } catch (err) {
            toast.error(isRTL ? 'تعذر حذف الشهادة' : 'Failed to delete certificate');
        }
    };

    return (
        <div className="space-y-8 font-arabic" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Header & Stats Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-[#004C97]/10 text-[#004C97] flex items-center justify-center font-bold">
                            <Award className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                            {isRTL ? 'إدارة وتوليد الشهادات المعتمدة' : 'Certificates Management & Issuance'}
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500">
                        {isRTL 
                            ? 'إصدار الشهادات الرسمية، ربط اعتمادات الدورات، وإدارة منظومة التحقق برمز الـ QR'
                            : 'Issue official certificates, attach course accreditations, and manage QR verification system'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#004C97] hover:bg-[#071942] text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-900/20 hover:scale-102 active:scale-98 transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isRTL ? 'توليد شهادة جديدة يدويًا' : 'Generate New Certificate'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500">{isRTL ? 'إجمالي الشهادات الصادرة' : 'Total Issued'}</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500">{isRTL ? 'الجهات المعتمدة النشطة' : 'Accredited Bodies'}</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{ACCREDITATION_BODIES.length}</div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500">{isRTL ? 'رقم اعتماد TVTC' : 'TVTC License No.'}</div>
                        <div className="text-base font-black text-emerald-600 font-mono mt-1">212001000344</div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500">{isRTL ? 'نظام التحقق QR' : 'QR Verification'}</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-1">
                            /verify-certificate/:id
                        </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                        <QrCode className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:w-auto">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={isRTL ? 'ابحث برقم الشهادة، اسم المتدرب، أو اسم الدورة...' : 'Search by cert number, trainee name, or course...'}
                        className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004C97]`}
                    />
                    <Search className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-3`} />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                        <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                        <option value="active">{isRTL ? 'معتمدة وسارية' : 'Active Only'}</option>
                        <option value="revoked">{isRTL ? 'ملغية' : 'Revoked Only'}</option>
                    </select>

                    <button
                        type="button"
                        onClick={fetchCertificates}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        title={isRTL ? 'تحديث' : 'Refresh'}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Table of Certificates */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <LoadingNew />
                        <span className="text-xs text-slate-500 mt-3">{isRTL ? 'جارٍ تحميل الشهادات...' : 'Loading certificates...'}</span>
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                        <p className="text-sm font-bold text-slate-500">{isRTL ? 'لا توجد شهادات مطابقة لخيارات البحث' : 'No certificates found'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-start">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'رقم الشهادة & QR' : 'Cert No & QR'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'اسم المتدرب' : 'Trainee Name'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'الدورة التدريبية' : 'Course'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'جهات الاعتماد' : 'Accreditations'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'النوع' : 'Type'}</th>
                                    <th className="py-3.5 px-4 text-start">{isRTL ? 'الحالة' : 'Status'}</th>
                                    <th className="py-3.5 px-4 text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {certificates.map((cert) => {
                                    const activeAccreds = (cert.hasAccreditation && Array.isArray(cert.accreditations))
                                        ? cert.accreditations.map(id => getAccreditationById(id)).filter(Boolean)
                                        : [];

                                    return (
                                        <tr key={cert._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                            
                                            {/* Cert Number & QR */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-[#004C97] dark:text-blue-400">
                                                <div className="flex items-center gap-2">
                                                    {cert.qrCodeImage ? (
                                                        <img src={cert.qrCodeImage} alt="QR" className="w-7 h-7 rounded border border-slate-200 shrink-0" />
                                                    ) : (
                                                        <QrCode className="w-5 h-5 text-slate-400 shrink-0" />
                                                    )}
                                                    <span>{cert.certificateNumber}</span>
                                                </div>
                                            </td>

                                            {/* Trainee */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                                <div>{cert.studentName}</div>
                                                {cert.studentEmail && (
                                                    <div className="text-[10px] text-slate-400 font-normal">{cert.studentEmail}</div>
                                                )}
                                            </td>

                                            {/* Course Title */}
                                            <td className="py-3.5 px-4 max-w-xs truncate" title={cert.courseTitle}>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{cert.courseTitle}</div>
                                                <div className="text-[10px] text-slate-400">{cert.courseDurationHours} {isRTL ? 'ساعة' : 'hrs'}</div>
                                            </td>

                                            {/* Accreditations Logos */}
                                            <td className="py-3.5 px-4">
                                                {activeAccreds.length > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {activeAccreds.map(accred => (
                                                            <div 
                                                                key={accred.id} 
                                                                className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0"
                                                                title={isRTL ? accred.nameAr : accred.nameEn}
                                                            >
                                                                <img src={accred.logo} alt="" className="w-full h-full object-contain" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">{isRTL ? 'بدون جهة اعتماد' : 'No Accreditation'}</span>
                                                )}
                                            </td>

                                            {/* Issue Date */}
                                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                                {new Date(cert.issueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                            </td>

                                            {/* Type */}
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    cert.isManual 
                                                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                                                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                                }`}>
                                                    {cert.isManual ? (isRTL ? 'يدوي (إدارة)' : 'Manual') : (isRTL ? 'تلقائي (إكمال)' : 'Auto')}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(cert._id)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                                        cert.status === 'active'
                                                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                                                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30'
                                                    }`}
                                                    title={isRTL ? 'انقر لتغيير الحالة' : 'Click to toggle status'}
                                                >
                                                    {cert.status === 'active' ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>{isRTL ? 'معتمدة' : 'Active'}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            <span>{isRTL ? 'ملغية' : 'Revoked'}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    
                                                    {/* View & Print */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedViewCert(cert)}
                                                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                                                        title={isRTL ? 'معاينة وطباعة الشهادة' : 'Preview & Print'}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Public Verify Link */}
                                                    <a
                                                        href={`/verify-certificate/${cert.certificateNumber}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                                                        title={isRTL ? 'رابط التحقق الإلكتروني' : 'Verification Page'}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCertificate(cert._id, cert.certificateNumber)}
                                                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                                                        title={isRTL ? 'حذف' : 'Delete'}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                            {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                            >
                                {isRTL ? 'السابق' : 'Previous'}
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                            >
                                {isRTL ? 'التالي' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MANUAL CERTIFICATE GENERATOR MODAL                                       */}
            {/* ========================================================================= */}
            {isGenerateModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                    onClick={() => setIsGenerateModalOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#004C97]/10 text-[#004C97] flex items-center justify-center">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        {isRTL ? 'توليد شهادة معتمدة جديدة' : 'Generate Accredited Certificate'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {isRTL ? 'إصدار شهادة حضور وتوليد رمز QR الخاص بها بالسجلات الرسمية' : 'Issue certificate with official QR code registration'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsGenerateModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleGenerateSubmit} className="space-y-6">
                            
                            {/* Course Selection or Custom Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isRTL ? 'اختر الدورة من النظام (أو اكتب دورة مخصصة أدناه):' : 'Select course from system (or type below):'}
                                </label>
                                <select
                                    value={formData.courseId}
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                    className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">{isRTL ? '-- اختر دورة لجلب بياناتها تلقائياً (اختياري) --' : '-- Choose a course (optional) --'}</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Course Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'عنوان المساق التدريبي' : 'Course Title'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseTitle}
                                        onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                                        placeholder={isRTL ? 'مثال: الذكاء الاصطناعي في الأعمال' : 'e.g. AI in Business'}
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                {/* Duration Hours */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'ساعات التدريب' : 'Duration (Hours)'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.courseDurationHours}
                                        onChange={(e) => setFormData({ ...formData, courseDurationHours: Number(e.target.value) })}
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Trainee Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'اسم المتدرب الكامل (كما يظهر بالشهادة)' : 'Trainee Full Name (As on Certificate)'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.studentName}
                                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                        placeholder={isRTL ? 'مثال: محمد عبدالله الشمري' : 'e.g. Mohammed Al-Shammari'}
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'البريد الإلكتروني للمتدرب (اختياري)' : 'Trainee Email (Optional)'}
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.studentEmail}
                                        onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                        placeholder="student@example.com"
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Trainer & CEO Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'اسم المدرب' : 'Trainer Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.trainerName}
                                        onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                        className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Accreditation Bodies Checkboxes */}
                            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                            {isRTL ? 'جهات الاعتماد الخاصة بالشهادة:' : 'Accreditation Bodies:'}
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            {isRTL ? 'حدد الجهات التي ستظهر شعاراتها على الشهادة (أو اتركها فارغة لدورة بدون اعتماد):' : 'Select accreditations to display on the certificate:'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            accreditations: prev.accreditations.length === ACCREDITATION_BODIES.length ? [] : ACCREDITATION_BODIES.map(a => a.id),
                                            hasAccreditation: prev.accreditations.length !== ACCREDITATION_BODIES.length
                                        }))}
                                        className="text-xs font-bold text-[#004C97] hover:underline"
                                    >
                                        {formData.accreditations.length === ACCREDITATION_BODIES.length 
                                            ? (isRTL ? 'إلغاء تحديد الكل' : 'Deselect All') 
                                            : (isRTL ? 'تحديد الكل' : 'Select All')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {ACCREDITATION_BODIES.map((accred) => {
                                        const isSelected = formData.accreditations.includes(accred.id);

                                        return (
                                            <div
                                                key={accred.id}
                                                onClick={() => toggleAccreditation(accred.id)}
                                                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 p-0.5 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                                                        <img src={accred.logo} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {isRTL ? accred.nameAr : (accred.nameEn || accred.nameAr)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                            {accred.code}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                    isSelected 
                                                        ? 'bg-[#004C97] border-[#004C97] text-white' 
                                                        : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Optional Custom Serial Number */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isRTL ? 'رقم الشهادة المخصص (اتركه فارغاً للتوليد التلقائي لـ AEC-YYYY-XXXX):' : 'Custom Certificate No. (Leave empty for auto AEC-YYYY-XXXX):'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.customCertificateNumber}
                                    onChange={(e) => setFormData({ ...formData, customCertificateNumber: e.target.value })}
                                    placeholder="AEC-2026-XXXX"
                                    className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004C97] hover:bg-[#071942] disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-blue-900/20 transition cursor-pointer"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                    <span>{isSubmitting ? (isRTL ? 'جارٍ التوليد...' : 'Generating...') : (isRTL ? 'توليد الشهادة والـ QR فوراً' : 'Generate & Issue Now')}</span>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FULLSCREEN PREVIEW & PRINT MODAL                                         */}
            {/* ========================================================================= */}
            {selectedViewCert && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                    onClick={() => setSelectedViewCert(null)}
                >
                    <div 
                        className="bg-slate-900 rounded-3xl p-4 sm:p-6 max-w-5xl w-full border border-white/10 shadow-2xl relative my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                            <div className="flex items-center gap-2 text-white">
                                <Award className="w-5 h-5 text-amber-400" />
                                <span className="font-black text-sm sm:text-base">
                                    {selectedViewCert.courseTitle} - {selectedViewCert.studentName}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedViewCert(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <CertificateTemplate certificate={selectedViewCert} showControls={true} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default CertificatesManagement;
