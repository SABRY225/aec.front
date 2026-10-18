import React, { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_01a0caa6-7b0e-7830-d0c4-c345462b4a9c';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'OJDM3';

/**
 * TabbyPromo component for Product and Cart pages.
 * Displays official Tabby split-in-4 promotional messaging with "Learn more" popup.
 *
 * @param {number|string} price - Price to calculate installments from
 * @param {string} [currency='SAR'] - Currency code ('SAR' or 'AED')
 * @param {string} [source='product'] - 'product' or 'cart'
 * @param {string} [lang] - 'ar' or 'en' (defaults to current language)
 * @param {string} [className] - Optional custom CSS classes
 * @param {string} [customId] - Optional custom element ID
 */
const TabbyPromo = ({
    price,
    currency = 'SAR',
    source = 'product',
    lang,
    className = '',
    customId
}) => {
    const { i18n } = useTranslation();
    const autoId = useId().replace(/[:]/g, '');
    const containerId = customId || `tabby-promo-${autoId}`;
    const containerRef = useRef(null);

    const numericPrice = Number(price);
    const resolvedLang = lang || (i18n.language?.startsWith('en') ? 'en' : 'ar');

    useEffect(() => {
        if (!numericPrice || numericPrice <= 0 || isNaN(numericPrice)) {
            return;
        }

        let isMounted = true;

        const initTabby = () => {
            if (!isMounted || !window.TabbyPromo) return;
            const el = document.getElementById(containerId);
            if (!el) return;

            try {
                // Clear any previous rendered markup in container
                el.innerHTML = '';
                new window.TabbyPromo({
                    selector: `#${containerId}`,
                    currency: currency.toUpperCase(),
                    price: numericPrice.toFixed(2),
                    lang: resolvedLang,
                    source: source,
                    publicKey: TABBY_PUBLIC_KEY,
                    merchantCode: TABBY_MERCHANT_CODE
                });
            } catch (err) {
                console.warn('TabbyPromo init error:', err);
            }
        };

        if (window.TabbyPromo) {
            initTabby();
        } else {
            let script = document.getElementById('tabby-promo-script');
            if (!script) {
                script = document.createElement('script');
                script.id = 'tabby-promo-script';
                script.src = 'https://checkout.tabby.ai/tabby-promo.js';
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
    }, [numericPrice, currency, source, resolvedLang, containerId]);

    if (!numericPrice || numericPrice <= 0 || isNaN(numericPrice)) {
        return null;
    }

    return (
        <div 
            id={containerId} 
            ref={containerRef} 
            className={`tabby-promo-wrapper ${className}`}
            dir={resolvedLang === 'ar' ? 'rtl' : 'ltr'}
        />
    );
};

export default TabbyPromo;
