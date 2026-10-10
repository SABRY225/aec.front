import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TamaraFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        toast.error(t('payment.failed.defaultError', 'تعذر إتمام الدفع عبر تمارا. يرجى التحقق من بياناتك أو تجربة طريقة دفع أخرى.'));
        navigate('/payment-failed?gateway=tamara' + (orderId ? `&orderId=${orderId}` : ''));
    }, [navigate, searchParams, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
             <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm w-full">
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">جاري إعادة التوجيه...</p>
             </div>
        </div>
    );
};

export default TamaraFailure;
