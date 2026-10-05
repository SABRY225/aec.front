import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSwitcher = () => {
    const { t } = useTranslation();
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', nameKey: 'nav.languageSwitcher.english', flag: '🇺🇸' },
        { code: 'ar', nameKey: 'nav.languageSwitcher.arabic', flag: '🇸🇦' }
    ];

    const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

    const handleLanguageChange = async (languageCode) => {
        await changeLanguage(languageCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
                aria-label={t('nav.languageSwitcher.changeLanguage')}
            >
                <GlobeAltIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t(currentLanguage.nameKey)}</span>
                <span className="sm:hidden">{currentLanguage.flag}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute end-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1" role="menu">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors duration-200 ${
                                        currentLanguage.code === lang.code
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700'
                                    }`}
                                    role="menuitem"
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span>{t(lang.nameKey)}</span>
                                    {currentLanguage.code === lang.code && (
                                        <span className="ms-auto text-blue-600">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
