import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const rules = [
  {
    files: ['src/pages/admin/CourseDetail.jsx'],
    pairs: [
      ['Course Not Found', "{t('admin.courses.notFound')}"],
      ['Course Brochure', "{t('course.preview.courseBrochure')}"],
      ['Download the course brochure for detailed information', "{t('course.preview.brochureDescription')}"],
      ['Course Details', "{t('admin.detailLabels.courseDetails')}"],
      ["What You'll Learn", "{t('admin.detailLabels.whatYouLearn')}"],
      ['Requirements', "{t('admin.detailLabels.requirements')}"],
      ['Course Content', "{t('admin.detailLabels.courseContent')}"],
      ['Course Information', "{t('admin.detailLabels.courseInformation')}"],
      ['>Instructor<', ">{t('course.study.instructor')}<"],
      ['>Created<', ">{t('admin.allCourses.created')}<"],
      ['>Language<', ">{t('course.preview.language')}<"],
      ['Subtitles:', "{t('course.preview.subtitles', { language: '' }).replace(': ', ': ')}"],
      ['>Duration<', ">{t('course.preview.duration')}<"],
      ['>Level<', ">{t('admin.detailLabels.level')}<"],
      ['>Type<', ">{t('common.type')}<"],
      ['>Category<', ">{t('admin.detailLabels.category')}<"],
      ['Topics:', "{t('course.preview.topicsLabel')}"],
      ['Topic:', "{t('course.preview.topicLabel')}"],
      ['>Location<', ">{t('admin.detailLabels.location')}<"],
      ['>Schedule<', ">{t('admin.courseEdit.schedule')}<"],
      ['Enrolled Students', "{t('admin.detailLabels.enrolledStudents')}"],
      ['Average Rating', "{t('admin.detailLabels.averageRating')}"],
      ['>Pricing<', ">{t('admin.courseEdit.pricing')}<"],
      ['Base Price', "{t('admin.courseEdit.basePrice')}"],
      ['Country-Specific Pricing', "{t('admin.courseEdit.countryPricing')}"],
      ['>Actions<', ">{t('admin.detailLabels.actions')}<"],
      ['Remove from Featured', "{t('admin.courseEdit.removeFromFeatured')}"],
      ['Add to Featured', "{t('admin.courseEdit.addToFeatured')}"],
    ],
  },
  {
    files: ['src/pages/admin/CourseEdit.jsx'],
    pairs: [
      ['Course Not Found', "{t('admin.courses.notFound')}"],
      ['Basic Information', "{t('admin.courseEdit.basicInformation')}"],
      ['placeholder="Enter course title"', "placeholder={t('admin.courseEdit.titlePlaceholder')}"],
      ['placeholder="Enter course description"', "placeholder={t('admin.courseEdit.descriptionPlaceholder')}"],
      ['Select Category', "{t('admin.courseEdit.selectCategory')}"],
      ['placeholder="Enter sub category"', "placeholder={t('admin.courseEdit.subCategoryPlaceholder')}"],
      ['Select Level', "{t('admin.courseEdit.selectLevel')}"],
      ['Country-Specific Pricing', "{t('admin.courseEdit.countryPricing')}"],
      ['placeholder="e.g., MENA Region, Europe"', "placeholder={t('admin.courseEdit.regionPlaceholder')}"],
      ['Base Price:', "{t('admin.courseEdit.basePrice')}:"],
    ],
  },
  {
    files: ['src/pages/instructor/InstructorAccountSettings.jsx'],
    pairs: [
      ['Loading...', "{t('instructor.courseCreation.loading')}"],
      ['Account Settings', "{t('instructor.settings.account.pageTitle')}"],
      ['Manage your account security and preferences', "{t('instructor.settings.account.accountSubtitle')}"],
      ['Account Security', "{t('instructor.settings.account.accountSecurity')}"],
      ['Change Password', "{t('instructor.settings.account.changePassword')}"],
      ['Notification Preferences', "{t('instructor.settings.account.notifications')}"],
      ['Availability Settings', "{t('instructor.settings.account.availabilitySettings')}"],
      ['Payment Settings', "{t('instructor.settings.account.payment')}"],
      ['>Available<', ">{t('instructor.courseCreation.statusAvailable')}<"],
      ['>Away<', ">{t('instructor.courseCreation.statusAway')}<"],
      ['>Busy<', ">{t('instructor.courseCreation.statusBusy')}<"],
      ['placeholder="Set an auto-reply message', "placeholder={t('instructor.courseCreation.autoReplyPlaceholder')}"],
      ['Bank Transfer', "{t('instructor.courseCreation.bankTransfer')}"],
      ['Stripe', "{t('instructor.courseCreation.stripe')}"],
    ],
  },
  {
    files: [
      'src/pages/instructor/course-creation/CurriculumStep.jsx',
      'src/pages/instructor/course-creation/PublishStep.jsx',
      'src/pages/instructor/course-creation/AdvancedInfoStep.jsx',
    ],
    pairs: [
      ['Attached Files:', "{t('instructor.courseCreation.attachedFiles')}"],
      ['>Quiz<', ">{t('instructor.courseCreation.quiz')}<"],
      ['Essay/Written Assignment', "{t('instructor.courseCreation.essay')}"],
      ['Multiple Choice', "{t('instructor.courseCreation.mcq')}"],
      ['True/False', "{t('instructor.courseCreation.trueFalse')}"],
      ['Essay/Written Answer', "{t('instructor.courseCreation.essayAnswer')}"],
      ['Select the radio button next to the correct answer.', "{t('instructor.courseCreation.selectCorrectAnswer')}"],
      ['Course Sections', "{t('instructor.courseCreation.courseSections')}"],
      ['>Lectures<', ">{t('instructor.courseCreation.lectures')}<"],
      ['>Assignments<', ">{t('instructor.courseCreation.assignments')}<"],
      ['Sections, lectures, and assignments', "{t('instructor.courseCreation.publishChecklistCurriculumDesc')}"],
      ['placeholder="e.g., Build responsive websites', "placeholder={t('instructor.courseCreation.outcomePlaceholder')}"],
      ['placeholder="Optional sub-point', "placeholder={t('instructor.courseCreation.subOutcomePlaceholder')}"],
    ],
  },
  {
    files: ['src/pages/instructor/course-creation/BasicInfoStep.jsx'],
    pairs: [
      ['placeholder="e.g., Complete JavaScript Course', "placeholder={t('instructor.courseCreation.titlePlaceholder')}"],
      ['Select a language', "{t('instructor.courseCreation.selectLanguage')}"],
      ['Select a level', "{t('instructor.courseCreation.selectLevel')}"],
      ['Select course type', "{t('instructor.courseCreation.selectCourseType')}"],
      ['>None<', ">{t('instructor.courseCreation.selectSubtitle')}<"],
      ['>English<', ">{t('student.settings.account.languages.english')}<"],
      ['>Arabic<', ">{t('student.settings.account.languages.arabic')}<"],
      ['>French<', ">{t('student.settings.account.languages.french')}<"],
      ['>Beginner<', ">{t('course.card.level.beginner')}<"],
      ['>Intermediate<', ">{t('course.card.level.intermediate')}<"],
      ['>Advanced<', ">{t('course.card.level.advanced')}<"],
      ['>Recorded<', ">{t('course.card.courseType.recorded')}<"],
      ['Online (live)', "{t('course.card.courseType.live')}"],
    ],
  },
];

let n = 0;
for (const rule of rules) {
  for (const rel of rule.files) {
    const fp = path.join(root, rel);
    if (!fs.existsSync(fp)) continue;
    let c = fs.readFileSync(fp, 'utf8');
    const o = c;
    for (const [a, b] of rule.pairs) c = c.split(a).join(b);
    if (c !== o) { fs.writeFileSync(fp, c); n++; console.log(rel); }
  }
}
console.log('done', n);
