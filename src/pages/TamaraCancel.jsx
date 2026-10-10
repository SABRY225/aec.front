import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TamaraCancel = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        toast.info(t('payment.failed.defaultError', 'تم إلغاء عملية الدفع عبر تمارا. يمكنك المحاولة مجدداً أو اختيار طريقة دفع أخرى.'));
        navigate('/checkout');
    }, [navigate, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
             <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm w-full">
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">جاري إعادة التوجيه إلى صفحة الدفع...</p>
             </div>
        </div>
    );
};

export default TamaraCancel;
