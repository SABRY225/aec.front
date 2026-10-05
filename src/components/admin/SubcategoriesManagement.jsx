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
    FolderTree, 
    Layers, 
    CheckCircle2, 
    Image as ImageIcon, 
    BookOpen, 
    Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';
import api, { subcategoryService } from '../../services/new-api';
import { useFileUpload } from '../../hooks/useFileUpload';

const SubcategoriesManagement = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { uploadFile } = useFileUpload();

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
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
        category: '',
        isActive: true,
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories');
            const data = response.data?.data || response.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(t('admin.categoriesMgmt.fetchFailed', 'فشل جلب التصنيفات'));
            console.error('Error fetching categories:', error);
        }
    }, [t]);

    const fetchSubcategories = useCallback(async (categoryId, isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const endpoint = categoryId ? `/subcategories/category/${categoryId}` : '/subcategories';
            const response = await api.get(endpoint);
            const data = response.data?.data || response.data || [];
            setSubcategories(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(t('admin.categoriesMgmt.subFetchFailed', 'فشل جلب التصنيفات الفرعية'));
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchSubcategories(selectedCategory);
    }, [selectedCategory, fetchSubcategories]);

    const handleRefresh = () => {
        fetchCategories();
        fetchSubcategories(selectedCategory, true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.image;
            
            // Upload image first if a new file is chosen
            if (imageFile) {
                const uploadingToast = toast.loading(t('admin.categories.uploadingImage', 'جاري رفع الصورة...'));
                try {
                    const result = await uploadFile(imageFile, 'subcategories');
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

            const subcategoryData = {
                ...formData,
                categoryId: formData.category,
                image: imageUrl
            };

            if (editingSubcategory) {
                await subcategoryService.updateSubcategory(editingSubcategory._id, subcategoryData);
                toast.success(t('admin.categoriesMgmt.subUpdated', 'تم تحديث التصنيف الفرعي بنجاح'));
            } else {
                await subcategoryService.createSubcategory(subcategoryData);
                toast.success(t('admin.categoriesMgmt.subCreated', 'تم إنشاء التصنيف الفرعي بنجاح'));
            }

            fetchSubcategories(selectedCategory);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.categoriesMgmt.operationFailed', 'فشلت العملية'));
            console.error('Error saving subcategory:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (subcategory) => {
        setEditingSubcategory(subcategory);
        setFormData({
            nameEn: subcategory.nameEn || '',
            nameAr: subcategory.nameAr || '',
            description: subcategory.description || '',
            category: subcategory.category?._id || subcategory.category || '',
            isActive: subcategory.isActive !== false,
            image: subcategory.image || ''
        });
        setImagePreview(subcategory.image || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (subcategoryId) => {
        if (!window.confirm(t('admin.categories.confirmDeleteSubcategory', 'هل أنت متأكد من حذف هذا التصنيف الفرعي؟'))) {
            return;
        }

        try {
            await api.delete(`/subcategories/${subcategoryId}`);
            toast.success(t('admin.categoriesMgmt.subDeleted', 'تم حذف التصنيف الفرعي بنجاح'));
            fetchSubcategories(selectedCategory);
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.categoriesMgmt.subDeleteFailed', 'فشل حذف التصنيف الفرعي'));
            console.error('Error deleting subcategory:', error);
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
            category: selectedCategory || '',
            isActive: true,
            image: ''
        });
        setImageFile(null);
        setImagePreview('');
        setEditingSubcategory(null);
        setShowModal(false);
    };

    const toggleStatus = async (subcategoryId, currentStatus) => {
        setStatusTogglingId(subcategoryId);
        try {
            await api.put(`/subcategories/${subcategoryId}`, { isActive: !currentStatus });
            toast.success(t('admin.categoriesMgmt.subStatusUpdated', 'تم تحديث حالة التصنيف الفرعي'));
            setSubcategories(prev => prev.map(sub => 
                sub._id === subcategoryId ? { ...sub, isActive: !currentStatus } : sub
            ));
        } catch (error) {
            toast.error(t('admin.categoriesMgmt.subStatusFailed', 'فشل تحديث الحالة'));
            console.error('Error updating status:', error);
        } finally {
            setStatusTogglingId(null);
        }
    };

    const openAddModal = () => {
        setFormData({
            nameEn: '',
            nameAr: '',
            description: '',
            category: selectedCategory || (categories[0]?._id || ''),
            isActive: true,
            image: ''
        });
        setImageFile(null);
        setImagePreview('');
        setEditingSubcategory(null);
        setShowModal(true);
    };

    // Filter subcategories
    const filteredSubcategories = useMemo(() => {
        let list = [...subcategories];

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            list = list.filter(sub => {
                const nameEn = (sub.nameEn || '').toLowerCase();
                const nameAr = (sub.nameAr || '').toLowerCase();
                const desc = (sub.description || '').toLowerCase();
                const parentName = (sub.category?.nameEn || sub.category?.nameAr || '').toLowerCase();
                return nameEn.includes(query) || nameAr.includes(query) || desc.includes(query) || parentName.includes(query);
            });
        }

        if (statusFilter === 'active') {
            list = list.filter(sub => sub.isActive);
        } else if (statusFilter === 'inactive') {
            list = list.filter(sub => !sub.isActive);
        }

        return list;
    }, [subcategories, searchTerm, statusFilter]);

    // Metric counts
    const activeCount = subcategories.filter(s => s.isActive).length;
    const totalCourses = subcategories.reduce((sum, s) => sum + (s.coursesCount || 0), 0);

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
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                            <FolderTree className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {t('admin.categories.subcategoriesTitle', 'إدارة التصنيفات الفرعية')}
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {subcategories.length}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {t('admin.categories.subcategoriesSubtitle', 'تنظيم وإدارة المسارات الفرعية وربطها بالتصنيفات ومتابعة الدورات')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right controls: Refresh & Add Button */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading || isRefreshing}
                        title={t('admin.categories.refresh', 'تحديث')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all disabled:opacity-50"
                    >
                        <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-600' : ''}`} />
                        <span className="hidden sm:inline">{t('admin.categories.refresh', 'تحديث')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{t('admin.categories.addSubcategory', 'إضافة تصنيف فرعي')}</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* KPI Metric Overview Cards */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Subcategories */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                            <FolderTree className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t('admin.categories.totalSubcategories', 'إجمالي المسارات')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.totalSubcategories', 'إجمالي التصنيفات الفرعية')}
                        </h3>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {subcategories.length}
                        </p>
                    </div>
                </div>

                {/* Active Subcategories */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            {subcategories.length > 0 ? Math.round((activeCount / subcategories.length) * 100) : 0}%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.activeSubcategories', 'المسارات النشطة')}
                        </h3>
                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {activeCount}
                        </p>
                    </div>
                </div>

                {/* Total Linked Courses */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t('admin.categories.tableCourses', 'الدورات المرتبطة')}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.categories.totalCourses', 'إجمالي الدورات')}
                        </h3>
                        <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                            {totalCourses}
                        </p>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Search & Control Filter Bar */}
            {/* ======================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('admin.categories.searchSubcategoriesPlaceholder', 'ابحث في التصنيفات الفرعية بالاسم بالعربي أو الإنجليزي...')}
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
                        {/* Parent Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer max-w-[180px] sm:max-w-xs"
                            >
                                <option value="">{t('admin.categories.allCategories', 'جميع التصنيفات الرئيسية')}</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {isRTL ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}
                                    </option>
                                ))}
                            </select>
                        </div>

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
            {/* Subcategories Display */}
            {/* ======================================================== */}
            {loading && subcategories.length === 0 ? (
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
            ) : filteredSubcategories.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-4">
                        <FolderTree className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {t('admin.categories.noSubcategoriesFound', 'لم يتم العثور على تصنيفات فرعية')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {searchTerm 
                            ? t('admin.courses.trySearch', 'لم نجد أي تصنيف فرعي يطابق عملية البحث.') 
                            : t('admin.categories.noSubcategoriesFound', 'لا توجد تصنيفات فرعية متاحة في هذا التصنيف حالياً.')}
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
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('admin.categories.addSubcategory', 'إضافة أول تصنيف فرعي')}</span>
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
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableSubcategory', 'التصنيف الفرعي')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableNames', 'الاسم')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableCategory', 'التصنيف الرئيسي')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('admin.categories.tableCourses', 'الدورات')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-start">{t('common.status', 'الحالة')}</th>
                                    <th className="py-3.5 px-4 font-semibold text-end">{t('common.actions', 'إجراءات')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filteredSubcategories.map((subcategory) => {
                                    const parentCategoryName = isRTL 
                                        ? subcategory.category?.nameAr || subcategory.category?.nameEn 
                                        : subcategory.category?.nameEn || subcategory.category?.nameAr;

                                    return (
                                        <tr key={subcategory._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Image */}
                                            <td className="py-3 px-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/60 shrink-0">
                                                    {subcategory.image && !imageErrors[subcategory._id] ? (
                                                        <img 
                                                            src={subcategory.image} 
                                                            alt={subcategory.nameEn}
                                                            onError={() => setImageErrors(prev => ({ ...prev, [subcategory._id]: true }))}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl">📂</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Names */}
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-base">
                                                    {isRTL ? subcategory.nameAr || subcategory.nameEn : subcategory.nameEn || subcategory.nameAr}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {isRTL ? subcategory.nameEn : subcategory.nameAr}
                                                </div>
                                                {subcategory.description && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                                                        {subcategory.description}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Parent Category */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    <span>{parentCategoryName || t('admin.categories.notAvailable', 'غير محدد')}</span>
                                                </span>
                                            </td>

                                            {/* Courses Count */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                                                    <span>{t('admin.categories.coursesCount', { count: subcategory.coursesCount || 0 })}</span>
                                                </span>
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(subcategory._id, subcategory.isActive)}
                                                    disabled={statusTogglingId === subcategory._id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                        subcategory.isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {statusTogglingId === subcategory._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : subcategory.isActive ? (
                                                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                    <span>{subcategory.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 whitespace-nowrap text-end">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(subcategory)}
                                                        title={t('admin.categories.edit', 'تعديل')}
                                                        className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(subcategory._id)}
                                                        title={t('admin.categories.delete', 'حذف')}
                                                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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
                    {filteredSubcategories.map((subcategory) => {
                        const parentCategoryName = isRTL 
                            ? subcategory.category?.nameAr || subcategory.category?.nameEn 
                            : subcategory.category?.nameEn || subcategory.category?.nameAr;

                        return (
                            <div 
                                key={subcategory._id}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Card Top: Cover Image or Icon Container */}
                                <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 flex items-center justify-center">
                                    {subcategory.image && !imageErrors[subcategory._id] ? (
                                        <img 
                                            src={subcategory.image} 
                                            alt={subcategory.nameEn}
                                            onError={() => setImageErrors(prev => ({ ...prev, [subcategory._id]: true }))}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/90 shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                                            📂
                                        </div>
                                    )}

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

                                    {/* Status Badge (Top-Start) */}
                                    <div className="absolute top-3 start-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(subcategory._id, subcategory.isActive)}
                                            disabled={statusTogglingId === subcategory._id}
                                            title={subcategory.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border transition-all ${
                                                subcategory.isActive
                                                    ? 'bg-emerald-500/90 text-white border-emerald-400/40'
                                                    : 'bg-slate-900/80 text-slate-300 border-white/20'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${subcategory.isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
                                            <span>{subcategory.isActive ? t('admin.categories.active', 'نشط') : t('admin.categories.inactive', 'غير نشط')}</span>
                                        </button>
                                    </div>

                                    {/* Courses count chip (Bottom-End) */}
                                    <div className="absolute bottom-3 end-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                                            <BookOpen className="w-3 h-3 text-primary-400" />
                                            <span>{subcategory.coursesCount || 0}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Parent Category Badge */}
                                        <div className="mb-2">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
                                                <Layers className="w-3 h-3" />
                                                <span>{parentCategoryName || t('admin.categories.notAvailable', 'غير محدد')}</span>
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {isRTL ? subcategory.nameAr || subcategory.nameEn : subcategory.nameEn || subcategory.nameAr}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                            {isRTL ? subcategory.nameEn : subcategory.nameAr}
                                        </p>

                                        {subcategory.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                                {subcategory.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Card Actions */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(subcategory._id, subcategory.isActive)}
                                            disabled={statusTogglingId === subcategory._id}
                                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
                                        >
                                            {subcategory.isActive ? (
                                                <><EyeOff className="w-3.5 h-3.5" /><span>{t('admin.categories.inactive', 'إيقاف')}</span></>
                                            ) : (
                                                <><Eye className="w-3.5 h-3.5" /><span>{t('admin.categories.active', 'تفعيل')}</span></>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(subcategory)}
                                                title={t('admin.categories.edit', 'تعديل')}
                                                className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(subcategory._id)}
                                                title={t('admin.categories.delete', 'حذف')}
                                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ======================================================== */}
            {/* Add / Edit Subcategory Modal */}
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
                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                    <FolderTree className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingSubcategory 
                                        ? t('admin.categories.editSubcategory', 'تعديل التصنيف الفرعي') 
                                        : t('admin.categories.addNewSubcategory', 'إضافة تصنيف فرعي جديد')}
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
                            {/* Parent Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.categories.categoryLabel', 'التصنيف الرئيسي')} *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                                >
                                    <option value="">{t('admin.categories.selectCategory', 'اختر التصنيف الرئيسي...')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {isRTL ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                        placeholder="e.g. React.js"
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
                                        placeholder="مثال: ريأكت جي إس"
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
                                    placeholder={t('admin.categories.description', 'اكتب وصفاً مختصراً للمسار الفرعي...')}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                />
                            </div>

                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.categories.image', 'صورة المسار الفرعي')}
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
                                        {t('admin.categories.active', 'تفعيل التصنيف الفرعي')}
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
                                            : (editingSubcategory ? t('common.update', 'تحديث') : t('common.create', 'إضافة'))}
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

export default SubcategoriesManagement;