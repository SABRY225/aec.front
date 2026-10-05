import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const companyLogos = [
  // First row
  { id: 1, name: 'LinkedIn', icon: '/company-logos/linkedin.svg' },
  { id: 2, name: 'Behance', icon: '/company-logos/behance.svg' },
  { id: 3, name: 'Meta', icon: '/company-logos/meta.svg' },
  { id: 4, name: 'CSS3', icon: '/company-logos/css.svg' },
  { id: 5, name: 'Steam', icon: '/company-logos/steam.svg' },
  { id: 6, name: 'PayPal', icon: '/company-logos/paypal.svg' },
  { id: 7, name: 'Telegram', icon: '/company-logos/telegram.svg' },
  { id: 8, name: 'Dribbble', icon: '/company-logos/dribbble.svg' },
  { id: 9, name: 'CSS', icon: '/company-logos/css-alt.svg' },
  { id: 10, name: 'JavaScript', icon: '/company-logos/javascript.svg' },
  // Second row
  { id: 11, name: 'BMW', icon: '/company-logos/bmw.svg' },
  { id: 12, name: 'Chrome', icon: '/company-logos/chrome.svg' },
  { id: 13, name: 'Mastercard', icon: '/company-logos/mastercard.svg' },
  { id: 14, name: 'Messenger', icon: '/company-logos/messenger.svg' },
  { id: 15, name: 'AmTeX', icon: '/company-logos/amtex.svg' },
  { id: 16, name: 'Figma', icon: '/company-logos/figma.svg' },
  { id: 17, name: 'YouTube', icon: '/company-logos/youtube.svg' },
  { id: 18, name: 'Node.js', icon: '/company-logos/nodejs.svg' },
  { id: 19, name: 'Git', icon: '/company-logos/git.svg' },
  { id: 20, name: 'Google Translate', icon: '/company-logos/translate.svg' }
];

function TopCompanies() {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      y: -5,
      scale: 1.1,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('home.topCompanies.title')}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-5 md:grid-cols-10 gap-8 mb-8"
        >
          {companyLogos.slice(0, 10).map((company) => (
            <motion.div
              key={company.id}
              variants={itemVariants}
              whileHover="hover"
              className="flex items-center justify-center"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={company.icon}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-5 md:grid-cols-10 gap-8"
        >
          {companyLogos.slice(10).map((company) => (
            <motion.div
              key={company.id}
              variants={itemVariants}
              whileHover="hover"
              className="flex items-center justify-center"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={company.icon}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TopCompanies;
