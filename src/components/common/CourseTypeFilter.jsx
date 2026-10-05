import { useTranslation } from 'react-i18next';
import { COURSE_TYPE_FILTER_OPTIONS } from '../../constants/courseTypes';

/**
 * Reusable course-type filter: All | Online | Recorded | Offline
 * Renders as a responsive clickable button group.
 */
const CourseTypeFilter = ({
  value = '',
  onChange,
  className = '',
  buttonClassName = '',
  labelClassName = '',
  showLabel = true,
  align = null, // 'center' | 'start' — defaults to center when no label (homepage), start in sidebars
  id = 'course-type-filter',
}) => {
  const { t } = useTranslation();
  const selected = value || '';
  const justify = align === 'center' || (!align && !showLabel) ? 'justify-center' : 'justify-start';

  return (
    <div className={className}>
      {showLabel && (
        <p
          id={`${id}-label`}
          className={labelClassName || 'block text-sm font-medium text-gray-700 mb-2'}
        >
          {t('explore.courseTypeLabel', 'Course Type')}
        </p>
      )}
      <div
        role="group"
        aria-labelledby={showLabel ? `${id}-label` : undefined}
        aria-label={!showLabel ? t('explore.courseTypeLabel', 'Course Type') : undefined}
        className={`flex flex-wrap items-center ${justify} gap-2 sm:gap-2.5`}
      >
        {COURSE_TYPE_FILTER_OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => onChange?.(opt.value)}
              aria-pressed={isActive}
              className={
                buttonClassName ||
                [
                  'px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold',
                  'border transition-all duration-200 whitespace-nowrap',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-blue-500/25'
                    : 'bg-white/90 text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/80',
                ].join(' ')
              }
            >
              {t(opt.labelKey, opt.fallback)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CourseTypeFilter;
