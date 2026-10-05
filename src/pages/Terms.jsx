import { useTranslation } from 'react-i18next';
import LegalDocumentPage from '../components/legal/LegalDocumentPage';
import { getLegalContent } from '../data/legal';

function Terms() {
  const { t, i18n } = useTranslation();
  const content = getLegalContent('terms', i18n.language);

  return (
    <LegalDocumentPage
      title={t('legal.terms.title')}
      lastUpdated={content.lastUpdated}
      intro={content.intro}
      sections={content.sections}
    />
  );
}

export default Terms;
