import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TabbyFailure = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Issue #6: Correct rejection message per Tabby guidelines (not a card/bank failure)
        toast.error(
            t(
                'tabby.failure.message',
                'Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method for your order.'
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

export default TabbyFailure;
