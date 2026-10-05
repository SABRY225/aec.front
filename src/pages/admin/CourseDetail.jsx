import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    XCircleIcon, 
    PencilIcon,
    ArrowLeftIcon,
    StarIcon,
    PlayIcon,
    DocumentTextIcon,
    UserIcon,
    CalendarIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { adminService } from '../../services/new-api';
import RichTextDisplay from '../../components/RichTextDisplay/RichTextDisplay';

const CourseDetail = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const response = await adminService.getCourseDetails(id);
            setCourse(response);
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status) => {
        setActionLoading(true);
        try {
            await adminService.updateCourseStatus(id, { status });
            setCourse(prev => ({ ...prev, status }));
        } catch (error) {
            console.error('Error updating course status:', error);
            setError('Failed to update course status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleFeatured = async () => {
        setActionLoading(true);
        try {
            await adminService.toggleCourseFeatured(id);
            setCourse(prev => ({ ...prev, featured: !prev.featured }));
        } catch (error) {
            console.error('Error toggling featured status:', error);
            setError('Failed to update featured status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }
        
        setActionLoading(true);
        try {
            await adminService.deleteCourse(id);
            navigate('/admin/courses');
        } catch (error) {
            console.error('Error deleting course:', error);
            setError('Failed to delete course');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatPrice = (price) => {
        return `${price} SAR`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.courses.notFound')}</h2>
                    <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
                    <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800">
                        ← Back to Courses
                    </Link>
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
                                onClick={() => navigate('/admin/courses')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Back to Courses
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                                {course.title}
                            </h1>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {course.status !== 'approved' && (
                                <button
                                    onClick={() => handleStatusChange('approved')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Approve
                                </button>
                            )}
                            
                            {course.status !== 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('pending')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    <ClockIcon className="w-4 h-4" />
                                    Set Pending
                                </button>
                            )}
                            
                            {course.status !== 'rejected' && (
                                <button
                                    onClick={() => handleStatusChange('rejected')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    Reject
                                </button>
                            )}
                            
                            <Link
                                to={`/admin/courses/${id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Course Image - 16:9 */}
                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                {course.thumbnail ? (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
                                        {course.title?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(course.status)}`}>
                                    {course.status?.charAt(0)?.toUpperCase() + course.status?.slice(1)}
                                </div>
                                
                                {/* Featured Badge */}
                                {course.featured && (
                                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200 flex items-center gap-1">
                                        <StarSolidIcon className="w-4 h-4" />
                                        Featured
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                                <div className="text-gray-600 mb-4">
                                    <RichTextDisplay 
                                        content={course.description} 
                                        showFull={true}
                                        className="text-gray-600"
                                    />
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {course.category}
                                    </span>
                                    {course.subCategory && (
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {course.subCategory}
                                        </span>
                                    )}
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {course.courseLevel}
                                    </span>
                                </div>

                                {/* {t('course.preview.courseBrochure')} Download */}
                                {course.brochure && (
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{t('course.preview.courseBrochure')}</h3>
                                                    <p className="text-sm text-gray-600">{t('course.preview.brochureDescription')}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={course.brochure}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* {t('admin.detailLabels.courseDetails')} */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.detailLabels.courseDetails')}</h2>
                            
                            {/* {t('admin.detailLabels.whatYouLearn')} */}
                            {(course.whatYouWillLearn || course.learningOutcomes) && (course.whatYouWillLearn?.length > 0 || course.learningOutcomes?.length > 0) && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">{t('admin.detailLabels.whatYouLearn')}</h3>
                                    <div className="space-y-3">
                                        {(course.whatYouWillLearn || course.learningOutcomes).map((outcome, index) => {
                                            const mainText = typeof outcome === 'string' 
                                                ? outcome 
                                                : (outcome?.main || '');
                                            const subPoints = typeof outcome === 'string' 
                                                ? [] 
                                                : (outcome?.subPoints || []);
                                            
                                            return (
                                                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                                    <div className="flex items-start gap-2 mb-1">
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">{mainText}</span>
                                                    </div>
                                                    {subPoints && subPoints.length > 0 && (
                                                        <div className="ml-7 space-y-1">
                                                            {subPoints.map((subPoint, subIndex) => (
                                                                <div key={subIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                                                    <span className="text-gray-400 mt-1">•</span>
                                                                    <span>{subPoint}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* {t('admin.detailLabels.requirements')} */}
                            {course.requirements && course.requirements.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">{t('admin.detailLabels.requirements')}</h3>
                                    <ul className="space-y-2">
                                        {course.requirements.map((requirement, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <DocumentTextIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{requirement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* {t('admin.detailLabels.courseContent')} */}
                            {course.sections && course.sections.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">{t('admin.detailLabels.courseContent')}</h3>
                                    <div className="space-y-3">
                                        {course.sections.map((section, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    Section {index + 1}: {section.name || section.title}
                                                </h4>
                                                {section.lectures && section.lectures.length > 0 && (
                                                    <ul className="space-y-1 ml-4">
                                                        {section.lectures.map((lecture, lectureIndex) => (
                                                            <li key={lectureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                                                <PlayIcon className="w-4 h-4" />
                                                                {lecture.name || lecture.title}
                                                                {(lecture.video?.duration || lecture.duration) && (
                                                                    <span className="text-gray-400">
                                                                        ({formatDuration(lecture.video?.duration || lecture.duration)})
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Copyright Notice */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-blue-900 mb-1">
                                            Copyright Notice / إشعار حقوق النشر
                                        </h3>
                                        <p className="text-xs text-blue-800 mb-1">
                                            All course content and materials are the property of the platform. Course rights are reserved to the platform.
                                        </p>
                                        <p className="text-xs text-blue-800" dir="rtl">
                                            جميع محتويات ومواد الدورة التدريبية هي ملك للمنصة. حقوق الدورة محفوظة للمنصة.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.detailLabels.courseInformation')}</h3>
                            
                            <div className="space-y-4">
                                {/* Instructor */}
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('course.study.instructor')}</p>
                                        <p className="font-medium text-gray-900">
                                            {course.instructor?.firstName} {course.instructor?.lastName}
                                        </p>
                                    </div>
                                </div>

                                {/* Created Date */}
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('admin.allCourses.created')}</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(course.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Language */}
                                {course.language && (
                                    <div className="flex items-center gap-3">
                                        <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('course.preview.language')}</p>
                                            <p className="font-medium text-gray-900">{course.language}</p>
                                            {course.subtitleLanguage && (
                                                <p className="text-xs text-gray-400 mt-1">{t('course.preview.subtitles', { language: '' }).replace(': ', ': ')} {course.subtitleLanguage}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Duration */}
                                {course.duration && (
                                    <div className="flex items-center gap-3">
                                        <ClockIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('course.preview.duration')}</p>
                                            <p className="font-medium text-gray-900">{formatDuration(course.duration)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Course Level */}
                                {course.courseLevel && (
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('admin.detailLabels.level')}</p>
                                            <p className="font-medium text-gray-900 capitalize">{course.courseLevel}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Course Type */}
                                {course.courseType && (
                                    <div className="flex items-center gap-3">
                                        <PlayIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('common.type')}</p>
                                            <p className="font-medium text-gray-900 capitalize">{course.courseType}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Category */}
                                {course.category && (
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('admin.detailLabels.category')}</p>
                                            <p className="font-medium text-gray-900">{course.category}</p>
                                            {course.subCategory && (
                                                <p className="text-xs text-gray-400 mt-1">{course.subCategory}</p>
                                            )}
                                            {/* Topics */}
                                            {course.topics && Array.isArray(course.topics) && course.topics.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">{t('course.preview.topicsLabel')}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {course.topics.map((topic, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                                                            >
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Fallback to single topic for backward compatibility */}
                                            {(!course.topics || !Array.isArray(course.topics) || course.topics.length === 0) && course.topic && (
                                                <p className="text-xs text-gray-400 mt-1">{t('course.preview.topicLabel')} {course.topic}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Location (for onsite courses) */}
                                {course.courseType === 'onsite' && course.location && (
                                    <div className="flex items-center gap-3">
                                        <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('admin.detailLabels.location')}</p>
                                            <p className="font-medium text-gray-900">{course.location}</p>
                                            {course.address && (
                                                <p className="text-xs text-gray-400 mt-1">{course.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dates (for live/onsite courses) */}
                                {(course.startDate || course.endDate) && (
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('admin.courseEdit.schedule')}</p>
                                            <p className="font-medium text-gray-900">
                                                {course.startDate && formatDate(course.startDate)}
                                                {course.startDate && course.endDate && ' - '}
                                                {course.endDate && formatDate(course.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* {t('admin.detailLabels.enrolledStudents')} */}
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('admin.detailLabels.enrolledStudents')}</p>
                                        <p className="font-medium text-gray-900">
                                            {course.enrolledStudents?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* {t('admin.detailLabels.averageRating')} */}
                                {course.averageRating && (
                                    <div className="flex items-center gap-3">
                                        <StarIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">{t('admin.detailLabels.averageRating')}</p>
                                            <p className="font-medium text-gray-900">
                                                {course.averageRating.toFixed(1)} ({course.ratings?.length || 0} reviews)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.courseEdit.pricing')}</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{t('admin.courseEdit.basePrice')}</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatPrice(course.price)}</p>
                                </div>

                                {course.hasPricingOverride && course.coursePricing?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">{t('admin.courseEdit.countryPricing')}</p>
                                        <div className="space-y-2">
                                            {course.coursePricing.map((rule, index) => (
                                                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                                    <p className="font-medium text-blue-900">
                                                        {formatPrice(rule.price)}
                                                    </p>
                                                    <p className="text-sm text-blue-700">
                                                        {rule.groupName || rule.countries.join(', ')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.detailLabels.actions')}</h3>
                            
                            <div className="space-y-3">
                                {course.status === 'approved' && (
                                    <button
                                        onClick={handleToggleFeatured}
                                        disabled={actionLoading}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                                            course.featured 
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        <StarIcon className="w-4 h-4" />
                                          {course.featured ? t('admin.courseEdit.removeFromFeatured') : t('admin.courseEdit.addToFeatured')}
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    Delete Course
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;