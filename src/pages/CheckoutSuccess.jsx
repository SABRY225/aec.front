import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { paymentService } from '../services/new-api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const CheckoutSuccess = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [isVerifying, setIsVerifying] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const orderId = searchParams.get('order_id');

            if (!orderId) {
                navigate('/');
                return;
            }

            try {
                const verificationResult = await paymentService.verifyPayment(orderId);
                setPaymentStatus(verificationResult);
                
                if (verificationResult.success) {
                    clearCart();
                    toast.success(t('checkoutSuccess.toast.success'));
                } else {
                    toast.error(t('checkoutSuccess.toast.verifyFailed'));
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setPaymentStatus({ success: false, error: 'Verification failed' });
                toast.error(t('checkoutSuccess.toast.verifyError'));
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate, clearCart, t]);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-lg shadow-lg text-center"
                >
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('checkoutSuccess.verifying')}</h2>
                    <p className="text-gray-600">{t('checkoutSuccess.verifyingMessage')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4"
            >
                {paymentStatus?.success ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('checkoutSuccess.successTitle')}</h2>
                        <p className="text-gray-600 mb-4">
                            {t('checkoutSuccess.successMessage')}
                        </p>
                        
                        {paymentStatus?.courses && paymentStatus.courses.length > 0 && (
                            <div className="mb-6 border-t border-b border-gray-100 py-4">
                                <h3 className="font-medium text-gray-700 mb-3">{t('checkoutSuccess.purchasedCourses')}</h3>
                                <div className="space-y-3">
                                    {paymentStatus.courses.map((course, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-800">{course.title}</h4>
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="text-gray-600">{t('checkout.byInstructor', { name: course.instructor?.name || `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() || t('course.card.unknownInstructor') })}</span>
                                                <span className="font-semibold text-blue-600">{paymentStatus.paid_amount} {paymentStatus.currency}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/my-courses')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('checkoutSuccess.goToMyCourses')}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t('checkoutSuccess.backToHome')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('checkoutSuccess.failedTitle')}</h2>
                        <p className="text-gray-600 mb-6">
                            {t('checkoutSuccess.failedMessage')}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/explore')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('checkoutSuccess.browseCourses')}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t('checkoutSuccess.backToHome')}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutSuccess;
