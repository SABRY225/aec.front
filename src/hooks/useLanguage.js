import { useTranslation } from 'react-i18next';
import { applyDocumentLanguage, saveLanguage } from '../utils/applyDocumentLanguage';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isRTL = language === 'ar';

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    applyDocumentLanguage(lng);
    saveLanguage(lng);
  };

  return { language, isRTL, changeLanguage };
};
