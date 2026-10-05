import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircleIcon } from '@heroicons/react/24/solid';

const PaymentFailed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('error') || t('payment.failed.defaultError');

  const tips = [
    t('payment.failed.tipCheckInfo'),
    t('payment.failed.tipFunds'),
    t('payment.failed.tipBank'),
    t('payment.failed.tipMethod'),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('payment.failed.title')}
        </h1>
        
        <p className="text-gray-600 mb-2">
          {t('payment.failed.message')}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          {errorMessage}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">{t('payment.failed.whatYouCanDo')}</h3>
          <ul className="text-sm text-yellow-700 text-start space-y-1">
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('checkout.tryAgain')}
          </button>
          
          <button
            onClick={() => navigate('/explore')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('payment.failed.continueShopping')}
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="w-full text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {t('payment.failed.contactSupport')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
