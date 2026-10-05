import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const ComingSoon = ({ title, message }) => {
    const { t } = useTranslation();
    const displayTitle = title ?? t('common.comingSoon.defaultTitle');
    const displayMessage = message ?? t('common.comingSoon.defaultMessage');

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
            <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-full animate-pulse"></div>
                    </div>
                    <svg
                        className="w-16 h-16 mx-auto relative z-10 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                </div>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">{displayTitle}</h2>

                <p className="text-lg text-gray-600 mb-8">{displayMessage}</p>

                <div className="w-64 mx-auto">
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full w-1/3 animate-[progress_2s_ease-in-out_infinite]"
                            style={{
                                '@keyframes progress': {
                                    '0%': { transform: 'translateX(-100%)' },
                                    '50%': { transform: 'translateX(100%)' },
                                    '100%': { transform: 'translateX(-100%)' }
                                }
                            }}
                        ></div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('common.comingSoon.inDevelopment')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {t('common.comingSoon.stayTuned')}
                    </div>
                </div>
            </div>
        </div>
    );
};

ComingSoon.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string
};

export default ComingSoon;

