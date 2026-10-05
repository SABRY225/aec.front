import fs from 'fs';

function patch(rel, pairs) {
  if (!fs.existsSync(rel)) return;
  let c = fs.readFileSync(rel, 'utf8');
  for (const [a, b] of pairs) {
    if (c.includes(a)) c = c.split(a).join(b);
  }
  fs.writeFileSync(rel, c);
  console.log('ok', rel);
}

function addI18n(rel, hookPath) {
  let c = fs.readFileSync(rel, 'utf8');
  if (!c.includes('useTranslation')) {
    const m = c.match(/^import .+ from 'react';\n/m);
    if (m) c = c.replace(m[0], m[0] + `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '${hookPath}';\n`);
    else c = `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '${hookPath}';\n` + c;
  }
  if (!c.includes('const { t } = useTranslation()')) {
    const comp = c.match(/(const \w+ = \([^)]*\) => \{\n)/);
    if (comp) c = c.replace(comp[1], comp[1] + '    const { t } = useTranslation();\n    const { isRTL } = useLanguage();\n');
  }
  fs.writeFileSync(rel, c);
}

const div = '<' + 'div';

patch('src/components/main/TopCompanies.jsx', [
  ["import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useTranslation } from 'react-i18next';"],
  ['function TopCompanies() {', "function TopCompanies() {\n  const { t } = useTranslation();"],
  ['Top companies choose AEC', "{t('home.topCompanies.title')}"],
]);

let pay = fs.readFileSync('src/pages/student/PaymentSettings.jsx', 'utf8');
if (!pay.includes('useTranslation')) {
  pay = `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '../../hooks/useLanguage';\n\n` + pay;
  pay = pay.replace('const PaymentSettings = () => {', "const PaymentSettings = () => {\n  const { t } = useTranslation();\n  const { isRTL } = useLanguage();");
}
pay = pay.replace('Payment Settings</h1>', "{t('student.settings.payment.title')}</h1>");
pay = pay.replace('Payment settings and billing information will be available soon.', "{t('student.settings.payment.comingSoon')}");
pay = pay.replace(`${div} className="container mx-auto`, `${div} dir={isRTL ? 'rtl' : 'ltr'} className="container mx-auto`);
fs.writeFileSync('src/pages/student/PaymentSettings.jsx', pay);

patch('src/pages/admin/ManualEnrollment.jsx', [
  ['>Search user</label>', ">{t('admin.manualEnrollment.searchUser')}</label>"],
  ['>Search course</label>', ">{t('admin.manualEnrollment.searchCourse')}</label>"],
]);

addI18n('src/pages/instructor/MyInstructorCourses.jsx', '../../hooks/useLanguage');
patch('src/pages/instructor/MyInstructorCourses.jsx', [
  ["toast.error('Failed to fetch enrolled courses')", "toast.error(t('instructor.myCourses.fetchFailed'))"],
]);

patch('src/pages/instructor/course-creation/AdditionalFilesStep.jsx', [
  ["toast.success('File removed')", "toast.success(t('instructor.courseCreation.fileRemoved'))"],
  ["onUploadError={(error) => toast.error('Failed to upload file')}", "onUploadError={() => toast.error(t('instructor.courseCreation.fileUploadFailed'))}"],
]);

patch('src/pages/instructor/course-creation/BasicInfoStep.jsx', [
  ["toast.info('This topic is already added')", "toast.info(t('instructor.courseCreation.topicAlreadyAdded'))"],
]);

patch('src/pages/admin/InstructorApplications.jsx', [
  ["toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`)", "toast.success(t('admin.instructorApplications.statusSuccess', { status: t(`admin.instructorApplications.${status === 'approved' ? 'approved' : 'rejected'}`) }))"],
]);

addI18n('src/pages/AccountSettings.jsx', '../hooks/useLanguage');
patch('src/pages/AccountSettings.jsx', [
  ["toast.success('Settings updated successfully')", "toast.success(t('student.settings.account.updated'))"],
  ["toast.error('Failed to update settings')", "toast.error(t('student.settings.account.updateFailed'))"],
]);

addI18n('src/pages/ProfileSettings.jsx', '../hooks/useLanguage');
patch('src/pages/ProfileSettings.jsx', [
  ["toast.error('Failed to fetch profile')", "toast.error(t('student.settings.profile.loadFailed'))"],
  ["toast.success('Profile photo uploaded successfully')", "toast.success(t('student.settings.profile.photoUploaded'))"],
  ["toast.error('Failed to upload profile photo')", "toast.error(t('student.settings.profile.photoUploadFailed'))"],
  ["toast.success('Profile updated successfully')", "toast.success(t('student.settings.profile.updated'))"],
  ["toast.error('Failed to update profile')", "toast.error(t('student.settings.profile.updateFailed'))"],
]);

patch('src/pages/CourseStudy.jsx', [
  ["{isCompleted ? 'Submitted' : 'Submit Assignment'}", "{isCompleted ? t('course.study.submitted') : t('course.study.submitAssignmentBtn')}"],
  ["const label = file.name || 'Download';", "const label = file.name || t('course.study.downloadDefault');"],
  ["|| 'Select content to start'", "|| t('course.study.selectContent')"],
  ["? `${daysRemaining} days remaining` : 'Course ended'", "? t('course.study.daysRemaining', { count: daysRemaining }) : t('course.study.courseEnded')"],
  ['<span>Rate Course</span>', "<span>{t('course.study.rateCourse')}</span>"],
  ["{courseMaterialsOpen ? 'Hide' : 'Show'} downloads", "{courseMaterialsOpen ? t('course.study.hideDownloads') : t('course.study.showDownloads')}"],
  ["{currentContent.isCompleted ? 'Completed' : 'Mark as Complete'}", "{currentContent.isCompleted ? t('course.study.completed') : t('course.study.markCompleteBtn')}"],
  ['>Description</h3>', ">{t('course.study.description')}</h3>"],
  ['>Lecture resources</h3>', ">{t('course.study.lectureResources')}</h3>"],
  ['placeholder="Share your thoughts about this course..."', "placeholder={t('course.study.reviewPlaceholder')}"],
]);

console.log('done');
