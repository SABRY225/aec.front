/**
 * Accredited Bodies Data & Config for AEC
 * جهات الاعتماد المعترف بها للأكاديمية والشهادات
 */

export const ACCREDITATION_BODIES = [
    {
        id: 'tvtc',
        code: 'TVTC',
        nameAr: 'المؤسسة العامة للتدريب التقني والمهني',
        nameEn: 'Technical and Vocational Training Corporation (TVTC)',
        logo: '/accreditations/tvtc.svg',
        licenseNoticeAr: 'مرخصة من المؤسسة العامة للتدريب التقني والمهني • رقم الاعتماد: 212001000344',
        licenseNoticeEn: 'Licensed by TVTC – License No. 212001000344',
        licenseNo: '212001000344',
        country: 'المملكة العربية السعودية',
        isDefault: true,
        order: 1
    },
    {
        id: 'american_board',
        code: 'ABT',
        nameAr: 'البورد الأمريكي للتدريب والتعليم',
        nameEn: 'American Board of Training',
        logo: '/accreditations/american-board.svg',
        country: 'الولايات المتحدة الأمريكية',
        isDefault: true,
        order: 2
    },
    {
        id: 'british_board',
        code: 'BB',
        nameAr: 'البورد البريطاني للتدريب',
        nameEn: 'British Board',
        logo: '/accreditations/british-board.svg',
        country: 'المملكة المتحدة',
        isDefault: true,
        order: 3
    },
    {
        id: 'american_university',
        code: 'AU-CE',
        nameAr: 'جامعة التعليم المستمر الأمريكية',
        nameEn: 'American University - Continuing Education',
        logo: '/accreditations/american-university.svg',
        country: 'الولايات المتحدة الأمريكية',
        isDefault: true,
        order: 4
    },
    {
        id: 'iao',
        code: 'IAO',
        nameAr: 'المنظمة الدولية للاعتماد (IAO)',
        nameEn: 'International Accreditation Organization (IAO)',
        logo: '/accreditations/iao.svg',
        country: 'دولي',
        isDefault: true,
        order: 5
    },
    {
        id: 'certified_board',
        code: 'CB-CPD',
        nameAr: 'البورد المعتمد للتطوير المهني المستمر (CPD)',
        nameEn: 'Certified Board / CPD',
        logo: '/accreditations/certified-board.svg',
        country: 'دولي',
        isDefault: true,
        order: 6
    }
];

export const getAccreditationById = (id) => {
    return ACCREDITATION_BODIES.find(item => item.id === id || item.code === id) || null;
};

export const getAccreditationsList = (ids = []) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
    return ids.map(id => getAccreditationById(id)).filter(Boolean);
};
