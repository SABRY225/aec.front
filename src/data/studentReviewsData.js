// Student reviews & verified conversation screenshots data
// Images placed in /reviews/ (e.g., /reviews/1.jpg, /reviews/2.jpg, ...) or external URLs
export const studentReviewsData = [
    {
        id: 1,
        image: '/reviews/1.jpg',
        title: 'تجربة متميزة في مسار تطوير البرمجيات والذكاء الاصطناعي',
        studentName: 'م. أحمد السعدي',
        courseName: 'دبلوم هندسة البرمجيات والذكاء الاصطناعي',
        category: 'programming',
        categoryName: 'البرمجة والذكاء الاصطناعي',
        rating: 5,
        date: '2025-01-12',
        source: 'محادثة واتساب موثقة',
        highlight: 'الشرح كان عملي ومباشر، والدعم الفني ساعدني خطوة بخطوة حتى أنهيت مشروعي وحصلت على وظيفة.',
        verified: true
    },
    {
        id: 2,
        image: '/reviews/2.jpg',
        title: 'اجتياز اختبار الـ PMP وإدارة المشاريع بنجاح',
        studentName: 'سارة خالد المنصور',
        courseName: 'إعداد محترف إدارة المشاريع (PMP®)',
        category: 'business',
        categoryName: 'إدارة الأعمال والمشاريع',
        rating: 5,
        date: '2025-01-08',
        source: 'رسالة تقييم وشكر',
        highlight: 'أفضل استثمار في مسيرتي المهنية! بنك الأسئلة والمحاكاة كان مطابقاً تماماً للاختبار الحقيقي.',
        verified: true
    },
    {
        id: 3,
        image: '/reviews/3.jpg',
        title: 'شهادة OSHA والسلامة والصحة المهنية',
        studentName: 'م. فهد القحطاني',
        courseName: 'معايير الأوشا وإدارة السلامة المهنية',
        category: 'engineering',
        categoryName: 'الهندسة والسلامة المهنية',
        rating: 5,
        date: '2024-12-28',
        source: 'محادثة موثقة عبر الواتساب',
        highlight: 'المحاضر خبير ومتمكن جداً، والشهادة معتمدة دولياً ومقبولة رسمياً في جهة عملي.',
        verified: true
    },
    {
        id: 4,
        image: '/reviews/4.jpg',
        title: 'الحصول على درجة 7.5 في اختبار IELTS',
        studentName: 'نورة عبد العزيز',
        courseName: 'الدورة المكثفة لاجتياز اختبار الآيلتس (IELTS)',
        category: 'languages',
        categoryName: 'اللغات والترجمة الاحترافية',
        rating: 5,
        date: '2024-12-20',
        source: 'رسالة واتساب مع صورة النتيجة',
        highlight: 'طرق الإجابة على قسمي التحدث والكتابة غيرت مستواي تماماً ووصلت لدرجة القبول للماجستير!',
        verified: true
    },
    {
        id: 5,
        image: '/reviews/5.jpg',
        title: 'إتقان التحليل المالي ونمذجة البيانات',
        studentName: 'عبد الله الشهري',
        courseName: 'التحليل المالي المتقدم وإدارة المخاطر',
        category: 'business',
        categoryName: 'إدارة الأعمال والمشاريع',
        rating: 5,
        date: '2024-12-15',
        source: 'محادثة موثقة',
        highlight: 'المحتوى احترافي جداً والتمارين التطبيقية على برنامج إكسل مكنتني من قيادة تقارير الشركة بثقة.',
        verified: true
    },
    {
        id: 6,
        image: '/reviews/6.jpg',
        title: 'دورة الأمن السيبراني واختبار الاختراق الأخلاقي',
        studentName: 'ريان العتيبي',
        courseName: 'أساسيات ومختبرات الأمن السيبراني',
        category: 'programming',
        categoryName: 'البرمجة والذكاء الاصطناعي',
        rating: 5,
        date: '2024-12-10',
        source: 'استبيان تقييم خريجي الدورة',
        highlight: 'المختبرات العملية والتطبيق على أدوات الحماية الحقيقية كانت تجربة استثنائية لم أجدها في دورات أخرى.',
        verified: true
    },
    {
        id: 7,
        image: '/reviews/7.jpg',
        title: 'إدارة الجودة الشاملة وتطبيقات الآيزو',
        studentName: 'د. منى الشريف',
        courseName: 'تأهيل وتطبيق نظام إدارة الجودة ISO 9001',
        category: 'engineering',
        categoryName: 'الهندسة والسلامة المهنية',
        rating: 5,
        date: '2024-11-30',
        source: 'رسالة شكر للمنصة',
        highlight: 'شرح مفصل ومبسط لمعايير الآيزو مع نماذج جاهزة للتطبيق. ممتنة جداً لفريق الأكاديمية.',
        verified: true
    },
    {
        id: 8,
        image: '/reviews/8.jpg',
        title: 'اللغة الإنجليزية للأعمال والمحادثة الاحترافية',
        studentName: 'فيصل الغامدي',
        courseName: 'إتقان المحادثة والمراسلات التجارية بالإنجليزية',
        category: 'languages',
        categoryName: 'اللغات والترجمة الاحترافية',
        rating: 5,
        date: '2024-11-22',
        source: 'محادثة موثقة عبر الواتساب',
        highlight: 'كسرت حاجز الخوف من التحدث بالإنجليزية في الاجتماعات الرسمية بفضل التدريب العملي المباشر.',
        verified: true
    }
];

export const reviewCategories = [
    { key: 'all', labelAr: 'جميع التقييمات', labelEn: 'All Reviews' },
    { key: 'programming', labelAr: 'البرمجة والذكاء الاصطناعي', labelEn: 'Programming & AI' },
    { key: 'business', labelAr: 'إدارة الأعمال والمشاريع', labelEn: 'Business & Management' },
    { key: 'engineering', labelAr: 'الهندسة والسلامة المهنية', labelEn: 'Engineering & Safety' },
    { key: 'languages', labelAr: 'اللغات والترجمة', labelEn: 'Languages & Translation' }
];

export const reviewStats = {
    averageRating: 4.9,
    totalReviews: '+1,500',
    satisfactionRate: '98%',
    certifiedRate: '100%'
};
