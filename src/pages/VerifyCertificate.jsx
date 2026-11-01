import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { certificateService } from '../services/new-api';
import CertificateTemplate from '../components/shared/Certificate/CertificateTemplate';
import { ACCREDITATION_BODIES, getAccreditationById } from '../data/accreditationBodies';
import {
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Calendar,
    Clock,
    User,
    BookOpen,
    Award,
    Printer,
    Share2,
    ExternalLink,
    Search,
    GraduationCap
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';

const VerifyCertificate = () => {
    const { certNumber } = useParams();
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();

    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCode, setSearchCode] = useState('');

    useEffect(() => {
        if (certNumber) {
            fetchCertificate(certNumber);
        } else {
            setLoading(false);
        }
    }, [certNumber]);

    const fetchCertificate = async (code) => {
        try {
            setLoading(true);
            setError(null);
            const data = await certificateService.verifyCertificate(code);
            if (data?.success && data?.certificate) {
                setCertificate(data.certificate);
            } else {
                setError(isRTL ? 'الشهادة المطلوبة غير مسجلة بالنظام أو تم إلغاؤها.' : 'Certificate not found or has been revoked.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || (isRTL ? 'تعذر العثور على الشهادة أو أن رمز التحقق غير صحيح.' : 'Certificate verification failed.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchCode.trim()) {
            fetchCertificate(searchCode.trim());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-arabic py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Branding */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-[#004C97] p-2 rounded-xl text-white font-black text-xl shadow-md">
                            AEC
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                {isRTL ? 'أكاديمية التعليم المتطور' : 'Advanced Education Academy'}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                {isRTL ? 'منظومة التحقق والتوثيق الإلكتروني للشهادات' : 'Official Certificate Verification System'}
                            </p>
                        </div>
                    </Link>

                    {/* Direct Search input */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder={isRTL ? 'أدخل رقم الشهادة (AEC-...)' : 'Enter Certificate No...'}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004C97]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                        <button
                            type="submit"
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#004C97] hover:bg-[#071942] text-white transition shadow-sm"
                        >
                            {isRTL ? 'تحقق' : 'Verify'}
                        </button>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <LoadingNew />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-4">
                            {isRTL ? 'جارٍ التحقق من صحة الشهادة والاعتمادات الرسمية...' : 'Verifying certificate authenticity...'}
                        </p>
                    </div>
                )}

                {/* Error / Not Found State */}
                {!loading && error && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-red-200 dark:border-red-900/50 shadow-sm text-center max-w-xl mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            {isRTL ? 'تعذر التحقق من الشهادة' : 'Certificate Verification Failed'}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {error}
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition"
                            >
                                {isRTL ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Verified Success View */}
                {!loading && certificate && (
                    <div className="space-y-8 animate-fadeIn">
                        
                        {/* Official Verification Banner */}
                        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
                            certificate.status === 'revoked'
                                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                                : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                        }`}>
                            <div className="flex items-center gap-4 text-center md:text-start">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                                    certificate.status === 'revoked'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                }`}>
                                    {certificate.status === 'revoked' ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-9 h-9" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                                        <h2 className="text-xl sm:text-2xl font-black">
                                            {certificate.status === 'revoked'
                                                ? (isRTL ? 'شهادة ملغية وغير صالحة' : 'Certificate Revoked / Invalid')
                                                : (isRTL ? 'شهادة موثقة ومعتمدة رسمياً' : 'Officially Verified & Accredited Certificate')}
                                        </h2>
                                        {certificate.status === 'active' && (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                                                {isRTL ? 'سارية ✅' : 'Valid ✅'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                        {isRTL 
                                            ? `تم التحقق من بيانات الشهادة الصادرة من أكاديمية التعليم المتطور AEC برقم قيد: ${certificate.certificateNumber}`
                                            : `Verified against official AEC registry records. Certificate No: ${certificate.certificateNumber}`}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-6 py-3 rounded-2xl bg-[#004C97] hover:bg-[#071942] text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-900/20 hover:scale-102 active:scale-98 transition flex items-center gap-2 shrink-0 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>{isRTL ? 'طباعة / حفظ PDF' : 'Print / Download PDF'}</span>
                            </button>
                        </div>

                        {/* Summary Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                    <User className="w-4 h-4 text-[#004C97]" />
                                    <span>{isRTL ? 'اسم المتدرب' : 'Trainee Name'}</span>
                                </div>
                                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {certificate.studentName}
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                    <BookOpen className="w-4 h-4 text-[#004C97]" />
                                    <span>{isRTL ? 'عنوان المساق التدريبي' : 'Course Title'}</span>
                                </div>
                                <div className="text-base font-extrabold text-[#004C97] dark:text-blue-400">
                                    {certificate.courseTitle}
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                    <Clock className="w-4 h-4 text-[#004C97]" />
                                    <span>{isRTL ? 'ساعات التدريب المعتمدة' : 'Training Hours'}</span>
                                </div>
                                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {certificate.courseDurationHours} {isRTL ? 'ساعة تدريبية' : 'hours'}
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                                    <Calendar className="w-4 h-4 text-[#004C97]" />
                                    <span>{isRTL ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                                </div>
                                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {new Date(certificate.issueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB')}
                                </div>
                            </div>

                        </div>

                        {/* Interactive Certificate View */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#004C97]" />
                                    <span>{isRTL ? 'معاينة الشهادة المعتمدة' : 'Official Certificate Preview'}</span>
                                </h3>
                                <span className="text-xs text-slate-500">
                                    {isRTL ? 'مطابقة للأصل الورقي والنسخة الرقمية' : 'Exact replica of physical and digital certificate'}
                                </span>
                            </div>

                            <CertificateTemplate certificate={certificate} showControls={false} />
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyCertificate;
