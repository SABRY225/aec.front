import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TabbyCancel = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Issue #6: Correct cancellation message per Tabby guidelines
        toast.info(
            t(
                'tabby.cancel.message',
                'You aborted the payment. Please retry or choose another payment method.'
            )
        );
        navigate('/checkout');
    }, [navigate, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
             <div className="text-center p-8">
                 <p className="text-slate-600 dark:text-slate-400">جاري إعادة التوجيه...</p>
             </div>
        </div>
    );
};

export default TabbyCancel;
