import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import {
    Handshake,
    ShieldCheck,
    ExternalLink,
    Award,
    CheckCircle2,
    Sparkles,
    Building2
} from 'lucide-react';
import api from '../../services/new-api';

const defaultPartners = [
    {
        id: 1,
        name: 'Autodesk',
        nameAr: 'أوتوديسك العالمية',
        nameEn: 'Autodesk',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Autodesk_Logo.png',
        website: 'https://www.autodesk.com',
        description: 'شريك برمجيات الهندسة والتصميم والتصنيع (BIM & CAD)',
        category: 'technology'
    },
    {
        id: 2,
        name: 'PMI',
        nameAr: 'معهد إدارة المشاريع PMI',
        nameEn: 'Project Management Institute (PMI)',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/PMI_Logo_Solid_RGB.png',
        website: 'https://www.pmi.org',
        description: 'الجهة العالمية الأولى المانحة لشهادات PMP وإدارة المشاريع',
        category: 'accreditation'
    },
    {
        id: 3,
        name: 'ISO',
        nameAr: 'المنظمة الدولية للمعايير ISO',
        nameEn: 'International Organization for Standardization (ISO)',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/ISO_Logo_%28Red_square%29.svg',
        website: 'https://www.iso.org',
        description: 'معايير إدارة الجودة والاعتمادات المؤسسية العالمية',
        category: 'accreditation'
    },
    {
        id: 4,
        name: 'NEBOSH',
        nameAr: 'مجلس الامتحانات الوطني للصحة والسلامة NEBOSH',
        nameEn: 'NEBOSH UK',
        logo: 'https://www.nebosh.org.uk/images/logos/nebosh-logo.png',
        website: 'https://www.nebosh.org.uk',
        description: 'الهيئة البريطانية الرائدة في شهادات السلامة والصحة المهنية',
        category: 'accreditation'
    },
    {
        id: 5,
        name: 'OSHA',
        nameAr: 'إدارة السلامة والصحة المهنية الأمريكية OSHA',
        nameEn: 'Occupational Safety & Health (OSHA)',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/OSHA_logo.svg',
        website: 'https://www.osha.gov',
        description: 'المعايير الدولية للصحة والسلامة وإدارة المخاطر المهنية',
        category: 'accreditation'
    },
    {
        id: 6,
        name: 'Saudi Council of Engineers',
        nameAr: 'الهيئة السعودية للمهندسين',
        nameEn: 'Saudi Council of Engineers',
        logo: 'https://saudieng.sa/English/PublishingImages/Logo.png',
        website: 'https://saudieng.sa',
        description: 'الجهة المنظمة والمشرفة على المهن الهندسية في المملكة',
        category: 'engineering'
    }
];

function PartnersSection() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState({});

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await api.get('/partners');
                if (response && Array.isArray(response.data) && response.data.length > 0) {
                    setPartners(response.data);
                } else {
                    setPartners(defaultPartners);
                }
            } catch (error) {
                console.error('Failed to fetch partners from API:', error);
                setPartners(defaultPartners);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const displayPartners = partners.length > 0 ? partners : defaultPartners;

    const handleImageError = (id) => {
        setFailedImages((prev) => ({ ...prev, [id]: true }));
    };

    return (
        <section
            className="py-16 sm:py-20 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50 border-t border-slate-200/80 relative overflow-hidden select-none"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/3 start-1/10 w-96 h-96 bg-[#004C97]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 end-1/10 w-96 h-96 bg-[#F7931E]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#004C97] font-bold text-xs sm:text-sm mb-3.5 shadow-sm"
                    >
                        <Handshake className="w-4 h-4 text-[#F7931E]" />
                        <span>{isRTL ? 'شراكات واعتمادات استراتيجية' : 'Strategic Accreditations & Partners'}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
                    >
                        {isRTL ? 'شركاء النجاح والاعتماد الدولي' : 'Our Success & Accreditation Partners'}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        {isRTL
                            ? 'نعتز بشراكاتنا المعتمدة مع كبرى المؤسسات والهيئات العالمية لتقديم شهادات معترف بها وتدريب يرتقي لأعلى المعايير'
                            : 'We take pride in our certified partnerships with leading global bodies to provide accredited certifications and high-standard training'}
                    </motion.p>
                </div>

                {/* Partners Showcase Grid */}
                {loading && partners.length === 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {displayPartners.map((partner, index) => {
                            const id = partner._id || partner.id || index;
                            const name = isRTL ? (partner.nameAr || partner.name) : (partner.nameEn || partner.name);
                            const logo = partner.logo || partner.image;
                            const hasFailed = failedImages[id];
                            const link = partner.website;

                            const CardWrapper = link ? 'a' : 'div';
                            const linkProps = link
                                ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
                                : {};

                            return (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="h-full"
                                >
                                    <CardWrapper
                                        {...linkProps}
                                        className="h-full group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 hover:border-[#004C97]/30 shadow-sm hover:shadow-xl hover:shadow-[#004C97]/10 p-5 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-1.5 text-center cursor-pointer overflow-hidden"
                                    >
                                        {/* Subtle Accent Glow on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#004C97]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                        {/* External Link Indicator */}
                                        {link && (
                                            <div className="absolute top-2.5 end-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 group-hover:text-[#004C97]">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </div>
                                        )}

                                        {/* Logo Container */}
                                        <div className="h-16 w-full flex items-center justify-center p-2 mb-3">
                                            {logo && !hasFailed ? (
                                                <img
                                                    src={logo}
                                                    alt={name}
                                                    loading="lazy"
                                                    onError={() => handleImageError(id)}
                                                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004C97] font-black text-sm">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Partner Name & Tag */}
                                        <div className="w-full">
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#004C97] transition-colors truncate">
                                                {name}
                                            </h3>
                                            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 truncate">
                                                {isRTL ? 'اعتماد موثق' : 'Certified'}
                                            </span>
                                        </div>
                                    </CardWrapper>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Trust Highlights Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 sm:mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004C97] shrink-0">
                            <Award className="w-5 h-5 text-[#004C97]" />
                        </div>
                        <div className="text-start">
                            <h4 className="text-sm font-black text-slate-900">
                                {isRTL ? 'شهادات معتمدة دولياً' : 'Globally Recognized'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                {isRTL ? 'معترف بها في كبرى المؤسسات والشركات' : 'Accredited by leading global institutions'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-start">
                            <h4 className="text-sm font-black text-slate-900">
                                {isRTL ? 'شراكات رسمية وموثوقة' : 'Official Partnerships'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                {isRTL ? 'اتفاقيات مباشرة مع الهيئات العالمية' : 'Direct agreements with certified bodies'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#F7931E] shrink-0">
                            <Sparkles className="w-5 h-5 text-[#F7931E]" />
                        </div>
                        <div className="text-start">
                            <h4 className="text-sm font-black text-slate-900">
                                {isRTL ? 'أعلى معايير الجودة' : 'Highest Quality Standards'}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                {isRTL ? 'محتوى تدريبي حديث ومحدث دورياً' : 'Constantly updated curriculum and tools'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default PartnersSection;
