import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import i18n from '../i18n';
import { cartService } from '../services/new-api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error(i18n.t('common.errors.cartProvider', 'useCart must be used within a CartProvider'));
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();
    
    // Keep a ref of previous cartItems for rollback in case of network error
    const previousItemsRef = useRef([]);

    // Remove any legacy cart item left in localStorage
    useEffect(() => {
        try {
            if (localStorage.getItem('cart')) {
                localStorage.removeItem('cart');
            }
        } catch {
            // Ignore storage access errors
        }
    }, []);

    // Fetch cart from backend database
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await cartService.getCart();
            if (response && response.success && response.cart) {
                setCartItems(response.cart.items || []);
            }
        } catch (error) {
            console.error('Failed to load cart from server:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Load cart on mount and whenever authentication status changes (login / logout)
    useEffect(() => {
        if (!isAuthenticated) {
            setCartItems([]);
            setLoading(false);
        } else {
            fetchCart();
        }
    }, [fetchCart, isAuthenticated]);

    /**
     * Add course to cart (Persisted to Backend DB)
     */
    const addToCart = async (course) => {
        if (!course || !course._id) return false;

        // Guard: Must be logged in student
        if (!isAuthenticated || !user) {
            return false;
        }

        if (user.role && user.role !== 'student') {
            return false;
        }

        // Check if already in cart
        const alreadyIn = cartItems.some(item => item._id === course._id);
        if (alreadyIn) return false;

        // Save current state for rollback
        previousItemsRef.current = cartItems;

        // Optimistic UI update
        const optimisticItem = {
            ...course,
            addedAt: new Date().toISOString()
        };
        setCartItems(prev => [...prev, optimisticItem]);

        try {
            const response = await cartService.addToCart(course._id);
            if (response && response.success && response.cart) {
                setCartItems(response.cart.items || []);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add course to backend cart:', error);
            // Rollback on failure
            setCartItems(previousItemsRef.current);
            return false;
        }
    };

    /**
     * Remove course from cart (Persisted to Backend DB)
     */
    const removeFromCart = async (courseId) => {
        if (!courseId) return;

        // Save current state for rollback
        previousItemsRef.current = cartItems;

        // Optimistic UI update
        setCartItems(prev => prev.filter(item => item._id !== courseId));

        try {
            const response = await cartService.removeFromCart(courseId);
            if (response && response.success && response.cart) {
                setCartItems(response.cart.items || []);
            }
        } catch (error) {
            console.error('Failed to remove course from backend cart:', error);
            // Rollback on failure
            setCartItems(previousItemsRef.current);
        }
    };

    /**
     * Clear all courses in cart (Persisted to Backend DB)
     */
    const clearCart = async () => {
        // Save current state for rollback
        previousItemsRef.current = cartItems;

        // Optimistic UI update
        setCartItems([]);

        try {
            await cartService.clearCart();
        } catch (error) {
            console.error('Failed to clear backend cart:', error);
            // Rollback on failure
            setCartItems(previousItemsRef.current);
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.displayPrice ?? item.price ?? 0);
            return total + (isNaN(price) ? 0 : price);
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.length;
    };

    const isInCart = (courseId) => {
        if (!courseId) return false;
        return cartItems.some(item => String(item._id) === String(courseId));
    };

    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    const openCart = () => {
        setIsCartOpen(true);
    };

    const closeCart = () => {
        setIsCartOpen(false);
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
        getTotalPrice,
        getCartItemsCount,
        isInCart,
        isCartOpen,
        toggleCart,
        openCart,
        closeCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;