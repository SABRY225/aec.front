import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { paymentService } from '../services/new-api';
import { useCart } from '../context/CartContext';

const PaymentProcess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        let orderId = searchParams.get('order_id') || searchParams.get('merchant_order_id');
        
        if (!orderId) {
          orderId = localStorage.getItem('pendingOrderId');
        }
        
        if (!orderId) {
          toast.error(t('payment.process.toast.noOrder'));
          navigate('/payment-failed?error=No order information');
          return;
        }

        const success = searchParams.get('success');
        const txnResponseCode = searchParams.get('txn_response_code');
        const paymentStatus = searchParams.get('payment_status');
        const gateway = searchParams.get('gateway') || localStorage.getItem('selectedPaymentMethod');
        const isSuccess = success === 'true' || txnResponseCode === 'APPROVED' || paymentStatus === 'success';
        
        if (isSuccess) {
          let verificationResult;
          if (gateway === 'tabby') {
             const paymentId = searchParams.get('payment_id');
             if (!paymentId) {
               throw new Error('Tabby payment ID missing');
             }
             verificationResult = await paymentService.verifyTabbyPayment(paymentId);
          } else {
             verificationResult = await paymentService.verifyPayment(orderId);
          }
          
          if (verificationResult.success && verificationResult.status === 'paid') {
            clearCart();
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('pendingCourseIds');
            localStorage.removeItem('selectedPaymentMethod');
            
            toast.success(t('payment.process.toast.success'));
            navigate(`/payment-success?order_id=${orderId}&id=${searchParams.get('id') || ''}`);
          } else {
            toast.error(t('payment.process.toast.verifyFailed'));
            navigate('/payment-failed?error=Payment verification failed');
          }
        } else {
          const errorMsg = searchParams.get('error') || t('payment.failed.defaultError');
          toast.error(errorMsg);
          navigate(`/payment-failed?error=${encodeURIComponent(errorMsg)}`);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.error(t('payment.process.toast.processError'));
        navigate('/payment-failed?error=Processing error');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, clearCart, t]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('payment.process.processingPayment')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('payment.process.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentProcess;
