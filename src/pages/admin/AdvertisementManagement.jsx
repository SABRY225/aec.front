import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { 
    Megaphone,
    Plus, 
    Pencil, 
    Trash2, 
    Eye, 
    EyeOff,
    Image as ImageIcon,
    Layers,
    Calendar,
    RefreshCw,
    X,
    CheckCircle2,
    XCircle,
    ArrowUpDown,
    Globe,
    ExternalLink
} from 'lucide-react';
import { advertisementService } from '../../services/new-api';
import FileUpload from '../../components/shared/FileUpload/FileUpload';
import { useFileUpload } from '../../hooks/useFileUpload';

const emptyForm = {
    headline: { en: '', ar: '' },
    description: { en: '', ar: '' },
    imageUrl: '',
    isVisible: true,
    priority: 0
};

const AdvertisementManagement = () => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const { uploading } = useFileUpload();
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState('ar');

    useEffect(() => {
        fetchAdvertisements();
    }, []);

    const fetchAdvertisements = async () => {
        try {
            setLoading(true);
            const data = await advertisementService.getAdvertisements();
            setAdvertisements(data.data || []);
        } catch (error) {
            console.error('Error fetching advertisements:', error);
            toast.error(t('admin.advertisements.loadFailed', 'فشل في تحميل الإعلانات'));
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = advertisements.length;
        const visible = advertisements.filter(a => a.isVisible).length;
        const hidden = total - visible;
        return { total, visible, hidden };
    }, [advertisements]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageUpload = (uploadedFile) => {
        const imageUrl = uploadedFile.url || uploadedFile.result || uploadedFile;
        setFormData(prev => ({ ...prev, imageUrl }));
        toast.success(t('admin.advertisements.imageUploaded', 'تم رفع صورة الإعلان بنجاح'));
    };

    const handleUploadError = (error) => {
        console.error('Upload error:', error);
        toast.error(error || t('admin.advertisements.uploadFailed', 'فشل في رفع الصورة'));
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingAd(null);
        setActiveLangTab('ar');
    };

    const openModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                headline: ad.headline || { en: '', ar: '' },
                description: ad.description || { en: '', ar: '' },
                imageUrl: ad.image?.url || ad.imageUrl || '',
                isVisible: ad.isVisible !== false,
                priority: ad.priority || 0
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const submitData = {
                isVisible: formData.isVisible,
                priority: Number(formData.priority) || 0
            };
            
            if (formData.headline.en?.trim() || formData.headline.ar?.trim()) {
                submitData.headline = formData.headline;
            }
            
            if (formData.description.en?.trim() || formData.description.ar?.trim()) {
                submitData.description = formData.description;
            }
            
            if (formData.imageUrl) {
                submitData.imageUrl = formData.imageUrl;
            }
            
            let data;
            if (editingAd) {
                data = await advertisementService.updateAdvertisement(editingAd._id, submitData);
            } else {
                data = await advertisementService.createAdvertisement(submitData);
            }
            
            toast.success(data.message || t('admin.advertisements.saved', 'تم حفظ الإعلان بنجاح'));
            closeModal();
            fetchAdvertisements();
        } catch (error) {
            console.error('Error saving advertisement:', error);
            toast.error(error.message || t('admin.advertisements.saveFailed', 'فشل في حفظ الإعلان'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.advertisements.confirmDelete', 'هل أنت متأكد من رغبتك في حذف هذا الإعلان؟'))) {
            return;
        }
        
        try {
            const data = await advertisementService.deleteAdvertisement(id);
            toast.success(data.message || t('admin.advertisements.deleted', 'تم حذف الإعلان بنجاح'));
            fetchAdvertisements();
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            toast.error(t('admin.advertisements.deleteFailed', 'فشل حذف الإعلان'));
        }
    };

    const toggleVisibility = async (id) => {
        try {
            const data = await advertisementService.toggleVisibility(id);
            toast.success(data.message || t('admin.advertisements.visibilityToggled', 'تم تغيير حالة الظهور'));
            fetchAdvertisements();
        } catch (error) {
            console.error('Error toggling visibility:', error);
            toast.error(t('admin.advertisements.visibilityFailed', 'فشل تغيير حالة الظهور'));
        }
    };

    const getPrimaryHeadline = (ad) => {
        if (isRTL) {
            return ad.headline?.ar || ad.headline?.en || t('admin.advertisements.noHeadline', 'بدون عنوان');
        }
        return ad.headline?.en || ad.headline?.ar || t('admin.advertisements.noHeadline', 'No Headline');
    };

    const getPrimaryDescription = (ad) => {
        if (isRTL) {
            return ad.description?.ar || ad.description?.en || '';
        }
        return ad.description?.en || ad.description?.ar || '';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {t('admin.advertisements.title', 'إدارة الإعلانات والبانرات')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            {t('admin.advertisements.subtitle', 'إدارة العروض الترويجية والبانرات الإعلانية في الصفحة الرئيسية')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                    <button
                        onClick={fetchAdvertisements}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                        title={t('common.refresh', 'تحديث')}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => openModal()}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                    >
                        <Plus size={18} />
                        <span>{t('admin.advertisements.addNew', 'إضافة إعلان جديد')}</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                        <Layers size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.advertisements.totalAds', 'إجمالي الإعلانات')}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                            {stats.total}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.advertisements.visibleAds', 'معروضة على الموقع')}
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {stats.visible}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                        <XCircle size={22} />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('admin.advertisements.hiddenAds', 'مخفية أو مسودات')}
                        </div>
                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {stats.hidden}
                        </div>
                    </div>
                </div>
            </div>

            {/* List / Table Container */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.advertisements.banner', 'البانر الإعلاني')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.advertisements.headline', 'العنوان والمحتوى')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    {t('admin.advertisements.priority', 'الأولوية')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.advertisements.status', 'حالة العرض')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
                                    {t('admin.advertisements.created', 'تاريخ الإنشاء')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                    {t('admin.advertisements.actions', 'الإجراءات')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="animate-spin text-amber-600 dark:text-amber-400" size={32} />
                                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                {t('admin.advertisements.loading', 'جاري تحميل الإعلانات...')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : advertisements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                                                <Megaphone size={36} className="opacity-40 text-slate-500" />
                                            </div>
                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
                                                {t('admin.advertisements.noAds', 'لا توجد إعلانات مسجلة')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                                {t('admin.advertisements.createFirst', 'أنشئ أول إعلان ترويجي ليظهر لزوار المنصة في الصفحة الرئيسية')}
                                            </p>
                                            <button
                                                onClick={() => openModal()}
                                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
                                            >
                                                {t('admin.advertisements.addNew', 'إضافة إعلان جديد')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                advertisements.map((ad) => {
                                    const adImage = ad.image?.url || ad.imageUrl;
                                    const headline = getPrimaryHeadline(ad);
                                    const desc = getPrimaryDescription(ad);
                                    return (
                                        <tr key={ad._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group">
                                            {/* Thumbnail / Media */}
                                            <td className="px-6 py-4">
                                                <div className="h-16 w-28 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm relative group/img">
                                                    {adImage ? (
                                                        <img 
                                                            src={adImage} 
                                                            alt={headline} 
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105" 
                                                        />
                                                    ) : (
                                                        <ImageIcon size={22} className="text-slate-400 opacity-60" />
                                                    )}
                                                </div>
                                            </td>

                                            {/* Headline & Description */}
                                            <td className="px-6 py-4 max-w-sm">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                        {headline}
                                                    </div>
                                                    {desc ? (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                            {desc}
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">{t('admin.advertisements.noDesc', 'لا يوجد وصف')}</span>
                                                    )}
                                                    {(ad.headline?.en && ad.headline?.ar) && (
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                                                                AR
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40">
                                                                EN
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {ad.priority || 0}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleVisibility(ad._id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                                        ad.isVisible
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-200'
                                                    }`}
                                                    title={t('admin.advertisements.toggleVisibilityHint', 'انقر لتغيير حالة الظهور')}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${ad.isVisible ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                    <span>{ad.isVisible ? t('admin.advertisements.visible', 'معروض') : t('admin.advertisements.hidden', 'مخفي')}</span>
                                                </button>
                                            </td>

                                            {/* Created */}
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-slate-400" />
                                                    <span>{new Date(ad.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => toggleVisibility(ad._id)}
                                                        className={`p-2 rounded-xl border text-xs transition-colors ${
                                                            ad.isVisible
                                                                ? 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                                                : 'border-emerald-200 dark:border-emerald-800/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                                        }`}
                                                        title={ad.isVisible ? t('admin.advertisements.hide', 'إخفاء') : t('admin.advertisements.show', 'إظهار')}
                                                    >
                                                        {ad.isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>

                                                    <button
                                                        onClick={() => openModal(ad)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                                        title={t('admin.advertisements.edit', 'تعديل')}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(ad._id)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                        title={t('admin.advertisements.delete', 'حذف')}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        <Megaphone size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {editingAd
                                            ? t('admin.advertisements.editModal', 'تعديل بيانات الإعلان')
                                            : t('admin.advertisements.addModal', 'إضافة إعلان جديد')}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                                {/* Language Switch Tabs */}
                                <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setActiveLangTab('ar')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            activeLangTab === 'ar'
                                                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        العربية (AR)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveLangTab('en')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            activeLangTab === 'en'
                                                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        English (EN)
                                    </button>
                                </div>

                                {/* Content Fields based on Active Tab */}
                                {activeLangTab === 'ar' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.advertisements.headlineAr', 'عنوان الإعلان (بالعربية)')}
                                            </label>
                                            <input
                                                type="text"
                                                name="headline.ar"
                                                value={formData.headline.ar}
                                                onChange={handleInputChange}
                                                placeholder="مثال: خصم 50% على جميع الدورات التقنية لفترة محدودة!"
                                                dir="rtl"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                                maxLength={200}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                {t('admin.advertisements.descAr', 'تفاصيل الإعلان (بالعربية)')}
                                            </label>
                                            <textarea
                                                name="description.ar"
                                                value={formData.description.ar}
                                                onChange={handleInputChange}
                                                placeholder="اكتب تفاصيل العرض الترويجي أو التنويه هنا..."
                                                dir="rtl"
                                                rows={3}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                                maxLength={1000}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Headline (English)
                                            </label>
                                            <input
                                                type="text"
                                                name="headline.en"
                                                value={formData.headline.en}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 50% Off On All Tech Courses For Limited Time!"
                                                dir="ltr"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                                maxLength={200}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Description (English)
                                            </label>
                                            <textarea
                                                name="description.en"
                                                value={formData.description.en}
                                                onChange={handleInputChange}
                                                placeholder="Write the promotional offer details or announcement here..."
                                                dir="ltr"
                                                rows={3}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                                maxLength={1000}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.advertisements.image', 'صورة البانر أو الإعلان')}
                                    </label>
                                    <FileUpload
                                        accept="image/*"
                                        folder="advertisements"
                                        onUploadSuccess={handleImageUpload}
                                        onUploadError={handleUploadError}
                                        label={t('admin.advertisements.uploadLabel', 'رفع صورة الإعلان')}
                                        dragDropLabel={t('admin.advertisements.dragDrop', 'أو اسحب وأفلت الصورة هنا')}
                                        helperText="PNG, JPG, WEBP (حتى 10MB)"
                                        disabled={uploading || submitting}
                                        showPreview={true}
                                        previewType="image"
                                        value={formData.imageUrl}
                                        maxSize={10 * 1024 * 1024}
                                    />
                                </div>

                                {/* Priority & Visibility settings */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {t('admin.advertisements.priority', 'أولوية الترتيب')}
                                        </label>
                                        <input
                                            type="number"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            {t('admin.advertisements.priorityHint', 'الرقم الأكبر يظهر أولاً')}
                                        </span>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    name="isVisible"
                                                    checked={formData.isVisible}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
                                                />
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-white block">
                                                        {t('admin.advertisements.visibleOnHome', 'عرض في الصفحة الرئيسية')}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {formData.isVisible ? t('admin.advertisements.visibleTrue', 'الإعلان معروض حالياً') : t('admin.advertisements.visibleFalse', 'الإعلان مخفي')}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                                    >
                                        {t('common.cancel', 'إلغاء')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || uploading}
                                        className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                <span>{t('common.saving', 'جاري الحفظ...')}</span>
                                            </>
                                        ) : (
                                            <span>{editingAd ? t('admin.advertisements.update', 'تحديث الإعلان') : t('admin.advertisements.create', 'نشر الإعلان')}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementManagement;