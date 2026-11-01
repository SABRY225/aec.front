import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import api, { categoryService, subcategoryService } from '../../services/new-api';
import { toast } from 'react-toastify';
import AdminCourseCard from '../../components/admin/AdminCourseCard';
import { 
    BookOpen, 
    CheckCircle2, 
    Clock, 
    Search, 
    X, 
    XCircle,
    RotateCcw, 
    LayoutGrid, 
    List, 
    Filter, 
    ArrowUpDown, 
    GraduationCap, 
    ChevronLeft, 
    ChevronRight,
    Sparkles,
    SlidersHorizontal,
    Layers,
    CheckCheck
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

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
    const [pageSize, setPageSize] = useState(25);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 25 });
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });
    
    // UI Enhancements: view mode, category filter, subcategory filter, sort order
    const [viewMode, setViewMode] = useState('grid');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subCategoryFilter, setSubCategoryFilter] = useState('all');
    const [allCategories, setAllCategories] = useState([]);
    const [allSubcategories, setAllSubcategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    // Bulk approval state
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);

    // Fetch all categories & subcategories from the system
    useEffect(() => {
        const loadTaxonomies = async () => {
            try {
                setCategoriesLoading(true);
                const [catRes, subRes] = await Promise.allSettled([
                    categoryService.getCategories(),
                    subcategoryService?.getAllSubcategories ? subcategoryService.getAllSubcategories() : api.get('/subcategories')
                ]);

                if (catRes.status === 'fulfilled') {
                    const cData = catRes.value?.data || (Array.isArray(catRes.value) ? catRes.value : []);
                    setAllCategories(Array.isArray(cData) ? cData : []);
                }

                if (subRes.status === 'fulfilled') {
                    const sData = subRes.value?.data || (Array.isArray(subRes.value) ? subRes.value : []);
                    setAllSubcategories(Array.isArray(sData) ? sData : []);
                }
            } catch (err) {
                console.error('Failed to load categories/subcategories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadTaxonomies();
    }, []);

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
                limit: pageSize,
                sortBy,
                ...(debouncedSearch ? { search: debouncedSearch } : {})
            };

            if (activeTab !== 'all') {
                params.status = activeTab;
            }

            if (categoryFilter && categoryFilter !== 'all') {
                params.category = categoryFilter;
            }

            if (subCategoryFilter && subCategoryFilter !== 'all') {
                params.subCategory = subCategoryFilter;
            }

            const response = await api.get('/admin/courses', { params });
            const payload = response.data;
            const coursesData = payload.courses || payload;
            setCourses(Array.isArray(coursesData) ? coursesData : []);

            if (payload.pagination) {
                setPagination(payload.pagination);
            } else {
                setPagination({
                    total: Array.isArray(coursesData) ? coursesData.length : 0,
                    pages: Math.ceil((Array.isArray(coursesData) ? coursesData.length : 0) / pageSize) || 1,
                    page,
                    limit: pageSize
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
    }, [activeTab, page, pageSize, categoryFilter, subCategoryFilter, sortBy, debouncedSearch, t]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
        setCategoryFilter('all');
        setSubCategoryFilter('all');
    };

    const handleStatusChange = async (courseId, newStatus) => {
        try {
            await api.put(`/admin/courses/${courseId}/status`, 
                { status: newStatus }
            );
            
            fetchCourses();
            const statusArabic = newStatus === 'approved' ? 'اعتماد' : newStatus === 'rejected' ? 'رفض' : 'تعليق';
            toast.success(t('admin.courses.statusChanged', { status: statusArabic }) || `تم ${statusArabic} الدورة بنجاح`);
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

    // Combine categories from system database + any found in courses
    const categoryOptions = useMemo(() => {
        const map = new Map();

        // 1. All registered categories from database Category model
        allCategories.forEach(cat => {
            const label = isRTL ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr);
            const value =  cat.slug;
            if (value) {
                map.set(value, {
                    value,
                    label: label || value,
                    id: cat._id
                });
            }
        });

        // 2. Also ensure any custom/legacy categories on loaded courses are included
        courses.forEach(c => {
            if (c.category && !map.has(c.category)) {
                map.set(c.category, {
                    value: c.category,
                    label: c.category,
                    id: c.category
                });
            }
        });

        return Array.from(map.values());
    }, [allCategories, courses, isRTL]);

    // Combine subcategories based on selected category + all subcategories in db + courses
    const subcategoryOptions = useMemo(() => {
        const map = new Map();

        // 1. Find currently selected category object if filtered
        const selectedCat = categoryFilter !== 'all'
            ? allCategories.find(c => c.slug === categoryFilter || c._id === categoryFilter || c.nameEn === categoryFilter || c.nameAr === categoryFilter)
            : null;

        allSubcategories.forEach(sub => {
            const catRef = sub.category;
            const catId = typeof catRef === 'object' ? catRef?._id : catRef;
            const catSlug = typeof catRef === 'object' ? catRef?.slug : null;

            if (selectedCat) {
                const matchesCategory = 
                    (catId && String(catId) === String(selectedCat._id)) ||
                    (catSlug && catSlug === selectedCat.slug) ||
                    (categoryFilter === catSlug);
                if (!matchesCategory) return;
            }

            const label = isRTL ? (sub.nameAr || sub.nameEn) : (sub.nameEn || sub.nameAr);
            const value = sub.slug || sub.nameEn;
            if (value && !map.has(value)) {
                map.set(value, {
                    value,
                    label: label || value,
                    categoryName: typeof catRef === 'object' ? (catRef?.nameAr || catRef?.nameEn) : null
                });
            }
        });

        // 2. Also inspect loaded courses for any legacy or custom subCategory values
        courses.forEach(c => {
            if (c.subCategory) {
                if (categoryFilter !== 'all' && c.category && c.category !== categoryFilter) {
                    return;
                }
                if (!map.has(c.subCategory)) {
                    map.set(c.subCategory, {
                        value: c.subCategory,
                        label: c.subCategory
                    });
                }
            }
        });

        return Array.from(map.values());
    }, [allSubcategories, allCategories, courses, categoryFilter, isRTL]);

    // Main courses list
    const displayedCourses = courses;

    // Approval rate calculation
    const approvalRate = stats.total > 0 
        ? Math.round((stats.approved / stats.total) * 100) 
        : 0;

    const handleBulkApprove = async () => {
        try {
            setIsBulkApproving(true);
            const response = await api.put('/admin/courses/bulk-approve-pending');
            const data = response.data;
            toast.success(data.message || (isRTL ? 'تم اعتماد جميع الدورات المعلقة بنجاح' : 'All pending courses approved'));
            setShowBulkApproveModal(false);
            fetchCourses(true);
        } catch (error) {
            console.error('Error bulk approving courses:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'فشل اعتماد الدورات المعلقة' : 'Failed to approve pending courses'));
        } finally {
            setIsBulkApproving(false);
        }
    };

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

                {/* Right controls: Bulk Approve, Refresh & View Toggle */}
                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                    {/* Bulk Approve All Pending Button */}
                    {stats.pending > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowBulkApproveModal(true)}
                            disabled={loading || isRefreshing || isBulkApproving}
                            title={isRTL ? 'قبول جميع الدورات التي قيد المراجعة' : 'Approve all pending courses'}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isRTL ? `قبول كل المعلق (${stats.pending})` : `Approve All Pending (${stats.pending})`}</span>
                        </button>
                    )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {/* Rejected Courses Card */}
                <button
                    type="button"
                    onClick={() => handleTabChange('rejected')}
                    className={`text-start relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 group ${
                        activeTab === 'rejected'
                            ? 'bg-gradient-to-br from-rose-50/80 to-red-50/40 dark:from-rose-950/40 dark:to-red-950/20 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-rose-100/70 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                            {stats.rejected || 0}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.courses.rejected', 'المرفوضة')}
                        </h3>
                        <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                            {stats.rejected || 0}
                        </p>
                    </div>
                    {activeTab === 'rejected' && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-rose-500"></div>
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

                    <button
                        type="button"
                        onClick={() => handleTabChange('rejected')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'rejected'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <XCircle className={`w-4 h-4 ${activeTab === 'rejected' ? 'text-rose-600 dark:text-rose-400' : ''}`} />
                        <span>{t('admin.courses.rejected', 'المرفوضة')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'rejected' ? 'bg-rose-100/70 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {stats.rejected || 0}
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
                    <div className="grid grid-cols-1 sm:flex sm:items-center gap-3 shrink-0 flex-wrap">
                        {/* 1. Category Filter */}
                        <div className="relative group min-w-[170px] sm:w-auto">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    setSubCategoryFilter('all');
                                    setPage(1);
                                }}
                                className="block w-full sm:w-[170px] lg:w-[200px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none font-medium"
                            >
                                <option value="all">
                                    {t('admin.courses.filterByCategory', 'جميع التصنيفات')} {categoryOptions.length > 0 ? `(${categoryOptions.length})` : ''}
                                </option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Subcategory Filter */}
                        <div className="relative group min-w-[170px] sm:w-auto">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                <Layers className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={subCategoryFilter}
                                onChange={(e) => {
                                    setSubCategoryFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="block w-full sm:w-[170px] lg:w-[200px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none font-medium"
                            >
                                <option value="all">
                                    {isRTL ? 'جميع التصنيفات الفرعية' : 'All Subcategories'} {subcategoryOptions.length > 0 ? `(${subcategoryOptions.length})` : ''}
                                </option>
                                {subcategoryOptions.map((sub) => (
                                    <option key={sub.value} value={sub.value}>
                                        {sub.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Sort Order */}
                        <div className="relative group min-w-[140px] sm:w-auto">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(1);
                                }}
                                className="block w-full sm:w-[150px] lg:w-[160px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none"
                            >
                                <option value="newest">{t('admin.courses.newest', 'الأحدث إضافتاً')}</option>
                                <option value="oldest">{isRTL ? 'الأقدم إضافتاً' : 'Oldest'}</option>
                                <option value="priceHigh">{t('admin.courses.priceHighToLow', 'السعر: الأغلى')}</option>
                                <option value="priceLow">{t('admin.courses.priceLowToHigh', 'السعر: الأرخص')}</option>
                                <option value="title">{t('admin.courses.titleAZ', 'العنوان (أ-ي)')}</option>
                            </select>
                        </div>

                        {/* 4. Page Size Selector (25, 50, 75, 100) */}
                        <div className="relative group min-w-[130px] sm:w-auto">
                            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="block w-full sm:w-[135px] lg:w-[145px] rounded-xl ps-9 pe-8 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 appearance-none shadow-sm transition-all truncate outline-none font-medium"
                                title={isRTL ? 'عدد الدورات المعروضة في الصفحة' : 'Courses per page'}
                            >
                                <option value={25}>{isRTL ? 'عرض: 25 دورة' : 'Show: 25'}</option>
                                <option value={50}>{isRTL ? 'عرض: 50 دورة' : 'Show: 50'}</option>
                                <option value={75}>{isRTL ? 'عرض: 75 دورة' : 'Show: 75'}</option>
                                <option value={100}>{isRTL ? 'عرض: 100 دورة' : 'Show: 100'}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary Strip */}
                {(categoryFilter !== 'all' || subCategoryFilter !== 'all' || searchTerm) && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-medium">
                            {isRTL ? 'التصفيات المطبقة:' : 'Active filters:'}
                        </span>

                        {categoryFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60">
                                <Filter className="w-3 h-3 text-primary-500" />
                                <span>
                                    {categoryOptions.find(c => c.value === categoryFilter)?.label || categoryFilter}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setCategoryFilter('all'); setSubCategoryFilter('all'); setPage(1); }}
                                    className="hover:text-primary-900 dark:hover:text-white"
                                    title={isRTL ? 'إلغاء التصفية' : 'Remove filter'}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}

                        {subCategoryFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                <Layers className="w-3 h-3 text-indigo-500" />
                                <span>
                                    {subcategoryOptions.find(s => s.value === subCategoryFilter)?.label || subCategoryFilter}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setSubCategoryFilter('all'); setPage(1); }}
                                    className="hover:text-indigo-900 dark:hover:text-white"
                                    title={isRTL ? 'إلغاء التصفية' : 'Remove filter'}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}

                        {searchTerm && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <Search className="w-3 h-3 text-slate-400" />
                                <span>"{searchTerm}"</span>
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="hover:text-slate-900 dark:hover:text-white"
                                    title={isRTL ? 'مسح البحث' : 'Clear search'}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setCategoryFilter('all');
                                setSubCategoryFilter('all');
                                setPage(1);
                            }}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline ms-1"
                        >
                            {isRTL ? 'إعادة تعيين الكل' : 'Clear all'}
                        </button>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* Pending Courses Bulk Action Banner */}
            {/* ======================================================== */}
            {activeTab === 'pending' && stats.pending > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-emerald-50/50 to-teal-50 dark:from-amber-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isRTL ? `يوجد ${stats.pending} دورة تدريبية قيد المراجعة بانتظار الاعتماد` : `${stats.pending} courses are awaiting review`}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                    {isRTL ? 'تتطلب إجراء' : 'Action Required'}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {isRTL 
                                    ? 'يمكنك فحص كل دورة على حدة، أو اعتماد وقبول ونشر جميع الدورات المعلقة فوراً دفعة واحدة بنقرة واحدة.' 
                                    : 'You can review courses individually or approve and publish all pending courses at once.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowBulkApproveModal(true)}
                        disabled={loading || isRefreshing || isBulkApproving}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-50 shrink-0 active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRTL ? 'قبول واعتماد الكل الآن' : 'Approve All Now'}</span>
                    </button>
                </div>
            )}

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
                        {(searchTerm || categoryFilter !== 'all' || subCategoryFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('all');
                                    setSubCategoryFilter('all');
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
                        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {isRTL 
                                        ? `الصفحة ${page} من إجمالي ${pagination.pages || 1} (${pagination.total} دورة)`
                                        : `Page ${page} of ${pagination.pages || 1} (${pagination.total} courses)`}
                                </span>

                                {/* Quick Per-Page Switcher */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ms-2">
                                    <span className="hidden md:inline">{isRTL ? 'عرض:' : 'Show:'}</span>
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
                                        {[25, 50, 75, 100].map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    setPageSize(size);
                                                    setPage(1);
                                                }}
                                                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                                                    pageSize === size
                                                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {pagination.pages > 1 && (
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
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ======================================================== */}
            {/* Bulk Approve Confirmation Modal */}
            {/* ======================================================== */}
            {showBulkApproveModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isBulkApproving) {
                            setShowBulkApproveModal(false);
                        }
                    }}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden space-y-5 animate-scaleUp"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    {isRTL ? 'تأكيد اعتماد جميع الدورات المعلقة' : 'Confirm Bulk Course Approval'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {isRTL 
                                        ? `هل أنت متأكد من رغبتك في قبول واعتماد جميع الدورات التي قيد المراجعة (${stats.pending} دورة)؟`
                                        : `Are you sure you want to approve all ${stats.pending} courses currently pending review?`}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                            <div className="font-bold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>{isRTL ? 'ما الذي سيحدث عند التأكيد؟' : 'What happens upon confirmation?'}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                                <li>{isRTL ? 'تحديث حالة جميع الدورات المعلقة إلى "معتمدة" وتعيين تاريخ النشر.' : 'All pending courses will be set to "approved" and published.'}</li>
                                <li>{isRTL ? 'إرسال إشعارات فورية لجميع المحاضرين أصحاب الدورات بإتمام الاعتماد.' : 'Instant notifications will be sent to all course instructors.'}</li>
                                <li>{isRTL ? 'منح نقاط ومكافآت نشر الدورة للمحاضرين تلقائياً عبر نظام المكافآت.' : 'Publishing points will be automatically awarded to instructors.'}</li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowBulkApproveModal(false)}
                                disabled={isBulkApproving}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkApprove}
                                disabled={isBulkApproving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isBulkApproving && <RotateCcw className="w-4 h-4 animate-spin" />}
                                <span>{isBulkApproving ? (isRTL ? 'جاري الاعتماد...' : 'Approving...') : (isRTL ? 'تأكيد واعتماد الكل' : 'Confirm & Approve All')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
