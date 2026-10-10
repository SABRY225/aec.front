import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../services/new-api';
import { toast } from 'react-toastify';
import AdminCourseCard from '../../components/admin/AdminCourseCard';
import { 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    Search, 
    X, 
    RotateCcw, 
    LayoutGrid, 
    List, 
    Filter, 
    ArrowUpDown, 
    GraduationCap, 
    ChevronLeft, 
    ChevronRight,
    Sparkles
} from 'lucide-react';

const PAGE_SIZE = 24;

const CourseManagement = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [activeTab, setActiveTab] = useState('all');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: PAGE_SIZE });
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0
    });
    
    // UI Enhancements: view mode, category filter, sort order
    const [viewMode, setViewMode] = useState('grid');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCourses = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            const params = {
                page,
                limit: PAGE_SIZE,
                ...(debouncedSearch ? { search: debouncedSearch } : {})
            };

            let endpoint = '/admin/courses';
            if (activeTab === 'pending') {
                endpoint = '/admin/courses/pending';
            } else if (activeTab === 'approved') {
                params.status = 'approved';
            }

            const response = await api.get(endpoint, { params });
            const payload = response.data;
            const coursesData = payload.courses || payload;
            setCourses(Array.isArray(coursesData) ? coursesData : []);

            if (payload.pagination) {
                setPagination(payload.pagination);
            } else {
                setPagination({
                    total: Array.isArray(coursesData) ? coursesData.length : 0,
                    pages: 1,
                    page: 1,
                    limit: PAGE_SIZE
                });
            }

            if (payload.stats) {
                setStats(payload.stats);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error(t('admin.courses.fetchFailed', 'فشل في تحميل الدورات'));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab, page, debouncedSearch, t]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Keep tab counts fresh when switching tabs
    useEffect(() => {
        if (activeTab === 'pending') {
            api.get('/admin/courses', { params: { page: 1, limit: 1 } })
                .then((response) => {
                    if (response.data?.stats) {
                        setStats(response.data.stats);
                    }
                })
                .catch(() => {});
        }
    }, [activeTab]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleStatusChange = async (courseId, newStatus) => {
        try {
            await api.put(`/admin/courses/${courseId}/status`, 
                { status: newStatus }
            );
            
            fetchCourses();
            toast.success(t('admin.courses.statusChanged', { status: newStatus }));
        } catch (error) {
            console.error('Error updating course status:', error);
            toast.error(t('admin.courses.updateStatusFailed', 'تعذر تحديث حالة الدورة'));
        }
    };

    const handleDelete = async (courseId) => {
        if (window.confirm(t('admin.courses.confirmDelete', 'هل أنت متأكد من حذف هذه الدورة؟'))) {
            try {
                await api.delete(`/admin/courses/${courseId}`);
                fetchCourses();
                toast.success(t('admin.courses.deleted', 'تم حذف الدورة بنجاح'));
            } catch (error) {
                console.error('Error deleting course:', error);
                toast.error(t('admin.courses.deleteFailed', 'فشل حذف الدورة'));
            }
        }
    };

    const handleToggleFeatured = async (courseId) => {
        try {
            await api.put(`/admin/courses/${courseId}/featured`);
            
            setCourses(prev => prev.map(course => 
                course._id === courseId ? { ...course, featured: !course.featured } : course
            ));
            
            toast.success(t('admin.courses.featuredUpdated', 'تم تحديث حالة التمييز'));
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error(t('admin.courses.featuredFailed', 'تعذر تحديث حالة التمييز'));
        }
    };

    // Extract unique categories for secondary quick-filter
    const categories = useMemo(() => {
        const set = new Set();
        courses.forEach(c => {
            if (c.category) set.add(c.category);
        });
        return ['all', ...Array.from(set)];
    }, [courses]);

    // Local client-side filter for categories and sort
    const displayedCourses = useMemo(() => {
        let list = [...courses];

        if (categoryFilter !== 'all') {
            list = list.filter(c => c.category === categoryFilter);
        }

        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === 'priceHigh') {
            list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (sortBy === 'priceLow') {
            list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (sortBy === 'title') {
            list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return list;
    }, [courses, categoryFilter, sortBy]);

    // Approval rate calculation
    const approvalRate = stats.total > 0 
        ? Math.round((stats.approved / stats.total) * 100) 
        : 0;

    const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextIcon = isRTL ? ChevronLeft : ChevronRight;

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
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {t('admin.courses.title', 'إدارة الدورات')}
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                    {stats.total}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isRTL 
                                    ? 'متابعة، مراجعة، اعتماد وتمييز جميع الدورات المنشورة على المنصة' 
                                    : 'Monitor, review, approve and organize all courses across the platform'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right controls: Refresh & View Toggle */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    {/* Refresh Button */}
                    <button
                        type="button"
                        onClick={() => fetchCourses(true)}
                        disabled={loading || isRefreshing}
                        title={t('admin.courses.refresh', 'تحديث')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all disabled:opacity-50"
                    >
                        <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
                        <span className="hidden sm:inline">{t('admin.courses.refresh', 'تحديث')}</span>
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            title={t('admin.courses.gridView', 'عرض شبكي')}
                            className={`p-1.5 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            title={t('admin.courses.listView', 'عرض قائمة')}
                            className={`p-1.5 rounded-lg transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Interactive KPI / Statistics Cards */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Courses Card */}
                <button
                    type="button"
                    onClick={() => handleTabChange('all')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'all'
                            ? 'bg-gradient-to-br from-primary-50/80 to-indigo-50/40 dark:from-primary-950/40 dark:to-indigo-950/20 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-primary-100/70 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t('admin.courses.catalogSummary', 'كتالوج المنصة')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.courses.allCourses', 'جميع الدورات')}
                        </h3>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {stats.total}
                        </p>
                    </div>
                    {activeTab === 'all' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-primary-500"></div>
                    )}
                </button>

                {/* Approved Courses Card */}
                <button
                    type="button"
                    onClick={() => handleTabChange('approved')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'approved'
                            ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {approvalRate}% {t('admin.courses.activeRate', 'من الإجمالي')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.courses.approvedCourses', 'الدورات المعتمدة')}
                        </h3>
                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {stats.approved}
                        </p>
                    </div>
                    {activeTab === 'approved' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500"></div>
                    )}
                </button>

                {/* Pending Review Card */}
                <button
                    type="button"
                    onClick={() => handleTabChange('pending')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'pending'
                            ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        {stats.pending > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                {t('admin.courses.actionNeeded', 'بحاجة لمراجعة')}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                0
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.courses.pendingCourses', 'دورات قيد المراجعة')}
                        </h3>
                        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                            {stats.pending}
                        </p>
                    </div>
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500"></div>
                    )}
                </button>
            </div>

            {/* ======================================================== */}
            {/* Filter & Search Action Bar */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-5">
                {/* 1. Tab Navigation */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto w-full max-w-fit custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => handleTabChange('all')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'all'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>{t('admin.courses.allCourses', 'جميع الدورات')}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {stats.total}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('approved')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'approved'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <CheckCircle2 className={`w-4 h-4 ${activeTab === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                        <span>{t('admin.courses.approvedCourses', 'المعتمدة')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'approved' ? 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {stats.approved}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('pending')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'pending'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <Clock className={`w-4 h-4 ${activeTab === 'pending' ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                        <span>{t('admin.courses.pendingCourses', 'قيد المراجعة')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {stats.pending}
                        </span>
                    </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full"></div>

                {/* 2. Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('admin.courses.searchPlaceholder', 'ابحث باسم الدورة أو المحاضر...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-xl ps-11 pe-10 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 shadow-sm outline-none"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Selects Container */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 shrink-0">
                        {/* Category Filter */}
                        {categories.length > 2 && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                    <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="block w-full sm:w-[160px] lg:w-[180px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none"
                                >
                                    <option value="all">{t('admin.courses.filterByCategory', 'جميع التصنيفات')}</option>
                                    {categories.filter(c => c !== 'all').map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Sort Order */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-full sm:w-[160px] lg:w-[180px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none"
                            >
                                <option value="newest">{t('admin.courses.newest', 'الأحدث إضافتاً')}</option>
                                <option value="priceHigh">{t('admin.courses.priceHighToLow', 'السعر: الأغلى')}</option>
                                <option value="priceLow">{t('admin.courses.priceLowToHigh', 'السعر: الأرخص')}</option>
                                <option value="title">{t('admin.courses.titleAZ', 'العنوان (أ-ي)')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Courses Display (Loading / Empty / Content) */}
            {/* ======================================================== */}
            <div>
                {loading ? (
                    /* Skeleton Loader Grid */
                    <div className={
                        viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6" 
                            : "space-y-3"
                    }>
                        {[...Array(viewMode === 'grid' ? 8 : 6)].map((_, idx) => (
                            <div 
                                key={idx}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm animate-pulse"
                            >
                                {viewMode === 'grid' ? (
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
                                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-24 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-28"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : displayedCourses.length === 0 ? (
                    /* Modern Empty State */
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {t('admin.courses.noCourses', 'لا توجد دورات')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                            {searchTerm 
                                ? t('admin.courses.trySearch', 'لم نجد أي دورات مطابقة لبحثك. جرّب تعديل كلمات البحث.') 
                                : t('admin.courses.noInCategory', 'لا توجد دورات متاحة في هذا التصنيف حالياً.')}
                        </p>
                        {(searchTerm || categoryFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('all');
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span>{t('admin.courses.clearSearch', 'إعادة ضبط عوامل التصفية')}</span>
                            </button>
                        )}
                    </div>
                ) : (
                    /* Main Course Content */
                    <>
                        <div className={
                            viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                                : "space-y-3"
                        }>
                            {displayedCourses.map((course) => (
                                <AdminCourseCard
                                    key={course._id}
                                    course={course}
                                    viewMode={viewMode}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                    onToggleFeatured={handleToggleFeatured}
                                />
                            ))}
                        </div>

                        {/* Pagination Bar */}
                        {pagination.pages > 1 && (
                            <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {isRTL 
                                        ? `الصفحة ${page} من إجمالي ${pagination.pages} (${pagination.total} دورة)`
                                        : `Page ${page} of ${pagination.pages} (${pagination.total} courses)`}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 transition-colors"
                                    >
                                        <PrevIcon className="w-4 h-4" />
                                        <span>{t('common.previous', 'السابق')}</span>
                                    </button>

                                    <div className="flex items-center gap-1 px-2">
                                        {[...Array(pagination.pages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Only render current page, first, last, and immediate neighbors
                                            if (
                                                pageNum === 1 ||
                                                pageNum === pagination.pages ||
                                                (pageNum >= page - 1 && pageNum <= page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        type="button"
                                                        onClick={() => setPage(pageNum)}
                                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                            pageNum === page
                                                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === page - 2 ||
                                                pageNum === page + 2
                                            ) {
                                                return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={page >= pagination.pages}
                                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 transition-colors"
                                    >
                                        <span>{t('common.next', 'التالي')}</span>
                                        <NextIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CourseManagement;
