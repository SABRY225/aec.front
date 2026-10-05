import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileUpload } from '../hooks/useFileUpload';
import { toast } from 'react-toastify';
import FileUpload from '../components/shared/FileUpload/FileUpload';
import { instructorService, categoryService } from '../services/new-api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { getCountriesForSelect, countries } from '../data/countries';
import PhoneCodeSelector from '../components/shared/PhoneCodeSelector/PhoneCodeSelector';

function BecomeATutor() {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    
    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/become-tutor' } });
            return;
        }
        
        // Redirect if instructor
        if (user.role === 'instructor') {
            if (user.isVerified) {
                navigate('/instructor/dashboard', { replace: true });
            } else if (user.hasInstructorApplication || user.instructorApplicationStatus === 'pending') {
                navigate('/instructor/pending-approval', { replace: true });
            } else {
                navigate('/instructor/apply', { replace: true });
            }
            return;
        }

        // Redirect if not a student
        if (user.role !== 'student') {
            navigate('/');
            toast.error(t('becomeTutor.onlyStudents'));
            return;
        }
    }, [isAuthenticated, user, navigate]);
    
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        age: '',
        category: '',
        subCategory: '',
        customCategory: '',
        nationality: '',
        phone: '',
        email: '',
        universityDegree: '',
        place: '',
        gender: '',
        maritalStatus: '',
        cv: null,
        certificate: null,
        photo: null,
        video: null
    });
    
    // State for file previews
    const [previews, setPreviews] = useState({
        photo: null,
        video: null,
        certificate: null
    });
    
    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            // Revoke object URLs to avoid memory leaks
            Object.values(previews).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    // State for categories, subcategories, and countries
    const [categories, setCategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [phoneCode, setPhoneCode] = useState('+20'); // Default to Egypt
    const [phoneCodeManuallyChanged, setPhoneCodeManuallyChanged] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
    const countries = getCountriesForSelect();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                if (response.success && response.data) {
                    const formattedCategories = response.data.map(category => ({
                        value: category.slug,
                        label: language === 'ar' ? (category.nameAr || category.nameEn) : category.nameEn,
                        id: category._id
                    }));
                    // Add "Other" option
                    formattedCategories.push({ value: 'other', label: t('becomeTutor.other'), id: 'other' });
                    setCategories(formattedCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error(t('becomeTutor.loadCategoriesFailed'));
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Update subcategories when category changes
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (formData.category) {
                if (formData.category === 'other') {
                    setShowCustomCategory(true);
                    setAvailableSubcategories([]);
                    setFormData(prev => ({ ...prev, subCategory: '' }));
                } else {
                    setShowCustomCategory(false);
                    setSubcategoriesLoading(true);
                    try {
                        // Find the category ID from the slug
                        const selectedCategory = categories.find(cat => cat.value === formData.category);
                        if (selectedCategory && selectedCategory.id !== 'other') {
                            const response = await categoryService.getSubcategories(selectedCategory.id);
                            if (response.success && response.data) {
                                const formattedSubcategories = response.data.map(subcategory => ({
                                    value: subcategory.slug,
                                    label: language === 'ar' ? (subcategory.nameAr || subcategory.nameEn) : subcategory.nameEn
                                }));
                                setAvailableSubcategories(formattedSubcategories);
                                
                                // Reset subcategory if it's not valid for the new category
                                if (formData.subCategory && !formattedSubcategories.find(sub => sub.value === formData.subCategory)) {
                                    setFormData(prev => ({ ...prev, subCategory: '' }));
                                }
                            } else {
                                setAvailableSubcategories([]);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching subcategories:', error);
                        setAvailableSubcategories([]);
                    } finally {
                        setSubcategoriesLoading(false);
                    }
                    setFormData(prev => ({ ...prev, customCategory: '' }));
                }
            } else {
                setShowCustomCategory(false);
                setAvailableSubcategories([]);
                setSubcategoriesLoading(false);
                if (formData.subCategory || formData.customCategory) {
                    setFormData(prev => ({ ...prev, subCategory: '', customCategory: '' }));
                }
            }
        };

        if (categories.length > 0) {
            fetchSubcategories();
        }
    }, [formData.category, categories]);

    // Update phone code when nationality changes (only if user hasn't manually changed it)
    useEffect(() => {
        // Only auto-update phone code if user hasn't manually changed it
        if (formData.nationality && !phoneCodeManuallyChanged) {
            const country = getCountriesForSelect().find(c => c.label === formData.nationality);
            if (country && country.phoneCode) {
                setPhoneCode(country.phoneCode);
            }
        }
    }, [formData.nationality, phoneCodeManuallyChanged]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCVUploadComplete = (result) => {
        setFormData(prev => ({
            ...prev,
            cv: result.url
        }));
        toast.success(t('becomeTutor.cvUploaded'));
    };

    const handleCVUploadError = (error) => {
        toast.error(t('becomeTutor.cvUploadFailed'));
        console.error('CV upload error:', error);
    };

    const handleCertificateUploadComplete = (result) => {
        // Create preview URL for certificate
        if (result.url) {
            setPreviews(prev => ({
                ...prev,
                certificate: result.url
            }));
        }

        setFormData(prev => ({
            ...prev,
            certificate: result.url
        }));
        toast.success(t('becomeTutor.certificateUploaded'));
    };

    const handleCertificateUploadError = (error) => {
        toast.error(t('becomeTutor.certificateUploadFailed'));
        console.error('Certificate upload error:', error);
    };

    const handlePhotoUploadComplete = (result) => {
        // Create preview URL for photo
        if (result.url) {
            setPreviews(prev => ({
                ...prev,
                photo: result.url
            }));
        }

        setFormData(prev => ({
            ...prev,
            photo: result.url
        }));
        toast.success(t('becomeTutor.photoUploaded'));
    };

    const handlePhotoUploadError = (error) => {
        toast.error(t('becomeTutor.photoUploadFailed'));
        console.error('Photo upload error:', error);
    };

    const handleVideoUploadComplete = (result) => {
        // Create preview URL for video
        if (result.url) {
            setPreviews(prev => ({
                ...prev,
                video: result.url
            }));
        }

        setFormData(prev => ({
            ...prev,
            video: result.url
        }));
        toast.success(t('becomeTutor.videoUploaded'));
    };

    const handleVideoUploadError = (error) => {
        toast.error(t('becomeTutor.videoUploadFailed'));
        console.error('Video upload error:', error);
    };

    // State for button loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = [
            'firstName', 'middleName', 'lastName', 'age',
            'category', 'subCategory', 'nationality', 'phone',
            'email', 'universityDegree', 'place', 'gender',
            'maritalStatus'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            toast.error(t('becomeTutor.fillRequired'));
            return;
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error(t('becomeTutor.validEmail'));
            return;
        }

        // Validate age is a number and reasonable
        if (isNaN(formData.age) || formData.age < 18 || formData.age > 100) {
            toast.error(t('becomeTutor.validAge'));
            return;
        }

        // Validate required files
        const requiredFiles = ['cv', 'certificate', 'photo', 'video'];
        const missingFiles = requiredFiles.filter(file => !formData[file]);
        
        if (missingFiles.length > 0) {
            toast.error(t('becomeTutor.uploadRequired'));
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if all files have been uploaded
            const fileFields = ['cv', 'certificate', 'photo', 'video'];
            const missingUploads = fileFields.filter(field => {
                const url = formData[field];
                return !url || typeof url !== 'string' || !url.startsWith('http');
            });

            if (missingUploads.length > 0) {
                toast.error(t('becomeTutor.uploadRequired'));
                setIsSubmitting(false);
                return;
            }

            // Check authentication
            if (!isAuthenticated) {
                toast.error(t('becomeTutor.loginFirst'));
                navigate('/login', { state: { from: '/become-tutor' } });
                setIsSubmitting(false);
                return;
            }

            // Prepare the data with URLs
            const submitData = {
                ...formData,
                phone: `${phoneCode}${formData.phone}`
            };

            // Send the application
            await instructorService.applyToBeInstructor(submitData);
            
            toast.success(t('becomeTutor.submitSuccess'));
            // Redirect to dashboard
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || t('becomeTutor.submitFailed'));
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8" dir={t('autoGenerated.ltr', `ltr`)}>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">
                        {t('becomeTutor.title')} <span className="text-blue-600">{t('becomeTutor.titleHighlight')}</span>
                    </h1>
                    <p className="mt-3 text-gray-600">{t('becomeTutor.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t('becomeTutor.firstName')}</label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">{t('becomeTutor.middleName')}</label>
                            <input
                                type="text"
                                name="middleName"
                                id="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t('becomeTutor.lastName')}</label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Age & Category Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">{t('becomeTutor.age')}</label>
                            <input
                                type="number"
                                name="age"
                                id="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('becomeTutor.category')}</label>
                            <select
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                disabled={loading}
                                required
                            >
                                <option value="">
                                    {loading ? t('becomeTutor.loadingCategories') : t('becomeTutor.selectCategory')}
                                </option>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {showCustomCategory ? (
                            <div>
                                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">{t('becomeTutor.customCategory')}</label>
                                <input
                                    type="text"
                                    name="customCategory"
                                    id="customCategory"
                                    value={formData.customCategory}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    placeholder={t('becomeTutor.customCategoryPlaceholder')}
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">{t('becomeTutor.subCategory')}</label>
                                <select
                                    name="subCategory"
                                    id="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    disabled={!formData.category || subcategoriesLoading}
                                    required
                                >
                                    <option value="">
                                        {subcategoriesLoading
                                            ? t('becomeTutor.loadingSubcategories')
                                            : availableSubcategories.length === 0 && formData.category
                                            ? t('becomeTutor.noSubcategories')
                                            : t('becomeTutor.selectSubcategory')}
                                    </option>
                                    {!subcategoriesLoading && availableSubcategories.map((subcategory) => (
                                        <option key={subcategory.value} value={subcategory.value}>
                                            {subcategory.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">{t('becomeTutor.nationality')}</label>
                            <select
                                name="nationality"
                                id="nationality"
                                value={formData.nationality}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                required
                            >
                                <option value="">{t('becomeTutor.selectNationality')}</option>
                                {getCountriesForSelect().map((country) => (
                                    <option key={country.value} value={country.label}>
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('becomeTutor.phone')}</label>
                            <div className="mt-1 flex rounded-md">
                                <PhoneCodeSelector
                                    value={phoneCode}
                                    onChange={(code) => {
                                        setPhoneCode(code);
                                        setPhoneCodeManuallyChanged(true);
                                    }}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-e-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('becomeTutor.email')}</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder={t('becomeTutor.emailPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label htmlFor="universityDegree" className="block text-sm font-medium text-gray-700">{t('becomeTutor.universityDegree')}</label>
                            <input
                                type="text"
                                name="universityDegree"
                                id="universityDegree"
                                value={formData.universityDegree}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder={t('becomeTutor.gradePlaceholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="place" className="block text-sm font-medium text-gray-700">{t('becomeTutor.place')}</label>
                            <select
                                name="place"
                                id="place"
                                value={formData.place}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                                <option value="">{t('becomeTutor.selectPlace')}</option>
                                {getCountriesForSelect().map((country) => (
                                    <option key={country.value} value={country.label}>
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">{t('becomeTutor.gender')}</label>
                            <select
                                name="gender"
                                id="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                                <option value="">{t('becomeTutor.selectGender')}</option>
                                <option value="male">{t('becomeTutor.male')}</option>
                                <option value="female">{t('becomeTutor.female')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">{t('becomeTutor.maritalStatus')}</label>
                        <select
                            name="maritalStatus"
                            id="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        >
                            <option value="">{t('becomeTutor.selectStatus')}</option>
                            <option value="single">{t('becomeTutor.single')}</option>
                            <option value="married">{t('becomeTutor.married')}</option>
                        </select>
                    </div>

                    {/* File Upload Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <FileUpload
                                accept="application/pdf"
                                maxSize={50 * 1024 * 1024} // 50MB
                                folder="instructor-applications/cvs"
                                onUploadSuccess={handleCVUploadComplete}
                                onUploadError={handleCVUploadError}
                                label={t('becomeTutor.cv')}
                                helperText={t('becomeTutor.cvHelper')}
                                value={formData.cv}
                            />
                        </div>
                        <div>
                            <FileUpload
                                accept="image/jpeg,image/png"
                                maxSize={50 * 1024 * 1024} // 50MB
                                folder="instructor-applications/certificates"
                                onUploadSuccess={handleCertificateUploadComplete}
                                onUploadError={handleCertificateUploadError}
                                label={t('becomeTutor.certificate')}
                                helperText={t('becomeTutor.certificateHelper')}
                                showPreview={true}
                                previewType="image"
                                value={formData.certificate}
                            />
                        </div>
                    </div>

                    <div>
                        <FileUpload
                            accept="image/jpeg,image/png,image/gif"
                            maxSize={50 * 1024 * 1024} // 50MB
                            folder="instructor-applications/photos"
                            onUploadSuccess={handlePhotoUploadComplete}
                            onUploadError={handlePhotoUploadError}
                            label={t('becomeTutor.uploadPhoto')}
                            helperText={t('becomeTutor.photoHelper')}
                            showPreview={true}
                            previewType="image"
                            value={formData.photo}
                        />
                    </div>

                    <div>
                        <FileUpload
                            accept="video/mp4,video/quicktime"
                            maxSize={50 * 1024 * 1024} // 50MB
                            folder="instructor-applications/videos"
                            onUploadSuccess={handleVideoUploadComplete}
                            onUploadError={handleVideoUploadError}
                            label={t('becomeTutor.uploadVideo')}
                            helperText={t('becomeTutor.videoHelper')}
                            showPreview={true}
                            previewType="video"
                            value={formData.video}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('becomeTutor.submitting')}
                                </>
                            ) : t('becomeTutor.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BecomeATutor;
