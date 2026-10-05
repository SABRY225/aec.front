import { useTranslation } from 'react-i18next';
import LegalDocumentPage from '../components/legal/LegalDocumentPage';
import { getLegalContent } from '../data/legal';

function Privacy() {
  const { t, i18n } = useTranslation();
  const content = getLegalContent('privacy', i18n.language);

  return (
    <LegalDocumentPage
      title={t('legal.privacy.title')}
      lastUpdated={content.lastUpdated}
      intro={content.intro}
      sections={content.sections}
    />
  );
}

export default Privacy;
