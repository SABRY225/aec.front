import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

const toastReplacements = [
  ["toast.error('Failed to fetch categories')", "toast.error(t('admin.categoriesMgmt.fetchFailed'))"],
  ["toast.error('Failed to upload image')", "toast.error(t('admin.categoriesMgmt.imageUploadFailed'))"],
  ["toast.success('Category updated successfully')", "toast.success(t('admin.categoriesMgmt.updated'))"],
  ["toast.success('Category created successfully')", "toast.success(t('admin.categoriesMgmt.created'))"],
  ["toast.error(error.response?.data?.message || 'Operation failed')", "toast.error(error.response?.data?.message || t('admin.categoriesMgmt.operationFailed'))"],
  ["toast.success('Category deleted successfully')", "toast.success(t('admin.categoriesMgmt.deleted'))"],
  ["toast.error(error.response?.data?.message || 'Failed to delete category')", "toast.error(error.response?.data?.message || t('admin.categoriesMgmt.deleteFailed'))"],
  ["toast.success('Category status updated')", "toast.success(t('admin.categoriesMgmt.statusUpdated'))"],
  ["toast.error('Failed to update category status')", "toast.error(t('admin.categoriesMgmt.statusFailed'))"],
  ["toast.success('Subcategory updated successfully')", "toast.success(t('admin.categoriesMgmt.subUpdated'))"],
  ["toast.success('Subcategory created successfully')", "toast.success(t('admin.categoriesMgmt.subCreated'))"],
  ["toast.success('Subcategory deleted successfully')", "toast.success(t('admin.categoriesMgmt.subDeleted'))"],
  ["toast.error(error.response?.data?.message || 'Failed to delete subcategory')", "toast.error(error.response?.data?.message || t('admin.categoriesMgmt.subDeleteFailed'))"],
  ["toast.success('Subcategory status updated')", "toast.success(t('admin.categoriesMgmt.subStatusUpdated'))"],
  ["toast.error('Failed to update subcategory status')", "toast.error(t('admin.categoriesMgmt.subStatusFailed'))"],
  ["toast.error('Failed to fetch subcategories')", "toast.error(t('admin.categoriesMgmt.subFetchFailed'))"],
  ["toast.error('Failed to fetch courses')", "toast.error(t('admin.allCourses.fetchFailed'))"],
  ["toast.error('Failed to fetch approved courses')", "toast.error(t('admin.approvedCourses.fetchFailed'))"],
  ["toast.error('Failed to fetch instructors')", "toast.error(t('admin.instructors.fetchFailed'))"],
  ["toast.error('Failed to fetch course applications')", "toast.error(t('admin.courseApplications.fetchFailed'))"],
  ["toast.error('Failed to update course status')", "toast.error(t('admin.courses.updateStatusFailed'))"],
  ["toast.error('Failed to fetch instructor applications')", "toast.error(t('admin.instructorApplications.fetchFailed'))"],
  ["toast.error('Failed to update application status')", "toast.error(t('admin.instructorApplications.updateFailed'))"],
  ["toast.error('Failed to load messages')", "toast.error(t('admin.contactMessages.loadFailed'))"],
  ["toast.success('Message updated successfully')", "toast.success(t('admin.contactMessages.updated'))"],
  ["toast.error('Failed to update message')", "toast.error(t('admin.contactMessages.updateFailed'))"],
  ["toast.success('Message deleted successfully')", "toast.success(t('admin.contactMessages.deleted'))"],
  ["toast.error('Failed to delete message')", "toast.error(t('admin.contactMessages.deleteFailed'))"],
  ["toast.error('Failed to load advertisements')", "toast.error(t('admin.advertisements.loadFailed'))"],
  ["toast.success('Image uploaded successfully')", "toast.success(t('admin.advertisements.imageUploaded'))"],
  ["toast.error(error || 'Upload failed')", "toast.error(error || t('admin.advertisements.uploadFailed'))"],
  ["toast.error(error.message || 'Failed to save advertisement')", "toast.error(error.message || t('admin.advertisements.saveFailed'))"],
  ["toast.error('Failed to delete advertisement')", "toast.error(t('admin.advertisements.deleteFailed'))"],
  ["toast.error('Failed to toggle visibility')", "toast.error(t('admin.advertisements.visibilityFailed'))"],
  ["toast.error('Failed to search users')", "toast.error(t('admin.manualEnrollment.searchUsersFailed'))"],
  ["toast.error('Failed to search courses')", "toast.error(t('admin.manualEnrollment.searchCoursesFailed'))"],
  ["toast.error('Select a user and a course first')", "toast.error(t('admin.manualEnrollment.selectBoth'))"],
  ["toast.success('User enrolled successfully')", "toast.success(t('admin.manualEnrollment.success'))"],
  ["toast.error(res?.message || 'Enrollment failed')", "toast.error(res?.message || t('admin.manualEnrollment.failed'))"],
  ["toast.error(e?.response?.data?.message || 'Enrollment failed')", "toast.error(e?.response?.data?.message || t('admin.manualEnrollment.failed'))"],
  ["toast.error('Failed to fetch your courses')", "toast.error(t('instructor.courses.fetchFailed'))"],
  ["toast.error('Failed to load course data')", "toast.error(t('instructor.courseCreation.loadFailed'))"],
  ["toast.success('Brochure uploaded successfully')", "toast.success(t('instructor.courseCreation.brochureUploaded'))"],
  ["toast.error('Failed to get brochure URL from upload. Please try again.')", "toast.error(t('instructor.courseCreation.brochureUrlFailed'))"],
  ["toast.error('Navigation function is not available. Please refresh the page.')", "toast.error(t('instructor.courseCreation.navUnavailable'))"],
  ["toast.error('Please add at least one topic')", "toast.error(t('instructor.courseCreation.addTopic'))"],
  ["toast.error('Please fix the errors before proceeding')", "toast.error(t('instructor.courseCreation.fixErrors'))"],
  ["toast.success('Thumbnail uploaded successfully')", "toast.success(t('instructor.courseCreation.thumbnailUploaded'))"],
  ["toast.success('Trailer uploaded successfully')", "toast.success(t('instructor.courseCreation.trailerUploaded'))"],
  ["toast.success('Video uploaded and saved successfully')", "toast.success(t('instructor.courseCreation.videoUploaded'))"],
  ["toast.error('Failed to get valid video URL from upload')", "toast.error(t('instructor.courseCreation.videoUrlInvalid'))"],
  ["toast.error('Failed to upload video')", "toast.error(t('instructor.courseCreation.videoFailed'))"],
  ["toast.error('Upload failed: No data received')", "toast.error(t('instructor.courseCreation.uploadNoData'))"],
  ["toast.error('Upload failed: Invalid file data format')", "toast.error(t('instructor.courseCreation.uploadInvalidFormat'))"],
  ["toast.error('Upload failed: No file information')", "toast.error(t('instructor.courseCreation.uploadNoFileInfo'))"],
  ["toast.error('Failed to get file URL from upload result')", "toast.error(t('instructor.courseCreation.attachmentUrlFailed'))"],
  ["toast.error('Failed to upload attachment')", "toast.error(t('instructor.courseCreation.attachmentUploadFailed'))"],
  ["toast.error('At least one option is required')", "toast.error(t('instructor.courseCreation.optionRequired'))"],
  ["toast.success('Question image uploaded successfully')", "toast.success(t('instructor.courseCreation.questionImageUploaded'))"],
  ["toast.error('Failed to upload question image')", "toast.error(t('instructor.courseCreation.questionImageFailed'))"],
  ["toast.success('Option image uploaded successfully')", "toast.success(t('instructor.courseCreation.optionImageUploaded'))"],
  ["toast.error('Failed to upload option image')", "toast.error(t('instructor.courseCreation.optionImageFailed'))"],
  ["toast.success('Basic information updated successfully!')", "toast.success(t('instructor.courseCreation.basicUpdated'))"],
  ["toast.success('Advanced information updated successfully!')", "toast.success(t('instructor.courseCreation.advancedSaved'))"],
  ["toast.success('Curriculum updated successfully!')", "toast.success(t('instructor.courseCreation.curriculumUpdated'))"],
  ["toast.success('Additional files updated successfully!')", "toast.success(t('instructor.courseCreation.filesUpdated'))"],
  ["toast.success('Course updated and submitted for review!')", "toast.success(t('instructor.courseCreation.updated'))"],
  ["toast.error(error.response?.data?.message || 'Failed to save course data')", "toast.error(error.response?.data?.message || t('instructor.courseCreation.saveFailed'))"],
  ["toast.error('Failed to load previous step data')", "toast.error(t('instructor.courseCreation.loadFailed'))"],
  ["toast.error('Failed to load profile data')", "toast.error(t('student.settings.profile.loadFailed'))"],
  ["toast.error('Photo size should not exceed 5MB')", "toast.error(t('student.settings.profile.photoTooLarge'))"],
  ["toast.error('Please upload a valid image file (JPEG or PNG)')", "toast.error(t('student.settings.profile.invalidImage'))"],
  ["toast.success('Photo uploaded successfully')", "toast.success(t('student.settings.profile.photoUploaded'))"],
  ["toast.error('Failed to upload photo')", "toast.error(t('student.settings.profile.photoUploadFailed'))"],
  ["toast.error('Error processing photo')", "toast.error(t('student.settings.profile.photoError'))"],
  ["toast.success('Profile updated successfully')", "toast.success(t('student.settings.profile.updated'))"],
  ["toast.error(error.response?.data?.message || 'Failed to update profile')", "toast.error(error.response?.data?.message || t('student.settings.profile.updateFailed'))"],
  ["toast.error('Failed to load admin profile')", "toast.error(t('student.adminSettings.profile.loadFailed'))"],
  ["toast.success('Admin profile updated successfully')", "toast.success(t('student.adminSettings.profile.updated'))"],
  ["toast.error('Failed to load account settings')", "toast.error(t('student.adminSettings.account.loadFailed'))"],
  ["toast.success('Account settings updated successfully')", "toast.success(t('student.adminSettings.account.updated'))"],
  ["toast.error('Failed to update account settings')", "toast.error(t('student.adminSettings.account.updateFailed'))"],
  ["toast.error('New passwords do not match')", "toast.error(t('student.adminSettings.account.passwordMismatch'))"],
  ["toast.success('Password changed successfully')", "toast.success(t('student.adminSettings.account.passwordChanged'))"],
  ["toast.error('Failed to change password')", "toast.error(t('student.adminSettings.account.passwordChangeFailed'))"],
  ["toast.error('Failed to load account settings')", "toast.error(t('instructor.settings.account.loadFailed'))"],
  ["toast.success('Account settings updated successfully')", "toast.success(t('instructor.settings.account.updated'))"],
  ["toast.error('Failed to update account settings')", "toast.error(t('instructor.settings.account.updateFailed'))"],
];

const importSnippets = [
  "import { useTranslation } from 'react-i18next';\nimport { useLanguage } from ",
  "import { useLanguage } from '../../hooks/useLanguage';\nimport { useTranslation } from 'react-i18next';\nimport { useLanguage } from ",
];

const files = process.argv.slice(2);

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (!content.includes('useTranslation')) {
    const reactImport = content.match(/^import .+ from 'react';?\n/m);
    if (reactImport) {
      const hookPath = rel.includes('components/admin') ? "'../../hooks/useLanguage'" : rel.includes('pages/admin') || rel.includes('pages/instructor') ? "'../../hooks/useLanguage'" : "'../hooks/useLanguage'";
      const insert = `import { useTranslation } from 'react-i18next';\nimport { useLanguage } from ${hookPath};\n`;
      content = content.replace(reactImport[0], reactImport[0] + insert);
      changed = true;
    }
  }

  if (!content.includes("const { t } = useTranslation()")) {
    const fnMatch = content.match(/(const \w+ = \(\) => \{\n)/);
    if (fnMatch) {
      content = content.replace(fnMatch[1], fnMatch[1] + '    const { t } = useTranslation();\n    const { isRTL } = useLanguage();\n');
      changed = true;
    }
  }

  for (const [from, to] of toastReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', rel);
  }
}
