import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { paymentService } from '../services/new-api';
import { useCart } from '../context/CartContext';
import { Loader2 } from 'lucide-react';

const TabbySuccess = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Tabby appends payment_id to the query string when redirecting back
                const paymentId = searchParams.get('payment_id');
                const orderId = searchParams.get('orderId') || localStorage.getItem('pendingOrderId');

                if (!paymentId) {
                    toast.error(t('payment.process.toast.verifyFailed', 'رقم عملية الدفع مفقود.'));
                    navigate('/payment-failed?error=Missing payment ID');
                    return;
                }

                const result = await paymentService.verifyTabbyPayment(paymentId);

                if (result.success && result.status === 'paid') {
                    clearCart();
                    localStorage.removeItem('pendingOrderId');
                    localStorage.removeItem('pendingCourseIds');
                    localStorage.removeItem('selectedPaymentMethod');

                    toast.success(t('payment.process.toast.success', 'تم الدفع بنجاح!'));
                    navigate(`/student/dashboard`);
                } else {
                    toast.error(t('payment.process.toast.verifyFailed', 'فشل التحقق من الدفع.'));
                    navigate('/payment-failed?error=Verification failed');
                }
            } catch (error) {
                console.error('Tabby verification error:', error);
                toast.error(t('payment.process.toast.processError', 'حدث خطأ أثناء معالجة الدفع.'));
                navigate('/payment-failed?error=Processing error');
            }
        };

        verifyPayment();
    }, [searchParams, navigate, clearCart, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-center mb-4">
                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t('payment.process.processingPayment', 'جاري التحقق من الدفع...')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    {t('payment.process.pleaseWait', 'يرجى الانتظار بينما نقوم بتأكيد اشتراكك.')}
                </p>
            </div>
        </div>
    );
};

export default TabbySuccess;
