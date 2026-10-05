import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function LegalDocumentPage({ title, lastUpdated, intro, sections }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = title;
    return () => {
      document.title = t('common.meta.siteTitle');
    };
  }, [title, t]);

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {title}
          </motion.h1>
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-blue-100 text-sm"
            >
              {t('legal.lastUpdated')}: {lastUpdated}
            </motion.p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-700 leading-relaxed mb-10 text-lg"
          >
            {intro}
          </motion.p>
        )}

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 pb-8 last:border-0"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {index + 1}. {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegalDocumentPage;
