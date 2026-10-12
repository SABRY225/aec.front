import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import InstructorApplications from './InstructorApplications';
import Instructors from './Instructors';
import { 
    Users, 
    FileText, 
    RotateCcw, 
    GraduationCap, 
    ShieldCheck, 
    Clock, 
    Sparkles 
} from 'lucide-react';

const InstructorManagement = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [activeTab, setActiveTab] = useState('instructors');
    const [counts, setCounts] = useState({
        instructors: 0,
        applications: 0
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleInstructorsCount = useCallback((count) => {
        setCounts(prev => ({ ...prev, instructors: count }));
    }, []);

    const handleApplicationsCount = useCallback((count) => {
        setCounts(prev => ({ ...prev, applications: count }));
    }, []);

    const handleRefreshAll = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" 
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* ======================================================== */}
            {/* Header Section */}
            {/* ======================================================== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 shadow-sm">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {t('admin.instructors.title', 'إدارة المحاضرين')}
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                    {counts.instructors}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {t('admin.instructors.subtitle', 'إدارة ومتابعة المحاضرين المعتمدين ومراجعة طلبات الانضمام الجديدة')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right controls: Refresh */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={handleRefreshAll}
                        disabled={isRefreshing}
                        title={t('admin.instructors.refresh', 'تحديث')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all disabled:opacity-50"
                    >
                        <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
                        <span>{t('admin.instructors.refresh', 'تحديث')}</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Interactive KPI Overview Cards */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Lecturers Card */}
                <button
                    type="button"
                    onClick={() => setActiveTab('instructors')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'instructors'
                            ? 'bg-gradient-to-br from-primary-50/80 to-indigo-50/40 dark:from-primary-950/40 dark:to-indigo-950/20 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-primary-100/70 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {t('admin.instructors.approved', 'معتمد')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.instructors.listTitle', 'المحاضرون المعتمدون')}
                        </h3>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {counts.instructors}
                        </p>
                    </div>
                    {activeTab === 'instructors' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-primary-500"></div>
                    )}
                </button>

                {/* Pending Applications Card */}
                <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'applications'
                            ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        {counts.applications > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                {t('admin.instructors.actionNeeded', 'بحاجة لمراجعة')}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                0
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.instructors.applicationsTitle', 'طلبات الانضمام كمحاضر')}
                        </h3>
                        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                            {counts.applications}
                        </p>
                    </div>
                    {activeTab === 'applications' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500"></div>
                    )}
                </button>
            </div>

            {/* ======================================================== */}
            {/* Segmented Tab Navigation Control */}
            {/* ======================================================== */}
            <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-700/80">
                <button
                    type="button"
                    onClick={() => setActiveTab('instructors')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'instructors'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Users className="w-4 h-4 text-primary-600" />
                    <span>{t('admin.instructors.listTitle', 'المحاضرون')}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {counts.instructors}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'applications'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>{t('admin.instructors.applications', 'طلبات الانضمام')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        counts.applications > 0 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                        {counts.applications}
                    </span>
                </button>
            </div>

            {/* ======================================================== */}
            {/* Tab Content Display */}
            {/* ======================================================== */}
            <div>
                <div className={activeTab === 'instructors' ? 'block' : 'hidden'}>
                    <Instructors 
                        onCountChange={handleInstructorsCount} 
                        isRefreshingParent={isRefreshing}
                    />
                </div>
                <div className={activeTab === 'applications' ? 'block' : 'hidden'}>
                    <InstructorApplications 
                        onCountChange={handleApplicationsCount} 
                        isRefreshingParent={isRefreshing}
                    />
                </div>
            </div>
        </div>
    );
};

export default InstructorManagement;
