// Comprehensive categories and subcategories data
// Used across registration, become a instructor , and course creation forms

export const categoriesData = [
    {
        id: 'health-medicine',
        nameAr: 'الصحة و الطب',
        nameEn: 'Health & Medicine',
        icon: '🏥',
        subcategories: [
            { id: 'human-medicine', nameAr: 'طب بشري', nameEn: 'Human Medicine' },
            { id: 'nursing', nameAr: 'التمريض', nameEn: 'Nursing' },
            { id: 'biomedical-sciences', nameAr: 'العلوم الطبية الحيوية', nameEn: 'Biomedical Sciences' },
            { id: 'food-science', nameAr: 'علوم وتكنولوجيا الأغذية', nameEn: 'Food Science & Technology' },
            { id: 'nutrition-health', nameAr: 'التغذية والصحة', nameEn: 'Nutrition & Health' },
            { id: 'alternative-medicine', nameAr: 'الطب البديل', nameEn: 'Alternative Medicine' },
            { id: 'mental-health', nameAr: 'الصحة النفسية', nameEn: 'Mental Health' }
        ]
    },
    {
        id: 'engineering',
        nameAr: 'الهندسة',
        nameEn: 'Engineering',
        icon: '⚙️',
        subcategories: [
            { id: 'energy-engineering', nameAr: 'هندسة الطاقة', nameEn: 'Energy Engineering' },
            { id: 'aerospace-engineering', nameAr: 'هندسة الطيران والفضاء', nameEn: 'Aerospace Engineering' },
            { id: 'civil-engineering', nameAr: 'الهندسة المدنية', nameEn: 'Civil Engineering' },
            { id: 'electrical-engineering', nameAr: 'الهندسة الكهربائية', nameEn: 'Electrical Engineering' },
            { id: 'mechanical-engineering', nameAr: 'الهندسة الميكانيكية', nameEn: 'Mechanical Engineering' },
            { id: 'petroleum-engineering', nameAr: 'هندسة البترول', nameEn: 'Petroleum Engineering' },
            { id: 'chemical-engineering', nameAr: 'الهندسة الكيميائية', nameEn: 'Chemical Engineering' }
        ]
    },
    {
        id: 'software-tools',
        nameAr: 'برامج',
        nameEn: 'Software & Tools',
        icon: '💻',
        subcategories: [
            { id: 'microsoft-office', nameAr: 'Microsoft Office', nameEn: 'Microsoft Office' },
            { id: 'adobe-creative', nameAr: 'Adobe Creative Suite', nameEn: 'Adobe Creative Suite' },
            { id: 'design-software', nameAr: 'برامج التصميم', nameEn: 'Design Software' },
            { id: 'accounting-software', nameAr: 'برامج المحاسبة', nameEn: 'Accounting Software' },
            { id: 'cms', nameAr: 'أنظمة إدارة المحتوى', nameEn: 'Content Management Systems' },
            { id: 'engineering-software', nameAr: 'برامج الهندسة', nameEn: 'Engineering Software' },
            { id: 'statistical-analysis', nameAr: 'برامج التحليل الإحصائي', nameEn: 'Statistical Analysis Software' }
        ]
    },
    {
        id: 'law',
        nameAr: 'القانون',
        nameEn: 'Law',
        icon: '⚖️',
        subcategories: [
            { id: 'civil-law', nameAr: 'القانون المدني', nameEn: 'Civil Law' },
            { id: 'criminal-law', nameAr: 'القانون الجنائي', nameEn: 'Criminal Law' },
            { id: 'commercial-law', nameAr: 'القانون التجاري', nameEn: 'Commercial Law' },
            { id: 'labor-law', nameAr: 'قانون العمل', nameEn: 'Labor Law' },
            { id: 'international-law', nameAr: 'القانون الدولي', nameEn: 'International Law' },
            { id: 'family-law', nameAr: 'قانون الأسرة', nameEn: 'Family Law' },
            { id: 'administrative-law', nameAr: 'القانون الإداري', nameEn: 'Administrative Law' }
        ]
    },
    {
        id: 'it-programming',
        nameAr: 'تقنية معلومات & برمجة',
        nameEn: 'IT & Programming',
        icon: '👨‍💻',
        subcategories: [
            { id: 'web-development', nameAr: 'تطوير الويب', nameEn: 'Web Development' },
            { id: 'mobile-development', nameAr: 'تطوير التطبيقات', nameEn: 'Mobile Development' },
            { id: 'information-security', nameAr: 'أمن المعلومات', nameEn: 'Information Security' },
            { id: 'databases', nameAr: 'قواعد البيانات', nameEn: 'Databases' },
            { id: 'artificial-intelligence', nameAr: 'الذكاء الاصطناعي', nameEn: 'Artificial Intelligence' },
            { id: 'data-science', nameAr: 'علوم البيانات', nameEn: 'Data Science' },
            { id: 'networking', nameAr: 'الشبكات', nameEn: 'Networking' }
        ]
    },
    {
        id: 'humanities-applied-sciences',
        nameAr: 'العلوم الانسانية & التطبيقية',
        nameEn: 'Humanities & Applied Sciences',
        icon: '📚',
        subcategories: [
            { id: 'psychology', nameAr: 'علم النفس', nameEn: 'Psychology' },
            { id: 'sociology', nameAr: 'علم الاجتماع', nameEn: 'Sociology' },
            { id: 'history', nameAr: 'التاريخ', nameEn: 'History' },
            { id: 'geography', nameAr: 'الجغرافيا', nameEn: 'Geography' },
            { id: 'philosophy', nameAr: 'الفلسفة', nameEn: 'Philosophy' },
            { id: 'literature', nameAr: 'الأدب', nameEn: 'Literature' },
            { id: 'cultural-studies', nameAr: 'الدراسات الثقافية', nameEn: 'Cultural Studies' }
        ]
    },
    {
        id: 'personal-care-fitness',
        nameAr: 'العناية الشخصية واللياقة البدنية',
        nameEn: 'Personal Care & Fitness',
        icon: '💪',
        subcategories: [
            { id: 'fitness', nameAr: 'اللياقة البدنية', nameEn: 'Fitness' },
            { id: 'healthy-nutrition', nameAr: 'التغذية الصحية', nameEn: 'Healthy Nutrition' },
            { id: 'yoga-meditation', nameAr: 'اليوغا والتأمل', nameEn: 'Yoga & Meditation' },
            { id: 'skincare', nameAr: 'العناية بالبشرة', nameEn: 'Skincare' },
            { id: 'haircare', nameAr: 'العناية بالشعر', nameEn: 'Haircare' },
            { id: 'mental-wellness', nameAr: 'الصحة النفسية', nameEn: 'Mental Wellness' },
            { id: 'massage-therapy', nameAr: 'التدليك والعلاج الطبيعي', nameEn: 'Massage & Physical Therapy' }
        ]
    },
    {
        id: 'business-management',
        nameAr: 'إدارة الأعمال',
        nameEn: 'Business Management',
        icon: '📊',
        subcategories: [
            { id: 'project-management', nameAr: 'إدارة المشاريع', nameEn: 'Project Management' },
            { id: 'human-resources', nameAr: 'إدارة الموارد البشرية', nameEn: 'Human Resources Management' },
            { id: 'financial-management', nameAr: 'إدارة المالية', nameEn: 'Financial Management' },
            { id: 'operations-management', nameAr: 'إدارة العمليات', nameEn: 'Operations Management' },
            { id: 'leadership', nameAr: 'القيادة والإدارة', nameEn: 'Leadership & Management' },
            { id: 'entrepreneurship', nameAr: 'ريادة الأعمال', nameEn: 'Entrepreneurship' },
            { id: 'strategic-management', nameAr: 'الإدارة الاستراتيجية', nameEn: 'Strategic Management' }
        ]
    },
    {
        id: 'economy',
        nameAr: 'اقتصاد',
        nameEn: 'Economy',
        icon: '💰',
        subcategories: [
            { id: 'macroeconomics', nameAr: 'الاقتصاد الكلي', nameEn: 'Macroeconomics' },
            { id: 'microeconomics', nameAr: 'الاقتصاد الجزئي', nameEn: 'Microeconomics' },
            { id: 'islamic-economics', nameAr: 'الاقتصاد الإسلامي', nameEn: 'Islamic Economics' },
            { id: 'international-economics', nameAr: 'الاقتصاد الدولي', nameEn: 'International Economics' },
            { id: 'finance-investment', nameAr: 'التمويل والاستثمار', nameEn: 'Finance & Investment' },
            { id: 'stock-market', nameAr: 'البورصة والأسهم', nameEn: 'Stock Market & Shares' },
            { id: 'insurance-banking', nameAr: 'التأمين والمصارف', nameEn: 'Insurance & Banking' }
        ]
    },
    {
        id: 'tourism-hospitality',
        nameAr: 'سياحة وفنادق',
        nameEn: 'Tourism & Hospitality',
        icon: '🏨',
        subcategories: [
            { id: 'hotel-management', nameAr: 'إدارة الفنادق', nameEn: 'Hotel Management' },
            { id: 'tourism-travel', nameAr: 'السياحة والسفر', nameEn: 'Tourism & Travel' },
            { id: 'customer-service', nameAr: 'خدمة العملاء', nameEn: 'Customer Service' },
            { id: 'event-management', nameAr: 'تنظيم الفعاليات', nameEn: 'Event Management' },
            { id: 'culinary-arts', nameAr: 'الطهي وفنون الطبخ', nameEn: 'Culinary Arts' },
            { id: 'restaurant-management', nameAr: 'إدارة المطاعم', nameEn: 'Restaurant Management' },
            { id: 'eco-tourism', nameAr: 'السياحة البيئية', nameEn: 'Eco-Tourism' }
        ]
    },
    {
        id: 'marketing',
        nameAr: 'التسويق',
        nameEn: 'Marketing',
        icon: '📈',
        subcategories: [
            { id: 'digital-marketing', nameAr: 'التسويق الرقمي', nameEn: 'Digital Marketing' },
            { id: 'social-media', nameAr: 'وسائل التواصل الاجتماعي', nameEn: 'Social Media Marketing' },
            { id: 'seo', nameAr: 'تحسين محركات البحث', nameEn: 'Search Engine Optimization' },
            { id: 'content-marketing', nameAr: 'التسويق بالمحتوى', nameEn: 'Content Marketing' },
            { id: 'email-marketing', nameAr: 'التسويق بالبريد الإلكتروني', nameEn: 'Email Marketing' },
            { id: 'paid-advertising', nameAr: 'الإعلان المدفوع', nameEn: 'Paid Advertising' },
            { id: 'marketing-analytics', nameAr: 'تحليل البيانات التسويقية', nameEn: 'Marketing Analytics' }
        ]
    },
    {
        id: 'human-development',
        nameAr: 'تنمية بشرية',
        nameEn: 'Human Development',
        icon: '🌱',
        subcategories: [
            { id: 'self-development', nameAr: 'تطوير الذات', nameEn: 'Self Development' },
            { id: 'communication-skills', nameAr: 'مهارات التواصل', nameEn: 'Communication Skills' },
            { id: 'time-management', nameAr: 'إدارة الوقت', nameEn: 'Time Management' },
            { id: 'personal-leadership', nameAr: 'القيادة الشخصية', nameEn: 'Personal Leadership' },
            { id: 'self-confidence', nameAr: 'الثقة بالنفس', nameEn: 'Self Confidence' },
            { id: 'problem-solving', nameAr: 'حل المشكلات', nameEn: 'Problem Solving' },
            { id: 'creative-thinking', nameAr: 'التفكير الإبداعي', nameEn: 'Creative Thinking' }
        ]
    },
    {
        id: 'creative-arts-design',
        nameAr: 'الفنون الابداعية والتصميم',
        nameEn: 'Creative Arts & Design',
        icon: '🎨',
        subcategories: [
            { id: 'graphic-design', nameAr: 'التصميم الجرافيكي', nameEn: 'Graphic Design' },
            { id: 'web-design', nameAr: 'تصميم المواقع', nameEn: 'Web Design' },
            { id: 'photography', nameAr: 'التصوير الفوتوغرافي', nameEn: 'Photography' },
            { id: 'drawing-arts', nameAr: 'الرسم والفنون التشكيلية', nameEn: 'Drawing & Fine Arts' },
            { id: 'fashion-design', nameAr: 'تصميم الأزياء', nameEn: 'Fashion Design' },
            { id: 'interior-design', nameAr: 'التصميم الداخلي', nameEn: 'Interior Design' },
            { id: 'music', nameAr: 'الموسيقى والعزف', nameEn: 'Music & Instruments' }
        ]
    },
    {
        id: 'languages',
        nameAr: 'اللغات',
        nameEn: 'Languages',
        icon: '🗣️',
        subcategories: [
            { id: 'english', nameAr: 'اللغة الإنجليزية', nameEn: 'English Language' },
            { id: 'arabic', nameAr: 'اللغة العربية', nameEn: 'Arabic Language' },
            { id: 'french', nameAr: 'اللغة الفرنسية', nameEn: 'French Language' },
            { id: 'german', nameAr: 'اللغة الألمانية', nameEn: 'German Language' },
            { id: 'spanish', nameAr: 'اللغة الإسبانية', nameEn: 'Spanish Language' },
            { id: 'chinese', nameAr: 'اللغة الصينية', nameEn: 'Chinese Language' },
            { id: 'other-languages', nameAr: 'لغات أخرى', nameEn: 'Other Languages' }
        ]
    }
];

// Helper functions
export const getCategoryById = (id) => {
    return categoriesData.find(category => category.id === id);
};

export const getSubcategoryById = (categoryId, subcategoryId) => {
    const category = getCategoryById(categoryId);
    return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getCategoriesForSelect = () => {
    return categoriesData.map(category => ({
        value: category.id,
        label: category.nameEn,
        labelAr: category.nameAr
    }));
};

export const getSubcategoriesForSelect = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category?.subcategories.map(sub => ({
        value: sub.id,
        label: sub.nameEn,
        labelAr: sub.nameAr
    })) || [];
};

// Legacy compatibility - for existing forms that use simple arrays
export const legacyCategories = [
    'Health & Medicine',
    'Engineering', 
    'Software & Tools',
    'Law',
    'IT & Programming',
    'Humanities & Applied Sciences',
    'Personal Care & Fitness',
    'Business Management',
    'Economy',
    'Tourism & Hospitality',
    'Marketing',
    'Human Development',
    'Creative Arts & Design',
    'Languages'
];

export const legacySubcategories = {
    'Health & Medicine': ['Human Medicine', 'Nursing', 'Biomedical Sciences', 'Food Science & Technology', 'Nutrition & Health', 'Alternative Medicine', 'Mental Health'],
    'Engineering': ['Energy Engineering', 'Aerospace Engineering', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Petroleum Engineering', 'Chemical Engineering'],
    'Software & Tools': ['Microsoft Office', 'Adobe Creative Suite', 'Design Software', 'Accounting Software', 'Content Management Systems', 'Engineering Software', 'Statistical Analysis Software'],
    'Law': ['Civil Law', 'Criminal Law', 'Commercial Law', 'Labor Law', 'International Law', 'Family Law', 'Administrative Law'],
    'IT & Programming': ['Web Development', 'Mobile Development', 'Information Security', 'Databases', 'Artificial Intelligence', 'Data Science', 'Networking'],
    'Humanities & Applied Sciences': ['Psychology', 'Sociology', 'History', 'Geography', 'Philosophy', 'Literature', 'Cultural Studies'],
    'Personal Care & Fitness': ['Fitness', 'Healthy Nutrition', 'Yoga & Meditation', 'Skincare', 'Haircare', 'Mental Wellness', 'Massage & Physical Therapy'],
    'Business Management': ['Project Management', 'Human Resources Management', 'Financial Management', 'Operations Management', 'Leadership & Management', 'Entrepreneurship', 'Strategic Management'],
    'Economy': ['Macroeconomics', 'Microeconomics', 'Islamic Economics', 'International Economics', 'Finance & Investment', 'Stock Market & Shares', 'Insurance & Banking'],
    'Tourism & Hospitality': ['Hotel Management', 'Tourism & Travel', 'Customer Service', 'Event Management', 'Culinary Arts', 'Restaurant Management', 'Eco-Tourism'],
    'Marketing': ['Digital Marketing', 'Social Media Marketing', 'Search Engine Optimization', 'Content Marketing', 'Email Marketing', 'Paid Advertising', 'Marketing Analytics'],
    'Human Development': ['Self Development', 'Communication Skills', 'Time Management', 'Personal Leadership', 'Self Confidence', 'Problem Solving', 'Creative Thinking'],
    'Creative Arts & Design': ['Graphic Design', 'Web Design', 'Photography', 'Drawing & Fine Arts', 'Fashion Design', 'Interior Design', 'Music & Instruments'],
    'Languages': ['English Language', 'Arabic Language', 'French Language', 'German Language', 'Spanish Language', 'Chinese Language', 'Other Languages']
};