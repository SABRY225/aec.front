import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { courseService } from '../../services/new-api';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 24;

const ApprovedCourses = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: PAGE_SIZE });

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await courseService.getAllCourses({
                limit: PAGE_SIZE,
                page,
            });
            setCourses(response.courses || []);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(t('admin.approvedCourses.fetchFailed'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, t]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const DetailRow = ({ labelKey, value }) => (
        <p>
            <span className="font-medium">{t(labelKey)}:</span> {value}
        </p>
    );

    const CourseDetailsModal = ({ course }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('admin.detailLabels.courseDetails')}</h2>
                    <button
                        type="button"
                        onClick={() => setSelectedCourse(null)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label={t('common.close')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseInformation')}</h3>
                        <DetailRow labelKey="admin.detailLabels.title" value={course.title} />
                        <DetailRow labelKey="admin.detailLabels.category" value={course.category} />
                        <DetailRow labelKey="admin.detailLabels.subCategory" value={course.subCategory} />
                        <DetailRow labelKey="admin.detailLabels.price" value={`${course.price} ${t('common.sar')}`} />
                        <DetailRow labelKey="admin.detailLabels.level" value={course.courseLevel} />
                        <DetailRow labelKey="admin.detailLabels.duration" value={`${course.duration} min`} />
                        <DetailRow labelKey="course.preview.language" value={course.language} />
                        {course.subtitleLanguage && (
                            <DetailRow labelKey="admin.detailLabels.subtitleLanguage" value={course.subtitleLanguage} />
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.courseDetails')}</h3>
                        <p><span className="font-medium">{t('admin.detailLabels.description')}:</span></p>
                        <p className="mt-1 text-gray-600">{course.description}</p>
                        <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.requirements')}:</span></p>
                        <ul className="list-disc ps-5 mt-1 text-gray-600">
                            {course.requirements?.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                        <p className="mt-2"><span className="font-medium">{t('admin.detailLabels.whatYouLearn')}:</span></p>
                        <ul className="list-disc ps-5 mt-1 text-gray-600">
                            {course.whatYouWillLearn?.map((item, index) => (
                                <li key={index}>{typeof item === 'string' ? item : item?.main}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('admin.detailLabels.instructorInfo')}</h3>
                        <DetailRow
                            labelKey="admin.detailLabels.name"
                            value={`${course.instructor.firstName} ${course.instructor.lastName}`}
                        />
                        <DetailRow labelKey="admin.detailLabels.email" value={course.instructor.email} />
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
                        <DetailRow
                            labelKey="admin.detailLabels.enrolledStudents"
                            value={course.enrolledStudents?.length || 0}
                        />
                        <DetailRow
                            labelKey="admin.detailLabels.averageRating"
                            value={course.rating || t('admin.detailLabels.noRatings')}
                        />
                        <DetailRow
                            labelKey="admin.detailLabels.publishedDate"
                            value={formatDate(course.publishedAt, language)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingNew words={['courses', 'loading', 'data', 'please wait']} />;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">{t('admin.courses.title')}</h1>

            <div className="grid gap-4">
                {courses.map((course) => (
                    <div
                        key={course._id}
                        className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                {course.thumbnail && (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold">{course.title}</h2>
                                    <p className="text-gray-600">
                                        {t('admin.detailLabels.byInstructor', {
                                            name: `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim(),
                                        })}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm text-gray-600">{course.category}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">
                                            {course.price} {t('common.sar')}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{course.courseLevel}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-sm text-gray-500">
                                            {t('admin.detailLabels.publishedLabel')}:{' '}
                                            {formatDate(course.publishedAt, language)}
                                        </span>
                                        <span className="mx-2 text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">
                                            {t('admin.detailLabels.students')}: {course.enrollmentCount || course.enrolledStudents?.length || 0}
                                        </span>
                                        {course.rating && (
                                            <>
                                                <span className="mx-2 text-gray-400">•</span>
                                                <span className="text-sm text-gray-500">
                                                    {t('admin.detailLabels.rating')}: {course.rating}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCourse(course)}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    {t('admin.detailLabels.viewDetails')}
                                </button>
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

            {selectedCourse && <CourseDetailsModal course={selectedCourse} />}
        </div>
    );
};

export default ApprovedCourses;
