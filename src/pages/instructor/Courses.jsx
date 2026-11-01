import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useCategoryLookup } from '../../context/CategoryLookupContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { instructorService } from '../../services/new-api';
import {
    BookOpen,
    Plus,
    Search,
    Users,
    DollarSign,
    Star,
    Edit3,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Layers,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Filter,
    ArrowUpRight,
    Loader2,
    SlidersHorizontal,
    X,
    RotateCcw,
    Tag
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

const InstructorCourses = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const navigate = useNavigate();
    const {
        categories,
        getCategoryOptions,
        getSubcategoryOptions,
        localizeCategory,
        localizeSubcategory
    } = useCategoryLookup();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'approved', 'pending'
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState('all');
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 25 });
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
    const cacheRef = useRef({});

    // Debounce search input to avoid overwhelming the server
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 350);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch courses from server with active filters
    const fetchInstructorCourses = useCallback(async (force = false) => {
        const cacheKey = `${page}_${pageSize}_${activeFilter}_${selectedCategory}_${selectedSubCategory}_${debouncedSearch}`;
        const cached = cacheRef.current[cacheKey];
        const isFresh = cached && (Date.now() - cached.timestamp < 30000); // 30s cache TTL

        // Instant render from cache if available
        if (cached && !force) {
            setCourses(cached.courses);
            if (cached.pagination) setPagination(cached.pagination);
            if (cached.stats) setStats(cached.stats);
            setLoading(false);
            if (isFresh) return; // Data is fresh, no background fetch needed
        } else {
            setLoading(true);
        }

        try {
            const params = {
                page,
                limit: pageSize,
                status: activeFilter !== 'all' ? activeFilter : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                subCategory: selectedSubCategory !== 'all' ? selectedSubCategory : undefined,
                search: debouncedSearch || undefined
            };

            const response = await instructorService.getInstructorCourses(params);

            const list = response?.courses || (Array.isArray(response) ? response : []);
            setCourses(list);
            if (response?.pagination) {
                setPagination(response.pagination);
            }
            if (response?.stats) {
                setStats(response.stats);
            }

            // Save to SWR cache
            cacheRef.current[cacheKey] = {
                courses: list,
                pagination: response?.pagination,
                stats: response?.stats,
                timestamp: Date.now()
            };
        } catch (error) {
            if (!cached) {
                toast.error(t('instructor.courses.fetchFailed', 'تعذّر تحميل الدورات التدريبية'));
                setCourses([]);
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, activeFilter, selectedCategory, selectedSubCategory, debouncedSearch, t]);

    useEffect(() => {
        fetchInstructorCourses();
    }, [fetchInstructorCourses]);

    // Category options from lookup
    const categoryOptions = useMemo(() => {
        return getCategoryOptions ? getCategoryOptions() : [];
    }, [getCategoryOptions]);

    // Subcategory options based on selectedCategory
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') return [];
        return getSubcategoryOptions ? getSubcategoryOptions(selectedCategory) : [];
    }, [selectedCategory, getSubcategoryOptions]);

    // Filter handlers
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedSubCategory('all');
        setPage(1);
    };

    const handleSubCategoryChange = (e) => {
        setSelectedSubCategory(e.target.value);
        setPage(1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    const filterStatus = (status) => {
        setActiveFilter(status);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setSelectedCategory('all');
        setSelectedSubCategory('all');
        setActiveFilter('all');
        setPageSize(25);
        setPage(1);
    };

    const hasActiveFilters =
        searchQuery.trim() !== '' ||
        selectedCategory !== 'all' ||
        selectedSubCategory !== 'all' ||
        activeFilter !== 'all' ||
        pageSize !== 25;

    // Status Badge Helpers
    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
            case 'approved':
                return {
                    label: t('autoGenerated.approved', isRTL ? 'معتمدة / منشورة' : 'Approved'),
                    className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60',
                    icon: <CheckCircle2 className="w-3 h-3" />
                };
            case 'pending':
                return {
                    label: t('autoGenerated.pending_review', isRTL ? 'قيد المراجعة' : 'Pending Review'),
                    className: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60',
                    icon: <Clock className="w-3 h-3" />
                };
            case 'rejected':
                return {
                    label: t('autoGenerated.rejected', isRTL ? 'مرفوضة' : 'Rejected'),
                    className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60',
                    icon: <AlertCircle className="w-3 h-3" />
                };
            default:
                return {
                    label: t('autoGenerated.draft', isRTL ? 'مسودة' : 'Draft'),
                    className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
                    icon: <Layers className="w-3 h-3" />
                };
        }
    };

    const totalCount = pagination.total || courses.length;
    const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, totalCount);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 font-arabic" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* HEADER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t('autoGenerated.course_management_studio', isRTL ? 'استوديو إدارة الدورات' : 'Course Management Studio')}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('instructor.courses.title', isRTL ? 'دوراتي التدريبية' : 'My Courses')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('autoGenerated.manage_your_courses_edit_lectu', isRTL ? 'إدارة دوراتك، تعديل المحاضرات، ومتابعة تسجيلات الطلاب' : 'Manage your courses, edit lectures, and monitor student enrollments')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchInstructorCourses(true)}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={t('autoGenerated.refresh', isRTL ? 'تحديث' : 'Refresh')}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>

                    <Link
                        to="/instructor/courses-create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-98 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('instructor.courses.createNew', isRTL ? 'إنشاء دورة جديدة' : 'Create New Course')}</span>
                    </Link>
                </div>
            </div>

            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Total Courses */}
                <button
                    type="button"
                    onClick={() => filterStatus('all')}
                    className={`p-5 rounded-3xl border text-start transition-all cursor-pointer ${
                        activeFilter === 'all'
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {t('autoGenerated.total_courses', isRTL ? 'إجمالي الدورات' : 'Total Courses')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {stats.total || courses.length}
                    </div>
                </button>

                {/* Approved Courses */}
                <button
                    type="button"
                    onClick={() => filterStatus('approved')}
                    className={`p-5 rounded-3xl border text-start transition-all cursor-pointer ${
                        activeFilter === 'approved'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {t('autoGenerated.approved_live', isRTL ? 'معتمدة / منشورة' : 'Approved / Live')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {stats.approved || 0}
                    </div>
                </button>

                {/* Pending Review Courses */}
                <button
                    type="button"
                    onClick={() => filterStatus('pending')}
                    className={`p-5 rounded-3xl border text-start transition-all cursor-pointer ${
                        activeFilter === 'pending'
                            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {t('autoGenerated.under_review', isRTL ? 'قيد المراجعة' : 'Under Review')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {stats.pending || 0}
                    </div>
                </button>

            </div>

            {/* SEARCH & FILTERS PANEL */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* 1. Search Input */}
                    <div className="relative">
                        <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('instructor.courses.searchPlaceholder', isRTL ? 'البحث عن عنوان الدورة...' : 'Search by course title...')}
                            className={`w-full ${isRTL ? 'pr-10 pl-8' : 'pl-10 pr-8'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs`}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer`}
                                title={isRTL ? 'مسح' : 'Clear'}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* 2. Main Category Filter */}
                    <div className="relative">
                        <Layers className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none shadow-2xs`}
                        >
                            <option value="all">
                                {t('instructor.courses.allCategories', isRTL ? 'جميع التصنيفات الأساسية' : 'All Main Categories')}
                            </option>
                            {categoryOptions.map((cat) => (
                                <option key={cat.value || cat.id} value={cat.value || cat.slug}>
                                    {cat.label || cat.nameAr || cat.nameEn}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Subcategory Filter */}
                    <div className="relative">
                        <Filter className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                        <select
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            disabled={selectedCategory === 'all' || subcategoryOptions.length === 0}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs`}
                        >
                            <option value="all">
                                {selectedCategory === 'all'
                                    ? (isRTL ? 'التصنيف الفرعي (اختر الأساسي أولاً)' : 'Subcategory (Pick main first)')
                                    : subcategoryOptions.length === 0
                                    ? (isRTL ? 'لا توجد تصنيفات فرعية' : 'No subcategories available')
                                    : (isRTL ? 'جميع التصنيفات الفرعية' : 'All Subcategories')}
                            </option>
                            {subcategoryOptions.map((sub) => (
                                <option key={sub.value || sub.id} value={sub.value || sub.slug}>
                                    {sub.label || sub.nameAr || sub.nameEn}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Page Size / Limit Filter (25, 50, 75, 100) */}
                    <div className="relative">
                        <SlidersHorizontal className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`} />
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none shadow-2xs`}
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {isRTL ? `عرض ${size} دورة` : `Show ${size} courses`}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Filter Results Strip & Reset Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                            {isRTL
                                ? `إجمالي النتائج: ${totalCount} دورة`
                                : `Total results: ${totalCount} courses`}
                        </span>
                        {totalCount > 0 && (
                            <span className="text-slate-400">
                                ({isRTL
                                    ? `معروض ${startIndex} - ${endIndex}`
                                    : `Showing ${startIndex} - ${endIndex}`})
                            </span>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'إلغاء الفلاتر وإعادة الضبط' : 'Reset Filters'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* COURSES GRID */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">{t('autoGenerated.loading_courses', isRTL ? 'جاري تحميل الدورات...' : 'Loading courses...')}</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 sm:p-16 text-center space-y-4 shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('instructor.courses.noCoursesTitle', isRTL ? 'لا توجد دورات مسجلة بهذا الفلتر' : 'No courses found with this filter')}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {t('instructor.courses.noCoursesDesc', isRTL ? 'يمكنك البدء الآن بإنشاء دورتك التدريبية الأولى أو تعديل خيارات الفلترة أعلاه.' : 'You can start creating your first course or adjust the filter options above.')}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{isRTL ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
                            </button>
                        )}
                        <Link
                            to="/instructor/courses-create"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('instructor.courses.createFirst', isRTL ? 'إنشاء دورة جديدة' : 'Create Course')}</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => {
                        const statusBadge = getStatusBadge(course.status);
                        const categoryName = course.category ? localizeCategory(course.category) : '';
                        const subCategoryName = course.subCategory ? localizeSubcategory(course.subCategory, course.category) : '';

                        return (
                            <div
                                key={course._id || course.id}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <BookOpen className="w-10 h-10 stroke-[1.5]" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 end-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-md ${statusBadge.className}`}>
                                            {statusBadge.icon}
                                            <span>{statusBadge.label}</span>
                                        </span>
                                    </div>

                                    {/* Course Type Badge */}
                                    {course.courseType && (
                                        <div className="absolute bottom-3 start-3">
                                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-md uppercase">
                                                {course.courseType}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2.5">
                                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {course.title}
                                        </h3>

                                        {/* Category & Subcategory Tags */}
                                        {(categoryName || subCategoryName) && (
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {categoryName && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
                                                        <Layers className="w-3 h-3 shrink-0" />
                                                        <span className="truncate max-w-[130px]">{categoryName}</span>
                                                    </span>
                                                )}
                                                {subCategoryName && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        <Tag className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[120px]">{subCategoryName}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Metrics (Students & Revenue) */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                                        <div className="space-y-0.5">
                                            <span className="text-[11px] text-slate-400 block font-medium">{t('autoGenerated.enrolled_students', isRTL ? 'الطلاب المسجلون' : 'Students')}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{course.students || course.enrolledStudents || 0}</span>
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 text-end">
                                            <span className="text-[11px] text-slate-400 block font-medium">{t('autoGenerated.total_sales', isRTL ? 'إجمالي المبيعات' : 'Revenue')}</span>
                                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                                {(course.revenue || 0).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex items-center gap-2">
                                        <Link
                                            to={`/instructor/courses/${course._id || course.id}/edit`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>{t('instructor.courses.edit', isRTL ? 'تعديل الدورة' : 'Edit')}</span>
                                        </Link>

                                        <Link
                                            to={`/course/${course._id || course.id}`}
                                            target="_blank"
                                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            title={t('autoGenerated.preview_course_students', isRTL ? 'معاينة الدورة كما تظهر للطلاب' : 'Preview Course')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PAGINATION */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {isRTL
                            ? `الصفحة ${page} من ${pagination.pages} (إجمالي ${totalCount} دورة)`
                            : `Page ${page} of ${pagination.pages} (Total ${totalCount} courses)`}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
                        >
                            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            <span>{t('common.previous', isRTL ? 'السابق' : 'Previous')}</span>
                        </button>

                        {/* Page number indicators */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) {
                                        acc.push('...');
                                    }
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((item, idx) => (
                                    item === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={`page-${item}`}
                                            type="button"
                                            onClick={() => setPage(item)}
                                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                page === item
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                ))
                            }
                        </div>

                        <button
                            type="button"
                            disabled={page >= pagination.pages}
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
                        >
                            <span>{t('common.next', isRTL ? 'التالي' : 'Next')}</span>
                            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InstructorCourses;
