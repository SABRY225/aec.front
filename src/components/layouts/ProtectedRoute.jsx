import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], requireVerified = true }) => {
    const { isAuthenticated, user, loading, getRedirectPathForUser } = useAuth();
    const location = useLocation();

    // Show loading while authentication is being initialized
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const intendedPath = `${location.pathname}${location.search || ''}`;
        localStorage.setItem('lastPath', intendedPath);
        return <Navigate to={`/login?redirect=${encodeURIComponent(intendedPath)}`} replace />;
    }

    const hasAccess = allowedRoles.length === 0 || (user?.role && allowedRoles.includes(user.role.toLowerCase()));
    
    if (!hasAccess) {
        // Redirect to appropriate destination based on role
        const destination = getRedirectPathForUser ? getRedirectPathForUser(user) : getDashboardPathByRole(user?.role);
        return <Navigate to={destination} replace />;
    }

    // Intercept unverified instructors trying to access instructor workspace
    if (requireVerified && user?.role?.toLowerCase() === 'instructor' && !user?.isVerified) {
        const currentPath = location.pathname;
        const isExempt = currentPath === '/instructor/pending-approval' || currentPath === '/instructor/apply';
        if (!isExempt) {
            const redirectPath = (user.hasInstructorApplication || user.instructorApplicationStatus === 'pending')
                ? '/instructor/pending-approval'
                : '/instructor/apply';
            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
};

const getDashboardPathByRole = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return '/admin/dashboard';
        case 'instructor':
            return '/instructor/dashboard';
        default:
            return '/student/dashboard';
    }
};

export default ProtectedRoute;
