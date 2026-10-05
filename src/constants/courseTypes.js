/** Canonical API values stay live | recorded | onsite */
export const COURSE_TYPES = {
  ALL: '',
  LIVE: 'live',
  RECORDED: 'recorded',
  ONSITE: 'onsite',
};

export const COURSE_TYPE_FILTER_OPTIONS = [
  { value: '', labelKey: 'explore.courseTypeFilter.all', fallback: 'All' },
  { value: 'recorded', labelKey: 'explore.courseTypeFilter.recorded', fallback: 'Recorded' },
  { value: 'live', labelKey: 'explore.courseTypeFilter.online', fallback: 'Online' },
  { value: 'onsite', labelKey: 'explore.courseTypeFilter.offline', fallback: 'Offline' },
];

export const COURSE_TYPE_BADGE = {
  live: 'ONLINE',
  recorded: 'RECORDED',
  onsite: 'OFFLINE',
  online: 'ONLINE',
  offline: 'OFFLINE',
};

export function normalizeCourseType(value) {
  if (!value || value === 'all') return '';
  const v = String(value).toLowerCase();
  if (v === 'online' || v === 'live') return 'live';
  if (v === 'offline' || v === 'onsite') return 'onsite';
  if (v === 'recorded') return 'recorded';
  return '';
}

export function getCourseTypeBadge(type) {
  return COURSE_TYPE_BADGE[type] || COURSE_TYPE_BADGE[normalizeCourseType(type)] || 'RECORDED';
}

export const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const ONLINE_PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'microsoft-teams', label: 'Microsoft Teams' },
  { value: 'other', label: 'Other' },
];
