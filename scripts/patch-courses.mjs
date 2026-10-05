import fs from 'fs';

const d = '<' + 'div';

const files = {
  'src/pages/instructor/Courses.jsx': [
    [`${d} className="container h-[calc(100vh-120px)]`, `${d} dir={isRTL ? 'rtl' : 'ltr'} className="container h-[calc(100vh-120px)]`],
    ['All Courses ({courses.length})', "{t('instructor.courses.allFilter', { count: courses.length })}"],
    ["Approved Courses ({courses.filter(course => course.status === 'approved').length})", "{t('instructor.courses.approvedFilter', { count: courses.filter(course => course.status === 'approved').length })}"],
    ["Pending Courses ({courses.filter(course => course.status === 'pending' || course.status === 'draft').length})", "{t('instructor.courses.pendingFilter', { count: courses.filter(course => course.status === 'pending' || course.status === 'draft').length })}"],
    ["You haven't created any courses yet", "{t('instructor.courses.noCoursesTitle')}"],
    ['Start creating your first course and share your knowledge with students around the world.', "{t('instructor.courses.noCoursesDesc')}"],
    ['Create Your First Course', "{t('instructor.courses.createFirst')}"],
    ['No thumbnail', "{t('instructor.courses.noThumbnail')}"],
    ["{course.status || 'Draft'}", "{course.status || t('instructor.courses.draftStatus')}"],
    ['<span className="font-medium">Students:</span>', "<span className=\"font-medium\">{t('instructor.courses.students')}:</span>"],
    ['<span className="font-medium">Revenue:</span>', "<span className=\"font-medium\">{t('instructor.courses.revenue')}:</span>"],
    ['>Edit</Link>', ">{t('instructor.courses.edit')}</Link>"],
    ['>Analytics</Link>', ">{t('instructor.courses.analytics')}</Link>"],
  ],
};

for (const [rel, patches] of Object.entries(files)) {
  let c = fs.readFileSync(rel, 'utf8');
  for (const [a, b] of patches) {
    if (c.includes(a)) c = c.split(a).join(b);
    else console.warn('missing', rel, a.slice(0, 50));
  }
  fs.writeFileSync(rel, c);
  console.log('patched', rel);
}
