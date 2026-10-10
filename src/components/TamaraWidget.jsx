import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';

const TamaraWidget = ({ price, type = 'tamara-summary', inlineType = '2', className = '' }) => {
    const { isRTL } = useLanguage();
    const widgetRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.tamaraWidgetConfig) {
            window.tamaraWidgetConfig.lang = isRTL ? 'ar' : 'en';
            if (window.TamaraWidgetV2 && typeof window.TamaraWidgetV2.refresh === 'function') {
                try {
                    window.TamaraWidgetV2.refresh();
                } catch (e) {
                    // Ignore transient widget refresh errors
                }
            }
        }
    }, [price, isRTL]);

    if (!price || isNaN(price) || price <= 0) return null;

    return (
        <div className={`tamara-widget-container ${className}`}>
            <tamara-widget 
                ref={widgetRef}
                type={type} 
                amount={Number(price).toFixed(2)} 
                inline-type={inlineType}
            />
        </div>
    );
};

export default TamaraWidget;
