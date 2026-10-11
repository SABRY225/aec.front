import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/layouts/ProtectedRoute';
import {
    LayoutDashboard,
    BookOpen,
    Bell,
    FileText,
    GraduationCap,
    Star,
    User,
    Settings,
    CreditCard,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Globe,
    Moon,
    Sun,
    Languages,
    Compass,
    ExternalLink
} from 'lucide-react';

const StudentLayout = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dark mode state synchronized with localStorage
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleDarkMode = () => setIsDark(!isDark);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    // Close mobile drawer on route transition
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        const result = await logout();
        if (result?.redirectPath) {
            navigate(result.redirectPath);
        } else {
            navigate('/login');
        }
    };

    const navigationGroups = useMemo(() => [
        {
            title: i18n.language === 'ar' ? 'التعليم والمقررات' : 'Academic & Learning',
            items: [
                {
                    path: '/student/dashboard',
                    label: t('nav.studentSidebar.items.dashboard', 'لوحة التحكم'),
                    icon: <LayoutDashboard className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/my-courses',
                    label: t('nav.studentSidebar.items.myCourses', 'دوراتي'),
                    icon: <BookOpen className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/assignments',
                    label: t('nav.studentSidebar.items.assignments', 'الواجبات والتكليفات'),
                    icon: <FileText className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/certificate',
                    label: t('nav.studentSidebar.items.certificate', 'الشهادات والإنجازات'),
                    icon: <GraduationCap className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/reviews',
                    label: t('nav.studentSidebar.items.reviews', 'التقييمات'),
                    icon: <Star className="h-4.5 w-4.5" />
                },
            ]
        },
        {
            title: i18n.language === 'ar' ? 'الحساب والدعم' : 'Account & Support',
            items: [
                {
                    path: '/student/profile-settings',
                    label: t('nav.studentSidebar.items.account', 'الملف الشخصي'),
                    icon: <User className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/account-settings',
                    label: t('nav.studentSidebar.items.settings', 'إعدادات الحساب'),
                    icon: <Settings className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/payment-settings',
                    label: t('nav.studentSidebar.items.payments', 'المدفوعات والاشتراكات'),
                    icon: <CreditCard className="h-4.5 w-4.5" />
                },
                {
                    path: '/student/help',
                    label: t('nav.studentSidebar.items.help', 'المساعدة والدعم'),
                    icon: <HelpCircle className="h-4.5 w-4.5" />
                },
            ]
        }
    ], [t, i18n.language]);

    const isRtl = i18n.language === 'ar';

    // Current page title for topbar breadcrumb
    const currentItem = useMemo(() => {
        return navigationGroups.flatMap(g => g.items).find(item =>
            location.pathname === item.path ||
            (item.path !== '/student/dashboard' && location.pathname.startsWith(item.path + '/'))
        );
    }, [navigationGroups, location.pathname]);

    return (
        <ProtectedRoute allowedRoles={['student']}>
            <div className={`h-screen flex overflow-hidden font-sans transition-colors duration-300 ${
                isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'
            }`}>

                {/* Mobile Drawer Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:static inset-y-0 start-0 z-50 
                        w-72 lg:w-68 h-full 
                        bg-white dark:bg-slate-900 
                        border-e border-slate-200/80 dark:border-slate-800 
                        shadow-2xl lg:shadow-none 
                        flex flex-col shrink-0
                        transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen
                            ? 'translate-x-0'
                            : (t('autoGenerated.translate_x_full_lg_translate_', `-translate-x-full lg:translate-x-0`))
                        }
                    `}
                >
                    {/* Sidebar Brand Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <Link to="/student/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                                AEC
                            </div>
                            <div>
                                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight block leading-tight">
                                    أكاديمية AEC
                                </span>
                                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                                    {t('nav.studentSidebar.mobileTitle', 'لوحة الطالب')}
                                </span>
                            </div>
                        </Link>

                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close Sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Go to Platform Button in Sidebar (Drawer & Desktop) */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                        <Link
                            to="/"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-800/90 dark:via-blue-950/30 dark:to-slate-800/90 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-800 dark:hover:to-slate-800 font-bold text-xs sm:text-sm border border-blue-200/60 dark:border-blue-900/40 shadow-2xs transition-all group"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="text-start min-w-0">
                                    <span className="block leading-tight font-bold truncate">
                                        {isRtl ? 'الانتقال إلى المنصة' : 'Go to Platform'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5 truncate">
                                        {isRtl ? 'الرئيسية وتصفح الدورات' : 'Home & Browse'}
                                    </span>
                                </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity shrink-0 ms-2" />
                        </Link>
                    </div>

                    {/* Scrollable Navigation Groups */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-6">
                        {navigationGroups.map((group, gIdx) => (
                            <div key={gIdx}>
                                <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {group.title}
                                </h3>
                                <nav className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = location.pathname === item.path ||
                                            (item.path !== '/student/dashboard' && location.pathname.startsWith(item.path + '/'));

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <span className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                    isActive
                                                        ? 'text-white'
                                                        : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                }`}>
                                                    {item.icon}
                                                </span>
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer Controls & Logout */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('common.logout', 'تسجيل الخروج')}</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/60 dark:bg-slate-950">

                    {/* TOPBAR */}
                    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
                        {/* Start side: Mobile Menu Toggle + Breadcrumb Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Open Sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                                <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
                                    {t('nav.studentSidebar.mobileTitle', 'لوحة الطالب')}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
                                <span className="text-slate-900 dark:text-white">
                                    {currentItem?.label || t('nav.studentSidebar.items.dashboard', 'لوحة التحكم')}
                                </span>
                            </div>
                        </div>

                        {/* End side: Quick Action Buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                            {/* Go to Platform Button (Responsive & Desktop) */}
                            <Link
                                to="/"
                                title={isRtl ? 'الانتقال إلى المنصة' : 'Go to Platform'}
                                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:bg-blue-900/80 border border-blue-200/70 dark:border-blue-800/60 font-bold text-xs transition-all shadow-2xs"
                            >
                                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>{isRtl ? 'المنصة' : 'Platform'}</span>
                            </Link>

                            {/* Explore Courses Link (Desktop) */}
                            <Link
                                to="/explore"
                                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition-colors"
                            >
                                <Compass className="w-3.5 h-3.5" />
                                <span>{t('student.dashboard.quickActions.browseCourses', 'تصفح الدورات')}</span>
                            </Link>

                            {/* Notifications */}
                            <Link
                                to="/student/notifications"
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                                title={t('nav.studentSidebar.items.notifications', 'الإشعارات')}
                            >
                                <Bell className="w-4.5 h-4.5" />
                                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                            </Link>

                            {/* Language Switch */}
                            <button
                                onClick={toggleLanguage}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
                                title="تغيير اللغة"
                            >
                                <Languages className="w-4.5 h-4.5" />
                                <span className="hidden sm:inline">{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
                            </button>

                            {/* Dark Mode Switch */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="تغيير المظهر"
                            >
                                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                            </button>

                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                            {/* Student Avatar */}
                            <Link to="/student/profile-settings" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-xl ring-2 ring-blue-500/20 overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    {user?.photo ? (
                                        <img src={user.photo} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user?.firstName?.[0] || 'S'}</span>
                                    )}
                                </div>
                                <span className="hidden md:block text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[100px] truncate">
                                    {user?.firstName}
                                </span>
                            </Link>
                        </div>
                    </header>

                    {/* SCROLLABLE OUTLET CONTAINER */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <Outlet />
                    </main>

                </div>

            </div>
        </ProtectedRoute>
    );
};

export default StudentLayout;
