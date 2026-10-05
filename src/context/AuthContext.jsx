import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/new-api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to get a new access token using refresh token
                const token = await authService.initializeAuth();
                
                if (token) {
                    // If we got a token, verify it and get user data
                    const { user } = await authService.verifyToken();
                    setUser(user);
                    setIsAuthenticated(true);
                    
                    // Update localStorage with fresh user data
                    localStorage.setItem('userData', JSON.stringify(user));
                } else {
                    // No valid refresh token, check if we have cached user data
                    const userDataStr = localStorage.getItem('userData');
                    if (userDataStr) {
                        try {
                            const cachedUser = JSON.parse(userDataStr);
                            // Use cached data temporarily, but don't mark as authenticated
                            // This allows the user to see their info but they'll need to login for API calls
                            setUser(cachedUser);
                            setIsAuthenticated(false);
                        } catch (parseError) {
                            // Invalid cached data, clear it
                            localStorage.removeItem('userData');
                        }
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                // Don't clear localStorage immediately, let user try to login
                // localStorage.removeItem('userData');
            } finally {
                setLoading(false);
            }
        };
        
        initializeAuth();
    }, []);

    const getUserData = async () => {
        try {
            const response = await userService.getProfile();
            setUser(response);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = async (result) => {
        // Set initial user data from login response
        setUser(result.user);
        setIsAuthenticated(true);

        let currentUser = result.user;

        // Fetch complete user profile to ensure all data including photo is loaded
        try {
            const completeProfile = await userService.getProfile();
            currentUser = { ...currentUser, ...completeProfile };
            setUser(currentUser);
            // Update localStorage with complete profile data
            localStorage.setItem('userData', JSON.stringify(currentUser));
        } catch (profileError) {
            console.error('Error fetching complete profile:', profileError);
            // Continue with basic user data if profile fetch fails
        }

        // Get the intended destination if it exists
        const lastPath = localStorage.getItem('lastPath');
        localStorage.removeItem('lastPath');

        // Determine destination path based on user role and verification status
        const destinationPath = getRedirectPathForUser(currentUser);
        
        // Unverified instructors should always go to their designated review/apply page
        const finalRedirect = (currentUser?.role?.toLowerCase() === 'instructor' && !currentUser?.isVerified)
            ? destinationPath
            : (lastPath || destinationPath);

        // Return navigation path for the component to handle
        return { 
            success: true, 
            redirectTo: finalRedirect 
        };
    };

    const login = async (email, password) => {
        try {
            const result = await authService.login({ email, password });
            
            if (result.requires2FA) {
                return {
                    success: true,
                    requires2FA: true,
                    email: result.email,
                    message: result.message
                };
            }

            return await handleLoginSuccess(result);
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || i18n.t('auth.login.invalidCredentials')
            };
        }
    };

    const verifyAdminLogin = async (email, code) => {
        try {
            const result = await authService.verifyAdminLogin({ email, code });
            return await handleLoginSuccess(result);
        } catch (error) {
            console.error('Verify admin login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || i18n.t('auth.login.invalidCode', 'Invalid verification code')
            };
        }
    };

    const getRedirectPathForUser = (user) => {
        if (!user) return '/';
        const role = user.role?.toLowerCase();
        
        if (role === 'admin') {
            return '/admin/dashboard';
        }

        if (role === 'instructor') {
            if (user.isVerified) {
                return '/instructor/dashboard';
            }
            if (user.hasInstructorApplication || user.instructorApplicationStatus === 'pending') {
                return '/instructor/pending-approval';
            }
            return '/instructor/apply';
        }

        return '/student/dashboard';
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

    const logout = async () => {
        try {
            // Use the authService logout method (now async)
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Reset state regardless of API call success
            setUser(null);
            setIsAuthenticated(false);
            // Clear localStorage on explicit logout
            localStorage.removeItem('userData');
            
            // Note: Navigation should be handled by components that call logout
        }
    };

    const updateUser = (userData) => {
        const updatedUser = {
            ...user,
            ...userData
        };
        setUser(updatedUser);
        // Update localStorage with the updated user data
        localStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider 
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                verifyAdminLogin,
                logout,
                updateUser,
                getUserData,
                getRedirectPathForUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

