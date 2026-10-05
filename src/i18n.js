import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './locales';
import {
  applyDocumentLanguage,
  getSavedLanguage,
  saveLanguage,
} from './utils/applyDocumentLanguage';

const savedLanguage = getSavedLanguage();
applyDocumentLanguage(savedLanguage);

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (lng) => {
  const language = lng?.startsWith('ar') ? 'ar' : 'en';
  applyDocumentLanguage(language);
  saveLanguage(language);
});

export default i18n;
