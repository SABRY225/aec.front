import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Upload, 
    Eye, 
    EyeOff, 
    Search, 
    X, 
    RotateCcw, 
    LayoutGrid, 
    List, 
    Layers, 
    FolderTree, 
    CheckCircle2, 
    AlertCircle, 
    Image as ImageIcon, 
    Sparkles, 
    Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/new-api';
import { useFileUpload } from '../../hooks/useFileUpload';

const SUGGESTED_ICONS = ['📚', '💻', '🎨', '💼', '🔬', '🌐', '🎵', '📈', '🚀', '🩺', '⚖️', '📐'];

const CategoriesManagement = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { uploadFile } = useFileUpload();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [statusTogglingId, setStatusTogglingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [imageErrors, setImageErrors] = useState({});

    const [formData, setFormData] = useState({
        nameEn: '',
        nameAr: '',
        description: '',
        icon: '📚',
        isActive: true,
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const fetchCategories = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await api.get('/categories');
            const data = response.data?.data || response.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(t('admin.categoriesMgmt.fetchFailed', 'فشل في جلب التصنيفات'));
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.image;
            
            // Upload image first if a new file is chosen
            if (imageFile) {
                const uploadingToast = toast.loading(t('admin.categories.uploadingImage', 'جاري رفع الصورة...'));
                try {
                    const result = await uploadFile(imageFile, 'categories');
                    imageUrl = result.url;
                    toast.dismiss(uploadingToast);
                } catch (uploadError) {
                    toast.dismiss(uploadingToast);
                    toast.error(t('admin.categoriesMgmt.imageUploadFailed', 'فشل رفع الصورة'));
                    console.error('Image upload error:', uploadError);
                    setSubmitting(false);
                    return;
                }
            }

            const categoryData = {
                ...formData,
                image: imageUrl
            };

            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, categoryData);
                toast.success(t('admin.categoriesMgmt.updated', 'تم تحديث التصنيف بنجاح'));
            } else {
                await api.post('/categories', categoryData);
                toast.success(t('admin.categoriesMgmt.created', 'تم إنشاء التصنيف بنجاح'));
            }

            fetchCategories();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.categoriesMgmt.operationFailed', 'فشلت العملية'));
            console.error('Error saving category:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            nameEn: category.nameEn || '',
            nameAr: category.nameAr || '',
            description: category.description || '',
            icon: category.icon || '📚',
            isActive: category.isActive !== false,
            image: category.image || ''
        });
        setImagePreview(category.image || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm(t('admin.categories.confirmDeleteCategory', 'هل أنت متأكد من حذف هذا التصنيف؟ سيؤدي ذلك إلى حذف جميع التصنيفات الفرعية.'))) {
            return;
        }

        try {
            await api.delete(`/categories/${categoryId}`);
            toast.success(t('admin.categoriesMgmt.deleted', 'تم حذف التصنيف بنجاح'));
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.categoriesMgmt.deleteFailed', 'فشل حذف التصنيف'));
            console.error('Error deleting category:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            nameEn: '',
            nameAr: '',
            description: '',
            icon: '📚',
            isActive: true,
            image: ''
        });
        setImageFile(null);
        setImagePreview('');
        setEditingCategory(null);
        setShowModal(false);
    };

    const toggleStatus = async (categoryId, currentStatus) => {
        setStatusTogglingId(categoryId);
        try {
            await api.put(`/categories/${categoryId}`, { isActive: !currentStatus });
            toast.success(t('admin.categoriesMgmt.statusUpdated', 'تم تحديث حالة التصنيف'));
            setCategories(prev => prev.map(cat => 
                cat._id === categoryId ? { ...cat, isActive: !currentStatus } : cat
            ));
        } catch (error) {
            toast.error(t('admin.categoriesMgmt.statusFailed', 'فشل تحديث الحالة'));
            console.error('Error updating status:', error);
        } finally {
            setStatusTogglingId(null);
        }
    };

    // Filter categories
    const filteredCategories = useMemo(() => {
        let list = [...categories];

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            list = list.filter(cat => 
                (cat.nameEn || '').toLowerCase().includes(query) ||
                (cat.nameAr || '').toLowerCase().includes(query) ||
                (cat.description || '').toLowerCase().includes(query)
            );
        }

        if (statusFilter === 'active') {
            list = list.filter(cat => cat.isActive);
        } else if (statusFilter === 'inactive') {
            list = list.filter(cat => !cat.isActive);
        }

        return list;
    }, [categories, searchTerm, statusFilter]);

    // Metric counts
    const activeCount = categories.filter(c => c.isActive).length;
    const inactiveCount = categories.length - activeCount;
    const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategoryCount || 0), 0);

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
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {t('admin.categories.title', 'إدارة التصنيفات')}
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                    {categories.length}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {t('admin.categories.subtitle', 'إدارة وتنظيم التصنيفات الرئيسية للمنصة والأيقونات والصور وحالة العرض')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right controls: Refresh & Add Button */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={() => fetchCategories(true)}
                        disabled={loading || isRefreshing}
                        title={t('admin.categories.refresh', 'تحديث')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all disabled:opacity-50"
                    >
                        <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
                        <span className="hidden sm:inline">{t('admin.categories.refresh', 'تحديث')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{t('admin.categories.addCategory', 'إضافة تصنيف')}</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* KPI Metric Overview Cards */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Categories */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t('admin.categories.totalCategories', 'إجمالي التصنيفات')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.totalCategories', 'إجمالي التصنيفات')}
                        </h3>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {categories.length}
                        </p>
                    </div>
                </div>

                {/* Active Categories */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {categories.length > 0 ? Math.round((activeCount / categories.length) * 100) : 0}%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.activeCategories', 'التصنيفات النشطة')}
                        </h3>
                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {activeCount}
                        </p>
                    </div>
                </div>

                {/* Linked Subcategories */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                            <FolderTree className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t('admin.categories.tableSubcategories', 'تصنيف فرعي')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.totalSubcategories', 'إجمالي المسارات الفرعية')}
                        </h3>
                        <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            {totalSubcategories}
                        </p>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Search & Control Filter Bar */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('admin.categories.searchPlaceholder', 'ابحث في التصنيفات بالاسم بالعربي أو الإنجليزي...')}
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

                    {/* Filter & View Switcher */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                            >
                                <option value="all">{t('admin.categories.allStatus', 'جميع الحالات')}</option>
                                <option value="active">{t('admin.categories.active', 'نشط فقط')}</option>
                                <option value="inactive">{t('admin.categories.inactive', 'غير نشط')}</option>
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                title={t('admin.categories.gridView', 'عرض شبكي')}
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
                                title={t('admin.categories.listView', 'عرض جدول')}
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
            {/* Categories Display */}
            {/* ======================================================== */}
            {loading && categories.length === 0 ? (
                /* Skeleton Loader */
                <div className={
                    viewMode === 'grid'
                        ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "space-y-3"
                }>
                    {[...Array(8)].map((_, idx) => (
                        <div 
                            key={idx}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm animate-pulse space-y-4"
                        >
                            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredCategories.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-4">
                        <Layers className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t('admin.categories.noCategoriesFound', 'لم يتم العثور على تصنيفات')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {searchTerm 
                            ? t('admin.courses.trySearch', 'لم نجد أي تصنيف يطابق عملية البحث.') 
                            : t('admin.categories.createFirst', 'أضف أول تصنيف لبدء تنظيم الدورات والمسارات.')}
                    </p>
                    {searchTerm ? (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>{t('admin.categories.clearSearch', 'مسح البحث')}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('admin.categories.addCategory', 'إضافة أول تصنيف')}</span>
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
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableCategory', 'التصنيف')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableNames', 'الاسم بالعربية والإنجليزية')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableSubcategories', 'المسارات الفرعية')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('common.status', 'الحالة')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-end">{t('common.actions', 'إجراءات')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filteredCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                        {/* Image / Icon */}
                                        <td className="py-3 px-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/60 shrink-0">
                                                {category.image && !imageErrors[category._id] ? (
                                                    <img 
                                                        src={category.image} 
                                                        alt={category.nameEn}
                                                        onError={() => setImageErrors(prev => ({ ...prev, [category._id]: true }))}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl">{category.icon || '📚'}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Names & Description */}
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-base">
                                                {isRTL ? category.nameAr || category.nameEn : category.nameEn || category.nameAr}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {isRTL ? category.nameEn : category.nameAr}
                                            </div>
                                            {category.description && (
                                                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                                                    {category.description}
                                                </p>
                                            )}
                                        </td>

                                        {/* Subcategories Count */}
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                                <FolderTree className="w-3.5 h-3.5" />
                                                <span>{category.subcategoryCount || 0} {t('admin.categories.tableSubcategories', 'فرعي')}</span>
                                            </span>
                                        </td>

                                        {/* Status Toggle */}
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(category._id, category.isActive)}
                                                disabled={statusTogglingId === category._id}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                    category.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80 hover:bg-emerald-100'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                {statusTogglingId === category._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : category.isActive ? (
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                                )}
                                                <span>{category.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}</span>
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 whitespace-nowrap text-end">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(category)}
                                                    title={t('admin.categories.edit', 'تعديل')}
                                                    className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(category._id)}
                                                    title={t('admin.categories.delete', 'حذف')}
                                                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid Mode */
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCategories.map((category) => (
                        <div 
                            key={category._id}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                            {/* Card Top: Cover Image or Icon Container */}
                            <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 flex items-center justify-center">
                                {category.image && !imageErrors[category._id] ? (
                                    <img 
                                        src={category.image} 
                                        alt={category.nameEn}
                                        onError={() => setImageErrors(prev => ({ ...prev, [category._id]: true }))}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/90 shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                                        {category.icon || '📚'}
                                    </div>
                                )}

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

                                {/* Status Badge (Top-Start) */}
                                <div className="absolute top-3 start-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(category._id, category.isActive)}
                                        disabled={statusTogglingId === category._id}
                                        title={category.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border transition-all ${
                                            category.isActive
                                                ? 'bg-emerald-500/90 text-white border-emerald-400/40'
                                                : 'bg-slate-900/80 text-slate-300 border-white/20'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
                                        <span>{category.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}</span>
                                    </button>
                                </div>

                                {/* Subcategories count chip (Bottom-End) */}
                                <div className="absolute bottom-3 end-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                                        <FolderTree className="w-3 h-3 text-indigo-400" />
                                        <span>{category.subcategoryCount || 0}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {isRTL ? category.nameAr || category.nameEn : category.nameEn || category.nameAr}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                        {isRTL ? category.nameEn : category.nameAr}
                                    </p>

                                    {category.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                            {category.description}
                                        </p>
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(category._id, category.isActive)}
                                        disabled={statusTogglingId === category._id}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
                                    >
                                        {category.isActive ? (
                                            <><EyeOff className="w-3.5 h-3.5" /><span>{t('admin.categories.inactive', 'إيقاف')}</span></>
                                        ) : (
                                            <><Eye className="w-3.5 h-3.5" /><span>{t('admin.categories.active', 'تفعيل')}</span></>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(category)}
                                            title={t('admin.categories.edit', 'تعديل')}
                                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(category._id)}
                                            title={t('admin.categories.delete', 'حذف')}
                                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ======================================================== */}
            {/* Add / Edit Category Modal */}
            {/* ======================================================== */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingCategory 
                                        ? t('admin.categories.editCategory', 'تعديل التصنيف') 
                                        : t('admin.categories.addCategory', 'إضافة تصنيف جديد')}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                            {/* Names Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.categories.englishName', 'الاسم بالإنجليزية')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                        placeholder="e.g. Web Development"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.categories.arabicName', 'الاسم بالعربية')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nameAr}
                                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                        placeholder="مثال: تطوير الويب"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.categories.description', 'الوصف')}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    placeholder={t('admin.categories.description', 'اكتب وصفاً مختصراً للتصنيف...')}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                />
                            </div>

                            {/* Icon Picker with suggestions */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.categories.icon', 'الأيقونة التعبيرية')}
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700 shrink-0">
                                        {formData.icon || '📚'}
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="📚"
                                        className="w-24 px-3 py-2 text-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                    {/* Suggested Quick Emojis */}
                                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                                        {SUGGESTED_ICONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: emoji })}
                                                className={`p-1.5 rounded-lg text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                                                    formData.icon === emoji ? 'bg-primary-100 dark:bg-primary-950/80 ring-2 ring-primary-500' : ''
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.categories.image', 'صورة الغلاف')}
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setImageFile(null);
                                                    setFormData({ ...formData, image: '' });
                                                }}
                                                className="absolute top-1 end-1 bg-slate-950/80 text-white p-1 rounded-md hover:bg-rose-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}

                                    <label className="flex-1 cursor-pointer">
                                        <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center bg-slate-50 dark:bg-slate-800/40">
                                            <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                                            <span className="text-xs font-bold text-primary-600 block">
                                                {t('admin.categories.uploadingImage', 'اختر صورة من جهازك')}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {t('admin.categories.uploadImageHint', 'يدعم PNG, JPG, WebP')}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Active Switch Toggle */}
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                        {t('admin.categories.active', 'تفعيل التصنيف')}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {formData.isActive ? t('admin.categories.active', 'مرئي لجميع الطلاب في المنصة') : t('admin.categories.inactive', 'مخفي حالياً')}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        formData.isActive ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.isActive ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Modal Actions Footer */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('common.cancel', 'إلغاء')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>
                                        {submitting 
                                            ? t('common.loading', 'جاري الحفظ...') 
                                            : (editingCategory ? t('common.update', 'تحديث') : t('common.create', 'إضافة'))}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManagement;