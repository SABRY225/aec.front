export const formatDate = (date, language = 'en', options = {}) => {
  if (!date) return '';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatDateTime = (date, language = 'en', options = {}) => {
  if (!date) return '';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
};
