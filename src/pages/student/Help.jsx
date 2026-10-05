import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { contactService } from '../../services/new-api';
import { toast } from 'react-toastify';
import {
    HelpCircle,
    MessageSquare,
    Mail,
    Phone,
    Send,
    Search,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Sparkles,
    CheckCircle2,
    Clock,
    Shield,
    BookOpen,
    GraduationCap,
    CreditCard,
    Laptop,
    AlertCircle,
    Loader2,
    LifeBuoy,
    Check,
    MessageCircle
} from 'lucide-react';

const Help = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { user } = useAuth();

    // FAQ Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [faqCategory, setFaqCategory] = useState('all');
    const [expandedFaq, setExpandedFaq] = useState(null);

    // Support Form State
    const [ticketCategory, setTicketCategory] = useState('courses');
    const [formData, setFormData] = useState({
        name: user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || ''),
        email: user?.email || '',
        phone: user?.phone || '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    // FAQ Knowledge Base
    const faqs = useMemo(() => [
        {
            id: 1,
            category: 'courses',
            question: 'كيف يمكنني الوصول إلى محاضرات الدورة بعد إتمام الاشتراك؟',
            answer: 'بمجرد تأكيد عملية الدفع، ستظهر الدورة فوراً في قائمة "دوراتي" في لوحة التحكم الخاصة بك. يمكنك الدخول إليها في أي وقت ومشاهدة مقاطع الفيديو والمواد التعليمية المرفقة، أو الانضمام إلى جلسات البث الحي المباشرة في المواعيد المقررة.'
        },
        {
            id: 2,
            category: 'courses',
            question: 'ما هو الفرق بين الدورات المسجلة والدورات المباشرة والحضورية؟',
            answer: 'الدورات المسجلة (Recorded) تتيح لك الدراسة بالوتيرة التي تناسبك في أي وقت. الدورات المباشرة (Live) تعقد في أوقات محددة عبر منصات تفاعلية مع المدرب مباشرة. أما الدورات الحضورية (Onsite) فتعقد في قاعات ومقرات الأكاديمية مع تقديم كود QR مخصص لإثبات الحضور.'
        },
        {
            id: 3,
            category: 'certificates',
            question: 'متى تصدر شهادة إتمام الدورة وكيف يمكنني التحقق منها؟',
            answer: 'تصدر الشهادة الرقمية المعتمدة تلقائياً فور إكمال متطلبات الدورة (مشاهدة المحاضرات، تسليم الواجبات، واجتياز الاختبار النهائي بنجاح). كل شهادة تحتوي على رقم تسلسلي فريد ورمز QR يمكن لأصحاب العمل والجهات مسحه ضوئياً للتحقق من مصداقيتها فورياً.'
        },
        {
            id: 4,
            category: 'certificates',
            question: 'هل شهادات أكاديمية AEC معتمدة دولياً ومحلياً؟',
            answer: 'نعم، تصدر شهادات الأكاديمية بالتعاون مع جهات تدريبية متخصصة ومعتمدة، وتعد إضافة قوية لسيرتك الذاتية وملفك على منصة LinkedIn ومطابقة للمعايير المهنية.'
        },
        {
            id: 5,
            category: 'payments',
            question: 'ما هي وسائل الدفع المتاحة على المنصة وهل هي آمنة؟',
            answer: 'نوفر الدفع عبر بطاقات مدى السعودية (Mada)، البطاقات الائتمانية (Visa & MasterCard)، وApple Pay من خلال بوابات دفع بنكية معتمدة ومحمية بتشفير 256-bit SSL وفق أعلى معايير الأمان المصرفي.'
        },
        {
            id: 6,
            category: 'payments',
            question: 'كيف يمكنني الحصول على إيصال أو فاتورة ضريبية رسمية للدورة؟',
            answer: 'يمكنك الانتقال إلى صفحة "المدفوعات والاشتراكات" في لوحة التحكم وتحميل ملف PDF يحتوي على إيصال الدفع المعتمد والرقم التسلسلي لأي دورة قمت بالاشتراك بها.'
        },
        {
            id: 7,
            category: 'technical',
            question: 'أواجه مشكلة في تشغيل الفيديو أو الصوت، ماذا أفعل؟',
            answer: 'تأكد أولاً من استقرار اتصال الإنترنت لديك. نوصي باستخدام متصفح حديث مثل Google Chrome أو Firefox وتحديثه لآخر إصدار. إذا استمرت المشكلة، يرجى مسح ملفات تعريف الارتباط (Cache) أو مراسلتنا فوراً عبر نموذج الدعم بالأسفل.'
        },
        {
            id: 8,
            category: 'technical',
            question: 'هل يمكنني متابعة الدورة من الجوال أو التابلت؟',
            answer: 'نعم بكل تأكيد! تم تصميم منصة AEC لتكون متجاوبة بالكامل على جميع الأجهزة الذكية بما فيها هواتف Android وiOS والأجهزة اللوحية دون الحاجة لتثبيت برامج إضافية.'
        }
    ], []);

    // Filter FAQs by Category and Search Query
    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesCat = faqCategory === 'all' || faq.category === faqCategory;
            const matchesQuery = !searchQuery ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesQuery;
        });
    }, [faqs, faqCategory, searchQuery]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit Support Ticket via contactService
    const handleSubmitTicket = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error(t('student.settings.help.nameRequired', 'يرجى إدخال اسمك'));
            return;
        }

        if (!formData.email.trim()) {
            toast.error(t('student.settings.help.emailRequired', 'يرجى إدخال بريدك الإلكتروني'));
            return;
        }

        if (!formData.message.trim() || formData.message.trim().length < 10) {
            toast.error(t('student.settings.help.messageMinLength', 'يرجى كتابة تفاصيل المشكلة (10 أحرف على الأقل)'));
            return;
        }

        try {
            setSubmitting(true);

            // Construct payload with category and subject
            const categoryLabels = {
                courses: 'استفسار عن الدورات والمحتوى',
                payments: 'مشكلة في الدفع أو الفواتير',
                certificates: 'استفسار عن الشهادات والاعتمادات',
                technical: 'مشكلة تقنية أو صعوبة تشغيل',
                other: 'ملاحظة عامة أو اقتراح'
            };

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: `[القسم: ${categoryLabels[ticketCategory] || ticketCategory}] ${formData.subject ? `[الموضوع: ${formData.subject}] ` : ''}${formData.message.trim()}${formData.phone ? ` - هاتف: ${formData.phone}` : ''}`
            };

            await contactService.submitContactForm(payload);

            setSubmittedSuccess(true);
            toast.success(t('student.settings.help.ticketSent', 'تم إرسال تذكرتك بنجاح! سيتواصل معك فريق الدعم قريباً'));
            
            // Clear message
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        } catch (error) {
            console.error('Error submitting support ticket:', error);
            toast.error(error.response?.data?.message || t('student.settings.help.ticketFailed', 'تعذّر إرسال التذكرة، يرجى المحاولة لاحقاً'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8" dir={t('autoGenerated.ltr', `ltr`)}>

            {/* HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white shadow-xl shadow-blue-900/10 p-6 sm:p-10">
                <div className="absolute top-0 end-0 -mt-10 -me-10 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 start-1/3 -mb-10 w-60 h-60 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-blue-100 border border-white/10">
                        <LifeBuoy className="w-3.5 h-3.5 text-blue-300" />
                        <span>{t('student.settings.help.badge', 'مركز المساعدة وخدمة الطلاب')}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                        {t('student.settings.help.heroTitle', 'كيف يمكننا مساعدتك اليوم؟')}
                    </h1>

                    <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                        {t('student.settings.help.heroSubtitle', 'فريق الدعم الأكاديمي والتقني في خدمتك. تصفح الأسئلة الشائعة للحصول على إجابات سريعة، أو أرسل استفسارك مباشرة وسيقوم فريقنا بمساعدتك.')}
                    </p>

                    {/* Search Bar */}
                    <div className="pt-2">
                        <div className="relative max-w-xl">
                            <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('student.settings.help.searchPlaceholder', 'ابحث عن إجابة (مثال: الشهادات، الدفع، الدورات المباشرة...)')}
                                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl ps-12 pe-4 py-3.5 text-sm placeholder:text-slate-400 shadow-lg shadow-black/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK CONTACT CHANNELS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Submit Ticket */}
                <a
                    href="#support-form"
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all group block"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('student.settings.help.ticketTitle', 'تذكرة دعم مباشر')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('student.settings.help.ticketDesc', 'أرسل تفاصيل مشكلتك واستلم الرد على بريدك')}
                    </p>
                </a>

                {/* WhatsApp Support */}
                <a
                    href="https://wa.me/966540098736"
                    target="_blank"
                    rel="noreferrer"
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all group block"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {t('student.settings.help.whatsappTitle', 'واتساب الأكاديمية')}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('student.settings.help.whatsappDesc', 'تواصل فوري وسريع مع خدمة العملاء')}
                    </p>
                </a>

                {/* Email Support */}
                <a
                    href="mailto:info@aectraining.com.sa"
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all group block"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('student.settings.help.emailTitle', 'البريد الإلكتروني')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono" dir="ltr">
                        info@aectraining.com.sa
                    </p>
                </a>

                {/* Working Hours & SLA */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('student.settings.help.hoursTitle', 'ساعات العمل')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        السبت - الخميس: 9:00 ص - 9:00 م<br />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">متوسط الرد: أقل من ساعتين</span>
                    </p>
                </div>

            </div>

            {/* FREQUENTLY ASKED QUESTIONS (FAQS) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{t('student.settings.help.faqTitle', 'الأسئلة الشائعة')}</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('student.settings.help.faqSubtitle', 'إجابات وافية لأكثر الاستفسارات شيوعاً بين الطلاب')}
                        </p>
                    </div>

                    {/* FAQ Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                        {[
                            { id: 'all', label: 'الكل' },
                            { id: 'courses', label: 'الدورات' },
                            { id: 'certificates', label: 'الشهادات' },
                            { id: 'payments', label: 'المدفوعات' },
                            { id: 'technical', label: 'التقنية' }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFaqCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                    faqCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredFaqs.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            لا توجد أسئلة تطابق بحثك حالياً.
                        </div>
                    ) : (
                        filteredFaqs.map((faq) => {
                            const isOpen = expandedFaq === faq.id;
                            return (
                                <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                                        className="w-full flex items-center justify-between gap-4 text-start font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        <span>{faq.question}</span>
                                        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed ps-2 pe-6">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* INTERACTIVE SUPPORT TICKET FORM */}
            <div id="support-form" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-20">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        <Send className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('student.settings.help.formTitle', 'إرسال طلب مساعدة أو استفسار')}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('student.settings.help.formSubtitle', 'املأ البيانات وسيقوم فريق الدعم الفني بمراجعة طلبك والتواصل معك')}
                        </p>
                    </div>
                </div>

                {submittedSuccess ? (
                    <div className="p-8 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <Check className="w-7 h-7 stroke-[3]" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('student.settings.help.successTitle', 'تم استلام تذكرتك بنجاح!')}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                                {t('student.settings.help.successDesc', 'شكراً لتواصلك. قام النظام بإرسال إشعار لفريق الدعم، وسيتم الرد على بريدك الإلكتروني خلال ساعات العمل الرسمية.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSubmittedSuccess(false)}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                            {t('student.settings.help.sendAnother', 'إرسال تذكرة أخرى')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                        
                        {/* Category Selector Cards */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('student.settings.help.selectCategory', 'نوع الاستفسار / القسم المختص')} <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'courses', label: 'الدورات والمحتوى', icon: <BookOpen className="w-4 h-4" /> },
                                    { id: 'payments', label: 'المدفوعات والفواتير', icon: <CreditCard className="w-4 h-4" /> },
                                    { id: 'certificates', label: 'الشهادات والاعتماد', icon: <GraduationCap className="w-4 h-4" /> },
                                    { id: 'technical', label: 'مشكلة تقنية في الموقع', icon: <Laptop className="w-4 h-4" /> },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setTicketCategory(cat.id)}
                                        className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                            ticketCategory === cat.id
                                                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 font-bold'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        {cat.icon}
                                        <span className="text-xs">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Student Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.help.name', 'اسم الطالب')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="الاسم الكامل"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.help.email', 'البريد الإلكتروني للرد')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="example@mail.com"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Phone (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.help.phone', 'رقم الهاتف / الواتساب (اختياري)')}
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="+966 50 123 4567"
                                    dir="ltr"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('student.settings.help.subject', 'عنوان الطلب أو المشكلة')}
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleFormChange}
                                    placeholder="مثال: صعوبة تحميل ملف المحاضرة رقم 3"
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Message Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {t('student.settings.help.message', 'تفاصيل المشكلة أو الاستفسار')} <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                required
                                rows="5"
                                minLength={10}
                                value={formData.message}
                                onChange={handleFormChange}
                                placeholder={t('student.settings.help.messagePlaceholder', 'اشرح مشكلتك بالتفصيل (اسم الدورة، الخطأ الذي يظهر لك...) حتى نتمكن من مساعدتك بأسرع شكل ممكن.')}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
                                <span>{t('student.settings.help.minChars', '10 أحرف كحد أدنى')}</span>
                                <span>{formData.message.length} حرف</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t('student.settings.help.submitting', 'جاري إرسال الطلب...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>{t('student.settings.help.submitTicket', 'إرسال تذكرة الدعم')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

        </div>
    );
};

export default Help;
