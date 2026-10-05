import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { enrollmentService } from '../services/new-api';
import LoadingNew from '../components/shared/LoadingNew/LoadingNew';

const VerifyEnrollment = () => {
  const { serial } = useParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await enrollmentService.verifyBySerial(serial);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || t('verifyEnrollment.failed', 'Unable to verify enrollment'));
        setResult(err.response?.data || { valid: false });
      } finally {
        setLoading(false);
      }
    };
    if (serial) run();
  }, [serial]);

  if (loading) return <LoadingNew />;

  const valid = result?.valid;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('verifyEnrollment.title', 'Enrollment Verification')}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {t('verifyEnrollment.subtitle', 'Confirm offline course enrollment authenticity')}
        </p>

        {valid ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-bold text-lg">
                  {t('verifyEnrollment.accepted', 'Student Accepted ✓')}
                </p>
                <p className="text-green-600 text-sm">
                  {t('verifyEnrollment.validEnrollment', 'This enrollment is valid')}
                </p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.serial', 'Serial')}</dt><dd className="font-mono font-semibold">{result.serialNumber}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.student', 'Student')}</dt><dd>{result.studentName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.course', 'Course')}</dt><dd>{result.courseTitle}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.type', 'Type')}</dt><dd className="font-bold">OFFLINE</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.payment', 'Payment')}</dt><dd className="text-green-700 font-semibold">{result.paymentStatus}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.status', 'Status')}</dt><dd>{result.enrollmentStatus}</dd></div>
              {result.location && (
                <div className="flex justify-between gap-4"><dt className="text-gray-500">{t('verifyEnrollment.location', 'Location')}</dt><dd>{result.location}</dd></div>
              )}
            </dl>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-red-800 font-bold text-lg">
                  {t('verifyEnrollment.invalid', 'INVALID')}
                </p>
                <p className="text-red-600 text-sm">
                  {error || t('verifyEnrollment.notFound', 'No enrollment found for this serial.')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link to="/" className="text-blue-600 text-sm underline">
            {t('verifyEnrollment.backHome', 'Back to home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEnrollment;
