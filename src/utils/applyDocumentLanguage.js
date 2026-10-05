export const LANGUAGE_STORAGE_KEY = 'aec-language';

export const applyDocumentLanguage = (language) => {
  const isArabic = language === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = isArabic ? 'ar' : 'en';
  document.documentElement.classList.toggle('font-arabic', isArabic);
  document.body.classList.toggle('font-arabic', isArabic);
};

export const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // ignore storage errors
  }
  return 'en';
};

export const saveLanguage = (language) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore storage errors
  }
};
