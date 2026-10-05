import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { userService } from '../../services/new-api';
import { 
    Users, 
    Search, 
    X, 
    LayoutGrid, 
    List, 
    Mail, 
    Phone, 
    Calendar, 
    Layers, 
    ShieldCheck, 
    ArrowUpDown, 
    User,
    RotateCcw
} from 'lucide-react';

const Instructors = ({ onCountChange, isRefreshingParent }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [failedImages, setFailedImages] = useState({});

    const fetchInstructors = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await userService.getUsers({ role: 'instructor' });
            const list = Array.isArray(response.data) 
                ? response.data 
                : (Array.isArray(response.users) ? response.users : []);
            
            setInstructors(list);
            if (onCountChange) {
                onCountChange(list.length);
            }
        } catch (error) {
            toast.error(t('admin.instructors.fetchFailed', 'تعذّر جلب بيانات المحاضرين'));
            console.error(error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [onCountChange, t]);

    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    // Parent trigger refresh
    useEffect(() => {
        if (isRefreshingParent) {
            fetchInstructors(true);
        }
    }, [isRefreshingParent, fetchInstructors]);

    const handleImageError = (id) => {
        setFailedImages(prev => ({ ...prev, [id]: true }));
    };

    // Extract unique categories
    const categories = useMemo(() => {
        const set = new Set();
        instructors.forEach(item => {
            if (item.category) set.add(item.category);
        });
        return ['all', ...Array.from(set)];
    }, [instructors]);

    // Filter and sort instructors
    const filteredInstructors = useMemo(() => {
        let list = [...instructors];

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            list = list.filter(item => {
                const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
                const email = (item.email || '').toLowerCase();
                const phone = (item.phone || '').toLowerCase();
                const category = (item.category || '').toLowerCase();
                const subCategory = (item.subCategory || '').toLowerCase();
                return fullName.includes(query) || 
                       email.includes(query) || 
                       phone.includes(query) || 
                       category.includes(query) ||
                       subCategory.includes(query);
            });
        }

        if (categoryFilter !== 'all') {
            list = list.filter(item => item.category === categoryFilter);
        }

        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === 'oldest') {
            list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === 'name') {
            list.sort((a, b) => {
                const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
                const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
                return nameA.localeCompare(nameB);
            });
        }

        return list;
    }, [instructors, searchTerm, categoryFilter, sortBy]);

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ======================================================== */}
            {/* Control & Search Bar */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('admin.instructors.searchPlaceholder', 'ابحث عن محاضر بالاسم، البريد، الهاتف، أو التخصص...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-10 pe-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter & View Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Category Filter */}
                        {categories.length > 2 && (
                            <div className="relative">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                                >
                                    <option value="all">{t('admin.instructors.allSpecializations', 'جميع التخصصات')}</option>
                                    {categories.filter(c => c !== 'all').map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Sort Order */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                            >
                                <option value="newest">{t('admin.courses.newest', 'الأحدث انضماماً')}</option>
                                <option value="oldest">{isRTL ? 'الأقدم' : 'Oldest'}</option>
                                <option value="name">{t('admin.courses.titleAZ', 'الاسم (أ-ي)')}</option>
                            </select>
                        </div>

                        {/* View Mode Switcher */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                title={t('admin.instructors.gridView', 'عرض شبكي')}
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
                                title={t('admin.instructors.listView', 'عرض قائمة')}
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
            </div>

            {/* ======================================================== */}
            {/* Instructors List / Grid Display */}
            {/* ======================================================== */}
            {loading ? (
                /* Skeleton Loader */
                <div className={
                    viewMode === 'grid'
                        ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-3"
                }>
                    {[...Array(8)].map((_, idx) => (
                        <div 
                            key={idx}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm animate-pulse space-y-4"
                        >
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredInstructors.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t('admin.instructors.noInstructors', 'لا يوجد محاضرون')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {searchTerm 
                            ? t('admin.courses.trySearch', 'لم يتم العثور على أي نتائج مطابقة لكلمات البحث.') 
                            : t('admin.courses.noInCategory', 'لا يوجد محاضرون مسجلون في هذا التصنيف حالياً.')}
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
                            <span>{t('admin.instructors.clearSearch', 'إلغاء التصفية')}</span>
                        </button>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                /* List / Table Mode */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400">
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.instructors.listTitle', 'المحاضر')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.detailLabels.category', 'التصنيف')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.detailLabels.phone', 'الهاتف')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.detailLabels.joined', 'تاريخ الانضمام')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filteredInstructors.map((instructor) => {
                                    const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || t('admin.courses.unknownInstructor', 'محاضر');
                                    const initials = `${instructor.firstName?.charAt(0) || ''}${instructor.lastName?.charAt(0) || ''}`.toUpperCase() || 'IN';

                                    return (
                                        <tr key={instructor._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Name & Photo */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                        {instructor.photo && !failedImages[instructor._id] ? (
                                                            <img 
                                                                src={instructor.photo} 
                                                                alt={fullName}
                                                                onError={() => handleImageError(instructor._id)}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900 dark:text-white truncate">
                                                                {fullName}
                                                            </span>
                                                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                                        </div>
                                                        <a 
                                                            href={`mailto:${instructor.email}`}
                                                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block"
                                                        >
                                                            {instructor.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3 px-4">
                                                {instructor.category ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-100 dark:border-primary-900/50">
                                                        <Layers className="w-3 h-3" />
                                                        {instructor.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {t('admin.detailLabels.notSpecified', 'غير محدد')}
                                                    </span>
                                                )}
                                                {instructor.subCategory && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                                        {instructor.subCategory}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                {instructor.phone ? (
                                                    <a 
                                                        href={`tel:${instructor.phone}`}
                                                        className="hover:text-primary-600 transition-colors inline-flex items-center gap-1.5"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span dir="ltr">{instructor.phone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>

                                            {/* Joined */}
                                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid Mode */
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredInstructors.map((instructor) => {
                        const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || t('admin.courses.unknownInstructor', 'محاضر');
                        const initials = `${instructor.firstName?.charAt(0) || ''}${instructor.lastName?.charAt(0) || ''}`.toUpperCase() || 'IN';

                        return (
                            <div 
                                key={instructor._id}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Avatar & Verification Badge */}
                                    <div className="relative text-center mb-4 pt-2">
                                        <div className="relative inline-block">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-md ring-4 ring-white dark:ring-slate-800">
                                                {instructor.photo && !failedImages[instructor._id] ? (
                                                    <img 
                                                        src={instructor.photo} 
                                                        alt={fullName}
                                                        onError={() => handleImageError(instructor._id)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            {/* Verified Badge */}
                                            <div className="absolute bottom-0 end-0 bg-emerald-500 text-white p-1 rounded-full shadow-md ring-2 ring-white dark:ring-slate-800">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {fullName}
                                        </h3>

                                        <a 
                                            href={`mailto:${instructor.email}`}
                                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block max-w-[200px] mx-auto mt-0.5"
                                            title={instructor.email}
                                        >
                                            {instructor.email}
                                        </a>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                        {/* Category & Subcategory */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                                                {t('admin.detailLabels.category', 'التصنيف')}
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                                                {instructor.category || t('admin.detailLabels.notSpecified', 'غير محدد')}
                                            </span>
                                        </div>

                                        {instructor.subCategory && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400 dark:text-slate-500 font-medium">
                                                    {t('admin.detailLabels.subCategory', 'التخصص الفرعي')}
                                                </span>
                                                <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                                                    {instructor.subCategory}
                                                </span>
                                            </div>
                                        )}

                                        {/* Phone */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                                                {t('admin.detailLabels.phone', 'الهاتف')}
                                            </span>
                                            {instructor.phone ? (
                                                <a 
                                                    href={`tel:${instructor.phone}`}
                                                    className="font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 transition-colors truncate"
                                                    dir="ltr"
                                                >
                                                    {instructor.phone}
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">
                                                    {t('admin.detailLabels.notProvided', 'غير متوفر')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Joined Date */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 dark:text-slate-500 font-medium">
                                                {t('admin.detailLabels.joined', 'تاريخ الانضمام')}
                                            </span>
                                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                                {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Action Footer */}
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                                    {instructor.email && (
                                        <a 
                                            href={`mailto:${instructor.email}`}
                                            title={instructor.email}
                                            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-center bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/60 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{t('admin.detailLabels.email', 'البريد')}</span>
                                        </a>
                                    )}
                                    {instructor.phone && (
                                        <a 
                                            href={`tel:${instructor.phone}`}
                                            title={instructor.phone}
                                            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-center bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{t('admin.detailLabels.phone', 'اتصال')}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Instructors;
