import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { paymentService, couponService } from '../services/new-api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { 
    CreditCard, 
    ShieldCheck, 
    Lock, 
    Tag, 
    ArrowLeft, 
    ArrowRight, 
    Trash2, 
    CheckCircle2, 
    Sparkles, 
    Clock, 
    ChevronRight, 
    AlertCircle, 
    Zap, 
    Check, 
    Loader2,
    ShoppingBag,
    Receipt,
    Calendar
} from 'lucide-react';

const Checkout = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { cartItems, removeFromCart, getTotalPrice } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();
    
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    
    // Payment method selection: 'paymob' | 'tabby' | 'tamara'
    const [paymentMethod, setPaymentMethod] = useState('paymob');

    // Tax calculation (15%) — tax is applied after discount
    const TAX_RATE = 0.15;
    const cartSubtotal = getTotalPrice();
    const subtotal = appliedCoupon?.subtotal ?? cartSubtotal;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = appliedCoupon?.taxAmount ?? discountedSubtotal * TAX_RATE;
    const totalWithTax = appliedCoupon?.total ?? discountedSubtotal + taxAmount;

    // Installment calculation for Tabby / Tamara (4 equal payments)
    const installmentAmount = (totalWithTax / 4).toFixed(2);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            const intendedPath = `${location.pathname}${location.search || ''}`;
            localStorage.setItem('lastPath', intendedPath);
            navigate(`/login?redirect=${encodeURIComponent(intendedPath)}`, { replace: true });
            return;
        }

        // If cart is empty, redirect to explore page
        if (!loading && cartItems.length === 0) {
            navigate('/explore');
        }
    }, [cartItems, navigate, isAuthenticated, loading, location.pathname, location.search]);

    // Clear applied coupon if cart contents change
    useEffect(() => {
        if (appliedCoupon) {
            setAppliedCoupon(null);
            setCouponCode('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems.length, cartSubtotal]);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.error(t('checkout.toast.emptyCart', 'سلة التسوق فارغة!'));
            return;
        }

        if (paymentMethod === 'tabby' || paymentMethod === 'tamara') {
            toast.info(isRTL 
                ? 'خدمة التقسيط عبر تابي وتمارا قيد التفعيل وستكون متاحة لجميع عملائنا الكرام خلال أيام قليلة. يرجى إتمام الدفع عبر البطاقة البنكية حالياً.' 
                : 'Tabby and Tamara installment services are being finalized and will be available to all customers in a few days. Please use card payment for now.'
            );
            setPaymentMethod('paymob');
            return;
        }

        setIsProcessingPayment(true);
        
        try {
            const courseIds = cartItems.map(course => course._id);
            const paymentData = await paymentService.createCheckoutSession(
                courseIds,
                appliedCoupon?.code || null,
                paymentMethod
            );
            
            // Redirect to payment page (Paymob uses iframURL, Tabby uses paymentUrl)
            const redirectUrl = paymentData.iframURL || paymentData.paymentUrl;
            if (redirectUrl) {
                // Store order ID and payment details in localStorage
                localStorage.setItem('pendingOrderId', paymentData.orderId);
                localStorage.setItem('pendingCourseIds', JSON.stringify(courseIds));
                localStorage.setItem('selectedPaymentMethod', paymentMethod);
                
                // Redirect to payment page
                window.location.href = redirectUrl;
            } else {
                throw new Error('Payment URL not received');
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            const message =
                error.response?.data?.message ||
                t('checkout.toast.paymentFailed', 'تعذّر بدء الدفع. حاول مرة أخرى.');
            toast.error(message);
            setIsProcessingPayment(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error(t('checkout.toast.enterCoupon', 'يرجى إدخال رمز الخصم'));
            return;
        }

        if (cartItems.length === 0) {
            toast.error(t('checkout.toast.emptyCart', 'سلة التسوق فارغة!'));
            return;
        }

        setIsApplyingCoupon(true);

        try {
            const courseIds = cartItems.map((course) => course._id);
            const result = await couponService.validateCoupon(
                couponCode.trim(),
                courseIds
            );

            if (!result.success) {
                throw new Error(result.message || t('checkout.toast.invalidCoupon', 'قسيمة غير صالحة.'));
            }

            setAppliedCoupon({
                code: result.data.code,
                discountType: result.data.discountType,
                discountValue: result.data.discountValue,
                discountAmount: result.data.discountAmount,
                subtotal: result.data.subtotal,
                taxAmount: result.data.taxAmount,
                total: result.data.total,
            });
            setCouponCode(result.data.code);
            toast.success(result.message || t('checkout.toast.couponApplied', 'تم تطبيق القسيمة بنجاح.'));
        } catch (error) {
            console.error('Coupon apply error:', error);
            setAppliedCoupon(null);
            const message =
                error.response?.data?.message ||
                error.message ||
                t('checkout.toast.invalidCoupon', 'قسيمة غير صالحة.');
            toast.error(message);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        toast.info(t('checkout.toast.couponRemoved', 'تم إزالة القسيمة'));
    };

    const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    return (
        <div 
            className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation Back button */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                    >
                        <BackIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                        <span>{t('checkout.back', 'العودة')}</span>
                    </button>

                    {/* Step indicator */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {isRTL ? 'السلة' : 'Cart'}
                        </span>
                        <span>/</span>
                        <span className="text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                            {isRTL ? 'إتمام الشراء والدفع' : 'Payment'}
                        </span>
                        <span>/</span>
                        <span>{isRTL ? 'تأكيد التسجيل' : 'Confirmation'}</span>
                    </div>
                </div>

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('checkout.title', 'إتمام الشراء والدفع')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('checkout.selectPaymentMethodSub', 'جميع المعاملات المالية مشفرة ومحمية بأعلى معايير الأمان المصرفي SSL')}
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column: Payment Methods & Cart Items */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        
                        {/* ======================================================== */}
                        {/* SECTION 1: PAYMENT METHOD SELECTION */}
                        {/* ======================================================== */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {t('checkout.selectPaymentMethod', 'اختر طريقة الدفع')}
                                        </h2>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {isRTL ? 'اختر الوسيلة الأنسب لك لإتمام عملية الدفع بأمان' : 'Choose your preferred secure payment method'}
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>{isRTL ? 'دفع مشفّر وآمن' : 'SSL Encrypted'}</span>
                                </span>
                            </div>

                            {/* Installments Notice Banner */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-xs">
                                    <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-0.5 text-xs sm:text-sm">
                                        {isRTL ? 'تنويه هام: خدمات التقسيط (تابي وتمارا)' : 'Notice: Installment Services (Tabby & Tamara)'}
                                    </h4>
                                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                                        {isRTL 
                                            ? 'خدمات التقسيط عبر تابي (Tabby) وتمارا (Tamara) ستكون متاحة لجميع عملائنا الكرام خلال أيام قليلة بإذن الله. يمكنك إتمام دفع مشترياتك بأمان حالياً عبر بطاقات مدى وفيزا وماستركارد (Paymob).' 
                                            : 'Installment payment services via Tabby and Tamara will be available to all customers within a few days. You can currently complete your purchase securely via Mada, Visa, and Mastercard.'}
                                    </p>
                                </div>
                            </div>

                            {/* 3 Payment Options */}
                            <div className="grid gap-3.5">
                                {/* 1. Paymob (Cards / Mada / Visa / Mastercard) - ACTIVE */}
                                <label 
                                    className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                        paymentMethod === 'paymob'
                                            ? 'border-primary-600 bg-primary-50/20 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-500/10'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="paymob" 
                                        checked={paymentMethod === 'paymob'}
                                        onChange={() => setPaymentMethod('paymob')}
                                        className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white text-base">
                                                    {t('checkout.paymobTitle', 'فيزا أو بطاقة بنكية')}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                                                    {t('checkout.paymobBadge', 'فوري ومباشر')}
                                                </span>
                                            </div>

                                            {/* Card Brand Badges */}
                                            <div className="flex items-center gap-1.5">
                                                {/* Mada Badge */}
                                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px] tracking-wider shadow-xs">
                                                    mada
                                                </span>
                                                {/* VISA Badge */}
                                                <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-black italic text-[10px] tracking-wider shadow-xs">
                                                    VISA
                                                </span>
                                                {/* Mastercard Badge */}
                                                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px] shadow-xs flex items-center gap-0.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block -mr-1"></span>
                                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {t('checkout.paymobDesc', 'مدى، فيزا، ماستركارد، وبطاقات الدفع المباشر عبر Paymob الآمن')}
                                        </p>
                                    </div>
                                </label>

                                {/* 2. Tabby (Installments - Suspended / Coming Soon) */}
                                <div 
                                    onClick={() => toast.info(isRTL ? 'خدمة التقسيط عبر تابي ستكون متاحة لجميع عملائنا الكرام خلال أيام قليلة. يرجى الدفع عبر البطاقة البنكية حالياً.' : 'Tabby installment service will be available within a few days. Please use card payment for now.')}
                                    className="relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 opacity-80 cursor-not-allowed transition-all"
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="tabby"
                                        disabled
                                        checked={false}
                                        className="mt-1 w-4 h-4 text-slate-300 cursor-not-allowed"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-base">
                                                    {t('checkout.tabbyTitle', 'تابي (Tabby)')}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{isRTL ? 'متاح خلال أيام' : 'Coming in a few days'}</span>
                                                </span>
                                            </div>

                                            {/* Tabby Logo Badge */}
                                            <span className="px-2.5 py-1 rounded-md bg-[#292929] text-[#39E992] font-black text-xs tracking-wider shadow-xs opacity-75">
                                                tabby
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {t('checkout.tabbyDesc', 'قسّم فاتورتك على 4 دفعات شهرية ميسرة بدون فوائد أو رسوم إضافية')}
                                        </p>

                                        {/* Notice highlight */}
                                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                                            <span>
                                                {isRTL ? '⏳ قيد التفعيل: ستتاح الخدمة لعملائنا خلال أيام قليلة' : '⏳ Finalizing integration: available within a few days'}
                                            </span>
                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                0% {isRTL ? 'مرابحة' : 'Interest'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Tamara (Installments - Suspended / Coming Soon) */}
                                <div 
                                    onClick={() => toast.info(isRTL ? 'خدمة التقسيط عبر تمارا ستكون متاحة لجميع عملائنا الكرام خلال أيام قليلة. يرجى الدفع عبر البطاقة البنكية حالياً.' : 'Tamara installment service will be available within a few days. Please use card payment for now.')}
                                    className="relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 opacity-80 cursor-not-allowed transition-all"
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="tamara"
                                        disabled
                                        checked={false}
                                        className="mt-1 w-4 h-4 text-slate-300 cursor-not-allowed"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-base">
                                                    {t('checkout.tamaraTitle', 'تمارا (Tamara)')}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{isRTL ? 'متاح خلال أيام' : 'Coming in a few days'}</span>
                                                </span>
                                            </div>

                                            <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#FF5C39] to-[#FF8C38] text-white font-extrabold text-xs tracking-wider shadow-xs opacity-75">
                                                tamara
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {t('checkout.tamaraDesc', 'قسّم مشترياتك على 4 دفعات بدون أي رسوم تأخير متوافقة مع الشريعة')}
                                        </p>

                                        {/* Notice highlight */}
                                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                                            <span>
                                                {isRTL ? '⏳ قيد التفعيل: ستتاح الخدمة لعملائنا خلال أيام قليلة' : '⏳ Finalizing integration: available within a few days'}
                                            </span>
                                            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                                                {isRTL ? 'متوافق مع الشريعة' : 'Sharia Approved'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ======================================================== */}
                        {/* SECTION 2: CART ITEMS */}
                        {/* ======================================================== */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {t('checkout.cartItems', 'عناصر السلة')}
                                    </h2>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {t('checkout.itemCount', { count: cartItems.length })}
                                </span>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>{t('checkout.emptyCart', 'سلة التسوق فارغة')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {cartItems.map((course) => {
                                        const instructorName = course.instructor?.name || 
                                            `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() || 
                                            t('course.card.unknownInstructor', 'محاضر معتمد');

                                        return (
                                            <div key={course._id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group">
                                                {/* Thumbnail */}
                                                <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700/60 relative">
                                                    {course.thumbnail ? (
                                                        <img 
                                                            src={course.thumbnail} 
                                                            alt={course.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-primary-600 text-lg bg-primary-50 dark:bg-primary-950/60">
                                                            {course.title?.charAt(0) || 'C'}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Course Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                        {t('checkout.byInstructor', { name: instructorName })}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                        {/* Price Tag */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm sm:text-base text-primary-600 dark:text-primary-400">
                                                                {course.displayPrice || course.price} {isRTL ? 'ر.س' : 'SAR'}
                                                            </span>
                                                            {course.originalPrice && course.originalPrice > (course.displayPrice || course.price) && (
                                                                <span className="text-xs text-slate-400 line-through">
                                                                    {course.originalPrice} {isRTL ? 'ر.س' : 'SAR'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeFromCart(course._id)}
                                                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                            title={t('checkout.remove', 'إزالة')}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">{t('checkout.remove', 'إزالة')}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full lg:w-1/3 sticky top-6 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-6 space-y-6">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('checkout.orderSummary', 'ملخص الطلب')}
                                </h2>
                            </div>

                            {/* Price Calculation Rows */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{t('checkout.subtotal', 'المجموع الفرعي')}</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {subtotal.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span className="flex items-center gap-1">
                                            <Tag className="w-3.5 h-3.5" />
                                            <span>
                                                {t('checkout.discount', 'الخصم')}
                                                {appliedCoupon ? ` (${appliedCoupon.code})` : ''}
                                            </span>
                                        </span>
                                        <span>
                                            -{discountAmount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{t('checkout.tax', 'الضريبة (15%)')}</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {taxAmount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>

                                {/* Grand Total Box */}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/80 to-indigo-50/40 dark:from-primary-950/40 dark:to-indigo-950/30 border border-primary-200/80 dark:border-primary-800/80 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                {t('checkout.totalIncludingTax', 'الإجمالي شامل الضريبة')}
                                            </span>
                                            <span className="text-2xl font-black text-primary-700 dark:text-primary-300">
                                                {totalWithTax.toFixed(2)} <span className="text-sm font-bold">{isRTL ? 'ر.س' : 'SAR'}</span>
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1.5 border-t border-primary-200/50 dark:border-primary-800/50 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                {isRTL 
                                                    ? 'خدمة التقسيط على 4 دفعات عبر (تابي وتمارا) ستتاح لعملائنا الكرام خلال أيام قليلة' 
                                                    : '4-installment payment service (Tabby & Tamara) will be available within a few days'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* ======================================================== */}
                            {/* Coupon Code Section */}
                            {/* ======================================================== */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('checkout.couponCode', 'كوبون الخصم')}
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder={t('checkout.couponPlaceholder', 'أدخل رمز الخصم')}
                                            disabled={isApplyingCoupon || !!appliedCoupon}
                                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-60"
                                        />
                                    </div>

                                    {appliedCoupon ? (
                                        <button 
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                                        >
                                            {t('checkout.removeCoupon', 'إزالة')}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode.trim()}
                                            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-sm"
                                        >
                                            {isApplyingCoupon ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                t('checkout.apply', 'تطبيق')
                                            )}
                                        </button>
                                    )}
                                </div>

                                {appliedCoupon && (
                                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>
                                            {t('checkout.couponAppliedNote', { code: appliedCoupon.code })}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* ======================================================== */}
                            {/* Main Checkout CTA Button */}
                            {/* ======================================================== */}
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessingPayment || cartItems.length === 0}
                                    className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 ${
                                        isProcessingPayment || cartItems.length === 0 
                                            ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                                            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>{t('checkout.processing', 'جاري تحويلك لبوابة الدفع بأمان...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>
                                                {paymentMethod === 'tabby'
                                                    ? (isRTL ? `المتابعة مع تابي (${installmentAmount} ر.س / شهرياً)` : `Pay with Tabby (${installmentAmount} SAR / mo)`)
                                                    : paymentMethod === 'tamara'
                                                    ? (isRTL ? `المتابعة مع تمارا (${installmentAmount} ر.س / شهرياً)` : `Pay with Tamara (${installmentAmount} SAR / mo)`)
                                                    : (isRTL ? `إتمام الدفع (${totalWithTax.toFixed(2)} ر.س)` : `Complete Payment (${totalWithTax.toFixed(2)} SAR)`)}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Guarantee / Security note */}
                                <div className="text-center pt-2 space-y-2">
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>{t('checkout.securityGuarantee', 'دفع آمن ومحمي 100%')}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                                        {t('checkout.securityGuaranteeDesc', 'معلوماتك المالية مشفرة بالكامل ولا يتم تخزين بيانات بطاقتك أبداً.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
