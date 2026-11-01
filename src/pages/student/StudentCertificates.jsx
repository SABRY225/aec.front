import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { certificateService, enrollmentService } from '../../services/new-api';
import CertificateTemplate from '../../components/shared/Certificate/CertificateTemplate';
import { ACCREDITATION_BODIES, getAccreditationById } from '../../data/accreditationBodies';
import {
    Award,
    Download,
    Printer,
    Share2,
    Calendar,
    Clock,
    BookOpen,
    Eye,
    X,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    QrCode,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const StudentCertificates = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();

    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const [generatingId, setGeneratingId] = useState(null);

    useEffect(() => {
        fetchMyCertificates();
    }, []);

    const fetchMyCertificates = async () => {
        try {
            setLoading(true);
            const res = await certificateService.getMyCertificates();
            if (res?.success) {
                setCertificates(res.certificates || []);
            }
        } catch (error) {
            console.error('Error fetching student certificates:', error);
            toast.error(isRTL ? 'تعذر جلب الشهادات' : 'Failed to fetch certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCert = (cert) => {
        setSelectedCert(cert);
    };

    return (
        <div className="space-y-8 font-arabic">
            
            {/* Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#071942] to-[#004C97] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10 space-y-2 text-center md:text-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'إنجازاتك الأكاديمية والمهنية' : 'Academic & Professional Achievements'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black">
                        {isRTL ? 'الشهادات المعتمدة والتوثيق' : 'Accredited Certificates'}
                    </h1>
                    <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl leading-relaxed">
                        {isRTL
                            ? 'جميع الشهادات التي حصلت عليها بعد إتمام المساقات التدريبية موثقة برمز QR رسمي ومعتمدة من الهيئات والجهات المعنية.'
                            : 'All certificates earned upon completing training courses are verified with an official QR code and accredited by recognized bodies.'}
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 text-center">
                    <div>
                        <div className="text-3xl font-black text-amber-300">
                            {certificates.length}
                        </div>
                        <div className="text-[11px] text-blue-100 font-medium">
                            {isRTL ? 'شهادة مكتسبة' : 'Certificates Earned'}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                        <Award className="w-7 h-7" />
                    </div>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <LoadingNew />
                    <span className="text-xs text-slate-500 mt-3">
                        {isRTL ? 'جارٍ تحميل شهاداتك...' : 'Loading your certificates...'}
                    </span>
                </div>
            ) : certificates.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                        <Award className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {isRTL ? 'لم تكتسب أي شهادة بعد' : 'No Certificates Yet'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                        {isRTL
                            ? 'أكمل مساقاتك التدريبية بنسبة 100% لتصدر لك شهادة الحضور المعتمدة رسمياً والمزودة برمز التحقق QR.'
                            : 'Complete 100% of your enrolled courses to receive your official accredited certificate equipped with a verification QR code.'}
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/student/my-courses"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#004C97] hover:bg-[#071942] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/20 transition"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>{isRTL ? 'الانتقال إلى دوراتي ومتابعة الدراسة' : 'Go to My Courses'}</span>
                        </Link>
                    </div>
                </div>
            ) : (
                /* Certificates Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => {
                        const activeAccreds = (cert.hasAccreditation && Array.isArray(cert.accreditations))
                            ? cert.accreditations.map(id => getAccreditationById(id)).filter(Boolean)
                            : [];

                        return (
                            <div
                                key={cert._id}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                            >
                                {/* Card Header Preview Aspect */}
                                <div className="relative aspect-[16/9] bg-gradient-to-tr from-[#071942] to-[#004C97] p-5 text-white flex flex-col justify-between overflow-hidden">
                                    <div className="flex items-center justify-between z-10">
                                        <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100">
                                            {cert.certificateNumber}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>{isRTL ? 'معتمدة' : 'Verified'}</span>
                                        </span>
                                    </div>

                                    <div className="z-10 text-center my-auto">
                                        <h4 className="text-sm sm:text-base font-black line-clamp-2 text-white group-hover:text-amber-300 transition-colors">
                                            {cert.courseTitle}
                                        </h4>
                                        <p className="text-[11px] text-blue-200 mt-1">
                                            {cert.studentName}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-blue-200/90 z-10 pt-2 border-t border-white/10">
                                        <span>{cert.courseDurationHours} {isRTL ? 'ساعة تدريبية' : 'hours'}</span>
                                        <span>{new Date(cert.issueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB')}</span>
                                    </div>

                                    {/* Subtle watermark */}
                                    <Award className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5 pointer-events-none" />
                                </div>

                                {/* Body Info */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    
                                    {/* Accreditations Logos Preview */}
                                    {activeAccreds.length > 0 && (
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {isRTL ? 'الجهات المعتمدة للشهادة:' : 'Accredited By:'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {activeAccreds.slice(0, 4).map((accred) => (
                                                    <div 
                                                        key={accred.id} 
                                                        className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center"
                                                        title={accred.nameAr}
                                                    >
                                                        <img src={accred.logo} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                ))}
                                                {activeAccreds.length > 4 && (
                                                    <span className="text-[10px] text-slate-500 font-bold">
                                                        +{activeAccreds.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenCert(cert)}
                                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#004C97] hover:bg-[#071942] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{isRTL ? 'عرض الشهادة' : 'View Certificate'}</span>
                                        </button>

                                        <Link
                                            to={`/verify-certificate/${cert.certificateNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                                            title={isRTL ? 'التحقق عبر الرابط وQR' : 'Verify via link & QR'}
                                        >
                                            <QrCode className="w-4 h-4 text-[#004C97]" />
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FULLSCREEN CERTIFICATE MODAL */}
            {selectedCert && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                    onClick={() => setSelectedCert(null)}
                >
                    <div 
                        className="bg-slate-900 rounded-3xl p-4 sm:p-6 max-w-5xl w-full border border-white/10 shadow-2xl relative my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                            <div className="flex items-center gap-2 text-white">
                                <Award className="w-5 h-5 text-amber-400" />
                                <span className="font-black text-sm sm:text-base">
                                    {selectedCert.courseTitle}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedCert(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Certificate Template Component */}
                        <div className="w-full">
                            <CertificateTemplate certificate={selectedCert} showControls={true} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentCertificates;
