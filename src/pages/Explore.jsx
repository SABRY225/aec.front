import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CourseCategories from '../components/explore/CourseCategories';

function Explore() {
    const { t } = useTranslation();

    useEffect(() => {
        document.title = `${t('explore.title', 'استكشف الدورات')} | ${t('common.meta.siteTitle', 'أكاديمية AEC')}`;
    }, [t]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#F8FAFC]"
        >
            <CourseCategories />
        </motion.div>
    );
}

export default Explore;
