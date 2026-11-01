import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { enrollmentService } from '../../services/new-api';
import { useCategoryLookup } from '../../context/CategoryLookupContext';
import { toast } from 'react-toastify';
import {
    GraduationCap,
    BookOpen,
    Play,
    CheckCircle2,
    Clock,
    RefreshCw,
    Loader2,
    Compass,
    Sparkles,
    Search,
    Filter,
    Layers,
    SlidersHorizontal,
    X,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

const MyInstructorCourses = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const {
        categories,
        getCategoryOptions,
        getSubcategoryOptions,
        localizeCategory,
        localizeSubcategory
    } = useCategoryLookup();

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState('all');
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            const response = await enrollmentService.getMyCourses();
            if (Array.isArray(response)) {
                setEnrolledCourses(response);
            } else if (response && response.courses && Array.isArray(response.courses)) {
                setEnrolledCourses(response.courses);
            } else {
                setEnrolledCourses([]);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error(t('instructor.myCourses.fetchFailed', 'تعذّر تحميل الدورات المسجل بها'));
        } finally {
            setLoading(false);
        }
    };

    // Category options from lookup
    const categoryOptions = useMemo(() => {
        return getCategoryOptions ? getCategoryOptions() : [];
    }, [getCategoryOptions]);

    // Subcategory options based on selectedCategory
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') return [];
        return getSubcategoryOptions ? getSubcategoryOptions(selectedCategory) : [];
    }, [selectedCategory, getSubcategoryOptions]);

    // When category changes, reset subcategory and page
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedSubCategory('all');
        setCurrentPage(1);
    };

    // When subcategory changes, reset page
    const handleSubcategoryChange = (e) => {
        setSelectedSubCategory(e.target.value);
        setCurrentPage(1);
    };

    // When search changes, reset page
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // When pageSize changes, reset page
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedSubCategory('all');
        setPageSize(25);
        setCurrentPage(1);
    };

    const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'all' || selectedSubCategory !== 'all' || pageSize !== 25;

    // Helper: Match a taxonomy value (category or subcategory)
    const matchesTaxonomy = useCallback((storedValue, filterValue, taxonomyList = []) => {
        if (!filterValue || filterValue === 'all') return true;
        if (!storedValue) return false;

        const valStr = typeof storedValue === 'object'
            ? String(storedValue.slug || storedValue._id || storedValue.nameEn || storedValue.nameAr || '')
            : String(storedValue);

        const selStr = String(filterValue).toLowerCase().trim();
        if (valStr.toLowerCase().trim() === selStr) return true;

        // Find candidate in taxonomy list
        const matchedItem = taxonomyList.find(item =>
            [item._id, item.slug, item.nameEn, item.nameAr].filter(Boolean).some(
                field => String(field).toLowerCase().trim() === selStr
            )
        );

        if (matchedItem) {
            return [matchedItem._id, matchedItem.slug, matchedItem.nameEn, matchedItem.nameAr]
                .filter(Boolean)
                .some(field => String(field).toLowerCase().trim() === valStr.toLowerCase().trim());
        }

        return false;
    }, []);

    // Filter courses based on search, category, subcategory
    const filteredCourses = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        // Selected category object
        const activeCatObj = categories.find(cat =>
            [cat._id, cat.slug, cat.nameEn, cat.nameAr].filter(Boolean).some(
                field => String(field).toLowerCase().trim() === String(selectedCategory).toLowerCase().trim()
            )
        );
        const activeSubcategories = activeCatObj?.subcategories || [];

        return enrolledCourses.filter((course) => {
            // 1. Search Query
            if (query) {
                const titleMatch = course.title && course.title.toLowerCase().includes(query);
                const descMatch = course.description && course.description.toLowerCase().includes(query);
                const instructorMatch = course.instructor && (
                    `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.toLowerCase().includes(query)
                );
                if (!titleMatch && !descMatch && !instructorMatch) return false;
            }

            // 2. Main Category Filter
            if (selectedCategory !== 'all') {
                const catMatches = matchesTaxonomy(course.category, selectedCategory, categories);
                if (!catMatches) return false;
            }

            // 3. Subcategory Filter
            if (selectedSubCategory !== 'all') {
                const subMatches = matchesTaxonomy(course.subCategory, selectedSubCategory, activeSubcategories);
                if (!subMatches) return false;
            }

            return true;
        });
    }, [enrolledCourses, searchTerm, selectedCategory, selectedSubCategory, categories, matchesTaxonomy]);

    // Pagination calculations
    const totalItems = filteredCourses.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const displayedCourses = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredCourses.slice(start, start + pageSize);
    }, [filteredCourses, safeCurrentPage, pageSize]);

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 font-arabic" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'التعلم المستمر' : 'Continuous Learning'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('instructor.myCourses.title', isRTL ? 'الدورات المسجل بها كمتعلم' : 'My Enrolled Courses')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isRTL
                            ? 'الدورات وورش العمل التي التحقت بها كمتدرب لتطوير مهاراتك ومعارفك'
                            : 'Courses and workshops you are currently enrolled in as a learner'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchEnrolledCourses}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isRTL ? 'تحديث' : 'Refresh'}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>

                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        <Compass className="w-4 h-4" />
                        <span>{isRTL ? 'استعراض الدورات' : 'Explore Courses'}</span>
                    </Link>
                </div>
            </div>

            {/* FILTERS & SEARCH BAR */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* 1. Search Input */}
                    <div className="relative">
                        <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-slate-400`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder={isRTL ? 'البحث في دوراتي...' : 'Search my courses...'}
                            className={`w-full ${isRTL ? 'pr-10 pl-8' : 'pl-10 pr-8'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
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
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none`}
                        >
                            <option value="all">
                                {isRTL ? 'جميع التصنيفات الأساسية' : 'All Main Categories'}
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
                            onChange={handleSubcategoryChange}
                            disabled={selectedCategory === 'all' || subcategoryOptions.length === 0}
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
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
                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none`}
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {isRTL ? `عرض ${size} دورة` : `Show ${size} courses`}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Filter Status Strip & Reset Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                            {isRTL
                                ? `إجمالي النتائج: ${totalItems} دورة`
                                : `Total results: ${totalItems} courses`}
                        </span>
                        {totalItems > 0 && (
                            <span className="text-slate-400">
                                ({isRTL
                                    ? `معروض ${startIndex + 1} - ${endIndex}`
                                    : `Showing ${startIndex + 1} - ${endIndex}`})
                            </span>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'إلغاء الفلاتر وإعادة الضبط' : 'Reset Filters'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* COURSES LIST */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">{t('autoGenerated.loading_courses', isRTL ? 'جاري تحميل الدورات...' : 'Loading courses...')}</p>
                </div>
            ) : enrolledCourses.length === 0 ? (
                /* No enrolled courses at all */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 sm:p-16 text-center space-y-4 shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('student.myCourses.empty', isRTL ? 'لست مسجلاً في أي دورات تدريبية كمتعلم بعد' : 'Not enrolled in any courses yet')}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {isRTL
                                ? 'استكشف برامج ودورات الأكاديمية وسجّل في دورات جديدة لتعزيز مهاراتك.'
                                : 'Explore the academy catalog to enroll in exciting new programs.'}
                        </p>
                    </div>
                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                        <Compass className="w-4 h-4" />
                        <span>{t('student.myCourses.browse', isRTL ? 'استعراض الدورات المتاحة' : 'Browse Courses')}</span>
                    </Link>
                </div>
            ) : filteredCourses.length === 0 ? (
                /* Filters resulted in 0 matches */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 sm:p-16 text-center space-y-4 shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Filter className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isRTL ? 'لا توجد دورات مطابقة لخيارات الفلترة' : 'No courses match the selected filters'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {isRTL
                                ? 'جرّب تغيير التصنيف، التصنيف الفرعي، أو تفريغ خانة البحث.'
                                : 'Try changing category, subcategory, or clearing search term.'}
                        </p>
                    </div>
                    <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>{isRTL ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedCourses.map((course) => {
                            const courseCategoryLabel = course.category ? localizeCategory(course.category) : '';
                            const courseSubcategoryLabel = course.subCategory ? localizeSubcategory(course.subCategory, course.category) : '';

                            return (
                                <div
                                    key={course.courseId || course._id}
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

                                        {course.courseLevel && (
                                            <div className="absolute top-3 end-3">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md uppercase">
                                                    {course.courseLevel}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            {/* Categories Badges */}
                                            {(courseCategoryLabel || courseSubcategoryLabel) && (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {courseCategoryLabel && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
                                                            <Layers className="w-2.5 h-2.5" />
                                                            <span>{courseCategoryLabel}</span>
                                                        </span>
                                                    )}
                                                    {courseSubcategoryLabel && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/40">
                                                            <span>{courseSubcategoryLabel}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {course.title}
                                            </h3>

                                            {course.instructor && (
                                                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                        {course.instructor.photo ? (
                                                            <img src={course.instructor.photo} alt={course.instructor.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                                                {course.instructor.firstName?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="truncate">
                                                        {course.instructor.firstName} {course.instructor.lastName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-semibold">{t('student.myCourses.progress', isRTL ? 'نسبة التقدم' : 'Progress')}</span>
                                                <span className="font-extrabold text-slate-700 dark:text-slate-300 font-mono">{course.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${course.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="pt-2">
                                            <Link
                                                to={`/course/${course.courseId || course._id}/study`}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                <span>
                                                    {(course.progress || 0) > 0
                                                        ? t('student.myCourses.continueLearning', isRTL ? 'متابعة الدورة' : 'Continue Learning')
                                                        : t('student.myCourses.startCourse', isRTL ? 'بدء الدورة' : 'Start Course')}
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                                {isRTL
                                    ? `صفحة ${safeCurrentPage} من ${totalPages} (إجمالي ${totalItems} دورة)`
                                    : `Page ${safeCurrentPage} of ${totalPages} (${totalItems} total courses)`}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safeCurrentPage <= 1}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                                >
                                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                    <span>{isRTL ? 'السابق' : 'Previous'}</span>
                                </button>

                                <div className="flex items-center gap-1 font-mono font-bold">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                                        .map((p, index, array) => {
                                            const showEllipsis = index > 0 && p - array[index - 1] > 1;
                                            return (
                                                <React.Fragment key={p}>
                                                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(p)}
                                                        className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer ${
                                                            safeCurrentPage === p
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safeCurrentPage >= totalPages}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                                >
                                    <span>{isRTL ? 'التالي' : 'Next'}</span>
                                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </>
               )}

        </div>
    );
};

export default MyInstructorCourses;