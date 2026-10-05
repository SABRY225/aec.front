const fs = require('fs');
const files = ['src/pages/Login.jsx', 'src/pages/Register.jsx', 'src/pages/ContactUs.jsx'];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('dir="rtl"')) {
            content = content.replace(/dir="rtl"/g, "dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}");
            
            // Check if i18n is not destructured from useTranslation
            if (!content.includes('i18n') && content.includes('const { t } = useTranslation()')) {
                content = content.replace('const { t } = useTranslation()', 'const { t, i18n } = useTranslation()');
            } else if (!content.includes('i18n') && content.includes('const { t } = useTranslation();')) {
                content = content.replace('const { t } = useTranslation();', 'const { t, i18n } = useTranslation();');
            }
            
            fs.writeFileSync(file, content);
            console.log('Fixed RTL in', file);
        }
    } catch(e) {
        console.error('Failed to process', file, e);
    }
});
