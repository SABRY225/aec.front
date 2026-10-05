import React from 'react';
import { sanitizeHTML } from '../../utils/htmlSanitizer';
import './RichTextDisplay.css';

/**
 * Component to safely display rich text HTML content
 * 
 * @param {string} content - HTML content to display
 * @param {number} maxLength - Optional: Maximum character length (for truncation)
 * @param {boolean} showFull - Whether to show full content or truncated
 * @param {string} className - Additional CSS classes
 */
const RichTextDisplay = ({ 
    content, 
    maxLength = null, 
    showFull = true, 
    className = '' 
}) => {
    if (!content) {
        return null;
    }

    // Sanitize the HTML content
    let sanitizedContent = sanitizeHTML(content);

    // Detect Arabic/RTL text and preserve/apply dir="rtl" and text-align styles
    const enhanceRTL = (html) => {
        // Check if content contains Arabic characters (Unicode range: \u0600-\u06FF)
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        if (arabicRegex.test(textContent)) {
            // Check if root element or any element has dir attribute
            const rootElement = tempDiv.firstElementChild;
            const hasDir = tempDiv.querySelector('[dir]');
            
            // If no dir attribute exists, add dir="rtl" to root element or wrap
            if (!hasDir) {
                if (rootElement && rootElement.tagName && ['P', 'DIV', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(rootElement.tagName)) {
                    rootElement.setAttribute('dir', 'rtl');
                } else {
                    // Wrap in div with dir="rtl"
                    const wrapper = document.createElement('div');
                    wrapper.setAttribute('dir', 'rtl');
                    wrapper.innerHTML = html;
                    return wrapper.innerHTML;
                }
            }
            
            // Ensure text-align: right is preserved for elements with Arabic text
            const allElements = tempDiv.querySelectorAll('*');
            allElements.forEach(el => {
                const elText = el.textContent || '';
                if (arabicRegex.test(elText)) {
                    const currentStyle = el.getAttribute('style') || '';
                    // If element has text-align: right, ensure it's preserved
                    if (currentStyle.includes('text-align: right') || currentStyle.includes('text-align:right')) {
                        // Already has right alignment, keep it
                        return;
                    }
                    // If no text-align specified and has Arabic, add right alignment
                    if (!currentStyle.includes('text-align')) {
                        el.setAttribute('style', (currentStyle ? currentStyle + '; ' : '') + 'text-align: right');
                    }
                }
            });
            
            return tempDiv.innerHTML;
        }
        return html;
    };

    sanitizedContent = enhanceRTL(sanitizedContent);

    // Truncate if needed
    let displayContent = sanitizedContent;
    if (!showFull && maxLength) {
        // Strip HTML tags to check text length
        const textContent = sanitizedContent.replace(/<[^>]*>/g, '');
        if (textContent.length > maxLength) {
            // Create a temporary element to properly truncate HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sanitizedContent;
            
            let textLength = 0;
            let truncated = false;
            
            const truncateNode = (node) => {
                if (truncated) return;
                
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    if (textLength + text.length > maxLength) {
                        node.textContent = text.substring(0, maxLength - textLength) + '...';
                        truncated = true;
                        return;
                    }
                    textLength += text.length;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const children = Array.from(node.childNodes);
                    for (let child of children) {
                        if (truncated) {
                            try {
                                node.removeChild(child);
                            } catch (e) {
                                // Ignore errors when removing nodes
                            }
                        } else {
                            truncateNode(child);
                        }
                    }
                }
            };
            
            truncateNode(tempDiv);
            displayContent = tempDiv.innerHTML;
        }
    }

    // Detect if content has RTL/Arabic text for wrapper class
    const hasRTL = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(displayContent);
    const wrapperDir = hasRTL ? 'rtl' : 'auto';

    return (
        <div 
            className={`rich-text-display ${className}`}
            dir={wrapperDir}
            dangerouslySetInnerHTML={{ __html: displayContent }}
        />
    );
};

export default RichTextDisplay;

