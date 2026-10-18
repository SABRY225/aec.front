import React, { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_01a0caa6-7b0e-7830-d0c4-c345462b4a9c';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'OJDM3';

/**
 * TabbyCard component for the Checkout page.
 * Displays official Tabby card snippet under the Tabby payment method.
 *
 * @param {number|string} price - Order total price
 * @param {string} [currency='SAR'] - Currency code ('SAR' or 'AED')
 * @param {string} [lang] - 'ar' or 'en'
 * @param {string} [className] - Optional custom CSS classes
 * @param {string} [customId] - Optional custom element ID
 */
const TabbyCard = ({
    price,
    currency = 'SAR',
    lang,
    className = '',
    customId
}) => {
    const { i18n } = useTranslation();
    const autoId = useId().replace(/[:]/g, '');
    const containerId = customId || `tabby-card-${autoId}`;
    const containerRef = useRef(null);

    const numericPrice = Number(price);
    const resolvedLang = lang || (i18n.language?.startsWith('en') ? 'en' : 'ar');

    useEffect(() => {
        if (!numericPrice || numericPrice <= 0 || isNaN(numericPrice)) {
            return;
        }

        let isMounted = true;

        const initTabby = () => {
            if (!isMounted || !window.TabbyCard) return;
            const el = document.getElementById(containerId);
            if (!el) return;

            try {
                el.innerHTML = '';
                new window.TabbyCard({
                    selector: `#${containerId}`,
                    currency: currency.toUpperCase(),
                    price: numericPrice.toFixed(2),
                    lang: resolvedLang,
                    publicKey: TABBY_PUBLIC_KEY,
                    merchantCode: TABBY_MERCHANT_CODE
                });
            } catch (err) {
                console.warn('TabbyCard init error:', err);
            }
        };

        if (window.TabbyCard) {
            initTabby();
        } else {
            let script = document.getElementById('tabby-card-script');
            if (!script) {
                script = document.createElement('script');
                script.id = 'tabby-card-script';
                script.src = 'https://checkout.tabby.ai/tabby-card.js';
                script.async = true;
                document.head.appendChild(script);
            }
            script.addEventListener('load', initTabby);
            return () => {
                isMounted = false;
                script.removeEventListener('load', initTabby);
            };
        }

        return () => {
            isMounted = false;
        };
    }, [numericPrice, currency, resolvedLang, containerId]);

    if (!numericPrice || numericPrice <= 0 || isNaN(numericPrice)) {
        return null;
    }

    return (
        <div 
            id={containerId} 
            ref={containerRef} 
            className={`tabby-card-wrapper ${className}`}
            dir={resolvedLang === 'ar' ? 'rtl' : 'ltr'}
        />
    );
};

export default TabbyCard;
