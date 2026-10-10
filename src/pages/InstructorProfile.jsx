import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/new-api';
import {
    MapPin,
    Briefcase,
    GraduationCap,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    MessageCircle,
    User,
    CheckCircle2,
    Calendar,
    BookOpen,
    Star,
    Award,
    ShieldCheck,
    Share2,
    MessageSquare,
    Users,
    Sparkles,
    Send,
    AlertCircle,
    Globe,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';

const getSocialIcon = (network) => {
    switch (network.toLowerCase()) {
        case 'facebook': return <Facebook className="w-4 h-4" />;
        case 'twitter': return <Twitter className="w-4 h-4" />;
        case 'linkedin': return <Linkedin className="w-4 h-4" />;
        case 'instagram': return <Instagram className="w-4 h-4" />;
        case 'youtube': return <Youtube className="w-4 h-4" />;
        case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
        default: return <Globe className="w-4 h-4" />;
    }
};

const InstructorProfile = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Course pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage] = useState(2);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const coursesSectionRef = useRef(null);

    // Review submission state
    const [userRating, setUserRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await userService.getInstructorPublicProfile(id, { page: 1, limit: coursesPerPage });

                if (data && data.instructor) {
                    setInstructor(data.instructor);
                    const realCourses = data.courses || [];
                    const realReviews = data.reviews || [];
                    setCourses(realCourses);
                    setReviews(realReviews);

                    // Compute real student count across all published courses
                    const totalStudents = realCourses.reduce((sum, c) => {
                        const count = c.enrolledStudents?.length || c.enrollmentCount || 0;
                        return sum + count;
                    }, 0);

                    // Compute real review statistics
                    const totalReviews = realReviews.length;
                    let averageRating = 0;
                    let breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                    if (totalReviews > 0) {
                        const sum = realReviews.reduce((acc, rev) => {
                            const rounded = Math.min(5, Math.max(1, Math.round(rev.rating) || 5));
                            breakdown[rounded] = (breakdown[rounded] || 0) + 1;
                            return acc + (rev.rating || 5);
                        }, 0);
                        averageRating = Number((sum / totalReviews).toFixed(1));
                    }

                    setStats({
                        totalCourses: data.stats?.totalCourses !== undefined ? data.stats.totalCourses : realCourses.length,
                        totalStudents: data.stats?.totalStudents !== undefined ? data.stats.totalStudents : totalStudents,
                        totalReviews,
                        averageRating,
                        ratingBreakdown: breakdown
                    });
                } else {
                    setError(t('instructor.profile.notFound', 'لم يتم العثور على هذا المحاضر في النظام'));
                }
            } catch (err) {
                console.error('Error fetching instructor profile:', err);
                setError(t('instructor.profile.fetchError', 'حدث خطأ أثناء جلب بيانات المحاضر من السيرفر'));
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id, t, coursesPerPage]);

    // Total course pages calculation
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((stats.totalCourses || courses.length) / coursesPerPage));
    }, [stats.totalCourses, courses.length, coursesPerPage]);

    // Handle course page change with server-side pagination
    const handlePageChange = async (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage || coursesLoading) return;
        try {
            setCoursesLoading(true);
            const data = await userService.getInstructorPublicProfile(id, { page: newPage, limit: coursesPerPage });
            if (data && data.courses) {
                setCourses(data.courses);
                setCurrentPage(newPage);
                if (coursesSectionRef.current) {
                    coursesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        } catch (err) {
            console.error('Failed to change courses page:', err);
            toast.error(isRTL ? 'حدث خطأ أثناء تحميل الصفحة' : 'Failed to load page');
        } finally {
            setCoursesLoading(false);
        }
    };

    // Calculate smart pagination items with ellipsis
    const paginationPages = useMemo(() => {
        const pages = [];
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta + 1;
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                pages.push(i);
            }
        }

        const withEllipsis = [];
        for (const p of pages) {
            if (l) {
                if (p - l === 2) {
                    withEllipsis.push(l + 1);
                } else if (p - l !== 1) {
                    withEllipsis.push('...');
                }
            }
            withEllipsis.push(p);
            l = p;
        }

        return withEllipsis;
    }, [currentPage, totalPages]);


    // Format photo URL safely from database
    const photoUrl = useMemo(() => {
        if (!instructor?.photo) return null;
        if (instructor.photo.startsWith('http://') || instructor.photo.startsWith('https://')) {
            return instructor.photo;
        }
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        return `${API_URL}${instructor.photo.startsWith('/') ? '' : '/'}${instructor.photo}`;
    }, [instructor?.photo]);

    // Format full name from database
    const fullName = useMemo(() => {
        if (!instructor) return '';
        const parts = [instructor.firstName, instructor.middleName, instructor.lastName].filter(Boolean);
        return parts.join(' ').trim();
    }, [instructor]);

    // Safe social media links parsing
    const socials = useMemo(() => {
        if (!instructor?.socials) return {};
        if (typeof instructor.socials === 'string') {
            try { return JSON.parse(instructor.socials); } catch (e) { return {}; }
        }
        return instructor.socials;
    }, [instructor?.socials]);

    // Handle review submission directly to the database
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.info(isRTL ? 'يرجى تسجيل الدخول بحسابك أولاً لإضافة تقييم' : 'Please log in to submit a review');
            navigate('/login');
            return;
        }

        if (!reviewComment.trim()) {
            toast.warn(isRTL ? 'يرجى كتابة نص التقييم قبل الإرسال' : 'Please provide review comments');
            return;
        }

        try {
            setSubmittingReview(true);
            const res = await userService.addInstructorReview(id, {
                rating: userRating,
                comment: reviewComment.trim()
            });

            if (res && res.reviews) {
                setReviews(res.reviews);
                if (res.stats) {
                    setStats(prev => ({
                        ...prev,
                        totalReviews: res.stats.totalReviews,
                        averageRating: res.stats.averageRating
                    }));
                }
            }

            toast.success(isRTL ? 'تم حفظ ونشر تقييمك بنجاح في النظام' : 'Review submitted and saved successfully');
            setReviewComment('');
            setShowReviewForm(false);
        } catch (err) {
            console.error('Failed to submit review:', err);
            const msg = err.response?.data?.message || (isRTL ? 'فشل حفظ التقييم. حاول مجدداً.' : 'Failed to save review');
            toast.error(msg);
        } finally {
            setSubmittingReview(false);
        }
    };

    // Copy profile link
    const handleShareProfile = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success(isRTL ? 'تم نسخ رابط ملف المحاضر بنجاح' : 'Instructor profile link copied to clipboard');
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex-1 flex flex-col justify-center items-center py-28">
                    <div className="w-14 h-14 border-4 border-[#004C97] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-600 font-bold text-sm animate-pulse">
                        {isRTL ? 'جاري جلب البيانات الحقيقية للمحاضر...' : 'Loading instructor data...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !instructor) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex-1 flex justify-center items-center p-8 py-20">
                    <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200/80">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            {error || (isRTL ? 'المحاضر غير موجود' : 'Instructor Not Found')}
                        </h2>
                        <p className="text-slate-500 text-sm mb-6">
                            {isRTL ? 'لم نتمكن من العثور على هذا المحاضر في قاعدة البيانات.' : 'Instructor profile could not be found.'}
                        </p>
                        <Link
                            to="/explore"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#004C97] text-white font-bold rounded-xl hover:bg-[#003870] transition-all shadow-md shadow-[#004C97]/20"
                        >
                            <span>{isRTL ? 'تصفح كافة المحاضرين والدورات' : 'Browse All Instructors'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Real location string from database
    const locationString = [instructor.city, instructor.country].filter(Boolean).join(' - ');

    return (
        <div className="min-h-screen bg-slate-50/60 flex flex-col font-arabic" dir={isRTL ? 'rtl' : 'ltr'}>
            <main className="flex-1 pb-24">
                {/* Hero Profile Banner Header */}
                <div className="relative bg-gradient-to-b from-[#004C97] via-[#003b75] to-[#002f5e] text-white overflow-hidden pt-12 pb-24 sm:pb-28">
                    {/* Ambient Glows */}
                    <div className="absolute top-0 end-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 start-0 w-96 h-96 bg-[#F7931E]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200 mb-8 font-medium">
                            <Link to="/" className="hover:text-white transition-colors">
                                {isRTL ? 'الرئيسية' : 'Home'}
                            </Link>
                            <span>/</span>
                            <Link to="/explore" className="hover:text-white transition-colors">
                                {isRTL ? 'المحاضرون والخبراء' : 'Instructors'}
                            </Link>
                            <span>/</span>
                            <span className="text-white font-bold">{fullName}</span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
                            {/* Avatar Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative shrink-0"
                            >
                                <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 backdrop-blur-md relative group">
                                    {photoUrl ? (
                                        <img
                                            src={photoUrl}
                                            alt={fullName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = '/logo.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-900/50 text-white font-black text-6xl">
                                            {fullName.charAt(0) || 'A'}
                                        </div>
                                    )}
                                </div>

                                {/* Verified Badge Icon */}
                                {instructor.isVerified && (
                                    <div
                                        className="absolute -bottom-2 -end-2 bg-white text-[#004C97] p-2 rounded-2xl shadow-xl border-2 border-blue-50 flex items-center justify-center"
                                        title={isRTL ? 'مدرب موثق ومعتمد في النظام' : 'Verified Instructor'}
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-[#004C97]" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Details Information */}
                            <div className="flex-1 text-center md:text-start space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-bold text-xs border border-white/20">
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#F7931E]" />
                                            {isRTL ? 'مدرب معتمد بالأكاديمية' : 'Verified Instructor'}
                                        </span>

                                        {stats.totalReviews > 0 ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7931E] text-white font-black text-xs shadow-md">
                                                <Star className="w-3.5 h-3.5 fill-white" />
                                                <span>{stats.averageRating}</span>
                                                <span className="text-white/80 font-normal">({stats.totalReviews} {isRTL ? 'تقييم' : 'reviews'})</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 font-semibold text-xs border border-white/20">
                                                <span>{isRTL ? 'محاضر جديد' : 'New Instructor'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight pt-1">
                                        {fullName}
                                    </h1>

                                    {instructor.jobTitle && (
                                        <p className="text-blue-100 text-base sm:text-lg font-medium max-w-2xl">
                                            {instructor.jobTitle}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Real Metadata Bar */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-blue-100/90 pt-1"
                                >
                                    {locationString && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-[#F7931E] shrink-0" />
                                            <span>{locationString}</span>
                                        </div>
                                    )}
                                    {instructor.universityDegree && (
                                        <div className="flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4 text-[#F7931E] shrink-0" />
                                            <span>{instructor.universityDegree}</span>
                                        </div>
                                    )}
                                    {instructor.website && (
                                        <a
                                            href={instructor.website.startsWith('http') ? instructor.website : `https://${instructor.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-white underline decoration-white/30"
                                        >
                                            <ExternalLink className="w-4 h-4 text-[#F7931E] shrink-0" />
                                            <span>{isRTL ? 'الموقع الإلكتروني' : 'Website'}</span>
                                        </a>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-[#F7931E] shrink-0" />
                                        <span>
                                            {isRTL ? 'انضم في' : 'Joined'} {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short' }) : '---'}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Action Buttons & Social Links */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3"
                                >
                                    <button
                                        onClick={handleShareProfile}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>{isRTL ? 'مشاركة البروفايل' : 'Share Profile'}</span>
                                    </button>

                                    {/* Social Links from database */}
                                    {socials && Object.keys(socials).length > 0 && (
                                        <div className="flex items-center gap-2">
                                            {Object.entries(socials).map(([net, url]) => url && (
                                                <a
                                                    key={net}
                                                    href={url.startsWith('http') ? url : `https://${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#004C97] flex items-center justify-center transition-all duration-200 border border-white/15"
                                                    title={net}
                                                >
                                                    {getSocialIcon(net)}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real Stats Ribbon */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 relative z-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 bg-white rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80">
                        {/* Real Courses Count */}
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004C97] flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                                    {stats.totalCourses}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {isRTL ? 'دورة منشورة' : 'Published Courses'}
                                </span>
                            </div>
                        </div>

                        {/* Real Enrolled Students */}
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                                    {stats.totalStudents}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {isRTL ? 'طالب مسجل' : 'Enrolled Students'}
                                </span>
                            </div>
                        </div>

                        {/* Real Rating Average */}
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7931E] flex items-center justify-center shrink-0">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                                        {stats.totalReviews > 0 ? stats.averageRating : '5.0'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                    {isRTL ? 'متوسط التقييم' : 'Average Rating'}
                                </span>
                            </div>
                        </div>

                        {/* Real Reviews Count */}
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                                    {stats.totalReviews}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    {isRTL ? 'رأي وتقييم موثق' : 'Verified Reviews'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Real Bio & Profile Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Real Bio Box */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                            <div className="flex items-center gap-2 text-slate-900 font-black text-lg mb-4">
                                <Award className="w-5 h-5 text-[#004C97]" />
                                <h3>{isRTL ? 'نبذة عن المحاضر' : 'About Instructor'}</h3>
                            </div>

                            {instructor.bio && instructor.bio.trim() ? (
                                <div className="text-slate-600 text-sm leading-relaxed space-y-3 font-normal">
                                    {instructor.bio.split('\n').map((para, i) => para && (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic">
                                    {isRTL ? 'لم يقم المحاضر بإضافة نبذة تعريفية بعد.' : 'No biography added yet.'}
                                </p>
                            )}

                            {/* Real Category & Subcategory tags */}
                            {(instructor.category || instructor.subCategory) && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                                        {isRTL ? 'التخصص والمسار الأكاديمي' : 'Specialization'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {instructor.category && (
                                            <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#004C97] font-bold text-xs border border-blue-100">
                                                {instructor.category}
                                            </span>
                                        )}
                                        {instructor.subCategory && (
                                            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/60">
                                                {instructor.subCategory}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Verified Credential Box */}
                        <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2.5 text-[#004C97] font-bold text-sm">
                                <ShieldCheck className="w-5 h-5 text-[#004C97]" />
                                <span>{isRTL ? 'التحقق والاعتماد الأكاديمي' : 'Verification & Accreditation'}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {isRTL
                                    ? 'هذا الحساب موثق ومسجل رسمياً كمدرب معتمد في أكاديمية التعليم المتطور AEC لنقل الخبرات المهنية والأكاديمية.'
                                    : 'This account is officially verified as an accredited instructor at AEC Academy.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Real Published Courses & Student Reviews */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Real Published Courses Section */}
                        <section ref={coursesSectionRef} className="scroll-mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004C97] flex items-center justify-center font-bold">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                        {isRTL ? 'الدورات التدريبية للمحاضر' : 'Instructor Courses'}
                                    </h2>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                    {stats.totalCourses || courses.length} {isRTL ? 'دورة' : 'courses'}
                                </span>
                            </div>

                            {courses.length > 0 ? (
                                <div className="relative">
                                    {coursesLoading && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 rounded-3xl flex items-center justify-center">
                                            <div className="w-10 h-10 border-3 border-[#004C97] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}

                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-200 ${coursesLoading ? 'opacity-50' : 'opacity-100'}`}>
                                        {courses.map((course, index) => (
                                            <motion.div
                                                key={course._id || index}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.04 }}
                                            >
                                                <CourseCard course={course} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            {/* Showing items indicator */}
                                            <p className="text-xs text-slate-500 font-semibold order-2 sm:order-1">
                                                {isRTL
                                                    ? `عرض الدورات ${(currentPage - 1) * coursesPerPage + 1} - ${Math.min(currentPage * coursesPerPage, stats.totalCourses || courses.length)} من أصل ${stats.totalCourses || courses.length} دورة`
                                                    : `Showing ${(currentPage - 1) * coursesPerPage + 1} - ${Math.min(currentPage * coursesPerPage, stats.totalCourses || courses.length)} of ${stats.totalCourses || courses.length} courses`}
                                            </p>

                                            {/* Pagination navigation buttons */}
                                            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                                                {/* Previous Page */}
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1 || coursesLoading}
                                                    aria-label={isRTL ? 'الصفحة السابقة' : 'Previous page'}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-[#004C97] hover:text-[#004C97] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                >
                                                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                                </button>

                                                {/* Numbered pages */}
                                                {paginationPages.map((p, idx) => {
                                                    if (p === '...') {
                                                        return (
                                                            <span
                                                                key={`ellipsis-${idx}`}
                                                                className="w-8 text-center text-xs text-slate-400 font-bold select-none"
                                                            >
                                                                ...
                                                            </span>
                                                        );
                                                    }
                                                    const isActive = p === currentPage;
                                                    return (
                                                        <button
                                                            key={`page-${p}`}
                                                            onClick={() => handlePageChange(p)}
                                                            disabled={coursesLoading}
                                                            className={`w-9 h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center shadow-sm active:scale-95 ${
                                                                isActive
                                                                    ? 'bg-[#004C97] text-white shadow-[#004C97]/30 ring-2 ring-[#004C97]/20'
                                                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#004C97] hover:text-[#004C97]'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                })}

                                                {/* Next Page */}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages || coursesLoading}
                                                    aria-label={isRTL ? 'الصفحة التالية' : 'Next page'}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-[#004C97] hover:text-[#004C97] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                >
                                                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
                                    <div className="w-16 h-16 bg-blue-50 text-[#004C97] rounded-2xl flex items-center justify-center mx-auto mb-2">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {isRTL ? 'لا توجد دورات منشورة حالياً لهذا المحاضر' : 'No Published Courses Yet'}
                                    </h3>
                                    <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                                        {isRTL
                                            ? 'سيتم عرض جميع الدورات والبرامج التدريبية المعتمدة التي يقدمها هذا المحاضر هنا فور اعتمادها.'
                                            : 'Courses published by this instructor will be displayed here.'}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Real Student Reviews Section */}
                        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare className="w-5 h-5 text-[#004C97]" />
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                                            {isRTL ? 'آراء وتقييمات الطلاب الحقيقية' : 'Student Reviews & Feedback'}
                                        </h2>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500">
                                        {isRTL ? 'آراء المتدربين المسجلين في النظام حول تجربة التعلم مع هذا المحاضر' : 'Real reviews and ratings submitted by enrolled students'}
                                    </p>
                                </div>

                                {/* Button to toggle Review Form */}
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="px-5 py-2.5 rounded-xl bg-[#004C97] text-white hover:bg-[#003870] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#004C97]/20 transition-all active:scale-95 self-start sm:self-auto"
                                >
                                    <Star className="w-4 h-4 fill-white" />
                                    <span>{showReviewForm ? (isRTL ? 'إلغاء' : 'Cancel') : (isRTL ? 'أضف تقييمك' : 'Write a Review')}</span>
                                </button>
                            </div>

                            {/* Add Review Form */}
                            <AnimatePresence>
                                {showReviewForm && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={handleSubmitReview}
                                        className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm sm:text-base font-black text-slate-900">
                                                {isRTL ? 'تقييم تجربتك مع المحاضر' : 'Rate Your Experience'}
                                            </h3>
                                            {!isAuthenticated && (
                                                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                                    {isRTL ? 'يتطلب تسجيل الدخول' : 'Login required'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Star Rating Picker */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 block">
                                                {isRTL ? 'اختر عدد النجوم:' : 'Select Rating:'}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setUserRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        className="p-1 focus:outline-none transition-transform active:scale-125"
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                                                (hoverRating || userRating) >= star
                                                                    ? 'text-[#F7931E] fill-[#F7931E]'
                                                                    : 'text-slate-300'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                                <span className="text-xs font-bold text-slate-600 ms-2">
                                                    {userRating === 5 && (isRTL ? 'ممتاز جداً ⭐⭐⭐⭐⭐' : 'Excellent')}
                                                    {userRating === 4 && (isRTL ? 'جيد جداً ⭐⭐⭐⭐' : 'Very Good')}
                                                    {userRating === 3 && (isRTL ? 'جيد ⭐⭐⭐' : 'Good')}
                                                    {userRating === 2 && (isRTL ? 'مقبول ⭐⭐' : 'Fair')}
                                                    {userRating === 1 && (isRTL ? 'ضعيف ⭐' : 'Poor')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comment Field */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 block">
                                                {isRTL ? 'اكتب رأيك وتجربتك بالتفصيل:' : 'Your Detailed Feedback:'}
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder={isRTL ? 'اكتب ملاحظاتك لمساعدة زملائك الطلاب...' : 'Write your honest review here...'}
                                                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004C97]/20 focus:border-[#004C97] transition-all resize-none"
                                                maxLength={1000}
                                            />
                                            <div className="text-end text-[11px] text-slate-400 font-medium">
                                                {reviewComment.length} / 1000
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowReviewForm(false)}
                                                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs sm:text-sm transition-all"
                                            >
                                                {isRTL ? 'إلغاء' : 'Cancel'}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="px-6 py-2.5 rounded-xl bg-[#004C97] text-white hover:bg-[#003870] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {submittingReview ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                <span>{isRTL ? 'إرسال وحفظ التقييم' : 'Save Review'}</span>
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Real Rating Breakdown Bar */}
                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-100 items-center">
                                    <div className="text-center md:border-e md:border-slate-200/80 pe-4">
                                        <span className="text-4xl sm:text-5xl font-black text-slate-900 block mb-1">
                                            {stats.averageRating}
                                        </span>
                                        <div className="flex items-center justify-center gap-1 text-[#F7931E] mb-1.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? 'fill-current text-[#F7931E]' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold block">
                                            {reviews.length} {isRTL ? 'تقييم حقيقي مسجل' : 'Registered Reviews'}
                                        </span>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        {[5, 4, 3, 2, 1].map((stars) => {
                                            const count = stats.ratingBreakdown[stars] || 0;
                                            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                            return (
                                                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                                        <span>{stars}</span>
                                                        <Star className="w-3 h-3 text-[#F7931E] fill-current" />
                                                    </div>
                                                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#F7931E] rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-10 text-end text-slate-400 font-bold">{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}

                            {/* Reviews List from database */}
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, idx) => {
                                        const studentName = rev.studentName || (rev.student?.firstName ? `${rev.student.firstName} ${rev.student.lastName || ''}`.trim() : (isRTL ? 'طالب مسجل' : 'Enrolled Student'));
                                        const studentPhoto = rev.studentPhoto || rev.student?.photo;

                                        return (
                                            <motion.div
                                                key={rev._id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:border-slate-200 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#004C97]/10 text-[#004C97] font-black flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                                                            {studentPhoto ? (
                                                                <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{studentName.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <h4 className="text-sm font-black text-slate-900">
                                                                    {studentName}
                                                                </h4>
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" title={isRTL ? 'طالب مسجل' : 'Verified Student'} />
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[#F7931E] mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3 h-3 ${
                                                                            i < (rev.rating || 5)
                                                                                ? 'fill-current text-[#F7931E]'
                                                                                : 'text-slate-200'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                                    </span>
                                                </div>

                                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium ps-1">
                                                    {rev.comment}
                                                </p>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm space-y-2">
                                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="font-bold text-slate-700">
                                            {isRTL ? 'لا توجد تقييمات مسجلة لهذا المحاضر حتى الآن' : 'No reviews recorded for this instructor yet.'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {isRTL ? 'هل درست مع هذا المحاضر؟ اضغط على زر "أضف تقييمك" في الأعلى لتكون أول من يشارك تجربته!' : 'Be the first to share your learning experience with this instructor!'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorProfile;
