import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import {
    BookOpen,
    FileCheck,
    Compass,
    Search,
    Trophy,
    CheckSquare,
    MessagesSquare,
    Layers,
    FileText,
    CalendarCheck,
    ShieldCheck,
    Database,
    Library,
    Sparkles,
    Award,
    CheckCircle2,
    Check,
    ArrowRight,
    ArrowLeft,
    Eye,
    Target,
    HeartHandshake,
    GraduationCap,
    Users,
    Clock,
    Globe2,
    Building,
    PhoneCall
} from 'lucide-react';

const SERVICE_KEYS = [
    'lessonExplanations',
    'examPreparations',
    'courseFollowUps',
    'researchSupport',
    'trainingCourses',
    'quizzesHelp',
    'consultation',
    'finalYearProject',
    'researchPublishing',
    'prometricBookings',
    'trueProfile',
    'dataflowServices',
    'questionBanks',
    'customizedServices',
];

const SERVICE_ICONS = {
    lessonExplanations: BookOpen,
    examPreparations: FileCheck,
    courseFollowUps: Compass,
    researchSupport: Search,
    trainingCourses: Trophy,
    quizzesHelp: CheckSquare,
    consultation: MessagesSquare,
    finalYearProject: Layers,
    researchPublishing: FileText,
    prometricBookings: CalendarCheck,
    trueProfile: ShieldCheck,
    dataflowServices: Database,
    questionBanks: Library,
    customizedServices: Sparkles,
};

const SERVICE_CATEGORY_MAP = {
    lessonExplanations: 'academic',
    examPreparations: 'academic',
    courseFollowUps: 'academic',
    researchSupport: 'academic',
    trainingCourses: 'professional',
    quizzesHelp: 'academic',
    consultation: 'professional',
    finalYearProject: 'academic',
    researchPublishing: 'academic',
    prometricBookings: 'international',
    trueProfile: 'international',
    dataflowServices: 'international',
    questionBanks: 'international',
    customizedServices: 'professional',
};

const WHY_CHOOSE_ITEMS = [
    {
        key: 'firstArab',
        icon: Trophy,
        badge: 'ريادة عربية',
        color: 'from-blue-600 to-indigo-700',
        lightBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
        key: 'flexible',
        icon: Layers,
        badge: 'مرونة وتكامل',
        color: 'from-emerald-600 to-teal-700',
        lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
        key: 'affordable',
        icon: Award,
        badge: 'قيمة تنافسية',
        color: 'from-amber-500 to-orange-600',
        lightBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
        key: 'trusted',
        icon: ShieldCheck,
        badge: 'ثقة واعتماد',
        color: 'from-purple-600 to-violet-700',
        lightBg: 'bg-purple-50 text-purple-700 border-purple-200'
    }
];

function AboutUs() {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const [activeServiceTab, setActiveServiceTab] = useState('all');

    useEffect(() => {
        document.title = `${t('about.title', 'من نحن')} | ${t('common.meta.siteTitle', 'أكاديمية AEC')}`;
    }, [t]);

    const getServiceCategoryLabel = (cat) => {
        if (isRTL) {
            return {
                all: 'جميع الخدمات (14)',
                academic: 'الدعم والتدريس الأكاديمي',
                professional: 'التدريب والاستشارات المهنية',
                international: 'الاعتمادات والفحص الدولي',
            }[cat];
        }
        return {
            all: 'All Services (14)',
            academic: 'Academic Support',
            professional: 'Training & Consulting',
            international: 'International Verification',
        }[cat];
    };

    const filteredServices = SERVICE_KEYS.filter((key) => {
        if (activeServiceTab === 'all') return true;
        return SERVICE_CATEGORY_MAP[key] === activeServiceTab;
    });

    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ========================================================================= */}
            {/* HERO SECTION: Cinematic Deep Navy with Brand Mesh & Key Action Buttons    */}
            {/* ========================================================================= */}
            <section className="relative bg-gradient-to-b from-[#071942] via-[#091f52] to-[#071942] text-white pt-16 pb-24 lg:pb-32 overflow-hidden border-b border-[#004C97]/30">
                {/* Ambient Decorative Lighting */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#004C97]/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F7931E]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Eyebrow Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md mb-6 shadow-sm">
                            <Sparkles className="w-4 h-4 text-[#F7931E]" />
                            <span>{t('about.subtitle', 'تعرّف أكثر على أكاديمية AEC')}</span>
                        </div>

                        {/* Hero Title */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                            {t('about.heroTitle', 'مرحباً بك في أكاديمية AEC')}
                        </h1>

                        {/* Hero Subtitle */}
                        <p className="text-lg sm:text-2xl font-bold text-[#F7931E] mb-6">
                            {t('about.heroSubtitle', 'مركز التعليم المتقدم — Advanced Education Center')}
                        </p>

                        {/* Tagline */}
                        <p className="text-blue-100/90 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed mb-10">
                            {t('about.heroTagline', 'أول أكاديمية عربية متخصصة في التدريب والتعليم في المملكة العربية السعودية، توفر حلولاً تعليمية واستشارية متكاملة للأفراد ورواد الأعمال والمؤسسات.')}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/explore"
                                className="px-8 py-4 bg-[#004C97] hover:bg-[#003870] text-white font-extrabold rounded-2xl shadow-xl shadow-blue-950/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm sm:text-base"
                            >
                                <span>{t('about.exploreCourses', 'استكشف دوراتنا')}</span>
                                <ArrowIcon className="w-4 h-4" />
                            </Link>

                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm sm:text-base"
                            >
                                <PhoneCall className="w-4 h-4 text-blue-300" />
                                <span>{t('contact.title', 'تواصل معنا')}</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* FLOATING STATS STRIP: AEC in Numbers                                      */}
            {/* ========================================================================= */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 lg:-mt-16 z-20">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/80 border border-slate-200/80">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-slate-100">
                        
                        <div className="pt-4 md:pt-0">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004C97] flex items-center justify-center mx-auto mb-3">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">2020</div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                                {t('autoGenerated.founded_established', `Founded & Established`)}
                            </p>
                        </div>

                        <div className="pt-4 md:pt-0">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7931E] flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">+15,000</div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                                {t('autoGenerated.enrolled_students', `Enrolled Students`)}
                            </p>
                        </div>

                        <div className="pt-4 md:pt-0">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <Award className="w-6 h-6" />
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">+120</div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                                {t('autoGenerated.accredited_programs', `Accredited Programs`)}
                            </p>
                        </div>

                        <div className="pt-4 md:pt-0">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                                <Globe2 className="w-6 h-6" />
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">7+</div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                                {t('autoGenerated.gcc_arab_countries', `GCC & Arab Countries`)}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* ABOUT STORY SECTION: Narrative & Mission                                  */}
            {/* ========================================================================= */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Visual Card / Left Column */}
                        <div className="lg:col-span-5">
                            <div className="relative">
                                {/* Ambient backglow */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#004C97]/20 to-[#F7931E]/20 rounded-3xl blur-2xl -z-10" />

                                <div className="bg-gradient-to-br from-[#071942] to-[#004C97] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931E]/20 rounded-full blur-3xl pointer-events-none" />

                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                                        <GraduationCap className="w-8 h-8 text-[#F7931E]" />
                                    </div>

                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-100 border border-white/20">
                                        {t('about.learningExcellence', 'التميز في التعلم')}
                                    </span>

                                    <h3 className="text-2xl font-black text-white mt-4 mb-2">
                                        {t('about.heroSubtitle', 'مركز التعليم المتقدم')}
                                    </h3>

                                    <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                        {t('about.learningTagline', 'تمكين العقول وبناء الكفاءات من خلال حلول تدريبية وتعليمية معتمدة ومتطورة.')}
                                    </p>

                                    <div className="space-y-3 pt-6 border-t border-white/15 text-sm">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <span className="text-blue-50 font-medium">أول أكاديمية عربية متخصصة بالمملكة</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <span className="text-blue-50 font-medium">تدريب مهني وتأهيل لسوق العمل</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <span className="text-blue-50 font-medium">اعتمادات دولية Dataflow & Prometric</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Narrative / Right Column */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004C97] border border-blue-200 mb-3">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{t('autoGenerated.our_story_purpose', `Our Story & Purpose`)}</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                    {t('about.aboutTitle', 'عن أكاديمية AEC')}
                                </h2>
                            </div>

                            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
                                <p className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-slate-800 font-medium">
                                    {t('about.aboutP1')}
                                </p>
                                <p>
                                    {t('about.aboutP2')}
                                </p>
                                <p>
                                    {t('about.aboutP3')}
                                </p>
                            </div>

                            <div className="pt-4 flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                                    <Building className="w-4 h-4 text-[#004C97]" />
                                    <span>{t('autoGenerated.solutions_for_individuals_ente', `Solutions for Individuals & Enterprises`)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                                    <Award className="w-4 h-4 text-[#F7931E]" />
                                    <span>{t('autoGenerated.accredited_certifications', `Accredited Certifications`)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* PILLARS SECTION: Vision, Mission, and Core Values                         */}
            {/* ========================================================================= */}
            <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004C97] border border-blue-200 mb-3">
                            <Target className="w-3.5 h-3.5" />
                            <span>{t('autoGenerated.strategic_pillars', `Strategic Pillars`)}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            {t('autoGenerated.vision_mission_core_values', `Vision, Mission & Core Values`)}
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            {t('autoGenerated.anchored_by_proven_educational', `Anchored by proven educational principles to transform careers and unlock leadership potential.`)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Vision Card */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
                            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-[#004C97] absolute top-0 inset-x-0" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#004C97] flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                    <Eye className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">
                                    {t('autoGenerated.our_vision', `Our Vision`)}
                                </h3>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    {t('autoGenerated.to_be_the_leading_arab_educati', `To be the leading Arab educational and training academy empowering individuals and entrepreneurs to excel globally.`)}
                                </p>
                            </div>
                        </div>

                        {/* Mission Card */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#F7931E] to-amber-500 absolute top-0 inset-x-0" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#F7931E] flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                    <Target className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">
                                    {t('autoGenerated.our_mission', `Our Mission`)}
                                </h3>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    {t('autoGenerated.delivering_comprehensive_educa', `Delivering comprehensive educational and vocational programs that bridge skills gaps and drive sustainable career success.`)}
                                </p>
                            </div>
                        </div>

                        {/* Values Card */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
                            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 inset-x-0" />
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                    <HeartHandshake className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">
                                    {t('autoGenerated.our_core_values', `Our Core Values`)}
                                </h3>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    {t('autoGenerated.academic_excellence_integrity_', `Academic excellence, integrity, innovation in methodology, and unwavering commitment to learner success.`)}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* OUR SERVICES: Categorized Tabs & Detailed Service Cards                   */}
            {/* ========================================================================= */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004C97] border border-blue-200 mb-3">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{t('about.servicesTitle', 'خدماتنا')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            {t('about.servicesTitle', 'خدماتنا الشاملة والمتكاملة')}
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            {t('about.servicesSubtitle', 'خدمات تعليمية ومهنية شاملة مصممة بعناية لتلبية كافة احتياجاتك الأكاديمية والمهنية')}
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                        {['all', 'academic', 'professional', 'international'].map((catKey) => {
                            const active = activeServiceTab === catKey;
                            return (
                                <button
                                    key={catKey}
                                    type="button"
                                    onClick={() => setActiveServiceTab(catKey)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                                        active
                                            ? 'bg-[#004C97] text-white border-[#004C97] shadow-lg shadow-blue-900/15 scale-105'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                >
                                    {getServiceCategoryLabel(catKey)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Service Cards Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence>
                            {filteredServices.map((key) => {
                                const IconComponent = SERVICE_ICONS[key] || Award;
                                const title = t(`about.services.${key}.title`);
                                const description = t(`about.services.${key}.description`);

                                return (
                                    <motion.div
                                        layout
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004C97] group-hover:bg-[#004C97] group-hover:text-white flex items-center justify-center mb-5 transition-colors duration-300">
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#004C97] transition-colors">
                                                {title}
                                            </h3>
                                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                                {description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </section>

            {/* ========================================================================= */}
            {/* WHY CHOOSE US: Feature Highlights & Trust Factors                         */}
            {/* ========================================================================= */}
            <section className="py-16 lg:py-24 bg-[#071942] text-white relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#004C97]/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F7931E]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md mb-3">
                            <Trophy className="w-3.5 h-3.5 text-[#F7931E]" />
                            <span>{t('about.whyTitle', 'لماذا تختارنا')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                            {t('about.whyTitle', 'لماذا يختار الآلاف أكاديمية AEC؟')}
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                            {t('about.whySubtitle', 'اكتشف ما يجعل أكاديمية AEC الخيار المفضل لآلاف الطلاب ورواد الأعمال والمهنيين')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WHY_CHOOSE_ITEMS.map((item) => {
                            const IconComponent = item.icon;
                            const text = t(`about.whyChoose.${item.key}`);

                            return (
                                <div
                                    key={item.key}
                                    className="bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-md rounded-3xl p-6 transition duration-300 hover:scale-[1.02] flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5 text-[#F7931E]">
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-3 ${item.lightBg}`}>
                                            {item.badge}
                                        </span>
                                        <p className="text-white font-bold text-sm sm:text-base leading-relaxed">
                                            {text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ========================================================================= */}
            {/* CALL TO ACTION: Immersive Closing Banner                                  */}
            {/* ========================================================================= */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#071942] via-[#004C97] to-[#071942] text-white rounded-3xl p-8 sm:p-14 text-center shadow-2xl">
                        
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F7931E]/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-[#F7931E]" />
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                                {t('about.ctaTitle', 'رحلة نموك وتطورك تبدأ هنا')}
                            </h2>

                            <p className="text-blue-100 text-sm sm:text-lg mb-8 leading-relaxed">
                                {t('about.ctaSubtitle', 'انضم إلى آلاف المتعلمين والمهنيين الناجحين الذين طوّروا مهاراتهم وحققوا أهدافهم مع أكاديمية AEC')}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    to="/explore"
                                    className="px-8 py-4 bg-white text-[#004C97] hover:bg-blue-50 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2"
                                >
                                    <span>{t('about.exploreCourses', 'استكشف دوراتنا الآن')}</span>
                                    <ArrowIcon className="w-4 h-4" />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2"
                                >
                                    <span>{t('contact.title', 'تواصل مع فريقنا')}</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutUs;