import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const TabbyFailure = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Issue #6: Correct rejection message per Tabby guidelines (not a card/bank failure)
        toast.error(
            t(
                'tabby.failure.message',
                'نعتذر، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى لطلبك.'
            )
        );
        navigate('/checkout');
    }, [navigate, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                    {t('tabby.failure.redirecting', 'جاري إعادة التوجيه إلى صفحة الدفع...')}
                </p>
            </div>
        </div>
    );
};

export default TabbyFailure;
