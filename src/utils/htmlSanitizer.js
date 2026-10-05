/**
 * Sanitizes HTML content by removing dangerous scripts and attributes
 * while preserving formatting tags
 * 
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
    if (!html || typeof html !== 'string') {
        return '';
    }

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Allowed tags for formatting
    const allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img',
        'div', 'span',
        'sub', 'sup',
        'hr'
    ];

    // Allowed attributes (include dir for RTL support)
    const allowedAttributes = {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
        'p': ['style', 'class', 'dir'],
        'div': ['style', 'class', 'dir'],
        'span': ['style', 'class', 'dir'],
        'h1': ['style', 'class', 'dir'],
        'h2': ['style', 'class', 'dir'],
        'h3': ['style', 'class', 'dir'],
        'h4': ['style', 'class', 'dir'],
        'h5': ['style', 'class', 'dir'],
        'h6': ['style', 'class', 'dir'],
        'ul': ['style', 'class', 'dir'],
        'ol': ['style', 'class', 'dir'],
        'li': ['style', 'class', 'dir'],
        'blockquote': ['style', 'class', 'dir'],
        'code': ['style', 'class', 'dir'],
        'pre': ['style', 'class', 'dir'],
        'strong': ['style', 'class', 'dir'],
        'b': ['style', 'class', 'dir'],
        'em': ['style', 'class', 'dir'],
        'i': ['style', 'class', 'dir'],
        'u': ['style', 'class', 'dir'],
        's': ['style', 'class', 'dir'],
        'strike': ['style', 'class', 'dir'],
    };

    // Function to sanitize attributes
    const sanitizeAttributes = (element, tagName) => {
        const allowedAttrs = allowedAttributes[tagName.toLowerCase()] || [];
        const attributes = Array.from(element.attributes);

        attributes.forEach(attr => {
            // Remove dangerous attributes
            if (attr.name.toLowerCase().startsWith('on') || // onclick, onerror, etc.
                attr.name.toLowerCase() === 'javascript:' ||
                attr.name.toLowerCase() === 'data:' ||
                attr.value.toLowerCase().includes('javascript:') ||
                attr.value.toLowerCase().includes('data:text/html')) {
                element.removeAttribute(attr.name);
                return;
            }

            // Only keep allowed attributes
            if (!allowedAttrs.includes(attr.name.toLowerCase())) {
                element.removeAttribute(attr.name);
            } else {
                // Sanitize href and src attributes
                if (attr.name === 'href' || attr.name === 'src') {
                    const value = attr.value.toLowerCase();
                    if (value.startsWith('javascript:') ||
                        value.startsWith('data:text/html') ||
                        value.startsWith('vbscript:')) {
                        element.removeAttribute(attr.name);
                    }
                }
                // Sanitize style attribute - remove dangerous CSS but preserve text-align and direction
                if (attr.name === 'style') {
                    let styleValue = attr.value;
                    // Remove dangerous CSS properties
                    styleValue = styleValue.replace(/expression\s*\(/gi, '');
                    styleValue = styleValue.replace(/javascript\s*:/gi, '');
                    styleValue = styleValue.replace(/@import/gi, '');
                    styleValue = styleValue.replace(/binding/gi, '');
                    styleValue = styleValue.replace(/-moz-binding/gi, '');
                    // Preserve text-align, direction, and other safe CSS properties
                    element.setAttribute('style', styleValue);
                }
                // Preserve dir attribute for RTL support
                if (attr.name === 'dir' && (attr.value === 'rtl' || attr.value === 'ltr' || attr.value === 'auto')) {
                    element.setAttribute('dir', attr.value);
                }
            }
        });

        // Add rel="noopener noreferrer" to external links
        if (tagName.toLowerCase() === 'a') {
            const href = element.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                element.setAttribute('target', '_blank');
                element.setAttribute('rel', 'noopener noreferrer');
            }
        }
    };

    // Function to recursively sanitize the DOM tree
    const sanitizeNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            // Remove script, style, iframe, embed, object, and other dangerous tags
            if (['script', 'style', 'iframe', 'embed', 'object', 'form', 'input', 'button', 'textarea', 'select'].includes(tagName)) {
                return null;
            }

            // If tag is not allowed, remove it but keep its children
            if (!allowedTags.includes(tagName)) {
                const fragment = document.createDocumentFragment();
                Array.from(node.childNodes).forEach(child => {
                    const sanitized = sanitizeNode(child);
                    if (sanitized) {
                        fragment.appendChild(sanitized);
                    }
                });
                return fragment;
            }

            // Unwrap "لمحة عن الدورة" / "Course Overview" links: show as plain text, not hyperlink
            if (tagName === 'a') {
                const raw = (node.textContent || '').trim();
                const normalized = raw.replace(/^[\s:]+|[\s:]+$/g, '').trim();
                if (normalized === 'لمحة عن الدورة' || normalized === 'Course Overview') {
                    const span = document.createElement('span');
                    span.textContent = raw || 'لمحة عن الدورة';
                    return span;
                }
            }

            // Clone the element
            const sanitizedElement = document.createElement(tagName);

            // Sanitize attributes
            sanitizeAttributes(node, tagName);

            // Copy allowed attributes (including dir for RTL)
            Array.from(node.attributes).forEach(attr => {
                const attrName = attr.name.toLowerCase();
                if (allowedAttributes[tagName]?.includes(attrName)) {
                    // Preserve dir attribute for RTL support
                    if (attrName === 'dir' && ['rtl', 'ltr', 'auto'].includes(attr.value.toLowerCase())) {
                        sanitizedElement.setAttribute('dir', attr.value);
                    } else {
                        sanitizedElement.setAttribute(attr.name, attr.value);
                    }
                }
            });

            // Recursively sanitize children
            Array.from(node.childNodes).forEach(child => {
                const sanitized = sanitizeNode(child);
                if (sanitized) {
                    if (sanitized.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                        Array.from(sanitized.childNodes).forEach(fragmentChild => {
                            sanitizedElement.appendChild(fragmentChild);
                        });
                    } else {
                        sanitizedElement.appendChild(sanitized);
                    }
                }
            });

            return sanitizedElement;
        }

        return null;
    };

    // Sanitize all nodes
    const sanitizedNodes = Array.from(tempDiv.childNodes)
        .map(node => sanitizeNode(node))
        .filter(node => node !== null);

    // Create a new container for sanitized content
    const sanitizedDiv = document.createElement('div');
    sanitizedNodes.forEach(node => {
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            Array.from(node.childNodes).forEach(child => {
                sanitizedDiv.appendChild(child);
            });
        } else {
            sanitizedDiv.appendChild(node);
        }
    });

    return sanitizedDiv.innerHTML;
};

