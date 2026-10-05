import { faqContent } from './faq';
import { termsContent } from './terms';
import { privacyContent } from './privacy';

export const getLegalContent = (type, language) => {
  const lang = language?.startsWith('ar') ? 'ar' : 'en';

  switch (type) {
    case 'faq':
      return faqContent[lang];
    case 'terms':
      return termsContent[lang];
    case 'privacy':
      return privacyContent[lang];
    default:
      return null;
  }
};
