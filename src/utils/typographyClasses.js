/**
 * Gradient text via bg-clip-text breaks Arabic contextual shaping (e.g. ي + ف).
 * Prefer Tailwind utilities text-gradient-heading-ltr / text-gradient-accent-ltr in new code.
 */
export const headingGradient = (isRTL) =>
  isRTL ? 'text-gray-900' : 'text-gradient-heading-ltr';

export const accentGradient = (isRTL) =>
  isRTL ? 'text-blue-700' : 'text-gradient-accent-ltr';

export const cardTitleHover = (isRTL) =>
  isRTL
    ? 'group-hover:text-blue-700'
    : 'group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-gradient-accent-ltr';

/** Use on labels in Arabic instead of uppercase + tracking-wide */
export const labelCaps = (isRTL) => (isRTL ? '' : 'uppercase tracking-wide');
