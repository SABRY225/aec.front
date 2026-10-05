import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DocumentTitle = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const setTitle = () => {
      document.title = t('common.meta.siteTitle');
    };

    setTitle();
    i18n.on('languageChanged', setTitle);
    return () => i18n.off('languageChanged', setTitle);
  }, [t, i18n]);

  return null;
};

export default DocumentTitle;
