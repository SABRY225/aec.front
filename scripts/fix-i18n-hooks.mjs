import fs from 'fs';
import path from 'path';

const files = [
  'pages/admin/AdminProfileSettings.jsx',
  'pages/admin/ApprovedCourses.jsx',
  'pages/admin/CourseApplications.jsx',
  'pages/admin/Instructors.jsx',
  'pages/admin/InstructorApplications.jsx',
  'pages/instructor/InstructorAccountSettings.jsx',
  'pages/instructor/InstructorProfileSettings.jsx',
  'pages/student/ProfileSettings.jsx',
  'components/admin/SubcategoriesManagement.jsx',
];

const root = path.resolve('src');

for (const rel of files) {
  const fp = path.join(root, rel);
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes('useTranslation')) continue;

  const hookDepth = rel.includes('components/admin') ? '../../hooks/useLanguage' : '../../hooks/useLanguage';

  if (!c.includes("from 'react-i18next'")) {
    const m = c.match(/^import .+ from 'react';?\n/m);
    if (m) {
      c = c.replace(m[0], m[0] + `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '${hookDepth}';\n`);
    } else {
      c = `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from '${hookDepth}';\n` + c;
    }
  }

  const compMatch = c.match(/(const \w+ = \([^)]*\) => \{\n)/);
  if (compMatch) {
    c = c.replace(compMatch[1], compMatch[1] + '    const { t } = useTranslation();\n    const { isRTL } = useLanguage();\n');
    fs.writeFileSync(fp, c);
    console.log('Fixed', rel);
  }
}
