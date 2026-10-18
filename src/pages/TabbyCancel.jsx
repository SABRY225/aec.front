import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const TabbyCancel = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Issue #6: Correct cancellation message per Tabby guidelines
        toast.info(
            t(
                'tabby.cancel.message',
                'قمت بإلغاء عملية الدفع. يرجى إعادة المحاولة أو اختيار طريقة دفع أخرى.'
            )
        );
        navigate('/checkout');
    }, [navigate, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                    {t('tabby.cancel.redirecting', 'جاري إعادة التوجيه إلى صفحة الدفع...')}
                </p>
            </div>
        </div>
    );
};

export default TabbyCancel;
