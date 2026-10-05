import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

const filePatches = {
  'pages/instructor/Courses.jsx': [
    ['<motion.div className="container', '<div dir={isRTL ? \'rtl\' : \'ltr\'} className="container'],
    ['My Courses</h1>', "{t('instructor.courses.title')}</h1>"],
    ['Create New Course', "{t('instructor.courses.createNew')}"],
    ['All Courses ({courses.length})', "{t('instructor.courses.allFilter', { count: courses.length })}"],
    ["Approved Courses ({courses.filter(course => course.status === 'approved').length})", "{t('instructor.courses.approvedFilter', { count: courses.filter(course => course.status === 'approved').length })}"],
    ["Pending Courses ({courses.filter(course => course.status === 'pending' || course.status === 'draft').length})", "{t('instructor.courses.pendingFilter', { count: courses.filter(course => course.status === 'pending' || course.status === 'draft').length })}"],
    ["You haven't created any courses yet", "{t('instructor.courses.noCoursesTitle')}"],
    ['Start creating your first course and share your knowledge with students around the world.', "{t('instructor.courses.noCoursesDesc')}"],
    ['Create Your First Course', "{t('instructor.courses.createFirst')}"],
    ['No thumbnail', "{t('instructor.courses.noThumbnail')}"],
    ["{course.status || 'Draft'}", "{course.status || t('instructor.courses.draftStatus')}"],
    ['<span className="font-medium">Students:</span>', '<span className="font-medium">{t(\'instructor.courses.students\')}:</span>'],
    ['<span className="font-medium">Revenue:</span>', '<span className="font-medium">{t(\'instructor.courses.revenue\')}:</span>'],
    ['>Edit<', '>{t(\'instructor.courses.edit\')}<'],
    ['>Analytics<', '>{t(\'instructor.courses.analytics\')}<'],
  ],
  'components/main/TopCompanies.jsx': [
    ["import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useTranslation } from 'react-i18next';"],
    ['function TopCompanies() {', "function TopCompanies() {\n  const { t } = useTranslation();"],
    ['Top companies choose AEC', "{t('home.topCompanies.title')}"],
  ],
  'pages/student/PaymentSettings.jsx': [
    ["const PaymentSettings = () => {", "import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '../../hooks/useLanguage';\n\nconst PaymentSettings = () => {\n  const { t } = useTranslation();\n  const { isRTL } = useLanguage();"],
    ['Payment Settings</h1>', "{t('student.settings.payment.title')}</h1>"],
    ['Payment settings and billing information will be available soon.', "{t('student.settings.payment.comingSoon')}"],
  ],
  'pages/admin/ManualEnrollment.jsx': [
    ['>Search user</label>', ">{t('admin.manualEnrollment.searchUser')}</label>"],
    ['>Search course</label>', ">{t('admin.manualEnrollment.searchCourse')}</label>"],
  ],
  'pages/instructor/MyInstructorCourses.jsx': [
    ["toast.error('Failed to fetch enrolled courses')", "toast.error(t('instructor.myCourses.fetchFailed'))"],
  ],
  'pages/instructor/course-creation/AdditionalFilesStep.jsx': [
    ["toast.success('File removed')", "toast.success(t('instructor.courseCreation.fileRemoved'))"],
    ["toast.error('Failed to upload file')", "toast.error(t('instructor.courseCreation.fileUploadFailed'))"],
  ],
  'pages/instructor/course-creation/BasicInfoStep.jsx': [
    ["toast.info('This topic is already added')", "toast.info(t('instructor.courseCreation.topicAlreadyAdded'))"],
  ],
  'pages/admin/InstructorApplications.jsx': [
    ["toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`)", "toast.success(t('admin.instructorApplications.statusSuccess', { status: t(`admin.instructorApplications.${status === 'approved' ? 'approved' : 'rejected'}`) }))"],
  ],
  'pages/AccountSettings.jsx': [
    ["import { useState } from 'react';", "import { useState } from 'react';\nimport { useTranslation } from 'react-i18next';\nimport { useLanguage } from '../hooks/useLanguage';"],
    ['const AccountSettings = () => {', 'const AccountSettings = () => {\n    const { t } = useTranslation();\n    const { isRTL } = useLanguage();'],
    ["toast.success('Settings updated successfully')", "toast.success(t('student.settings.account.updated'))"],
    ["toast.error('Failed to update settings')", "toast.error(t('student.settings.account.updateFailed'))"],
  ],
  'pages/ProfileSettings.jsx': [
    ["import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';\nimport { useLanguage } from '../hooks/useLanguage';"],
  ],
};

function ensureHook(content, rel) {
  if (content.includes('useTranslation') && content.includes('const { t } = useTranslation()')) return content;
  const hookPath = rel.includes('components/') ? '../../hooks/useLanguage' : rel.includes('pages/instructor/') || rel.includes('pages/admin/') ? '../../hooks/useLanguage' : '../hooks/useLanguage';
  if (!content.includes("from 'react-i18next'")) {
    const m = content.match(/^import .+ from 'react';?\n/m) || content.match(/^import .+ from "react";\n/m);
    if (m) {
      content = content.replace(m[0], m[0] + `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '${hookPath}';\n`);
    }
  }
  const comp = content.match(/(const \w+ = \([^)]*\) => \{\n)/);
  if (comp && !content.includes('const { t } = useTranslation()')) {
    content = content.replace(comp[1], comp[1] + '    const { t } = useTranslation();\n    const { isRTL } = useLanguage();\n');
  }
  return content;
}

for (const [rel, patches] of Object.entries(filePatches)) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) { console.log('skip', rel); continue; }
  let c = fs.readFileSync(fp, 'utf8');
  for (const [from, to] of patches) {
    if (c.includes(from)) c = c.split(from).join(to);
  }
  if (rel.includes('MyInstructorCourses') || rel.includes('ProfileSettings.jsx')) {
    c = ensureHook(c, rel);
  }
  fs.writeFileSync(fp, c);
  console.log('patched', rel);
}
