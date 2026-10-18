import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Eye,
    Users,
    TrendingUp,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    Search,
    RefreshCw,
    ExternalLink,
    Clock,
    UserCheck,
    UserX,
    Compass,
    Home,
    BookOpen,
    ShoppingCart,
    GraduationCap,
    SlidersHorizontal,
    Award,
    Sparkles,
    ShieldAlert
} from 'lucide-react';
import { adminService } from '../../services/new-api';
import { toast } from 'react-toastify';

const getCategoryBadge = (category) => {
    switch (category) {
        case 'home':
            return {
                label: 'الرئيسية',
                icon: <Home size={14} />,
                bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            };
        case 'courses':
            return {
                label: 'دليل الدورات',
                icon: <Compass size={14} />,
                bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            };
        case 'course_detail':
            return {
                label: 'صفحة دورة',
                icon: <BookOpen size={14} />,
                bg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
            };
        case 'cart_checkout':
            return {
                label: 'السلة والدفع',
                icon: <ShoppingCart size={14} />,
                bg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            };
        case 'student_portal':
            return {
                label: 'بوابة الطالب',
                icon: <GraduationCap size={14} />,
                bg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            };
        default:
            return {
                label: 'صفحة عامة',
                icon: <Globe size={14} />,
                bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            };
    }
};

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'غير محدد';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
};

const PageAnalytics = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('week'); // 'today' | 'week' | 'month' | 'all'
    const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'guest'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [data, setData] = useState({
        summary: {
            totalViews: 0,
            uniqueVisitors: 0,
            studentViews: 0,
            guestViews: 0,
            instructorViews: 0,
            registeredPercentage: 0,
            topPage: null
        },
        topPages: [],
        trend: [],
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        recentVisits: []
    });

    const fetchAnalytics = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) setRefreshing(true);
            else setLoading(true);

            const res = await adminService.getPageAnalytics({
                timeRange,
                role: roleFilter,
                search: searchQuery
            });

            if (res && res.success) {
                setData({
                    summary: res.summary || {},
                    topPages: res.topPages || [],
                    trend: res.trend || [],
                    devices: res.devices || { desktop: 0, mobile: 0, tablet: 0 },
                    recentVisits: res.recentVisits || []
                });
            }
        } catch (err) {
            console.error('Error loading page analytics:', err);
            toast.error('تعذر تحميل بيانات تتبع الصفحات');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange, roleFilter]);

    // Filter topPages based on category and local search
    const filteredPages = useMemo(() => {
        return (data.topPages || []).filter((page) => {
            const matchesSearch =
                !searchQuery ||
                (page.path && page.path.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (page.pageTitle && page.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory =
                selectedCategory === 'all' || page.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [data.topPages, searchQuery, selectedCategory]);

    const maxTrendViews = useMemo(() => {
        if (!data.trend || data.trend.length === 0) return 10;
        return Math.max(...data.trend.map((t) => t.views || 0), 10);
    }, [data.trend]);

    const totalDeviceViews = useMemo(() => {
        const d = data.devices || {};
        return (d.desktop || 0) + (d.mobile || 0) + (d.tablet || 0) || 1;
    }, [data.devices]);

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 font-arabic">
            {/* ---------------- Header ---------------- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-4 sm:gap-5">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 shrink-0">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                تتبع صفحات المستخدمين
                            </h1>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                رصد مباشر
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
                            تحليل شامل لأكثر الصفحات زيارة ونشاط الطلاب والزوار عبر النظام بالكامل.
                        </p>
                    </div>
                </div>

                {/* Actions & Refresh */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-white bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex items-center gap-2 group active:scale-95 disabled:opacity-50"
                        title="تحديث البيانات"
                    >
                        <RefreshCw
                            size={18}
                            className={`${refreshing ? 'animate-spin text-blue-500' : 'group-hover:rotate-180 transition-transform duration-700'}`}
                        />
                        <span>{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
                    </button>
                </div>
            </div>

            {/* ---------------- Filter & Time Range Bar ---------------- */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                {/* Time Range Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                    {[
                        { id: 'today', label: 'اليوم' },
                        { id: 'week', label: 'آخر 7 أيام' },
                        { id: 'month', label: 'آخر 30 يوماً' },
                        { id: 'all', label: 'كل الأوقات' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id)}
                            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                                timeRange === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Role Filter & Search */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {/* User Role Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
                        {[
                            { id: 'all', label: 'الجميع' },
                            { id: 'student', label: 'الطلاب' },
                            { id: 'guest', label: 'الزوار الضيوف' }
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setRoleFilter(role.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    roleFilter === role.id
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search
                            size={16}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="ابحث عن مسار أو عنوان صفحة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* ---------------- 4 KPI Hero Metric Cards ---------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Pageviews */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <Eye size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            إجمالي المشاهدات
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                        {data.summary.totalViews?.toLocaleString() || 0}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <Activity size={14} className="text-blue-500" />
                        <span>مشاهدة تم رصدها خلال الفترة</span>
                    </p>
                </motion.div>

                {/* 2. Unique Visitors */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            زوار فريدين
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                        {data.summary.uniqueVisitors?.toLocaleString() || 0}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <Globe size={14} className="text-emerald-500" />
                        <span>جلسات تصفح مختلفة</span>
                    </p>
                </motion.div>

                {/* 3. Top Visited Page */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <Award size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            الأكثر زيارة
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate" title={data.summary.topPage?.pageTitle || data.summary.topPage?.path || 'لا توجد بيانات'}>
                        {data.summary.topPage?.pageTitle || data.summary.topPage?.path || 'لا توجد بيانات'}
                    </h3>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-2 truncate flex items-center gap-1" dir="ltr">
                        {data.summary.topPage?.path || '/'}
                        <span className="text-slate-400 font-medium ml-2">
                            ({data.summary.topPage?.totalViews || 0} زيارة)
                        </span>
                    </p>
                </motion.div>

                {/* 4. Registered vs Guests */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <UserCheck size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            نسبة الطلاب
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                        {data.summary.registeredPercentage || 0}%
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                        <span>{data.summary.studentViews || 0} طالب</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span>{data.summary.guestViews || 0} زائر ضيف</span>
                    </p>
                </motion.div>
            </div>

            {/* ---------------- Visual Analytics Charts ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Traffic Activity Chart (2 cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    مسار الزيارات عبر الوقت
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    توزيع المشاهدات حسب الفترات الزمنية
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 relative pt-8 pb-4">
                        {data.trend && data.trend.length > 0 ? (
                            data.trend.map((point, idx) => {
                                const heightPercent = Math.max(
                                    Math.round((point.views / maxTrendViews) * 100),
                                    6
                                );
                                return (
                                    <div
                                        key={idx}
                                        className="flex-1 flex flex-col items-center h-full justify-end group/bar relative"
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-xl z-30 pointer-events-none whitespace-nowrap flex flex-col items-center">
                                            <span>{point.views} مشاهدة</span>
                                            <span className="text-[10px] text-blue-400">{point.unique} زائر فريد</span>
                                            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mb-1 mt-0.5"></div>
                                        </div>

                                        {/* Bar */}
                                        <div className="w-full flex-1 flex items-end justify-center">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercent}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.03 }}
                                                className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-400 dark:from-blue-700 dark:to-indigo-500 rounded-t-xl group-hover/bar:brightness-110 transition-all shadow-sm"
                                            />
                                        </div>

                                        {/* Label */}
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-2 truncate w-full text-center">
                                            {point.label}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Activity size={36} className="opacity-30" />
                                <span className="text-sm font-medium">لا توجد بيانات كافية خلال هذه الفترة</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Device Breakdown & User Audience (1 col) */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    توزيع الأجهزة
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">نوع أجهزة الزوار</p>
                            </div>
                        </div>

                        {/* Device Bars */}
                        <div className="space-y-4">
                            {[
                                {
                                    id: 'desktop',
                                    name: 'أجهزة الكمبيوتر (Desktop)',
                                    icon: <Monitor size={18} className="text-blue-500" />,
                                    count: data.devices?.desktop || 0,
                                    color: 'from-blue-500 to-indigo-600'
                                },
                                {
                                    id: 'mobile',
                                    name: 'الهواتف الذكية (Mobile)',
                                    icon: <Smartphone size={18} className="text-emerald-500" />,
                                    count: data.devices?.mobile || 0,
                                    color: 'from-emerald-500 to-teal-500'
                                },
                                {
                                    id: 'tablet',
                                    name: 'الأجهزة اللوحية (Tablet)',
                                    icon: <Tablet size={18} className="text-purple-500" />,
                                    count: data.devices?.tablet || 0,
                                    color: 'from-purple-500 to-pink-500'
                                }
                            ].map((dev) => {
                                const percent = Math.round((dev.count / totalDeviceViews) * 100);
                                return (
                                    <div key={dev.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <span className="flex items-center gap-2">
                                                {dev.icon}
                                                {dev.name}
                                            </span>
                                            <span className="text-slate-900 dark:text-white">
                                                {percent}% ({dev.count})
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 0.8 }}
                                                className={`h-full bg-gradient-to-r ${dev.color} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Audience Breakdown */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 mb-3">توزيع الجمهور:</h4>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block mb-1">
                                    طلاب مسجلين
                                </span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                    {data.summary.studentViews || 0}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">
                                    زوار غير مسجلين
                                </span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                    {data.summary.guestViews || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Top Visited Pages Table ---------------- */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Table Header & Category Tabs */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <BookOpen size={20} />
                            </div>
                            الصفحات الأكثر زيارة عبر النظام
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            مرتبة تنازلياً حسب إجمالي عدد المشاهدات والزوار
                        </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {[
                            { id: 'all', label: 'جميع الأقسام' },
                            { id: 'home', label: 'الرئيسية' },
                            { id: 'courses', label: 'الدورات' },
                            { id: 'course_detail', label: 'صفحات الدورات' },
                            { id: 'cart_checkout', label: 'السلة والدفع' },
                            { id: 'student_portal', label: 'بوابة الطالب' }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 text-xs">
                            <tr>
                                <th className="px-6 py-4 w-16 text-center">الترتيب</th>
                                <th className="px-6 py-4">عنوان ومسار الصفحة</th>
                                <th className="px-6 py-4">التصنيف</th>
                                <th className="px-6 py-4 text-center">المشاهدات</th>
                                <th className="px-6 py-4 text-center">زوار فريدين</th>
                                <th className="px-6 py-4">توزيع الزوار</th>
                                <th className="px-6 py-4 text-center">آخر زيارة</th>
                                <th className="px-6 py-4 text-center w-24">معاينة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw size={30} className="animate-spin text-blue-600" />
                                            <span className="text-sm font-bold text-slate-500">
                                                جاري تحميل بيانات التتبع...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPages.length > 0 ? (
                                filteredPages.map((page, idx) => {
                                    const badge = getCategoryBadge(page.category);
                                    const isTop3 = idx < 3;
                                    return (
                                        <tr
                                            key={page.path || idx}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                                        >
                                            {/* Rank */}
                                            <td className="px-6 py-4 text-center font-black">
                                                {idx === 0 ? (
                                                    <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 inline-flex items-center justify-center text-sm shadow-sm">
                                                        🥇 1
                                                    </span>
                                                ) : idx === 1 ? (
                                                    <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 inline-flex items-center justify-center text-sm shadow-sm">
                                                        🥈 2
                                                    </span>
                                                ) : idx === 2 ? (
                                                    <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-600 inline-flex items-center justify-center text-sm shadow-sm">
                                                        🥉 3
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-bold">
                                                        #{idx + 1}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Page Title & Path */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {page.pageTitle || 'صفحة بدون عنوان'}
                                                    </span>
                                                    <span
                                                        className="text-xs font-mono text-slate-400 block mt-0.5"
                                                        dir="ltr"
                                                    >
                                                        {page.path}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${badge.bg}`}
                                                >
                                                    {badge.icon}
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Views with Progress Bar */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-black text-slate-900 dark:text-white text-base">
                                                        {page.totalViews?.toLocaleString()}
                                                    </span>
                                                    <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-blue-600 h-full rounded-full"
                                                            style={{
                                                                width: `${Math.min(page.percentage || 0, 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1">
                                                        {page.percentage}% من الزيارات
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Unique Visitors */}
                                            <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                                {page.uniqueVisitors?.toLocaleString()}
                                            </td>

                                            {/* Visitors Distribution */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span
                                                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold"
                                                        title="مشاهدات الطلاب"
                                                    >
                                                        <UserCheck size={14} />
                                                        {page.studentViews || 0}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700">/</span>
                                                    <span
                                                        className="flex items-center gap-1 text-slate-500 font-medium"
                                                        title="مشاهدات الزوار الضيوف"
                                                    >
                                                        <UserX size={14} />
                                                        {page.guestViews || 0}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Last Visited */}
                                            <td className="px-6 py-4 text-center text-xs font-medium text-slate-400">
                                                {formatTimeAgo(page.lastVisited)}
                                            </td>

                                            {/* Preview in new tab */}
                                            <td className="px-6 py-4 text-center">
                                                <a
                                                    href={page.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 inline-flex items-center justify-center transition-colors"
                                                    title="فتح الصفحة في تابة جديدة"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Compass size={40} className="opacity-30" />
                                            <p className="font-bold text-base text-slate-600 dark:text-slate-300">
                                                لا توجد صفحات مطابقة للبحث
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                جرّب تغيير فلاتر البحث أو النطاق الزمني
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---------------- Real-time Live Visitors Activity Stream ---------------- */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                سجل الزيارات المباشرة (لحظة بلحظة)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                أحدث الصفحات التي تم فتحها الآن من قبل المستخدمين
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.recentVisits && data.recentVisits.length > 0 ? (
                        data.recentVisits.map((visit, i) => (
                            <div
                                key={i}
                                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                            visit.userRole === 'student'
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        {visit.userRole === 'student' ? (
                                            <GraduationCap size={18} />
                                        ) : (
                                            <Globe size={18} />
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                                            {visit.userName || 'زائر ضيف'}
                                        </span>
                                        <span
                                            className="text-[11px] font-mono text-slate-400 block truncate"
                                            dir="ltr"
                                        >
                                            {visit.path}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
                                    {formatTimeAgo(visit.createdAt)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium">
                            لا توجد زيارات مسجلة مؤخراً
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageAnalytics;
