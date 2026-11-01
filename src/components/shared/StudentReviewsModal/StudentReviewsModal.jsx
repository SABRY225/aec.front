import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { studentReviewsData, reviewCategories, reviewStats } from '../../../data/studentReviewsData';
import {
    X,
    Star,
    CheckCircle2,
    ShieldCheck,
    MessageSquareQuote,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Users,
    Sparkles,
    Calendar,
    Search,
    ExternalLink,
    Check
} from 'lucide-react';

const StudentReviewsModal = ({ 
    isOpen, 
    onClose, 
    initialCategory = 'all',
    courseTitle = null,
    onEnrollClick = null
}) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Update category when initialCategory prop changes
    useEffect(() => {
        if (initialCategory) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory]);

    // Handle ESC key to close modal or lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (lightboxImage) {
                    setLightboxImage(null);
                } else if (isOpen) {
                    onClose();
                }
            } else if (lightboxImage) {
                if (e.key === 'ArrowRight') {
                    navigateLightbox(isRTL ? -1 : 1);
                } else if (e.key === 'ArrowLeft') {
                    navigateLightbox(isRTL ? 1 : -1);
                }
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, lightboxImage, isRTL]);

    // Filter reviews based on category and search
    const filteredReviews = useMemo(() => {
        return studentReviewsData.filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query || 
                item.title?.toLowerCase().includes(query) ||
                item.studentName?.toLowerCase().includes(query) ||
                item.courseName?.toLowerCase().includes(query) ||
                item.highlight?.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const openLightbox = (review, index) => {
        setLightboxImage(review);
        setLightboxIndex(index);
    };

    const navigateLightbox = (step) => {
        const newIndex = (lightboxIndex + step + filteredReviews.length) % filteredReviews.length;
        setLightboxIndex(newIndex);
        setLightboxImage(filteredReviews[newIndex]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
                >
                    {/* Header */}
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                                <MessageSquareQuote className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                                        {t('reviews.modalTitle', 'ماذا يقول طلابنا عنّا؟')}
                                    </h2>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                        <span>{t('reviews.verifiedBadge', 'محادثات وتجارب موثقة')}</span>
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {courseTitle 
                                        ? t('reviews.modalCourseSubtitle', { title: courseTitle, defaultValue: `آراء وتقييمات خريجي ${courseTitle} والدورات المعتمدة` })
                                        : t('reviews.modalSubtitle', 'لقطات شاشة ورسائل شكر حقيقية من متدربينا وخريجينا في مختلف التخصصات')}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center shrink-0"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats Highlights Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-4 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-center">
                        <div className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-base sm:text-lg">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span>{reviewStats.averageRating} / 5</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{t('reviews.stats.rating', 'متوسط تقييم المتدربين')}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-black text-base sm:text-lg">
                                <Users className="w-4 h-4" />
                                <span>{reviewStats.totalReviews}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{t('reviews.stats.graduates', 'خريج ومتدرب معتمد')}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{reviewStats.satisfactionRate}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{t('reviews.stats.satisfaction', 'نسبة رضا الطلاب')}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-black text-base sm:text-lg">
                                <ShieldCheck className="w-4 h-4" />
                                <span>{reviewStats.certifiedRate}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{t('reviews.stats.authentic', 'تجارب واقعية موثقة')}</span>
                        </div>
                    </div>

                    {/* Filter Controls & Search */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
                        {/* Categories Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                            {reviewCategories.map(cat => {
                                const isSelected = selectedCategory === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => setSelectedCategory(cat.key)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                                            isSelected 
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {isRTL ? cat.labelAr : cat.labelEn}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64 shrink-0">
                            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('reviews.searchPlaceholder', 'بحث في تجارب الطلاب...')}
                                className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Gallery Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                        {filteredReviews.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                                    {t('reviews.noResultsTitle', 'لم يتم العثور على تقييمات مطابقة')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {t('reviews.noResultsSubtitle', 'جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {filteredReviews.map((review, idx) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                        className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                                    >
                                        {/* Card Top / Header */}
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-gradient-to-b from-slate-50/70 to-transparent dark:from-slate-800/40">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                    {review.studentName?.charAt(0) || 'ط'}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                                        {review.studentName}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                                        {review.courseName}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                                                <Check className="w-2.5 h-2.5" />
                                                <span>{review.source}</span>
                                            </span>
                                        </div>

                                        {/* Review Image / Phone Frame Container */}
                                        <div 
                                            onClick={() => openLightbox(review, idx)}
                                            className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden cursor-pointer group/img"
                                        >
                                            {/* Preview Image with fallbacks */}
                                            <img
                                                src={review.image}
                                                alt={review.title}
                                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    // High-aesthetic fallback when local file is pending upload
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'p-6');
                                                }}
                                            />

                                            {/* Beautiful Decorative Overlay & Watermark */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5">
                                                <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-xl">
                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                    <span>{t('reviews.clickToEnlarge', 'اضغط للتكبير والقراءة')}</span>
                                                </span>
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Chat Bubble Fallback in case image is missing */}
                                            <div className="absolute inset-0 flex flex-col justify-center p-5 text-center bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-slate-900/10 pointer-events-none">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                                                    <MessageSquareQuote className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-3 italic">
                                                    "{review.highlight}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Content & Highlight */}
                                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                                                "{review.highlight}"
                                            </p>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{review.date}</span>
                                                </span>
                                                <button
                                                    onClick={() => openLightbox(review, idx)}
                                                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    <span>{t('reviews.viewProof', 'عرض التوثيق')}</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{t('reviews.footerNote', 'جميع التقييمات المعروضة حقيقية 100% ومستخرجة من رسائل المتدربين المسجلين.')}</span>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                            >
                                {t('common.close', 'إغلاق')}
                            </button>

                            {onEnrollClick && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onEnrollClick();
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95 w-full sm:w-auto"
                                >
                                    {t('reviews.joinStudentsCta', 'انضم لطلابنا وسجل الآن')}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Fullscreen Lightbox Preview Overlay */}
                <AnimatePresence>
                    {lightboxImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8"
                        >
                            {/* Close Lightbox */}
                            <button
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-4 end-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20"
                                aria-label="Close Preview"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Prev / Next Buttons */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox(isRTL ? 1 : -1);
                                }}
                                className="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-20"
                            >
                                {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateLightbox(isRTL ? -1 : 1);
                                }}
                                className="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-20"
                            >
                                {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                            </button>

                            {/* Main Lightbox Content */}
                            <div className="max-w-4xl max-h-[82vh] w-full flex flex-col items-center justify-center relative">
                                <motion.div
                                    key={lightboxImage.id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-2xl w-full flex flex-col items-center"
                                >
                                    <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-white">
                                        <div>
                                            <h3 className="text-sm sm:text-base font-bold">{lightboxImage.studentName}</h3>
                                            <p className="text-xs text-blue-300">{lightboxImage.courseName}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Container with Fallback */}
                                    <div className="w-full max-h-[55vh] overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center p-2">
                                        <img
                                            src={lightboxImage.image}
                                            alt={lightboxImage.title}
                                            className="max-h-[50vh] max-w-full object-contain rounded-xl"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `
                                                    <div class="py-12 px-6 text-center text-white">
                                                        <div class="w-16 h-16 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                                                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                        </div>
                                                        <h4 class="text-base font-bold mb-2">${lightboxImage.title}</h4>
                                                        <p class="text-sm text-slate-300 italic max-w-md mx-auto">"${lightboxImage.highlight}"</p>
                                                        <span class="inline-block mt-4 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">محادثة موثقة ✅</span>
                                                    </div>
                                                `;
                                            }}
                                        />
                                    </div>

                                    <div className="w-full pt-4 mt-3 border-t border-slate-800 text-center">
                                        <p className="text-xs sm:text-sm text-slate-300 italic">
                                            "{lightboxImage.highlight}"
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatePresence>
    );
};

export default StudentReviewsModal;
