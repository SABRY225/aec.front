import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Printer,
    Download,
    CheckCircle2,
    Calendar,
    FileText,
    Receipt,
    CreditCard,
    Hash,
    User,
    Mail,
    Phone,
    Globe,
    GraduationCap,
    Coins,
    Laptop,
    Radio,
    MapPin,
    X
} from 'lucide-react';

/**
 * Official AEC Training Payment Invoice Component
 * مطابق تماماً لنموذج فاتورة شراء دورة تدريبية المعتمدة لأكاديمية AEC
 */
export const InvoiceTemplate = ({ invoiceData, showControls = true, onPrint }) => {
    const { t } = useTranslation();
    const invoiceRef = useRef(null);

    if (!invoiceData) return null;

    // Normalizing dynamic data from paymentOrder or enrollment
    const {
        invoiceNumber = 'INV-2026-00001',
        orderNumber = 'AEC-ORD-00001',
        issueDate = new Date(),
        paymentStatus = 'completed',
        student = {},
        courses = [],
        paymentMethod = 'mada',
        transactionRef = 'TXN-00000000',
        subtotal = 0,
        couponCode = null,
        discountAmount = 0,
        taxAmount = 0,
        grandTotal = 0,
        verificationUrl = ''
    } = invoiceData;

    // Calculate dates
    const dateObj = issueDate ? new Date(issueDate) : new Date();
    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const englishMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedDateAr = `${dateObj.getDate()} ${arabicMonths[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    const formattedDateEn = `${englishMonths[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

    // Normalize student info
    const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'المتدرب الكريم';
    const studentEmail = student.email || '—';
    const studentPhone = student.phone ? (student.phoneCode ? `${student.phoneCode} ${student.phone}` : student.phone) : '—';

    // Format currency
    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Payment method label
    const getPaymentMethodDisplay = (gateway) => {
        const g = String(gateway || '').toLowerCase();
        if (g.includes('tabby')) return { ar: 'تابي (أقساط 4 أشهر)', en: 'Tabby (4 Installments)' };
        if (g.includes('tamara')) return { ar: 'تمارا (أقساط مرنة)', en: 'Tamara (Flexible Pay)' };
        if (g.includes('apple')) return { ar: 'أبل باي (Apple Pay)', en: 'Apple Pay' };
        if (g.includes('manual') || g.includes('admin')) return { ar: 'تسجيل إداري / معتمد', en: 'Admin Manual Enrollment' };
        if (g.includes('bank') || g.includes('transfer')) return { ar: 'تحويل بنكي رسمي', en: 'Bank Wire Transfer' };
        return { ar: 'مدى / بطاقة بنكية', en: 'Mada / Bank Card' };
    };

    const methodDisplay = getPaymentMethodDisplay(paymentMethod);

    // Calculate financial values if subtotal wasn't explicitly supplied
    const calculatedSubtotal = subtotal > 0 
        ? subtotal 
        : courses.reduce((sum, c) => sum + (Number(c.price) || Number(c.paymentAmount) || 0), 0) || grandTotal;

    const calculatedGrandTotal = grandTotal > 0 ? grandTotal : Math.max(0, calculatedSubtotal - discountAmount);
    
    // VAT calculation: if taxAmount > 0 use it, otherwise 15% standard
    const calculatedVat = taxAmount > 0 
        ? taxAmount 
        : Math.round(((calculatedGrandTotal * 15) / 115) * 100) / 100;

    // Dynamic QR URL
    const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://aectraining.com.sa';
    const qrData = verificationUrl || `${frontendBase}/verify-enrollment/${orderNumber}`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}&margin=4`;

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    return (
        <div className="relative font-arabic print:p-0">
            {/* Action Bar (Screen Only) */}
            {showControls && (
                <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#004C97] dark:text-blue-400 flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">فاتورة ضريبية رسمية</h3>
                            <p className="text-xs text-slate-500 font-mono">{invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004C97] hover:bg-[#071942] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 transition-all cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>طباعة الفاتورة (A4)</span>
                        </button>
                    </div>
                </div>
            )}

            {/* THE PRINTABLE INVOICE SHEET */}
            <div
                ref={invoiceRef}
                id="printable-invoice"
                dir="rtl"
                className="invoice-sheet bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden mx-auto max-w-4xl p-6 sm:p-10 relative print:m-0 print:p-8 print:max-w-none print:shadow-none print:rounded-none print:border-none"
                style={{
                    minHeight: '270mm',
                    boxSizing: 'border-box'
                }}
            >
                {/* Decorative Top Accent Ribbons (Red & Navy) */}
                <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none">
                    <div className="absolute -top-14 -right-14 w-32 h-32 rounded-full border-8 border-[#E31B23]/30" />
                    <div className="absolute -top-20 -right-4 w-40 h-40 rounded-full border-8 border-[#004C97]/20" />
                </div>
                <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#004C97]/10 to-[#E31B23]/10" />
                </div>

                {/* 1. HEADER ROW */}
                <div className="flex items-start justify-between relative z-10 border-b border-slate-100 pb-6">
                    {/* Top Right: AEC LOGO & BRANDING */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="AEC Academy"
                            className="h-14 sm:h-16 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div>
                            <div className="flex items-center gap-1 font-black text-2xl tracking-tight">
                                <span className="text-[#E31B23]">A</span>
                                <span className="text-[#004C97]">EC</span>
                            </div>
                            <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#071942] uppercase font-mono">
                                Training & Consulting
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold">
                                أكاديمية التعليم المتطور للتدريب
                            </div>
                        </div>
                    </div>

                    {/* Top Left: TAX INVOICE BADGE & INVOICE NUMBER */}
                    <div className="text-left flex flex-col items-end">
                        <div className="bg-[#071942] text-white px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1.5 shadow-sm">
                            <span>فاتورة ضريبية مبسطة</span>
                            <span className="opacity-70 text-[9px] font-mono">| SIMPLIFIED TAX INVOICE</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 text-slate-500">
                            <Receipt className="w-4 h-4 text-[#004C97]" />
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400">رقم الفاتورة / Invoice No.</div>
                                <div className="font-mono font-black text-sm sm:text-base text-[#071942] tracking-wider">
                                    {invoiceNumber}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER INVOICE TITLE */}
                <div className="text-center my-6 relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#004C97] tracking-tight">
                        فاتورة شراء دورة تدريبية
                    </h1>
                    <p className="text-xs sm:text-sm font-bold text-[#071942] tracking-widest uppercase font-mono mt-1">
                        TRAINING PAYMENT INVOICE
                    </p>
                    {/* Two-tone accent bar */}
                    <div className="flex items-center justify-center gap-1 mt-2.5">
                        <div className="w-12 h-1 bg-[#004C97] rounded-full" />
                        <div className="w-6 h-1 bg-[#E31B23] rounded-full" />
                    </div>
                </div>

                {/* 3. FOUR QUICK METRICS CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 relative z-10">
                    {/* Card 1: Invoice No */}
                    <div className="bg-[#F4F8FC] border border-[#D5E5F5] rounded-2xl p-3 text-center">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#004C97] flex items-center justify-center mx-auto mb-1.5">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">رقم الفاتورة</div>
                        <div className="text-[9px] font-mono text-slate-400">Invoice No.</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-[#071942] mt-1 truncate">
                            {invoiceNumber}
                        </div>
                    </div>

                    {/* Card 2: Payment Status */}
                    <div className="bg-[#F4F8FC] border border-[#D5E5F5] rounded-2xl p-3 text-center">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">حالة الدفع</div>
                        <div className="text-[9px] font-mono text-slate-400">Payment Status</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-1 flex items-center justify-center gap-1">
                            <span>مدفوعة</span>
                            <span className="text-[10px] font-mono font-normal">/ Paid</span>
                        </div>
                    </div>

                    {/* Card 3: Issue Date */}
                    <div className="bg-[#F4F8FC] border border-[#D5E5F5] rounded-2xl p-3 text-center">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#004C97] flex items-center justify-center mx-auto mb-1.5">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">تاريخ الإصدار</div>
                        <div className="text-[9px] font-mono text-slate-400">Issue Date</div>
                        <div className="text-xs font-bold text-[#071942] mt-1">
                            {formattedDateAr}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                            {formattedDateEn}
                        </div>
                    </div>

                    {/* Card 4: Order No */}
                    <div className="bg-[#F4F8FC] border border-[#D5E5F5] rounded-2xl p-3 text-center">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#004C97] flex items-center justify-center mx-auto mb-1.5">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">رقم الطلب</div>
                        <div className="text-[9px] font-mono text-slate-400">Order No.</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-[#071942] mt-1 truncate">
                            {orderNumber}
                        </div>
                    </div>
                </div>

                {/* 4. STUDENT INFORMATION CARD */}
                <div className="border border-[#D5E5F5] rounded-2xl overflow-hidden bg-[#F4F8FC] my-6 relative z-10">
                    <div className="bg-[#002D62] text-white px-5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-bold text-xs sm:text-sm">بيانات المتدرب</span>
                            <span className="text-white/60 text-[10px] font-mono">/ Student Information</span>
                        </div>
                        <User className="w-4 h-4 opacity-50" />
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Name */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white text-[#004C97] border border-[#D5E5F5] flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400">الاسم / Name</div>
                                <div className="text-xs sm:text-sm font-extrabold text-[#071942] truncate">
                                    {studentName}
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white text-[#004C97] border border-[#D5E5F5] flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400">البريد الإلكتروني / Email</div>
                                <div className="text-xs sm:text-sm font-mono font-bold text-[#071942] truncate" dir="ltr">
                                    {studentEmail}
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white text-[#004C97] border border-[#D5E5F5] flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400">رقم الجوال / Phone</div>
                                <div className="text-xs sm:text-sm font-mono font-bold text-[#071942] truncate" dir="ltr">
                                    {studentPhone}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. COURSES TABLE */}
                <div className="border border-[#D5E5F5] rounded-2xl overflow-hidden my-6 relative z-10 shadow-xs">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-[#002D62] text-white font-bold text-[11px] sm:text-xs">
                                <th className="py-3 px-3 text-center w-12">م<br/><span className="text-[9px] font-mono opacity-80">No.</span></th>
                                <th className="py-3 px-4 text-start">اسم الدورة / الوصف<br/><span className="text-[9px] font-mono opacity-80">Course / Description</span></th>
                                <th className="py-3 px-3 text-center w-20">الكمية<br/><span className="text-[9px] font-mono opacity-80">Qty.</span></th>
                                <th className="py-3 px-4 text-center w-28">سعر الوحدة<br/><span className="text-[9px] font-mono opacity-80">Unit Price</span></th>
                                <th className="py-3 px-4 text-end w-28">الإجمالي<br/><span className="text-[9px] font-mono opacity-80">Total</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5E5F5] bg-white">
                            {courses.length > 0 ? (
                                courses.map((course, idx) => {
                                    const title = course.title || course.name || 'دورة تدريبية معتمدة';
                                    const price = Number(course.price) || Number(course.paymentAmount) || (calculatedSubtotal / courses.length);
                                    const courseType = course.courseType || 'recorded';
                                    
                                    const typeBadge = courseType === 'live'
                                        ? { label: 'بث مباشر (Live)', icon: Radio, bg: 'bg-purple-100 text-purple-700' }
                                        : courseType === 'onsite'
                                        ? { label: 'تدريب حضوري (Onsite)', icon: MapPin, bg: 'bg-amber-100 text-amber-700' }
                                        : { label: 'تدريب إلكتروني (مسجلة)', icon: Laptop, bg: 'bg-blue-100 text-blue-700' };

                                    const TypeIcon = typeBadge.icon;

                                    return (
                                        <tr key={course._id || idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-3 text-center font-mono font-bold text-[#071942]">
                                                {idx + 1}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                                    {title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${typeBadge.bg}`}>
                                                        <TypeIcon className="w-3 h-3" />
                                                        <span>{typeBadge.label}</span>
                                                    </span>
                                                    {course.instructor && (
                                                        <span className="text-[10px] text-slate-400">
                                                            المدرب: {course.instructor.name || `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 text-center font-mono font-bold text-slate-700">
                                                1
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">
                                                {formatMoney(price)} <span className="text-[10px] font-arabic font-normal">ر.س</span>
                                            </td>
                                            <td className="py-4 px-4 text-end font-mono font-extrabold text-[#004C97]">
                                                {formatMoney(price)} <span className="text-[10px] font-arabic font-normal">ر.س</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td className="py-4 px-3 text-center font-mono font-bold text-[#071942]">1</td>
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">دورة تدريبية معتمدة</div>
                                        <div className="text-[10px] text-slate-400">تدريب إلكتروني متقدم</div>
                                    </td>
                                    <td className="py-4 px-3 text-center font-mono font-bold text-slate-700">1</td>
                                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">
                                        {formatMoney(calculatedSubtotal)} <span className="text-[10px] font-arabic font-normal">ر.س</span>
                                    </td>
                                    <td className="py-4 px-4 text-end font-mono font-extrabold text-[#004C97]">
                                        {formatMoney(calculatedSubtotal)} <span className="text-[10px] font-arabic font-normal">ر.س</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 6. BREAKDOWN & PAYMENT DETAILS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 relative z-10">
                    {/* Left Box: Payment Details */}
                    <div className="bg-[#F4F8FC] border border-[#D5E5F5] rounded-2xl p-4 flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E5F5] text-[#004C97] flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400">طريقة الدفع / Payment Method</div>
                                <div className="text-xs sm:text-sm font-bold text-[#071942]">
                                    {methodDisplay.ar}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                    {methodDisplay.en}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-[#D5E5F5]/60">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E5F5] text-[#004C97] flex items-center justify-center shrink-0">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400">رقم العملية / Transaction Reference</div>
                                <div className="text-xs sm:text-sm font-mono font-black text-[#071942] truncate">
                                    {transactionRef}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Box: Financial Summary */}
                    <div className="border border-[#D5E5F5] rounded-2xl overflow-hidden bg-white shadow-xs">
                        <div className="p-4 space-y-2.5 text-xs">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between text-slate-600">
                                <div>
                                    <span className="font-bold">المجموع الفرعي</span>
                                    <span className="text-[10px] text-slate-400 font-mono ms-1">Subtotal</span>
                                </div>
                                <div className="font-mono font-bold text-[#071942]">
                                    {formatMoney(calculatedSubtotal)} <span className="font-arabic font-normal text-[10px]">ر.س</span>
                                </div>
                            </div>

                            {/* Discount Coupon (if applied) */}
                            {discountAmount > 0 && (
                                <div className="flex items-center justify-between text-[#E31B23]">
                                    <div>
                                        <span className="font-bold">كوبون الخصم {couponCode ? `(${couponCode})` : ''}</span>
                                        <span className="text-[10px] opacity-70 font-mono ms-1">Discount Coupon</span>
                                    </div>
                                    <div className="font-mono font-bold">
                                        -{formatMoney(discountAmount)} <span className="font-arabic font-normal text-[10px]">ر.س</span>
                                    </div>
                                </div>
                            )}

                            {/* VAT 15% */}
                            <div className="flex items-center justify-between text-slate-600">
                                <div>
                                    <span className="font-bold">ضريبة القيمة المضافة 15%</span>
                                    <span className="text-[10px] text-slate-400 font-mono ms-1">VAT 15%</span>
                                </div>
                                <div className="font-mono font-bold text-[#071942]">
                                    {formatMoney(calculatedVat)} <span className="font-arabic font-normal text-[10px]">ر.س</span>
                                </div>
                            </div>
                        </div>

                        {/* Grand Total Bar */}
                        <div className="bg-[#002D62] text-white px-5 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-amber-400" />
                                <div>
                                    <div className="font-black text-xs sm:text-sm">المبلغ الإجمالي</div>
                                    <div className="text-[9px] text-white/70 font-mono">Grand Total</div>
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="text-lg sm:text-xl font-mono font-black tracking-tight text-white">
                                    {formatMoney(calculatedGrandTotal)} <span className="text-xs font-arabic font-normal text-white/80">ر.س</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. FOOTER SECTION: QR CODE & APPRECIATION */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 pt-6 border-t border-slate-100 my-4 relative z-10">
                    {/* Left: Dynamic QR Verification Code */}
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-[#D5E5F5] rounded-xl shadow-xs shrink-0">
                            <img
                                src={qrCodeImageUrl}
                                alt="Verification QR"
                                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                            />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#002D62]">امسح رمز التحقق</div>
                            <div className="text-[9px] font-mono text-slate-400">Scan to verify</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-1">
                                {orderNumber}
                            </div>
                        </div>
                    </div>

                    {/* Center: Appreciation Message */}
                    <div className="text-center sm:col-span-1">
                        <h4 className="font-black text-[#004C97] text-xs sm:text-sm">
                            شكراً لاختياركم أكاديمية AEC
                        </h4>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                            نتمنى لكم رحلة تعليمية ناجحة وموفقة
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1">
                            Thank you for choosing AEC Academy
                        </p>
                    </div>

                    {/* Right: Contact & Website */}
                    <div className="text-left sm:text-end text-[10px] space-y-1">
                        <div className="flex items-center justify-start sm:justify-end gap-1.5 text-slate-600">
                            <span className="font-mono">aec.training.com.sa</span>
                            <Globe className="w-3.5 h-3.5 text-[#004C97]" />
                        </div>
                        <div className="flex items-center justify-start sm:justify-end gap-1.5 text-slate-600">
                            <span className="font-mono">info@aectraining.com.sa</span>
                            <Mail className="w-3.5 h-3.5 text-[#E31B23]" />
                        </div>
                        <div className="text-[9px] text-slate-400 font-arabic">
                            الرياض، المملكة العربية السعودية
                        </div>
                    </div>
                </div>

                {/* 8. BOTTOM ACCENT FOOTER WITH SIGNATURE */}
                <div className="bg-gradient-to-r from-[#002D62] to-[#071942] text-white py-3.5 px-6 rounded-2xl flex items-center justify-between mt-6 relative z-10 shadow-md">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                        <div>
                            <span className="font-bold text-xs sm:text-sm">تعلم اليوم .. تصنع مستقبلك</span>
                            <span className="text-[10px] text-white/70 font-mono ms-2 hidden sm:inline">
                                | Learn Today .. Build Your Future
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-end">
                        <div className="text-right">
                            <div className="text-[11px] font-bold text-white">إدارة الأكاديمية</div>
                            <div className="text-[8px] font-mono text-white/60">AEC Academy Management</div>
                        </div>
                        <div className="w-12 h-6 border-b border-white/60 font-serif italic text-xs text-white/80 flex items-center justify-center font-bold">
                            AEC.Mgt
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles for flawless A4 output */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }
                    body {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print, nav, header, footer, aside, .modal-backdrop {
                        display: none !important;
                    }
                    #printable-invoice {
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceTemplate;
