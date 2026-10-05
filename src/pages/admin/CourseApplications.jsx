import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { adminService } from '../../services/new-api';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 24;

const CourseApplications = ({ onCourseUpdate }) => {
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: PAGE_SIZE });

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingCourses({
                page,
                limit: PAGE_SIZE
            });
            const list = response?.courses || (Array.isArray(response) ? response : []);
            setCourses(list);
            if (response?.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(t('admin.courseApplications.fetchFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, t]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleCourseAction = async (courseId, status) => {
        try {
            await adminService.reviewCourse(courseId, { status });
            toast.success(t(status === 'approved' ? 'admin.courses.approvedSuccess' : 'admin.courses.rejectedSuccess'));
            fetchCourses();
            if (onCourseUpdate) {
                onCourseUpdate();
            }
        } catch (error) {
            toast.error(t('admin.courses.updateStatusFailed'));
            console.error(error);
        }
    };

    const CourseDetails = ({ course }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('admin.detailLabels.courseDetails')}</h2>
                    <button 
                        onClick={() => setSelectedCourse(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseInformation')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.title')}:</span> {course.title}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.category')}:</span> {course.category}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.subCategory')}:</span> {course.subCategory}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.price')}:</span> {course.price} SAR</p>
                        <p><span className="font-medium">{t('admin.detailLabels.level')}:</span> {course.level}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseDetails')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.description')}:</span></p>
                        <p className="mt-1 text-gray-600">{course.description}</p>
                        <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.requirements')}:</span></p>
                        <ul className="list-disc pl-5 mt-1 text-gray-600">
                            {course.requirements && course.requirements.length > 0 ? (
                                course.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))
                            ) : (
                                <li>{t('admin.detailLabels.noRequirements')}</li>
                            )}
                        </ul>
                        <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.whatYouLearn')}:</span></p>
                        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                            <ul className="list-disc pl-5 mt-1 text-gray-600 space-y-2">
                                {course.whatYouWillLearn.map((item, index) => {
                                    const mainText = typeof item === 'string' ? item : (item?.main || '');
                                    const subPoints = typeof item === 'string' ? [] : (item?.subPoints || []);
                                    
                                    return (
                                        <li key={index} className="font-medium">
                                            {mainText}
                                            {subPoints && subPoints.length > 0 && (
                                                <ul className="list-circle pl-5 mt-1 space-y-1 font-normal">
                                                    {subPoints.map((subPoint, subIndex) => (
                                                        <li key={subIndex}>{subPoint}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-500">{t('admin.courseApplications.noOutcomes')}</p>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.instructorInfo')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.name')}:</span> {course.instructor.firstName} {course.instructor.lastName}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.email')}:</span> {course.instructor.email}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.previewContent')}</h3>
                        {course.previewVideo && (
                            <p>
                                <a 
                                    href={course.previewVideo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {t('admin.detailLabels.viewPreviewVideo')}
                                </a>
                            </p>
                        )}
                        {course.thumbnail && (
                            <p className="mt-2">
                                <a 
                                    href={course.thumbnail}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {t('admin.detailLabels.viewThumbnail')}
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={() => handleCourseAction(course._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleCourseAction(course._id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingNew words={["courses", "applications", "reviewing", "please wait"]} />;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">{t('admin.courseApplications.title')}</h1>
            
            <div className="grid gap-4">
                {courses.map((course) => (
                    <div 
                        key={course._id}
                        className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex space-x-4">
                                {course.thumbnail && (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold">{course.title}</h2>
                                    <p className="text-gray-600">by {course.instructor.firstName} {course.instructor.lastName}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {t('admin.detailLabels.submittedOn')} {formatDate(course.createdAt, language)}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className="text-sm text-gray-600">{course.category}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{course.price} SAR</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{course.level}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSelectedCourse(course)}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    View Details
                                </button>
                                {course.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleCourseAction(course._id, 'rejected')}
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleCourseAction(course._id, 'approved')}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                        >
                                            Accept
                                        </button>
                                    </>
                                )}
                                <span className={`px-3 py-1 rounded-full text-sm
                                    ${course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    course.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'}`}
                                >
                                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 bg-white"
                    >
                        {t('common.previous', { defaultValue: 'Previous' })}
                    </button>
                    <span className="text-sm text-gray-600">
                        {page} / {pagination.pages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= pagination.pages}
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 bg-white"
                    >
                        {t('common.next', { defaultValue: 'Next' })}
                    </button>
                </div>
            )}

            {selectedCourse && (
                <CourseDetails course={selectedCourse} />
            )}
        </div>
    );
};

export default CourseApplications;
