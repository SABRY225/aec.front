import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ShoppingCart, Search, Filter, Eye, Trash2, CheckCircle, 
    XCircle, Clock, MoreVertical, Edit2, ChevronLeft, ChevronRight, Phone, Download, Loader2, BookOpen 
} from 'lucide-react';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

// Format phone with country code properly
const formatFullPhone = (phone, phoneCode) => {
    if (!phone) return '';
    const cleanPhone = String(phone).trim();
    if (!phoneCode) return cleanPhone;
    const cleanCode = String(phoneCode).trim();
    if (cleanPhone.startsWith('+')) return cleanPhone;
    if (cleanPhone.startsWith(cleanCode.replace('+', ''))) return `+${cleanPhone}`;
    const formattedCode = cleanCode.startsWith('+') ? cleanCode : `+${cleanCode}`;
    const normalizedNumber = cleanPhone.replace(/^0+/, '');
    return `${formattedCode} ${normalizedNumber}`;
};

// Helper to translate course type
const getCourseTypeLabel = (type) => {
    switch (type) {
        case 'live': return 'أونلاين مباشر (Live)';
        case 'onsite': return 'حضوري / أوفلاين (Onsite)';
        case 'recorded': return 'مسجلة (Recorded)';
        default: return type ? String(type) : '—';
    }
};

const Orders = () => {
    const { t } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gatewayFilter, setGatewayFilter] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editStatus, setEditStatus] = useState('');

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            toast.info('جاري تجهيز وتصدير كافة بيانات الطلبات...');
            const res = await adminService.getPayments({
                limit: 0,
                search,
                status: statusFilter,
                gateway: gatewayFilter
            });

            const dataToExport = res?.payments || payments || [];

            if (dataToExport.length === 0) {
                toast.warning('لا توجد بيانات لتصديرها');
                return;
            }

            const headers = [
                'معرف العملية الداخلي (ID)',
                'رقم الطلب (Order ID)',
                'معرف معاملة البوابة (Transaction/Payment ID)',
                'اسم الطالب الأول',
                'اسم العائلة',
                'اسم الطالب بالكامل',
                'البريد الإلكتروني',
                'كود الدولة',
                'رقم الهاتف',
                'رقم الهاتف كاملاً',
                'الدورات المشتراة',
                'نوع الدورة (مسجلة / أونلاين / حضوري)',
                'التصنيف / المجال',
                'عدد الدورات',
                'المبلغ الإجمالي الأصلي (Subtotal)',
                'نوع الخصم',
                'قيمة الخصم/النسبة',
                'مبلغ الخصم (Discount Amount)',
                'كود الخصم (Coupon)',
                'مبلغ الضريبة (Tax)',
                'المبلغ الصافي المدفوع (Total Paid)',
                'العملة (Currency)',
                'بوابة الدفع (Gateway)',
                'حالة الدفع (Status)',
                'تاريخ ووقت الإنشاء (Created At)',
                'تاريخ آخر تحديث (Updated At)'
            ];

            const rows = dataToExport.map(item => {
                const firstName = item.userId?.firstName || '';
                const lastName = item.userId?.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim() || '—';
                const email = item.userId?.email || '—';
                const phone = item.userId?.phone || '—';
                const phoneCode = item.userId?.phoneCode || '—';
                const fullPhone = item.userId?.phone ? formatFullPhone(item.userId.phone, item.userId.phoneCode) : '—';
                
                const gatewayTxId = item.paymob?.transactionId 
                    || item.tabby?.paymentId 
                    || item.tamara?.orderId 
                    || item.tamara?.checkoutId 
                    || '—';

                const coursesList = Array.isArray(item.courseIds) 
                    ? item.courseIds.map(c => typeof c === 'object' ? `${c.title || 'دورة'} (${c.price || 0} SAR)` : c).join(' | ') 
                    : '—';
                
                const courseTypesList = Array.isArray(item.courseIds)
                    ? item.courseIds.map(c => typeof c === 'object' ? getCourseTypeLabel(c.courseType) : '—').join(' | ')
                    : '—';

                const categoriesList = Array.isArray(item.courseIds)
                    ? item.courseIds.map(c => typeof c === 'object' ? (c.category || '—') : '—').join(' | ')
                    : '—';

                const coursesCount = Array.isArray(item.courseIds) ? item.courseIds.length : 0;

                const subtotal = item.subtotal ?? item.amount ?? 0;
                const discountType = item.discountType === 'percentage' ? 'نسبة مئوية' : item.discountType === 'fixed' ? 'مبلغ ثابت' : '—';
                const discountVal = item.discountValue !== undefined && item.discountValue !== null ? item.discountValue : '—';
                const discountAmount = item.discountAmount ?? 0;
                const coupon = item.couponCode || '—';
                const taxAmount = item.taxAmount ?? 0;
                const totalPaid = item.totalPaid ?? item.amount ?? 0;
                const currency = item.currency || 'SAR';
                const gateway = item.gateway || '—';
                const status = item.status === 'completed' ? 'مكتمل' : item.status === 'pending' ? 'قيد الانتظار' : 'فاشل';
                const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString('ar-SA') : '—';
                const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleString('ar-SA') : '—';

                return [
                    item._id || '—',
                    item.orderId || '—',
                    gatewayTxId,
                    firstName || '—',
                    lastName || '—',
                    fullName,
                    email,
                    phoneCode,
                    phone,
                    fullPhone,
                    coursesList,
                    courseTypesList,
                    categoriesList,
                    coursesCount,
                    subtotal,
                    discountType,
                    discountVal,
                    discountAmount,
                    coupon,
                    taxAmount,
                    totalPaid,
                    currency,
                    gateway,
                    status,
                    createdAt,
                    updatedAt
                ];
            });

            const escapeCSV = (value) => {
                const str = String(value ?? '').replace(/"/g, '""');
                return `"${str}"`;
            };

            const csvContent = '\uFEFF' + [
                headers.map(escapeCSV).join(','),
                ...rows.map(row => row.map(escapeCSV).join(','))
            ].join('\r\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_full_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`تم تصدير ملف الإكسيل بنجاح (${dataToExport.length} طلب)`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('حدث خطأ أثناء تصدير البيانات');
        } finally {
            setExporting(false);
        }
    };
    
    // Status color mapping
    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} className="mr-1" />;
            case 'failed': return <XCircle size={14} className="mr-1" />;
            case 'pending': return <Clock size={14} className="mr-1" />;
            default: return null;
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPayments({
                page,
                limit: pageSize,
                search,
                status: statusFilter,
                gateway: gatewayFilter
            });
            setPayments(res.payments || []);
            setTotalPages(res.totalPages || 1);
            setTotal(res.total || 0);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('حدث خطأ أثناء جلب الطلبات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, pageSize, search, statusFilter, gatewayFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
        try {
            await adminService.deletePayment(id);
            toast.success('تم حذف الطلب بنجاح');
            fetchPayments();
        } catch (error) {
            toast.error('فشل في حذف الطلب');
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedPayment) return;
        try {
            await adminService.updatePayment(selectedPayment._id, { status: editStatus });
            toast.success('تم تحديث الحالة بنجاح');
            setIsEditModalOpen(false);
            fetchPayments();
        } catch (error) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const openEditModal = (payment) => {
        setSelectedPayment(payment);
        setEditStatus(payment.status);
        setIsEditModalOpen(true);
    };

    const openViewModal = async (id) => {
        try {
            const data = await adminService.getPaymentDetails(id);
            setSelectedPayment(data);
            setIsViewModalOpen(true);
        } catch (error) {
            toast.error('فشل في جلب تفاصيل الطلب');
        }
    };

    if (loading && payments.length === 0) return <LoadingNew />;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الطلبات</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">عرض وتتبع كافة طلبات الشراء في المنصة</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || payments.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                        title="تصدير شيت إكسيل شامل لكافة البيانات والطلبات"
                    >
                        {exporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>جاري التصدير...</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                <span>تصدير إكسيل (شامل كافة البيانات)</span>
                            </>
                        )}
                    </button>
                    <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        إجمالي الطلبات: <span className="font-bold text-slate-800 dark:text-white">{total}</span>
                    </div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="ابحث برقم الطلب، اسم الطالب، البريد، الهاتف، أو اسم الدورة..." 
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="flex gap-3 flex-wrap items-center">
                    <select 
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="completed">مكتملة</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="failed">فاشلة</option>
                    </select>
                    <select 
                        value={gatewayFilter}
                        onChange={(e) => {
                            setGatewayFilter(e.target.value);
                            setPage(1);
                        }}
                        className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="">جميع البوابات</option>
                        <option value="paymob">Paymob</option>
                        <option value="tabby">Tabby</option>
                    </select>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-medium">عرض:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                            className="bg-transparent text-slate-800 dark:text-white font-semibold outline-none cursor-pointer text-xs"
                        >
                            <option value={25} className="bg-white dark:bg-slate-900">25 صف</option>
                            <option value={50} className="bg-white dark:bg-slate-900">50 صف</option>
                            <option value={75} className="bg-white dark:bg-slate-900">75 صف</option>
                            <option value={100} className="bg-white dark:bg-slate-900">100 صف</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">رقم الطلب</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">الطالب</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">الكورس / الدورة المشترك بها</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">المبلغ (SAR)</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">البوابة</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">الحالة</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">التاريخ</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold text-sm">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payments.map(payment => (
                                <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        {payment.orderId}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {payment.userId?.firstName} {payment.userId?.lastName}
                                            </span>
                                            <span className="text-slate-500 text-xs mt-0.5">{payment.userId?.email}</span>
                                            {payment.userId?.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <Phone size={12} className="text-emerald-500 flex-shrink-0" />
                                                    <a 
                                                        href={`tel:${formatFullPhone(payment.userId.phone, payment.userId.phoneCode).replace(/\s+/g, '')}`} 
                                                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono"
                                                        dir="ltr"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {formatFullPhone(payment.userId.phone, payment.userId.phoneCode)}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-[280px]">
                                        {Array.isArray(payment.courseIds) && payment.courseIds.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {payment.courseIds.map((c, idx) => (
                                                    <div 
                                                        key={c._id || idx}
                                                        className="flex flex-col gap-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-white truncate" title={c.title || 'دورة'}>
                                                            <BookOpen size={13} className="text-blue-500 flex-shrink-0" />
                                                            <span className="truncate">{c.title || 'دورة'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                                c.courseType === 'live' 
                                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                    : c.courseType === 'onsite'
                                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                                {getCourseTypeLabel(c.courseType)}
                                                            </span>
                                                            {c.price !== undefined && (
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    {c.price} SAR
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-semibold text-slate-800 dark:text-white">
                                        {(payment.totalPaid ?? payment.amount ?? 0).toLocaleString()} SAR
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium capitalize">
                                            {payment.gateway}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status === 'completed' ? 'مكتمل' : payment.status === 'pending' ? 'انتظار' : 'فشل'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                                        {new Date(payment.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openViewModal(payment._id)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="عرض التفاصيل">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(payment)} className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors" title="تعديل الحالة">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(payment._id)} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="حذف الطلب">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">لا توجد طلبات مطابقة لبحثك.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span>
                            عرض {payments.length} من أصل {total} طلب
                        </span>
                        <span>•</span>
                        <span>
                            صفحة {page} من {totalPages || 1}
                        </span>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="الصفحة السابقة"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {page}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="الصفحة التالية"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">تفاصيل الدفع - {selectedPayment.orderId}</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">المستخدم / الطالب</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPayment.userId?.firstName} {selectedPayment.userId?.lastName}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedPayment.userId?.email}</p>
                                    {selectedPayment.userId?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                            <Phone size={14} className="text-emerald-500 flex-shrink-0" />
                                            <span className="text-slate-500 text-xs">الهاتف:</span>
                                            <a 
                                                href={`tel:${formatFullPhone(selectedPayment.userId.phone, selectedPayment.userId.phoneCode).replace(/\s+/g, '')}`} 
                                                className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline font-mono" 
                                                dir="ltr"
                                            >
                                                {formatFullPhone(selectedPayment.userId.phone, selectedPayment.userId.phoneCode)}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">معلومات مالية</p>
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPayment.totalPaid} SAR</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">بوابة: {selectedPayment.gateway}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">الدورات المشتراة</h4>
                                <ul className="space-y-2">
                                    {selectedPayment.courseIds?.map((course) => (
                                        <li key={course._id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                                            <span className="text-slate-700 dark:text-slate-300">{course.title}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{course.price} SAR</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {selectedPayment.couponCode && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                    تم استخدام كود خصم: <strong>{selectedPayment.couponCode}</strong> (وفر {selectedPayment.discountAmount} SAR)
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">تعديل حالة الدفع</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الحالة</label>
                            <select 
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="completed">مكتملة</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="failed">فاشلة</option>
                            </select>
                            
                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={handleUpdateStatus}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-medium transition-colors"
                                >
                                    حفظ التغييرات
                                </button>
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-3 rounded-xl font-medium transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
