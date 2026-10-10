import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import {
    Crown,
    Trophy,
    Medal,
    Award,
    Star,
    CheckCircle2,
    BookOpen,
    Users,
    Sparkles,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Flame
} from 'lucide-react';
import api from '../../services/new-api';

// Fallback Top 5 in case API is offline
const fallbackTop5 = [
    {
        _id: 'top-1',
        name: 'AEC ACADEMY',
        nameEn: 'AEC ACADEMY',
        jobTitle: 'المؤسسة التعليمية المعتمدة | AEC CEO',
        photo: 'https://aec-academy.b-cdn.net/profile-photos/7a6abe43-e1b8-452b-a469-0a049905bb62.jpg',
        coursesCount: 737,
        studentsCount: 1420,
        rating: 5.0,
        reviews: 86,
        isVerified: true,
        rank: 1
    },
    {
        _id: 'top-2',
        name: 'AEC Instractor eladly',
        nameEn: 'AEC Instructor Eladly',
        jobTitle: 'كبير محاضري الهندسة وإدارة المشاريع',
        photo: 'https://aec-academy.b-cdn.net/profile-photos/082416e5-c4ee-4d7b-9ee7-3f01b9801f5a.jpg',
        coursesCount: 53,
        studentsCount: 680,
        rating: 4.9,
        reviews: 42,
        isVerified: true,
        rank: 2
    },
    {
        _id: 'top-3',
        name: 'Bahaa Adel',
        nameEn: 'Bahaa Adel',
        jobTitle: 'استشاري التراخيص الطبية والصحية المعتمدة',
        photo: 'https://aec-academy.b-cdn.net/profile-photos/f2cadf09-28dd-4189-99e0-0696d95974fd.jpg',
        coursesCount: 12,
        studentsCount: 310,
        rating: 4.9,
        reviews: 28,
        isVerified: true,
        rank: 3
    },
    {
        _id: 'top-4',
        name: 'Ahmed Mahmoud',
        nameEn: 'Ahmed Mahmoud',
        jobTitle: 'خبير السلامة والصحة المهنية وإدارة المخاطر',
        photo: '',
        coursesCount: 8,
        studentsCount: 240,
        rating: 4.8,
        reviews: 19,
        isVerified: true,
        rank: 4
    },
    {
        _id: 'top-5',
        name: 'Ahmed Nady Essa',
        nameEn: 'Ahmed Nady Essa',
        jobTitle: 'استشاري هندسة البرمجيات والحلول الرقمية',
        photo: 'https://aec-academy.b-cdn.net/profile-photos/db78d1a0-e606-42f8-82b2-dfab5811eafc.jpg',
        coursesCount: 6,
        studentsCount: 190,
        rating: 4.8,
        reviews: 15,
        isVerified: true,
        rank: 5
    }
];

// Configuration for each rank medal and theme
const rankConfig = {
    1: {
        badgeTitleAr: 'المركز الأول 🥇 خبير المنصة',
        badgeTitleEn: 'Rank #1 Gold Champion',
        badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950',
        ringColor: 'ring-amber-400/80 shadow-amber-400/30',
        cardBorder: 'border-amber-300/90 shadow-2xl shadow-amber-500/15',
        glowBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
        tagBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
        icon: Crown,
        iconColor: 'text-amber-500 fill-amber-400',
        ribbonNumber: '01'
    },
    2: {
        badgeTitleAr: 'المركز الثاني 🥈 تميز معتمد',
        badgeTitleEn: 'Rank #2 Silver Excellence',
        badgeBg: 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400 text-slate-900',
        ringColor: 'ring-slate-300/80 shadow-slate-300/30',
        cardBorder: 'border-slate-300/80 shadow-xl shadow-slate-300/15',
        glowBg: 'from-slate-200/20 via-slate-100/10 to-transparent',
        tagBg: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: Medal,
        iconColor: 'text-slate-500 fill-slate-300',
        ribbonNumber: '02'
    },
    3: {
        badgeTitleAr: 'المركز الثالث 🥉 كفاءة احترافية',
        badgeTitleEn: 'Rank #3 Bronze Elite',
        badgeBg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white',
        ringColor: 'ring-amber-600/60 shadow-amber-700/20',
        cardBorder: 'border-amber-700/30 shadow-lg shadow-amber-900/10',
        glowBg: 'from-amber-700/10 via-amber-600/5 to-transparent',
        tagBg: 'bg-amber-50/80 text-amber-950 border-amber-200/60',
        icon: Award,
        iconColor: 'text-amber-700 fill-amber-600',
        ribbonNumber: '03'
    },
    4: {
        badgeTitleAr: 'المركز الرابع 🏆 نخبة التوب 5',
        badgeTitleEn: 'Rank #4 Top 5 Elite',
        badgeBg: 'bg-gradient-to-r from-blue-600 to-[#004C97] text-white',
        ringColor: 'ring-blue-400/50 shadow-blue-500/20',
        cardBorder: 'border-blue-100 shadow-md shadow-blue-500/5',
        glowBg: 'from-blue-500/5 via-blue-500/2 to-transparent',
        tagBg: 'bg-blue-50 text-[#004C97] border-blue-100',
        icon: Trophy,
        iconColor: 'text-[#004C97]',
        ribbonNumber: '04'
    },
    5: {
        badgeTitleAr: 'المركز الخامس 🏆 نخبة التوب 5',
        badgeTitleEn: 'Rank #5 Top 5 Elite',
        badgeBg: 'bg-gradient-to-r from-blue-600 to-[#004C97] text-white',
        ringColor: 'ring-blue-400/50 shadow-blue-500/20',
        cardBorder: 'border-blue-100 shadow-md shadow-blue-500/5',
        glowBg: 'from-blue-500/5 via-blue-500/2 to-transparent',
        tagBg: 'bg-blue-50 text-[#004C97] border-blue-100',
        icon: Sparkles,
        iconColor: 'text-[#004C97]',
        ribbonNumber: '05'
    }
};

function InstructorsSection() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [topInstructors, setTopInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRank, setActiveRank] = useState(1);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchTopInstructors = async () => {
            try {
                setLoading(true);
                const response = await api.get('/user/instructors/public?limit=5');
                if (response && Array.isArray(response.data) && response.data.length > 0) {
                    // Ensure only top 5 are used
                    const formatted = response.data.slice(0, 5).map((inst, index) => ({
                        ...inst,
                        rank: index + 1
                    }));
                    setTopInstructors(formatted);
                } else {
                    setTopInstructors(fallbackTop5);
                }
            } catch (error) {
                console.error('Failed to fetch top instructors:', error);
                setTopInstructors(fallbackTop5);
            } finally {
                setLoading(false);
            }
        };

        fetchTopInstructors();
    }, []);

    const displayList = topInstructors.length > 0 ? topInstructors : fallbackTop5;
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    if (loading && topInstructors.length === 0) {
        return (
            <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                        <div className="h-7 w-48 bg-slate-200 rounded-full mx-auto animate-pulse" />
                        <div className="h-10 w-80 bg-slate-200 rounded-2xl mx-auto animate-pulse" />
                        <div className="h-4 w-96 bg-slate-200 rounded-lg mx-auto animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/80" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="py-16 sm:py-24 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 relative overflow-hidden select-none font-arabic"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Ambient Lighting & Royal Atmosphere */}
            <div className="absolute top-10 start-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 end-1/4 w-[500px] h-[500px] bg-[#004C97]/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header: Hall of Fame & Top 5 Honor */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border border-amber-300/50 text-amber-800 font-black text-xs sm:text-sm mb-4 shadow-sm"
                    >
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
                        <span>{isRTL ? 'قائمة الشرف | أفضل 5 محاضرين على مستوى المنصة' : 'Hall of Fame | Top 5 Platform Instructors'}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
                    >
                        {isRTL ? 'نخبة النخبة: أفضل 5 محاضرين تميزاً وإنجازاً' : 'The Elite Top 5: Master Instructors'}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        {isRTL
                            ? 'نحتفي بالخبراء الأكثر إلهاماً وعطاءً الذين حققوا أعلى معايير التميز في جودة التدريب، رضا الطلاب، وعدد البرامج التدريبية المعتمدة.'
                            : 'Celebrating our highest-performing educators based on real student satisfaction, certified content volume, and learning impact.'}
                    </motion.p>
                </div>

                {/* Top 5 Champion Cards Podium Grid */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-5 items-stretch"
                    >
                        {displayList.map((instructor, index) => {
                            const rank = instructor.rank || index + 1;
                            const config = rankConfig[rank] || rankConfig[5];
                            const IconComponent = config.icon;

                            const id = instructor._id || instructor.id;
                            const name = instructor.firstName
                                ? `${instructor.firstName} ${instructor.lastName || ''}`.trim()
                                : (isRTL ? instructor.name : (instructor.nameEn || instructor.name));
                            const jobTitle = instructor.jobTitle || (isRTL ? 'محاضر وخبير معتمد' : 'Certified Expert');
                            const photo = instructor.photo || instructor.image || '/logo.png';
                            const coursesCount = instructor.coursesCount || 0;
                            const studentsCount = instructor.studentsCount || 0;
                            const rating = instructor.rating ? Number(instructor.rating).toFixed(1) : '5.0';

                            const isChampion = rank === 1;

                            return (
                                <motion.div
                                    key={id || index}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.08 }}
                                    className={`relative flex flex-col h-full rounded-3xl bg-white border ${config.cardBorder} transition-all duration-300 hover:-translate-y-2 group overflow-hidden ${
                                        isChampion ? 'lg:-translate-y-3 lg:scale-[1.03] z-20 ring-2 ring-amber-400/40' : 'z-10'
                                    }`}
                                >
                                    {/* Ambient Card Top Glow */}
                                    <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${config.glowBg} pointer-events-none`} />

                                    {/* Crown / Top Badge Ribbon Header */}
                                    <div className={`py-2 px-3 text-center text-[11px] font-black tracking-wide flex items-center justify-center gap-1.5 shadow-sm ${config.badgeBg}`}>
                                        <IconComponent className={`w-3.5 h-3.5 ${isChampion ? 'fill-slate-950 animate-bounce' : ''}`} />
                                        <span>{isRTL ? config.badgeTitleAr : config.badgeTitleEn}</span>
                                    </div>

                                    {/* Card Content Header */}
                                    <div className="p-5 pb-3 text-center flex flex-col items-center flex-1">
                                        {/* Rank Number Medal Badge */}
                                        <div className="w-full flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1 text-[11px] font-black text-slate-400">
                                                <span>{isRTL ? 'المرتبة' : 'RANK'}</span>
                                                <span className={`text-sm font-black ${isChampion ? 'text-amber-500' : 'text-slate-800'}`}>
                                                    #{config.ribbonNumber}
                                                </span>
                                            </div>

                                            {/* Rating Badge */}
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs">
                                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                <span>{rating}</span>
                                            </div>
                                        </div>

                                        {/* Avatar with Metallic Rank Ring */}
                                        <div className="relative mb-4">
                                            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ${config.ringColor} shadow-xl bg-slate-100 relative group-hover:scale-105 transition-transform duration-500`}>
                                                <img
                                                    src={photo}
                                                    alt={name}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = '/logo.png';
                                                    }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Gold Crown floating above Rank 1 avatar */}
                                            {isChampion && (
                                                <div className="absolute -top-3.5 -start-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-1.5 rounded-2xl shadow-lg border-2 border-white animate-pulse">
                                                    <Crown className="w-4 h-4 fill-slate-950" />
                                                </div>
                                            )}

                                            {/* Verified Badge */}
                                            <div className="absolute -bottom-1.5 -end-1.5 bg-white p-1 rounded-xl shadow-md border border-slate-100">
                                                <CheckCircle2 className="w-4 h-4 text-[#004C97]" />
                                            </div>
                                        </div>

                                        {/* Instructor Name & Job Title */}
                                        <div className="w-full mb-4">
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#004C97] transition-colors truncate mb-1">
                                                {name}
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                                                {jobTitle}
                                            </p>
                                        </div>

                                        {/* 3 Real Platform Metrics */}
                                        <div className="w-full grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 mb-4">
                                            <div className="flex flex-col items-center justify-center p-1">
                                                <div className="flex items-center gap-1 text-[#004C97] font-black text-sm">
                                                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{coursesCount}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    {isRTL ? 'دورة منشورة' : 'Courses'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-center justify-center p-1 border-s border-slate-200/80">
                                                <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                                                    <Users className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{studentsCount}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    {isRTL ? 'طالب مسجل' : 'Students'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button: View Profile */}
                                    <div className="p-4 pt-0 mt-auto">
                                        <Link
                                            to={`/profile/${id}`}
                                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-sm ${
                                                isChampion
                                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black shadow-amber-500/20'
                                                    : 'bg-slate-50 hover:bg-[#004C97] text-slate-700 hover:text-white border border-slate-200/80 hover:border-[#004C97]'
                                            }`}
                                        >
                                            <span>{isRTL ? 'عرض الملف التعريفي' : 'View Profile'}</span>
                                            <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Trust & Navigation Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 sm:mt-16 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">
                                {isRTL ? 'معايير تصنيف قائمة التوب 5' : 'Top 5 Evaluation Criteria'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                {isRTL
                                    ? 'يتم تحديث الترتيب دورياً بالاعتماد على تقييمات الطلاب، عدد البرامج المنشورة، ونشاط المتدربين.'
                                    : 'Rankings are periodically refreshed based on real student reviews, published course count, and student engagement.'}
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#004C97] hover:border-[#004C97] font-bold text-xs sm:text-sm shadow-sm transition-all"
                    >
                        <span>{isRTL ? 'استكشف كافة مدربي المنصة' : 'Browse All Instructors'}</span>
                        <ArrowIcon className="w-4 h-4 text-[#004C97]" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default InstructorsSection;
