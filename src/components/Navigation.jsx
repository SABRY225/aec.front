import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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
    Languages
} from 'lucide-react';

const NavigationItem = ({ to, icon, children, badge, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/student/dashboard' && location.pathname.startsWith(to + '/'));

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                    {icon}
                </span>
                <span className="truncate">{children}</span>
            </div>

            {badge !== undefined && badge !== null && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                }`}>
                    {badge}
                </span>
            )}
        </Link>
    );
};

const Navigation = () => {
    const { t, i18n } = useTranslation();
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isRtl = i18n.language === 'ar';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dark mode state sync with localStorage and AdminLayout
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

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleLogout = async () => {
        const result = await logout();
        closeSidebar();
        if (result?.redirectPath) {
            navigate(result.redirectPath);
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            {/* MOBILE STICKY TOPBAR */}
            <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ms-1 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <Link to="/student/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-600/30">
                            AEC
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {t('nav.studentSidebar.mobileTitle', t('autoGenerated.compText1371', 'لوحة الطالب'))}
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Dark Mode toggle on mobile header */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={isDark ? t('autoGenerated.compText1372', 'الوضع النهاري') : t('autoGenerated.compText1373', 'الوضع الليلي')}
                    >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Language toggle on mobile header */}
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t('autoGenerated.compText1374', 'تغيير اللغة')}
                    >
                        <Languages className="w-4 h-4" />
                    </button>

                    {/* Quick User Avatar */}
                    <button
                        onClick={toggleSidebar}
                        className="ms-1 flex items-center ring-2 ring-blue-500/20 rounded-full"
                    >
                        {user?.photo ? (
                            <img
                                src={user.photo}
                                alt={user.firstName}
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                {user?.firstName?.[0] || 'U'}
                            </div>
                        )}
                    </button>
                </div>
            </header>

            {/* MOBILE BACKDROP OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR PANEL */}
            <aside
                className={`
                    fixed md:sticky top-0 inset-y-0 start-0 z-50 md:z-30 
                    w-72 md:w-60 lg:w-68 h-screen
                    bg-white dark:bg-slate-900 
                    border-e border-slate-200/80 dark:border-slate-800 
                    shadow-2xl md:shadow-none 
                    flex flex-col shrink-0
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full md:translate-x-0 ltr:md:translate-x-0 rtl:md:translate-x-0'}
                `}
            >
                {/* 1. BRAND HEADER */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                    <Link to="/student/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                            AEC
                        </div>
                        <div>
                            <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight block leading-tight">
                                {t('autoGenerated.compText1375', 'أكاديمية AEC')}
                            </span>
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                                {t('nav.studentSidebar.mobileTitle', t('autoGenerated.compText1376', 'لوحة الطالب'))}
                            </span>
                        </div>
                    </Link>

                    <button
                        onClick={closeSidebar}
                        className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close Sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. USER PROFILE SUMMARY */}
                <div className="px-3 pt-3 pb-1 shrink-0">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="relative shrink-0">
                            {user?.photo ? (
                                <img
                                    src={user.photo}
                                    alt={user.firstName}
                                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                    {user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || ''}
                                </div>
                            )}
                            <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-emerald-500 ring-2 ring-white dark:ring-slate-900 rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {user?.firstName} {user?.lastName || ''}
                            </h2>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                {t(`common.roles.${user?.role?.toLowerCase() || 'student'}`, t('autoGenerated.compText1377', 'طالب'))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. SCROLLABLE NAVIGATION GROUPS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-6">
                    {/* Academic / Learning Group */}
                    <div>
                        <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {isRtl ? t('autoGenerated.compText1378', 'التعليم والمقررات') : 'Learning'}
                        </h3>
                        <nav className="space-y-1">
                            <NavigationItem
                                to="/student/dashboard"
                                icon={<LayoutDashboard className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.dashboard', t('autoGenerated.compText1379', 'لوحة التحكم'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/my-courses"
                                icon={<BookOpen className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.myCourses', t('autoGenerated.compText1380', 'دوراتي'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/notifications"
                                icon={<Bell className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.notifications', t('autoGenerated.compText1381', 'الإشعارات'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/assignments"
                                icon={<FileText className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.assignments', t('autoGenerated.compText1382', 'الواجبات'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/certificate"
                                icon={<GraduationCap className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.certificate', t('autoGenerated.compText1383', 'الشهادات'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/reviews"
                                icon={<Star className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.reviews', t('autoGenerated.compText1384', 'التقييمات'))}
                            </NavigationItem>
                        </nav>
                    </div>

                    {/* Account & Settings Group */}
                    <div>
                        <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {isRtl ? t('autoGenerated.compText1385', 'الحساب والدعم') : 'Account & Support'}
                        </h3>
                        <nav className="space-y-1">
                            <NavigationItem
                                to="/student/account-settings"
                                icon={<User className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.account', t('autoGenerated.compText1386', 'إعدادات الحساب'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/profile-settings"
                                icon={<Settings className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.settings', t('autoGenerated.compText1387', 'الملف الشخصي'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/payment-settings"
                                icon={<CreditCard className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.payment', t('autoGenerated.compText1388', 'المدفوعات'))}
                            </NavigationItem>
                            <NavigationItem
                                to="/student/help"
                                icon={<HelpCircle className="h-4.5 w-4.5" />}
                                onClick={closeSidebar}
                            >
                                {t('nav.studentSidebar.items.help', t('autoGenerated.compText1389', 'المساعدة والدعم'))}
                            </NavigationItem>
                        </nav>
                    </div>
                </div>

                {/* 4. FOOTER CONTROLS & LOGOUT */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
                    {/* Quick utility controls row */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl">
                        {/* Go to main website */}
                        <Link
                            to="/"
                            target="_blank"
                            title={isRtl ? t('autoGenerated.compText1390', 'عرض الموقع الرئيسي') : 'View Public Site'}
                            className="flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                        </Link>

                        {/* Language Switch */}
                        <button
                            onClick={toggleLanguage}
                            title={isRtl ? 'Switch to English' : t('autoGenerated.compText1391', 'التحويل للعربية')}
                            className="flex items-center justify-center gap-1 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors text-xs font-bold"
                        >
                            <Languages className="w-4 h-4" />
                            <span>{i18n.language === 'ar' ? 'EN' : t('autoGenerated.compText1392', 'عربي')}</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            title={isDark ? t('autoGenerated.compText1393', 'الوضع النهاري') : t('autoGenerated.compText1394', 'الوضع الليلي')}
                            className="flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        >
                            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{t('common.logout', t('autoGenerated.compText1395', 'تسجيل الخروج'))}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Navigation;
