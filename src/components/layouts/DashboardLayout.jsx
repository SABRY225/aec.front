import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const NavigationItem = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg transition-colors ${
                isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            {icon}
            <span className="text-sm md:text-base">{children}</span>
        </Link>
    );
};

const DashboardLayout = ({ navigationItems, allowedRoles = [] }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const roleKey = user?.role?.toLowerCase() || 'student';

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <div className="flex h-screen bg-gray-50 md:bg-gray-100">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                        onClick={closeSidebar}
                    ></div>
                )}

                {/* Sidebar */}
                <div className={`fixed md:static inset-y-0 start-0 z-50 sm:z-50 md:z-0 w-64 md:w-56 lg:w-64 bg-white shadow-lg md:shadow-md transform transition-transform duration-300 ease-in-out md:transform-none ${
                    isSidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full ltr:md:translate-x-0 rtl:md:translate-x-0'
                }`}>
                    <div className="flex flex-col h-screen p-3 md:p-4 overflow-y-auto">
                        {/* Mobile Close Button */}
                        <div className="flex justify-end md:hidden mb-4">
                            <button
                                onClick={closeSidebar}
                                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* User Profile Section */}
                        <div className="mb-6 md:mb-8 text-center">
                            {user?.photo ? (
                                <img
                                    src={user.photo}
                                    alt={user.firstName}
                                    className="w-16 md:w-20 h-16 md:h-20 rounded-full mx-auto mb-3 md:mb-4"
                                />
                            ) : (
                                <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-semibold text-blue-600">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                            )}
                            <h2 className="text-base md:text-lg font-semibold text-gray-900">{`${user?.firstName} ${user?.lastName}`}</h2>
                            <p className="text-xs md:text-sm text-gray-600">{t(`common.roles.${roleKey}`)}</p>
                        </div>

                        {/* Navigation Items */}
                        <nav className="flex-1 space-y-1 md:space-y-2">
                            {navigationItems.map((item) => (
                                <NavigationItem 
                                    key={item.path} 
                                    to={item.path} 
                                    icon={item.icon}
                                    onClick={closeSidebar}
                                >
                                    {item.label}
                                </NavigationItem>
                            ))}
                        </nav>

                        {/* Settings Links */}
                        <div className="border-t pt-4 space-y-1 md:space-y-2">
                            <NavigationItem 
                                to={`/${user?.role?.toLowerCase()}/account-settings`}
                                icon={
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                                onClick={closeSidebar}
                            >
                                {t('nav.dashboardLayout.account')}
                            </NavigationItem>
                            <NavigationItem 
                                to={`/${user?.role?.toLowerCase()}/profile-settings`}
                                icon={
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                                onClick={closeSidebar}
                            >
                                {t('nav.dashboardLayout.settings')}
                            </NavigationItem>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={async () => {
                                const result = await logout();
                                closeSidebar();
                                if (result?.redirectPath) {
                                    navigate(result.redirectPath);
                                }
                            }}
                            className="flex items-center gap-3 px-3 md:px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 w-full text-sm md:text-base"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('common.logout')}</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">{t('nav.dashboardLayout.mobileTitle', { role: t(`common.roles.${roleKey}`) })}</h1>
                        <div className="w-10"></div> {/* Spacer for centering */}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto bg-gray-50 md:bg-gray-100">
                        <div className="p-4 md:p-6">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default DashboardLayout;
