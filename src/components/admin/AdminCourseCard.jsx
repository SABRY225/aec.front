import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { Link } from 'react-router-dom';
import { 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Pencil, 
    Trash2, 
    Eye, 
    Star,
    Layers,
    User,
    Sparkles,
    Loader2
} from 'lucide-react';

const AdminCourseCard = ({ 
    course, 
    onStatusChange, 
    onDelete, 
    onToggleFeatured,
    viewMode = 'grid' 
}) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [actionLoading, setActionLoading] = useState(false);
    const [imgError, setImgError] = useState(false);

    const statusLabel = (status) => {
        const map = {
            approved: t('admin.courses.approved', 'معتمد'),
            pending: t('admin.courses.pendingStatus', 'قيد المراجعة'),
            rejected: t('admin.courses.rejected', 'مرفوض'),
            draft: t('admin.courses.draft', 'مسودة'),
        };
        return map[status] || status;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved':
                return {
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
                    dot: 'bg-emerald-500',
                    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                };
            case 'pending':
            case 'draft':
                return {
                    badge: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
                    dot: 'bg-amber-500 animate-pulse',
                    icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                };
            case 'rejected':
                return {
                    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
                    dot: 'bg-rose-500',
                    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                };
            default:
                return {
                    badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                    dot: 'bg-slate-400',
                    icon: <Clock className="w-3.5 h-3.5 text-slate-500" />
                };
        }
    };

    const handleAction = async (action) => {
        setActionLoading(true);
        try {
            switch (action) {
                case 'approve':
                    await onStatusChange(course._id, 'approved');
                    break;
                case 'pending':
                    await onStatusChange(course._id, 'pending');
                    break;
                case 'reject':
                    await onStatusChange(course._id, 'rejected');
                    break;
                case 'delete':
                    await onDelete(course._id);
                    break;
                case 'toggle-featured':
                    await onToggleFeatured(course._id);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error executing course action:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const formatPrice = (price) => {
        const val = Number(price || 0);
        return isRTL ? `${val.toLocaleString()} ر.س` : `${val.toLocaleString()} SAR`;
    };

    const getPricingDisplay = () => {
        if (course.hasPricingOverride && course.coursePricing?.length > 0) {
            const prices = course.coursePricing.map(rule => Number(rule.price || 0));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            if (minPrice === maxPrice) {
                return formatPrice(minPrice);
            }
            return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
        }
        return formatPrice(course.price);
    };

    const instructorName = `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() 
        || t('admin.courses.unknownInstructor', 'محاضر');
    const instructorInitial = instructorName.charAt(0).toUpperCase() || 'I';

    const statusStyle = getStatusStyle(course.status);

    // ==========================================
    // LIST VIEW
    // ==========================================
    if (viewMode === 'list') {
        return (
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-28 h-20 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-800">
                        {course.thumbnail && !imgError ? (
                            <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                onError={() => setImgError(true)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 font-bold text-xl">
                                {course.title?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                        )}
                        {course.featured && (
                            <div className="absolute top-1.5 start-1.5 bg-amber-500 text-white p-1 rounded-md shadow-sm">
                                <Star className="w-3 h-3 fill-white" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                {statusLabel(course.status)}
                            </span>
                            {course.category && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    <Layers className="w-3 h-3" />
                                    {course.category}
                                </span>
                            )}
                        </div>

                        <Link 
                            to={`/admin/courses/${course._id}`}
                            className="font-bold text-slate-900 dark:text-white text-base hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                        >
                            {course.title}
                        </Link>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                {instructorName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Middle: Pricing: Before & After Display */}
                <div className="text-start md:text-end shrink-0 px-2">
                    {course.originalPrice && Number(course.originalPrice) > Number(course.price) ? (
                        <div>
                            <div className="flex items-center md:justify-end gap-1.5 text-xs text-slate-400">
                                <span className="text-[11px]">{isRTL ? 'قبل:' : 'Before:'}</span>
                                <span className="line-through">{formatPrice(course.originalPrice)}</span>
                                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                    {`-${Math.round(((Number(course.originalPrice) - Number(course.price)) / Number(course.originalPrice)) * 100)}%`}
                                </span>
                            </div>
                            <div className="flex items-baseline md:justify-end gap-1 mt-0.5">
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{isRTL ? 'بعد:' : 'Now:'}</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {getPricingDisplay()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-lg font-bold text-slate-900 dark:text-white block">
                            {getPricingDisplay()}
                        </span>
                    )}
                    {course.hasPricingOverride && (
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            {t('admin.courses.multiCountryPricing', 'تسعير دولي')}
                        </span>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* View */}
                    <Link
                        to={`/admin/courses/${course._id}`}
                        title={t('admin.courses.view', 'عرض')}
                        className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <Link
                        to={`/admin/courses/${course._id}/edit`}
                        title={t('admin.courses.edit', 'تعديل')}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </Link>

                    {/* Status Toggle */}
                    {course.status !== 'approved' ? (
                        <button
                            type="button"
                            onClick={() => handleAction('approve')}
                            disabled={actionLoading}
                            title={t('admin.courses.approve', 'اعتماد')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>{t('admin.courses.approve', 'اعتماد')}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleAction('pending')}
                            disabled={actionLoading}
                            title={t('admin.courses.pendingStatus', 'تعليق للمراجعة')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>{t('admin.courses.pendingStatus', 'تعليق')}</span>
                        </button>
                    )}

                    {/* Featured */}
                    {course.status === 'approved' && (
                        <button
                            type="button"
                            onClick={() => handleAction('toggle-featured')}
                            disabled={actionLoading}
                            title={course.featured ? t('admin.courses.unfeature', 'إلغاء التمييز') : t('admin.courses.feature', 'تمييز الدورة')}
                            className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                                course.featured 
                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100' 
                                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Star className={`w-4 h-4 ${course.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                    )}

                    {/* Delete */}
                    <button
                        type="button"
                        onClick={() => handleAction('delete')}
                        disabled={actionLoading}
                        title={t('admin.courses.delete', 'حذف')}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // GRID VIEW (Default)
    // ==========================================
    return (
        <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Top: 16:9 Thumbnail Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900">
                {course.thumbnail && !imgError ? (
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                        <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-xl font-bold shadow-sm text-primary-600 dark:text-primary-400">
                            {course.title?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                    </div>
                )}

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"></div>

                {/* Status Badge (Top-Start) */}
                <div className="absolute top-3 start-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${statusStyle.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {statusStyle.icon}
                        <span>{statusLabel(course.status)}</span>
                    </span>
                </div>

                {/* Featured Badge (Top-End) */}
                {course.featured && (
                    <div className="absolute top-3 end-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md shadow-amber-500/30 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3 fill-white" />
                            <span>{t('admin.courses.featured', 'مميّز')}</span>
                        </span>
                    </div>
                )}

                {/* Price pill floating over image bottom-end: Before & After */}
                <div className="absolute bottom-3 end-3 flex items-center gap-1.5">
                    {course.originalPrice && Number(course.originalPrice) > Number(course.price) ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-slate-950/85 text-white backdrop-blur-md border border-white/10 shadow-sm">
                            <span className="text-[10px] text-slate-400 line-through">
                                {formatPrice(course.originalPrice)}
                            </span>
                            <span className="font-bold text-amber-300">
                                {getPricingDisplay()}
                            </span>
                        </div>
                    ) : (
                        <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                            {getPricingDisplay()}
                        </span>
                    )}
                </div>
            </div>

            {/* Middle: Course Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    {/* Category Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {course.category && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
                                <Layers className="w-3 h-3" />
                                {course.category}
                            </span>
                        )}
                        {course.subCategory && (
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                                {course.subCategory}
                            </span>
                        )}
                    </div>

                    {/* Course Title */}
                    <Link 
                        to={`/admin/courses/${course._id}`}
                        className="block font-bold text-slate-900 dark:text-white text-base leading-snug hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 mb-2"
                        title={course.title}
                    >
                        {course.title}
                    </Link>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">
                            {instructorInitial}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                            {t('admin.courses.byInstructor', { name: instructorName })}
                        </span>
                    </div>
                </div>

                {/* Footer: Quick Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                    {/* Left Actions: View & Edit */}
                    <div className="flex items-center gap-1">
                        <Link
                            to={`/admin/courses/${course._id}`}
                            title={t('admin.courses.view', 'عرض تفاصيل الدورة')}
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                            to={`/admin/courses/${course._id}/edit`}
                            title={t('admin.courses.edit', 'تعديل الدورة')}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Right Actions: Status, Feature, Delete */}
                    <div className="flex items-center gap-1">
                        {/* Status Change Button */}
                        {course.status !== 'approved' ? (
                            <button
                                type="button"
                                onClick={() => handleAction('approve')}
                                disabled={actionLoading}
                                title={t('admin.courses.approve', 'اعتماد')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>{t('admin.courses.approve', 'اعتماد')}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleAction('pending')}
                                disabled={actionLoading}
                                title={t('admin.courses.pendingStatus', 'تعليق')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                )}
                                <span>{t('admin.courses.pendingStatus', 'تعليق')}</span>
                            </button>
                        )}

                        {/* Feature Toggle Button (Only for approved courses) */}
                        {course.status === 'approved' && (
                            <button
                                type="button"
                                onClick={() => handleAction('toggle-featured')}
                                disabled={actionLoading}
                                title={course.featured ? t('admin.courses.unfeature', 'إلغاء التمييز') : t('admin.courses.feature', 'تمييز')}
                                className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                                    course.featured 
                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100' 
                                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Star className={`w-4 h-4 ${course.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                        )}

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={() => handleAction('delete')}
                            disabled={actionLoading}
                            title={t('admin.courses.delete', 'حذف الدورة')}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseCard;