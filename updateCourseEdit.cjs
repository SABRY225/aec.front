const fs = require('fs');
let content = fs.readFileSync('H:/ace/AEC-frontend/src/pages/admin/CourseEdit.jsx', 'utf8');

// 1. Update imports
content = content.replace(
    "import { adminService } from '../../services/new-api';",
    "import { adminService, categoryService, subcategoryService } from '../../services/new-api';"
);

// 2. Remove old categories array and add WORLD_LANGUAGES
const oldCategories = `    const categories = [
        'Programming',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Health & Fitness',
        'Language',
        'Personal Development'
    ];`;

const newArrays = `    const WORLD_LANGUAGES = [
        { value: 'العربية', label: isRTL ? 'العربية' : 'Arabic' },
        { value: 'English', label: isRTL ? 'الإنجليزية' : 'English' },
        { value: 'Français', label: isRTL ? 'الفرنسية' : 'French' },
        { value: 'Español', label: isRTL ? 'الإسبانية' : 'Spanish' },
        { value: 'Deutsch', label: isRTL ? 'الألمانية' : 'German' },
        { value: 'Italiano', label: isRTL ? 'الإيطالية' : 'Italian' },
        { value: 'Português', label: isRTL ? 'البرتغالية' : 'Portuguese' },
        { value: 'Русский', label: isRTL ? 'الروسية' : 'Russian' },
        { value: '中文', label: isRTL ? 'الصينية' : 'Chinese' },
        { value: '日本語', label: isRTL ? 'اليابانية' : 'Japanese' },
        { value: '한국어', label: isRTL ? 'الكورية' : 'Korean' },
        { value: 'Türkçe', label: isRTL ? 'التركية' : 'Turkish' },
        { value: 'हिन्दी', label: isRTL ? 'الهندية' : 'Hindi' },
        { value: 'اردو', label: isRTL ? 'الأوردو' : 'Urdu' }
    ];`;

content = content.replace(oldCategories, newArrays);

// 3. Add states
const stateStr = `    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);`;

const newStates = `    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [apiCategories, setApiCategories] = useState([]);
    const [apiSubcategories, setApiSubcategories] = useState([]);`;

content = content.replace(stateStr, newStates);

// 4. Add hooks for categories
const effectStr = `    useEffect(() => {
        fetchCourseDetails();
    }, [id]);`;

const newEffects = `    useEffect(() => {
        fetchCourseDetails();
        fetchCategories();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAllCategories();
            setApiCategories(res.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        if (formData.category && apiCategories.length > 0) {
            const selectedCat = apiCategories.find(c => c.name === formData.category || c._id === formData.category);
            if (selectedCat) {
                subcategoryService.getSubcategoriesByCategory(selectedCat._id)
                    .then(res => setApiSubcategories(res.data || []))
                    .catch(console.error);
            }
        }
    }, [formData.category, apiCategories]);`;

content = content.replace(effectStr, newEffects);

// 5. Update JSX for category
const catJsx = `<select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر التصنيف --' : '-- Select Category --'}</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>`;

const newCatJsx = `<select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر التصنيف --' : '-- Select Category --'}</option>
                                    {apiCategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>`;

content = content.replace(catJsx, newCatJsx);

// 6. Update JSX for subCategory
const subCatJsx = `<input
                                    type="text"
                                    value={formData.subCategory}
                                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                                    placeholder={isRTL ? 'مثال: Web Development, UI/UX...' : 'e.g. Web Development'}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />`;

const newSubCatJsx = `<select
                                    value={formData.subCategory}
                                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر التصنيف الفرعي --' : '-- Select Sub-Category --'}</option>
                                    {apiSubcategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>`;

content = content.replace(subCatJsx, newSubCatJsx);

// 7. Update JSX for language
const langJsx = `<input
                                    type="text"
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    placeholder="العربية"
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                />`;

const newLangJsx = `<select
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                                >
                                    <option value="">{isRTL ? '-- اختر لغة الشرح --' : '-- Select Language --'}</option>
                                    {WORLD_LANGUAGES.map(lang => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>`;

content = content.replace(langJsx, newLangJsx);

fs.writeFileSync('H:/ace/AEC-frontend/src/pages/admin/CourseEdit.jsx', content, 'utf8');
console.log('Successfully updated CourseEdit.jsx');
