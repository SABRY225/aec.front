/**
 * One-off helper: wire common hardcoded strings to t() in listed files.
 * Run from client/: node scripts/i18n-wire.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const rules = [
  // instructor course creation
  {
    files: [
      'src/pages/instructor/course-creation/BasicInfoStep.jsx',
      'src/pages/instructor/course-creation/AdvancedInfoStep.jsx',
      'src/pages/instructor/course-creation/CurriculumStep.jsx',
      'src/pages/instructor/course-creation/AdditionalFilesStep.jsx',
      'src/pages/instructor/course-creation/PublishStep.jsx',
      'src/pages/instructor/EditCourse.jsx',
    ],
    pairs: [
      ['>Basic Course Information<', ">{t('instructor.courseCreation.basicInfoTitle')}<"],
      ['>Advanced Course Information<', ">{t('instructor.courseCreation.advancedInfoTitle')}<"],
      ['>Course Curriculum<', ">{t('instructor.courseCreation.curriculumTitle')}<"],
      ['>Publish Your Course<', ">{t('instructor.courseCreation.publishTitle')}<"],
      ['placeholder="Enter lecture title"', 'placeholder={t(\'instructor.courseCreation.lectureTitlePlaceholder\')}'],
      ['placeholder="Enter lecture description"', 'placeholder={t(\'instructor.courseCreation.lectureDescPlaceholder\')}'],
      ['placeholder="Enter assignment title"', 'placeholder={t(\'instructor.courseCreation.assignmentTitlePlaceholder\')}'],
      ['placeholder="Enter assignment description"', 'placeholder={t(\'instructor.courseCreation.assignmentDescPlaceholder\')}'],
      ['placeholder="Enter section name"', 'placeholder={t(\'instructor.courseCreation.sectionNamePlaceholder\')}'],
      ['placeholder="Provide a detailed description of your course..."', 'placeholder={t(\'instructor.courseCreation.descriptionPlaceholder\')}'],
      ['placeholder="Enter a topic and press Enter"', 'placeholder={t(\'instructor.courseCreation.topicPlaceholder\')}'],
      ['placeholder="Enter your question text (optional if using image)"', 'placeholder={t(\'instructor.courseCreation.questionPlaceholder\')}'],
      ['placeholder="Enter a model answer for reference"', 'placeholder={t(\'instructor.courseCreation.modelAnswerPlaceholder\')}'],
      ['>Auto save loading...<', ">{t('instructor.courseCreation.autoSaveLoading')}<"],
      ['>Auto save done<', ">{t('instructor.courseCreation.autoSaveDone')}<"],
      ['>Step not found<', ">{t('instructor.courseCreation.stepNotFound')}<"],
      ['>Previous<', ">{t('instructor.courseCreation.previous')}<"],
    ],
  },
  {
    files: [
      'src/pages/admin/CourseApplications.jsx',
      'src/pages/admin/InstructorApplications.jsx',
      'src/pages/admin/AllCourses.jsx',
    ],
    pairs: [
      ['>Course Details<', ">{t('admin.detailLabels.courseDetails')}<"],
      ['>Course Information<', ">{t('admin.detailLabels.courseInformation')}<"],
      ['>Instructor Information<', ">{t('admin.detailLabels.instructorInfo')}<"],
      ['>Preview Content<', ">{t('admin.detailLabels.previewContent')}<"],
      ['>Application Details<', ">{t('admin.detailLabels.applicationDetails')}<"],
      ['>Personal Information<', ">{t('admin.detailLabels.personalInformation')}<"],
      ['>Personal Details<', ">{t('admin.detailLabels.personalDetails')}<"],
      ['>Academic Information<', ">{t('admin.detailLabels.academicInformation')}<"],
      ['>Documents<', ">{t('admin.detailLabels.documents')}<"],
      ['<span className="font-medium">Title:</span>', '<span className="font-medium">{t(\'admin.detailLabels.title\')}:</span>'],
      ['<span className="font-medium">Category:</span>', '<span className="font-medium">{t(\'admin.detailLabels.category\')}:</span>'],
      ['<span className="font-medium">Subcategory:</span>', '<span className="font-medium">{t(\'admin.detailLabels.subCategory\')}:</span>'],
      ['<span className="font-medium">Price:</span>', '<span className="font-medium">{t(\'admin.detailLabels.price\')}:</span>'],
      ['<span className="font-medium">Level:</span>', '<span className="font-medium">{t(\'admin.detailLabels.level\')}:</span>'],
      ['<span className="font-medium">Description:</span>', '<span className="font-medium">{t(\'admin.detailLabels.description\')}:</span>'],
      ['<span className="font-medium">Requirements:</span>', '<span className="font-medium">{t(\'admin.detailLabels.requirements\')}:</span>'],
      ['<span className="font-medium">What You\'ll Learn:</span>', '<span className="font-medium">{t(\'admin.detailLabels.whatYouLearn\')}:</span>'],
      ['<span className="font-medium">Name:</span>', '<span className="font-medium">{t(\'admin.detailLabels.name\')}:</span>'],
      ['<span className="font-medium">Email:</span>', '<span className="font-medium">{t(\'admin.detailLabels.email\')}:</span>'],
      ['<span className="font-medium">Phone:</span>', '<span className="font-medium">{t(\'admin.detailLabels.phone\')}:</span>'],
      ['>View Details<', ">{t('admin.detailLabels.viewDetails')}<"],
      ['>Reject<', ">{t('admin.courses.reject')}<"],
      ['>Approve<', ">{t('admin.courses.approve')}<"],
      ['>Accept<', ">{t('admin.courses.approve')}<"],
      ['View Preview Video', "{t('admin.detailLabels.viewPreviewVideo')}"],
      ['View Thumbnail', "{t('admin.detailLabels.viewThumbnail')}"],
      ['No requirements specified', "{t('admin.detailLabels.noRequirements')}"],
      ['No learning outcomes specified', "{t('admin.courseApplications.noOutcomes')}"],
      ['>Course Applications<', ">{t('admin.courseApplications.title')}<"],
      ['>Instructor Applications<', ">{t('admin.instructors.applicationsTitle')}<"],
    ],
  },
  {
    files: [
      'src/components/admin/CategoriesManagement.jsx',
      'src/components/admin/SubcategoriesManagement.jsx',
    ],
    pairs: [
      ['>Categories Management<', ">{t('admin.categories.title')}<"],
      ['>Subcategories Management<', ">{t('admin.categories.subcategoriesTitle')}<"],
      ['Add Category', "{t('admin.categories.addCategory')}"],
      ['Add Subcategory', "{t('admin.categories.addSubcategory')}"],
      ["toast.loading('Uploading image...')", "toast.loading(t('admin.categories.uploadingImage'))"],
      ["'Are you sure you want to delete this category? This will also delete all its subcategories.'", "t('admin.categories.confirmDeleteCategory')"],
    ],
  },
];

let changed = 0;
for (const rule of rules) {
  for (const rel of rule.files) {
    const fp = path.join(root, rel);
    if (!fs.existsSync(fp)) continue;
    let content = fs.readFileSync(fp, 'utf8');
    const orig = content;
    for (const [from, to] of rule.pairs) {
      content = content.split(from).join(to);
    }
    if (content !== orig) {
      fs.writeFileSync(fp, content);
      changed++;
      console.log('Updated', rel);
    }
  }
}
console.log('Files changed:', changed);
