import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Printer } from 'lucide-react';
import { paymentService } from '../services/new-api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/shared/Invoice/InvoiceModal';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        const orderId = searchParams.get('order_id');
        const transactionId = searchParams.get('id');
        
        if (!orderId) {
          toast.error(t('payment.success.toast.invalidInfo'));
          navigate('/courses');
          return;
        }

        const response = await paymentService.verifyPayment(orderId);
        
        if (response.success) {
          setPaymentDetails({
            orderId,
            transactionId,
            amount: response.amount,
            currency: response.currency,
            courses: response.courses
          });
          toast.success(t('payment.success.toast.verified'));
        } else {
          toast.error(t('payment.success.toast.verifyFailed'));
          navigate('/payment-failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(t('payment.success.toast.verifyError'));
        navigate('/payment-failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPaymentStatus();
  }, [searchParams, navigate, t]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('payment.success.verifying')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('payment.success.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('payment.success.message')}
        </p>

        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-start">
            <h3 className="font-semibold text-gray-900 mb-2">{t('payment.success.paymentDetails')}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">{t('payment.success.orderId')}</span> {paymentDetails.orderId}</p>
              {paymentDetails.transactionId && (
                <p><span className="font-medium">{t('payment.success.transactionId')}</span> {paymentDetails.transactionId}</p>
              )}
              <p><span className="font-medium">{t('payment.success.amount')}</span> {paymentDetails.amount} {paymentDetails.currency}</p>
              <p><span className="font-medium">{t('payment.success.coursesCount')}</span> {t('payment.success.courseCount', { count: paymentDetails.courses?.length || 0 })}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="w-full bg-[#004C97] hover:bg-[#071942] text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer size={18} />
            <span>طباعة إيصال الفاتورة (A4)</span>
          </button>

          <button
            onClick={() => {
              const myCoursesPath = user?.role === 'instructor' ? '/instructor/my-courses' : '/student/my-courses';
              navigate(myCoursesPath);
            }}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 font-bold transition-colors"
          >
            {t('payment.success.viewCourses')}
          </button>
          
          <button
            onClick={() => navigate('/explore')}
            className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 font-medium transition-colors"
          >
            {t('payment.success.browseMore')}
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {paymentDetails && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoiceData={{
            invoiceNumber: `INV-${new Date().getFullYear()}-${paymentDetails.orderId?.slice(-5).toUpperCase() || '00001'}`,
            orderNumber: paymentDetails.orderId,
            issueDate: new Date(),
            paymentStatus: 'completed',
            student: {
              name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
              email: user?.email || '',
              phone: user?.phone || '',
              phoneCode: user?.phoneCode || ''
            },
            courses: paymentDetails.courses || [],
            paymentMethod: 'mada',
            transactionRef: paymentDetails.transactionId ? `TXN-${paymentDetails.transactionId}` : 'TXN-PAID',
            subtotal: paymentDetails.amount || 0,
            grandTotal: paymentDetails.amount || 0,
            verificationUrl: `${window.location.origin}/verify-enrollment/${paymentDetails.orderId}`
          }}
        />
      )}
    </div>
  );
};

export default PaymentSuccess;
