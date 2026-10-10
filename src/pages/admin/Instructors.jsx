import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { userService, adminService } from '../../services/new-api';
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
    RotateCcw,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    Edit3,
    Briefcase,
    MapPin,
    Globe,
    Lock,
    Save,
    Loader2
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

    // Edit Instructor Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        category: '',
        subCategory: '',
        bio: '',
        country: '',
        city: '',
        gender: 'Male',
        website: '',
        isVerified: false,
        isActive: true,
        password: ''
    });

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

    
    const handleToggleVerification = async (id, currentStatus) => {
        try {
            const res = await adminService.toggleInstructorVerification(id);
            setInstructors(prev => prev.map(inst => 
                inst._id === id ? { ...inst, isVerified: res.isVerified } : inst
            ));
            toast.success(res.message || t('admin.instructors.verificationToggled', 'تم تحديث حالة توثيق المحاضر بنجاح'));
        } catch (error) {
            toast.error(t('admin.instructors.verificationError', 'حدث خطأ أثناء محاولة تحديث التوثيق'));
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.instructors.confirmDelete', 'هل أنت متأكد من أنك تريد حذف هذا المحاضر؟'))) return;
        try {
            await adminService.deleteInstructor(id);
            setInstructors(prev => prev.filter(inst => inst._id !== id));
            toast.success(t('admin.instructors.deleted', 'تم حذف المحاضر بنجاح'));
        } catch (error) {
            toast.error(t('admin.instructors.deleteError', 'حدث خطأ أثناء حذف المحاضر'));
            console.error(error);
        }
    };

    const handleImageError = (id) => {
        setFailedImages(prev => ({ ...prev, [id]: true }));
    };

    const handleOpenEdit = (instructor) => {
        setEditingInstructor(instructor);
        setEditForm({
            firstName: instructor.firstName || '',
            lastName: instructor.lastName || '',
            email: instructor.email || '',
            phone: instructor.phone || '',
            jobTitle: instructor.jobTitle || '',
            category: instructor.category || '',
            subCategory: instructor.subCategory || '',
            bio: instructor.bio || '',
            country: instructor.country || '',
            city: instructor.city || '',
            gender: instructor.gender || 'Male',
            website: instructor.website || '',
            isVerified: Boolean(instructor.isVerified),
            isActive: instructor.isActive !== false,
            password: ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
            toast.error(isRTL ? 'يرجى إدخال الاسم الأول والأخير' : 'First and last name are required');
            return;
        }
        if (!editForm.email.trim()) {
            toast.error(isRTL ? 'يرجى إدخال البريد الإلكتروني' : 'Email is required');
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim(),
                jobTitle: editForm.jobTitle.trim(),
                category: editForm.category.trim(),
                subCategory: editForm.subCategory.trim(),
                bio: editForm.bio.trim(),
                country: editForm.country.trim(),
                city: editForm.city.trim(),
                gender: editForm.gender,
                website: editForm.website.trim(),
                isVerified: editForm.isVerified,
                isActive: editForm.isActive
            };

            if (editForm.password.trim()) {
                if (editForm.password.trim().length < 6) {
                    toast.error(isRTL ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
                    setIsSaving(false);
                    return;
                }
                payload.password = editForm.password.trim();
            }

            const res = await adminService.updateInstructor(editingInstructor._id, payload);
            if (res.success || res.instructor) {
                const updated = res.instructor || { ...editingInstructor, ...payload };
                setInstructors(prev => prev.map(inst => inst._id === editingInstructor._id ? updated : inst));
                toast.success(res.message || (isRTL ? 'تم حفظ وتحديث بيانات المعلم بنجاح' : 'Instructor updated successfully'));
                setShowEditModal(false);
                setEditingInstructor(null);
            } else {
                throw new Error(res.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating instructor:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'تعذّر تحديث بيانات المعلم' : 'Failed to update instructor'));
        } finally {
            setIsSaving(false);
        }
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
                                                            {instructor.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title={t('admin.instructors.verified', 'تم القبول')} />}
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
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a 
                                                        href={`/profile/${instructor._id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                                        title={t('common.viewProfile', 'مشاهدة الملف الشخصي')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleOpenEdit(instructor)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                                        title={isRTL ? 'تعديل البيانات الأساسية' : 'Edit instructor'}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleVerification(instructor._id, instructor.isVerified)}
                                                        className={`p-1.5 transition-colors ${instructor.isVerified ? 'text-emerald-500 hover:text-slate-500' : 'text-slate-400 hover:text-emerald-500'}`}
                                                        title={instructor.isVerified ? t('admin.instructors.unverify', 'إلغاء التوثيق') : t('admin.instructors.verify', 'توثيق المحاضر')}
                                                    >
                                                        {instructor.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(instructor._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                        title={t('common.delete', 'حذف المحاضر')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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
                                            {instructor.isVerified && (
                                            <div className="absolute bottom-0 end-0 bg-emerald-500 text-white p-1 rounded-full shadow-md ring-2 ring-white dark:ring-slate-800" title={t('admin.instructors.verified', '????')}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            )}
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
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                    <div className="flex gap-1.5">
                                        <a 
                                            href={`/profile/${instructor._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            title={t('common.viewProfile', '??? ????? ??????')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        {instructor.email && (
                                            <a 
                                                href={`mailto:${instructor.email}`}
                                                title={instructor.email}
                                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        )}
                                        {instructor.phone && (
                                            <a 
                                                href={`tel:${instructor.phone}`}
                                                title={instructor.phone}
                                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => handleOpenEdit(instructor)}
                                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                            title={isRTL ? 'تعديل البيانات الأساسية' : 'Edit instructor'}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleVerification(instructor._id, instructor.isVerified)}
                                            className={`p-2 rounded-lg transition-colors ${instructor.isVerified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                                            title={instructor.isVerified ? t('admin.instructors.unverify', 'إلغاء التوثيق') : t('admin.instructors.verify', 'توثيق المحاضر')}
                                        >
                                            {instructor.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(instructor._id)}
                                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                                            title={t('common.delete', 'حذف المحاضر')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
</div>
                        );
                    })}
                </div>
            )}
            {/* ======================================================== */}
            {/* Edit Instructor Modal */}
            {/* ======================================================== */}
            {showEditModal && editingInstructor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {isRTL ? 'تعديل بيانات المعلم الأساسية' : 'Edit Instructor Details'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {editingInstructor.firstName} {editingInstructor.lastName} ({editingInstructor.email})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingInstructor(null);
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* 1. Personal & Contact Information */}
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-primary-500" />
                                    <span>{isRTL ? 'البيانات الشخصية والاتصال' : 'Personal & Contact Information'}</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'الاسم الأول *' : 'First Name *'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'الاسم الأخير *' : 'Last Name *'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'البريد الإلكتروني *' : 'Email Address *'}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={editForm.email}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                dir="ltr"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-start"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'الجنس' : 'Gender'}
                                        </label>
                                        <select
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                                        >
                                            <option value="Male">{isRTL ? 'ذكر' : 'Male'}</option>
                                            <option value="Female">{isRTL ? 'أنثى' : 'Female'}</option>
                                        </select>
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'الدولة' : 'Country'}
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={editForm.country}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                                                className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                                placeholder={isRTL ? 'مثال: السعودية، مصر...' : 'e.g., Saudi Arabia, Egypt'}
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'المدينة' : 'City'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.city}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder={isRTL ? 'مثال: الرياض، القاهرة...' : 'e.g., Riyadh, Cairo'}
                                        />
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'الموقع الإلكتروني' : 'Website'}
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                dir="ltr"
                                                value={editForm.website}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                                                className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-start"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Professional & Academic Info */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                    <span>{isRTL ? 'البيانات المهنية والتخصص' : 'Professional & Track Information'}</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Job Title */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'المسمى الوظيفي والمهني' : 'Job Title / Designation'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.jobTitle}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder={isRTL ? 'مثال: مدرب ومحاضر معتمد في إدارة الأعمال' : 'e.g., Certified Instructor in Business'}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'التصنيف / المجال الرئيسي' : 'Primary Category'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.category}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder={isRTL ? 'مثال: تقنية المعلومات' : 'e.g., Information Technology'}
                                        />
                                    </div>

                                    {/* Sub Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'التخصص الفرعي' : 'Sub-Category'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.subCategory}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, subCategory: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder={isRTL ? 'مثال: البرمجة والتطوير' : 'e.g., Programming'}
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {isRTL ? 'النبذة التعريفية عن المعلم' : 'Instructor Bio'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y"
                                            placeholder={isRTL ? 'اكتب نبذة مختصرة عن مؤهلات وخبرات المعلم...' : 'Write a short bio about instructor qualifications...'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Account Status & Password Reset */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                                    <Lock className="w-4 h-4 text-emerald-500" />
                                    <span>{isRTL ? 'حالة الحساب والأمان' : 'Account Status & Security'}</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Verification Card */}
                                    <label className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${editForm.isVerified ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isVerified}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'توثيق واعتماد المحاضر' : 'Verified Instructor'}
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {isRTL ? 'يمنح المحاضر شارة التوثيق الرسمي' : 'Displays verification badge'}
                                            </span>
                                        </div>
                                    </label>

                                    {/* Active Account Card */}
                                    <label className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${editForm.isActive ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isActive}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                                        />
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                                {isRTL ? 'تفعيل الحساب (نشط)' : 'Account Active'}
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {isRTL ? 'السماح بتسجيل الدخول والوصول' : 'Allows login and access'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Password Reset */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isRTL ? 'تعيين كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)' : 'Reset Password (leave empty to keep current)'}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full ps-9.5 pe-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder={isRTL ? 'أدخل كلمة مرور جديدة إذا أردت تغييرها...' : 'Enter new password if you want to reset...'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingInstructor(null);
                                    }}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{isRTL ? 'حفظ التعديلات' : 'Save Changes'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Instructors;
