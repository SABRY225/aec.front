import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

const AdminReviews = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                    <Star size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">التقييمات والمراجعات</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">إدارة تقييمات الطلاب للدورات والمحاضرين.</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
                <Star size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">قريباً</h3>
                <p className="text-slate-500 dark:text-slate-400">جاري تطوير صفحة إدارة التقييمات.</p>
            </div>
        </div>
    );
};

export default AdminReviews;
