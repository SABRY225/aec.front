import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error(i18n.t('common.errors.cartProvider'));
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever cartItems changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (course) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === course._id);
            if (existingItem) {
                // Course already in cart, don't add again
                return prevItems;
            }
            return [...prevItems, { ...course, addedAt: new Date().toISOString() }];
        });
    };

    const removeFromCart = (courseId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== courseId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.displayPrice || item.price || 0), 0);
    };

    const getCartItemsCount = () => {
        return cartItems.length;
    };

    const isInCart = (courseId) => {
        return cartItems.some(item => item._id === courseId);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const closeCart = () => {
        setIsCartOpen(false);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartItemsCount,
        isInCart,
        isCartOpen,
        toggleCart,
        closeCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};