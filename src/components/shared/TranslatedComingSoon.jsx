import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const TranslatedComingSoon = ({ titleKey, messageKey }) => {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t(titleKey)}
      message={t(messageKey)}
    />
  );
};

export default TranslatedComingSoon;
