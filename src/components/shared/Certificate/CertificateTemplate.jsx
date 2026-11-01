import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { ACCREDITATION_BODIES, getAccreditationById } from '../../../data/accreditationBodies';
import {
    Printer,
    Download,
    Share2,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Calendar,
    ExternalLink,
    Award
} from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Official AEC Certificate Template
 * مطابق لنموذج شهادة الحضور المعتمد لأكاديمية التعليم المتطور (AEC)
 */
const CertificateTemplate = ({
    certificate,
    showControls = true,
    className = ''
}) => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const certRef = useRef(null);

    if (!certificate) return null;

    const {
        certificateNumber = 'AEC-2026-0000',
        studentName = 'اسم المتدرب',
        courseTitle = 'عنوان الدورة التدريبية',
        courseDurationHours = 10,
        issueDate = new Date(),
        trainerName = 'مدرب معتمد بالأكاديمية',
        ceoName = 'المدير العام لأكاديمية AEC',
        issuedLocation = 'الرياض • Riyadh',
        accreditations = ['tvtc', 'american_board', 'british_board'],
        hasAccreditation = true,
        licenseNotice = 'مرخصة من المؤسسة العامة للتدريب التقني والمهني • رقم الاعتماد: 212001000344',
        qrCodeImage,
        verificationUrl
    } = certificate;

    // Format date in Arabic & English
    const formattedDateEn = new Date(issueDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const formattedDateAr = new Date(issueDate).toLocaleDateString('ar-SA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Fallback QR code url if base64 not provided
    const verifyLink = verificationUrl || `${window.location.origin}/verify-certificate/${certificateNumber}`;
    const effectiveQr = qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyLink)}`;

    // Active accreditation logos
    const activeAccreditations = (hasAccreditation && Array.isArray(accreditations) && accreditations.length > 0)
        ? accreditations.map(id => getAccreditationById(id)).filter(Boolean)
        : [];

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(verifyLink);
            toast.success(isRTL ? 'تم نسخ رابط التحقق من الشهادة بنجاح 📋' : 'Certificate link copied to clipboard 📋');
        } else {
            toast.info(verifyLink);
        }
    };

    return (
        <div className={`certificate-wrapper flex flex-col items-center w-full max-w-5xl mx-auto ${className}`}>
            
            {/* Top Toolbar / Action Controls (Hidden on Print) */}
            {showControls && (
                <div className="no-print flex flex-wrap items-center justify-between gap-3 w-full mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                                    {isRTL ? 'الشهادة المعتمدة الرسمية' : 'Official Accredited Certificate'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    {certificate.status === 'revoked' ? (isRTL ? 'ملغية' : 'Revoked') : (isRTL ? 'معتمدة وسارية ✅' : 'Verified ✅')}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono tracking-wider">
                                {certificateNumber}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                        >
                            <Share2 className="w-4 h-4 text-[#004C97]" />
                            <span>{isRTL ? 'مشاركة الرابط' : 'Share Link'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004C97] hover:bg-[#071942] text-white text-xs sm:text-sm font-black transition shadow-lg shadow-blue-900/20 hover:scale-102 active:scale-98 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>{isRTL ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Print Stylesheet injection */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-printable, .certificate-printable * {
                        visibility: visible;
                    }
                    .certificate-printable {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }
            `}</style>

            {/* CERTIFICATE CONTAINER (A4 Landscape aspect ~ 1.414 ratio) */}
            <div
                ref={certRef}
                dir="ltr"
                className="certificate-printable relative w-full aspect-[1.414/1] bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border-[8px] border-[#071942] select-none flex flex-col justify-between p-6 sm:p-10 md:p-12"
                style={{
                    background: 'radial-gradient(circle at center, #ffffff 60%, #f8fafc 100%)',
                    fontFamily: "'Segoe UI', 'Cairo', Tahoma, Arial, sans-serif"
                }}
            >
                {/* Decorative Geometric Corner Borders (Matches Image) */}
                {/* Top-Left Corner Accent */}
                <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="0,0 100,0 0,100" fill="#071942" />
                        <polygon points="0,0 80,0 0,80" fill="#004C97" />
                        <line x1="0" y1="88" x2="88" y2="0" stroke="#D4AF37" strokeWidth="3" />
                    </svg>
                </div>

                {/* Bottom-Right Corner Accent */}
                <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polygon points="100,100 0,100 100,0" fill="#071942" />
                        <polygon points="100,100 20,100 100,20" fill="#004C97" />
                        <line x1="12" y1="100" x2="100" y2="12" stroke="#D4AF37" strokeWidth="3" />
                    </svg>
                </div>

                {/* Top-Right and Bottom-Left Inner Gold Border Trim */}
                <div className="absolute inset-3 sm:inset-5 border-2 border-[#D4AF37]/50 rounded-2xl pointer-events-none" />
                <div className="absolute inset-4 sm:inset-6 border border-[#071942]/20 rounded-xl pointer-events-none" />

                {/* Background Watermark Laurel / AEC Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                    <img src="/assets/logo.png" alt="" className="w-96 max-w-lg object-contain" />
                </div>

                {/* ========================================================================= */}
                {/* 1. HEADER SECTION                                                         */}
                {/* ========================================================================= */}
                <div className="relative z-10 flex items-start justify-between w-full">
                    
                    {/* Left: AEC Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-2xl sm:text-3xl font-black text-[#004C97] tracking-tight">AEC</span>
                                <span className="w-px h-7 bg-slate-300 mx-1" />
                                <div className="flex flex-col text-start">
                                    <span className="text-[12px] sm:text-sm font-extrabold text-[#071942] leading-tight font-arabic">
                                        أكاديمية التعليم المتطور
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-wider">
                                        ADVANCED EDUCATION ACADEMY
                                    </span>
                                </div>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 tracking-widest mt-0.5">
                                TRAINING & CONSULTING
                            </span>
                        </div>
                    </div>

                    {/* Right: Golden Ribbon Seal (Training Builds Better Futures) */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            {/* Blue ribbon tails */}
                            <div className="absolute -bottom-3 w-8 h-8 flex justify-between">
                                <div className="w-3.5 h-6 bg-[#004C97] transform -rotate-12 rounded-b-sm border-b-2 border-r border-[#D4AF37]" />
                                <div className="w-3.5 h-6 bg-[#004C97] transform rotate-12 rounded-b-sm border-b-2 border-l border-[#D4AF37]" />
                            </div>
                            {/* Gold Seal */}
                            <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#DAA520] p-1 shadow-lg flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-[#071942] flex flex-col items-center justify-center text-center p-1 border border-[#D4AF37]">
                                    <Award className="w-3.5 h-3.5 text-[#FBF5B7] mb-0.5" />
                                    <span className="text-[6.5px] sm:text-[7.5px] font-extrabold text-[#FBF5B7] leading-tight tracking-tighter uppercase">
                                        TRAINING BUILDS<br/>BETTER FUTURES
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ========================================================================= */}
                {/* 2. BODY CONTENT SECTION                                                   */}
                {/* ========================================================================= */}
                <div className="relative z-10 text-center my-auto px-4 sm:px-12 flex flex-col items-center">
                    
                    {/* Main Title: Certificate OF ATTENDANCE */}
                    <div className="mb-2">
                        <h1 
                            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#071942] tracking-wide"
                            style={{ fontFamily: "'Cinzel', 'Times New Roman', Georgia, serif" }}
                        >
                            Certificate
                        </h1>
                        <div className="flex items-center justify-center gap-3 mt-1">
                            <span className="w-12 sm:w-20 h-0.5 bg-[#D4AF37]" />
                            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#004C97] uppercase">
                                OF ATTENDANCE
                            </span>
                            <span className="w-12 sm:w-20 h-0.5 bg-[#D4AF37]" />
                        </div>
                    </div>

                    {/* Subtitle bilingual */}
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-semibold tracking-wider mt-1 mb-3">
                        <span className="font-arabic font-bold text-slate-800">تشهد الأكاديمية بأن</span>
                        <span className="mx-2 text-[#D4AF37]">•</span>
                        <span>THIS CERTIFICATE IS AWARDED TO</span>
                    </p>

                    {/* TRAINEE FULL NAME (Elegant Calligraphy) */}
                    <div className="relative w-full max-w-2xl my-2">
                        {/* Golden Decorative Framing Flourishes */}
                        <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 px-6 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 border-y border-[#D4AF37]/40">
                            <span className="text-amber-500 text-lg sm:text-2xl font-serif">‹‹</span>
                            <h2 
                                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#071942] tracking-wide text-center"
                                style={{
                                    fontFamily: "'Amiri', 'Traditional Arabic', 'Cinzel', Georgia, serif"
                                }}
                            >
                                {studentName}
                            </h2>
                            <span className="text-amber-500 text-lg sm:text-2xl font-serif">››</span>
                        </div>
                    </div>

                    {/* Course Attendance Clause */}
                    <p className="text-[11px] sm:text-xs text-slate-600 font-semibold tracking-wider my-2">
                        <span>has attended the training course</span>
                        <span className="mx-2 text-[#D4AF37]">•</span>
                        <span className="font-arabic font-bold text-slate-800">قد حضر الدورة التدريبية</span>
                    </p>

                    {/* COURSE TITLE */}
                    <div className="relative my-1 max-w-2xl">
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-8 sm:w-16 h-px bg-[#004C97]/40" />
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#004C97] font-arabic px-3 py-0.5 rounded-lg">
                                [ {courseTitle} ]
                            </h3>
                            <span className="w-8 sm:w-16 h-px bg-[#004C97]/40" />
                        </div>
                    </div>

                    {/* Metadata Pill Bar: Duration & Date */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-[11px] sm:text-xs font-bold text-[#071942]">
                        {/* Duration */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                            <Clock className="w-3.5 h-3.5 text-[#004C97]" />
                            <span className="font-mono">Duration: {courseDurationHours} hours</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-arabic">المدة: {courseDurationHours} ساعة</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                            <Calendar className="w-3.5 h-3.5 text-[#004C97]" />
                            <span className="font-mono">Date: {formattedDateEn}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-arabic">التاريخ: {formattedDateAr}</span>
                        </div>
                    </div>

                    {/* TVTC License Notice (if present) */}
                    {hasAccreditation && licenseNotice && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-arabic font-medium mt-3">
                            {licenseNotice}
                        </p>
                    )}

                    {/* ACCREDITATIONS ROW (Logos from the 6 recognized bodies) */}
                    {hasAccreditation && activeAccreditations.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mt-3 py-1">
                            {activeAccreditations.map((accred) => (
                                <div key={accred.id} className="flex flex-col items-center group" title={accred.nameAr}>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
                                        <img 
                                            src={accred.logo} 
                                            alt={accred.nameEn} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* ========================================================================= */}
                {/* 3. FOOTER SIGNATURES & QR CODE SECTION                                    */}
                {/* ========================================================================= */}
                <div className="relative z-10 w-full pt-4 border-t border-slate-200/70 mt-2 flex items-end justify-between text-xs">
                    
                    {/* Left: CEO OF AEC */}
                    <div className="flex flex-col items-start text-start w-1/3">
                        <div className="w-32 sm:w-44 h-0.5 bg-[#071942] mb-1.5" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                            <span className="font-arabic font-black">المدير العام</span>
                            <span className="mx-1">•</span>
                            <span className="font-mono text-[10px]">CEO OF AEC</span>
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#004C97] font-arabic mt-0.5">
                            {ceoName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">
                            Certificate No.: [{certificateNumber}]
                        </span>
                    </div>

                    {/* Center: QR Code with Scan to verify */}
                    <div className="flex flex-col items-center text-center justify-center w-1/3">
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-md">
                            <img 
                                src={effectiveQr} 
                                alt="QR Code" 
                                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" 
                            />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#071942] mt-1">
                            <span className="font-arabic">امسح للتحقق</span>
                            <span className="mx-1">•</span>
                            <span>Scan to verify</span>
                        </span>
                        <a 
                            href={verifyLink}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[8.5px] sm:text-[9.5px] text-[#004C97] font-mono hover:underline"
                        >
                            aectraining.com.sa
                        </a>
                    </div>

                    {/* Right: TRAINER */}
                    <div className="flex flex-col items-end text-end w-1/3">
                        <div className="w-32 sm:w-44 h-0.5 bg-[#071942] mb-1.5" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                            <span className="font-arabic font-black">المدرب</span>
                            <span className="mx-1">•</span>
                            <span className="font-mono text-[10px]">TRAINER</span>
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#004C97] font-arabic mt-0.5">
                            {trainerName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-arabic mt-1">
                            {issuedLocation} • {formattedDateEn}
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default CertificateTemplate;
