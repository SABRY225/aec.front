import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    GlobeAltIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/new-api';

const CourseEdit = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subCategory: '',
        courseLevel: '',
        price: '',
        featured: false,
        coursePricing: []
    });

    // Available countries for pricing rules
    const availableCountries = [
        { code: 'US', name: 'United States' },
        { code: 'EG', name: 'Egypt' },
        { code: 'SY', name: 'Syria' },
        { code: 'LB', name: 'Lebanon' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'AE', name: 'UAE' },
        { code: 'JO', name: 'Jordan' },
        { code: 'IQ', name: 'Iraq' },
        { code: 'KW', name: 'Kuwait' },
        { code: 'QA', name: 'Qatar' },
        { code: 'BH', name: 'Bahrain' },
        { code: 'OM', name: 'Oman' },
        { code: 'YE', name: 'Yemen' },
        { code: 'PS', name: 'Palestine' },
        { code: 'MA', name: 'Morocco' },
        { code: 'TN', name: 'Tunisia' },
        { code: 'DZ', name: 'Algeria' },
        { code: 'LY', name: 'Libya' },
        { code: 'SD', name: 'Sudan' },
        { code: 'OTHER', name: 'Other Countries' }
    ];

    const categories = [
        'Programming',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Health & Fitness',
        'Language',
        'Personal Development'
    ];

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const courseData = await adminService.getCourseDetails(id);
            setCourse(courseData);
            setFormData({
                title: courseData.title || '',
                description: courseData.description || '',
                category: courseData.category || '',
                subCategory: courseData.subCategory || '',
                courseLevel: courseData.courseLevel || '',
                price: courseData.price || '',
                featured: courseData.featured || false,
                coursePricing: courseData.coursePricing || []
            });
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError(t('admin.courseEdit.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addPricingRule = () => {
        setFormData(prev => ({
            ...prev,
            coursePricing: [
                ...prev.coursePricing,
                {
                    countries: [],
                    price: '',
                    groupName: ''
                }
            ]
        }));
    };

    const removePricingRule = (index) => {
        setFormData(prev => ({
            ...prev,
            coursePricing: prev.coursePricing.filter((_, i) => i !== index)
        }));
    };

    const updatePricingRule = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            coursePricing: prev.coursePricing.map((rule, i) => 
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    };

    const handleCountrySelection = (ruleIndex, countryCode) => {
        const rule = formData.coursePricing[ruleIndex];
        const isSelected = rule.countries.includes(countryCode);
        
        let newCountries;
        if (isSelected) {
            newCountries = rule.countries.filter(c => c !== countryCode);
        } else {
            newCountries = [...rule.countries, countryCode];
        }
        
        updatePricingRule(ruleIndex, 'countries', newCountries);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            await adminService.updateCourseDetails(id, formData);
            setSuccess(t('admin.courseEdit.updateSuccess'));
            setTimeout(() => {
                navigate(`/admin/courses/${id}`);
            }, 1500);
        } catch (error) {
            console.error('Error updating course:', error);
            setError(t('admin.courseEdit.updateFailed'));
        } finally {
            setSaving(false);
        }
    };

    const formatPrice = (price) => {
        return `${price} SAR`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.courses.notFound')}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/admin/courses')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/admin/courses/${id}`)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Back to Course
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Edit Course
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/admin/courses/${id}`)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {t('admin.courseEdit.cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : null}
                                {saving ? t('admin.courseEdit.saving') : t('admin.courseEdit.save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="space-y-6">
                    {/* {t('admin.courseEdit.basicInformation')} */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('admin.courseEdit.basicInformation')}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t('admin.courseEdit.titlePlaceholder')}
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t('admin.courseEdit.descriptionPlaceholder')}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{t('admin.courseEdit.selectCategory')}</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub Category
                                </label>
                                <input
                                    type="text"
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t('admin.courseEdit.subCategoryPlaceholder')}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Level
                                </label>
                                <select
                                    name="courseLevel"
                                    value={formData.courseLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{t('admin.courseEdit.selectLevel')}</option>
                                    {levels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Price (SAR)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={t('admin.courseEdit.pricePlaceholder')}
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        {t('admin.courseEdit.featuredCourse')}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* {t('admin.courseEdit.countryPricing')} */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{t('admin.courseEdit.countryPricing')}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {t('admin.courseEdit.countryPricingDesc')}
                                </p>
                            </div>
                            <button
                                onClick={addPricingRule}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {t('admin.courseEdit.addPricingRule')}
                            </button>
                        </div>

                        {formData.coursePricing.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <GlobeAltIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>{t('admin.courseEdit.noPricingRules')}</p>
                                <p className="text-sm">{t('admin.courseEdit.allCountriesBasePrice')}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.coursePricing.map((rule, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-gray-900">
                                                {t('admin.courseEdit.pricingRule', { num: index + 1 })}
                                            </h3>
                                            <button
                                                onClick={() => removePricingRule(index)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('admin.courseEdit.groupNameOptional')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rule.groupName}
                                                    onChange={(e) => updatePricingRule(index, 'groupName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={t('admin.courseEdit.regionPlaceholder')}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('admin.courseEdit.priceSar')}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={rule.price}
                                                    onChange={(e) => updatePricingRule(index, 'price', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={t('admin.courseEdit.pricePlaceholder')}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('admin.courseEdit.countries')}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                                {availableCountries.map(country => (
                                                    <label key={country.code} className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={rule.countries.includes(country.code)}
                                                            onChange={() => handleCountrySelection(index, country.code)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className={country.code === 'OTHER' ? 'font-medium text-blue-600' : ''}>
                                                            {country.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {t('admin.courseEdit.otherCountriesHint')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pricing Summary */}
                    {formData.coursePricing.length > 0 && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5" />
                                Pricing Summary
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-800">{t('admin.courseEdit.basePrice')}:</span>
                                    <span className="font-medium text-blue-900">
                                        {formatPrice(formData.price || 0)}
                                    </span>
                                </div>
                                {formData.coursePricing.map((rule, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-blue-800">
                                            {rule.groupName || rule.countries.join(', ')}:
                                        </span>
                                        <span className="font-medium text-blue-900">
                                            {formatPrice(rule.price || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEdit;