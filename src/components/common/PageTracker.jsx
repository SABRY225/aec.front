import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/new-api';

const getDeviceType = () => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

const getBrowserName = () => {
    if (typeof navigator === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Browser';
};

const getOSName = () => {
    if (typeof navigator === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
};

/**
 * Lightweight background component that silently tracks user page visits
 */
const PageTracker = () => {
    const location = useLocation();
    const lastTrackedPath = useRef('');

    useEffect(() => {
        const currentPath = location.pathname;

        // Skip tracking admin internal pages
        if (!currentPath || currentPath.startsWith('/admin')) {
            return;
        }

        // Avoid duplicate firing on hash / query change for same path
        if (lastTrackedPath.current === currentPath) {
            return;
        }

        lastTrackedPath.current = currentPath;

        // Delay slightly so document.title can update if changed by the component
        const timeoutId = setTimeout(() => {
            const pageTitle = document.title || 'منصة التدريب الهندسي';
            analyticsService.recordPageView({
                path: currentPath,
                pageTitle: pageTitle.slice(0, 150),
                device: getDeviceType(),
                browser: getBrowserName(),
                os: getOSName(),
                referrer: typeof document !== 'undefined' ? document.referrer : ''
            });
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [location.pathname]);

    return null;
};

export default PageTracker;
