import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ShoppingCart, Search, Filter, Eye, Trash2, CheckCircle, 
    XCircle, Clock, MoreVertical, Edit2, ChevronLeft, ChevronRight, Phone 
} from 'lucide-react';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const Orders = () => {
    const { t } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gatewayFilter, setGatewayFilter] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editStatus, setEditStatus] = useState('');
    
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
                limit: 10,
                search,
                status: statusFilter,
                gateway: gatewayFilter
            });
            setPayments(res.payments || []);
            setTotalPages(res.totalPages || 1);
            setTotal(res.total || 0);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('حدث خطأ أثناء جلب المدفوعات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, search, statusFilter, gatewayFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
        try {
            await adminService.deletePayment(id);
            toast.success('تم حذف العملية بنجاح');
            fetchPayments();
        } catch (error) {
            toast.error('فشل في حذف العملية');
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
            toast.error('فشل في جلب تفاصيل الدفع');
        }
    };

    if (loading && payments.length === 0) return <LoadingNew />;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المدفوعات</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">عرض وتتبع كافة عمليات الدفع في المنصة</p>
                    </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    إجمالي العمليات: <span className="font-bold text-slate-800 dark:text-white">{total}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="ابحث برقم الطلب، اسم الطالب، البريد، أو رقم الهاتف..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex gap-4 min-w-[200px]">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="completed">مكتملة</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="failed">فاشلة</option>
                    </select>
                    <select 
                        value={gatewayFilter}
                        onChange={(e) => setGatewayFilter(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">جميع البوابات</option>
                        <option value="paymob">Paymob</option>
                        <option value="tabby">Tabby</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">رقم الطلب</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">المستخدم</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">المبلغ (SAR)</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">البوابة</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">الحالة</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">التاريخ</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payments.map(payment => (
                                <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                                        {payment.orderId}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 dark:text-white font-medium">
                                                {payment.userId?.firstName} {payment.userId?.lastName}
                                            </span>
                                            <span className="text-slate-500 text-sm">{payment.userId?.email}</span>
                                            {payment.userId?.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <Phone size={12} className="text-emerald-500 flex-shrink-0" />
                                                    <a 
                                                        href={`tel:${payment.userId.phone}`} 
                                                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono"
                                                        dir="ltr"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {payment.userId.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">
                                        {payment.totalPaid?.toLocaleString()}
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
                                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                        {new Date(payment.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openViewModal(payment._id)} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(payment)} className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(payment._id)} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">لا توجد عمليات دفع مطابقة لبحثك.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            صفحة {page} من {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </div>
                    </div>
                )}
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
                                                href={`tel:${selectedPayment.userId.phone}`} 
                                                className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline font-mono" 
                                                dir="ltr"
                                            >
                                                {selectedPayment.userId.phone}
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
