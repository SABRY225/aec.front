import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/new-api';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';

const PAGE_SIZE = 24;

const AllCourses = ({ onCourseUpdate }) => {
    const { t } = useTranslation();
    const { isRTL, language } = useLanguage();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: PAGE_SIZE });

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllCourses({
                page,
                limit: PAGE_SIZE
            });
            const list = response?.courses || (Array.isArray(response) ? response : []);
            setCourses(list);
            if (response?.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(t('admin.allCourses.fetchFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, t]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm(t('admin.courses.confirmDeletePermanent'))) {
            try {
                await adminService.deleteCourse(courseId);
                toast.success(t('admin.courses.deleted'));
                fetchCourses();
            } catch (error) {
                toast.error(t('admin.courses.deleteFailed'));
                console.error(error);
            }
        }
    };

    const handleEditCourse = (courseId) => {
        navigate(`/instructor/courses/${courseId}/edit`);
    };

    const handleUpdateStatus = async (courseId, newStatus) => {
        try {
            await adminService.updateCourseStatus(courseId, { status: newStatus });
            toast.success(t('admin.courses.statusUpdated', { status: newStatus }));
            fetchCourses();
            if (onCourseUpdate) {
                onCourseUpdate();
            }
        } catch (error) {
            toast.error(t('admin.courses.updateStatusFailed'));
            console.error(error);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'published':
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
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
                        <p><span className="font-medium">{t('admin.detailLabels.status')}:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                                {course.status}
                            </span>
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseDetails')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.description')}:</span></p>
                        <p className="mt-1 text-gray-600">{course.description}</p>
                        {course.requirements && course.requirements.length > 0 && (
                            <>
                                <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.requirements')}:</span></p>
                                <ul className="list-disc pl-5 mt-1 text-gray-600">
                                    {course.requirements.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                            <>
                                <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.whatYouLearn')}:</span></p>
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
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.instructorInfo')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.name')}:</span> {course.instructor?.firstName} {course.instructor?.lastName}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.email')}:</span> {course.instructor?.email}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseContent')}</h3>
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

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseStatistics')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.enrolledStudents')}:</span> {course.enrolledStudents?.length || 0}</p>
                        <p><span className="font-medium">{t('admin.detailLabels.averageRating')}:</span> {course.rating || t('admin.detailLabels.noRatings')}</p>
                        <p><span className="font-medium">{t('admin.courses.created')}:</span> {formatDate(course.createdAt, language)}</p>
                        {course.publishedAt && (
                            <p><span className="font-medium">{t('admin.detailLabels.publishedLabel')}:</span> {formatDate(course.publishedAt, language)}</p>
                        )}
                    </div>

                    {/* Admin Actions */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">{t('admin.detailLabels.adminActions')}</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleEditCourse(course._id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {t('admin.detailLabels.editCourse')}
                            </button>
                            <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                {t('admin.detailLabels.deleteCourse')}
                            </button>
                            {course.status !== 'approved' && (
                                <button
                                    onClick={() => handleUpdateStatus(course._id, 'approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {t('admin.courses.approve')}
                                </button>
                            )}
                            {course.status !== 'rejected' && (
                                <button
                                    onClick={() => handleUpdateStatus(course._id, 'rejected')}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {t('admin.courses.reject')}
                                </button>
                            )}
                            {course.status !== 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus(course._id, 'pending')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                    {t('admin.detailLabels.setPending')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingNew words={["courses", "loading", "please wait"]} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('admin.allCourses.titleWithCount', { count: pagination.total || courses.length })}</h2>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">{t('admin.allCourses.noCourses')}</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course._id || course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="w-full aspect-video overflow-hidden">
                                {course.thumbnail ? (
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">{t('admin.allCourses.noThumbnail')}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">{course.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(course.status)}`}>
                                        {course.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">by {course.instructor?.firstName} {course.instructor?.lastName}</p>
                                <p className="text-gray-600 text-sm mb-2">{course.category}</p>
                                <p className="text-gray-800 font-semibold mb-4">{course.price} SAR</p>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditCourse(course._id || course.id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course._id || course.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCourse(course)}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
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
                </>
            )}

            {selectedCourse && (
                <CourseDetails course={selectedCourse} />
            )}
        </div>
    );
};

export default AllCourses;