import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { paymentService } from '../services/new-api';
import { useCart } from '../context/CartContext';
import { Loader2 } from 'lucide-react';

const TamaraSuccess = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Tamara appends paymentStatus and orderId (or order_reference_id)
                const orderId = searchParams.get('orderId') || 
                                searchParams.get('order_id') || 
                                searchParams.get('order_reference_id') || 
                                localStorage.getItem('pendingOrderId');

                const paymentStatus = searchParams.get('paymentStatus');

                if (!orderId) {
                    toast.error(t('payment.process.toast.verifyFailed', 'رقم عملية الدفع مفقود.'));
                    navigate('/payment-failed?error=Missing order ID');
                    return;
                }

                console.log('Verifying Tamara payment for orderId:', orderId, 'status:', paymentStatus);
                const result = await paymentService.verifyTamaraPayment(orderId);

                if (result.success && result.status === 'paid') {
                    clearCart();
                    localStorage.removeItem('pendingOrderId');
                    localStorage.removeItem('pendingCourseIds');
                    localStorage.removeItem('selectedPaymentMethod');

                    toast.success(t('payment.process.toast.success', 'تم الدفع وتأكيد اشتراكك عبر تمارا بنجاح!'));
                    navigate('/student/dashboard');
                } else {
                    toast.error(t('payment.process.toast.verifyFailed', 'فشل التحقق من الدفع عبر تمارا.'));
                    navigate('/payment-failed?error=Verification failed');
                }
            } catch (error) {
                console.error('Tamara verification error:', error);
                toast.error(t('payment.process.toast.processError', 'حدث خطأ أثناء معالجة الدفع عبر تمارا.'));
                navigate('/payment-failed?error=Processing error');
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate, clearCart, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center animate-pulse">
                            <span className="font-extrabold text-orange-500 text-lg">tamara</span>
                        </div>
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin absolute -bottom-2 -right-2" />
                    </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {t('payment.process.processingPayment', 'جاري التحقق من عملية الدفع عبر تمارا...')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('payment.process.pleaseWait', 'يرجى الانتظار بينما نقوم بتأكيد اشتراكك وتفعيل الدورات في حسابك.')}
                </p>
            </div>
        </div>
    );
};

export default TamaraSuccess;
