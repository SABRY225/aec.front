import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { useFileUpload } from '../../../hooks/useFileUpload';
import FileUpload from '../../../components/shared/FileUpload';
import {
    Layers,
    Play,
    FileText,
    Plus,
    Trash2,
    Edit3,
    CheckCircle2,
    HelpCircle,
    Paperclip,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
    X,
    Eye,
    Video,
    Upload,
    Award
} from 'lucide-react';

const CurriculumStep = ({ courseData, handleChange, onNext }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const [activeSection, setActiveSection] = useState(0);
    const [activeLecture, setActiveLecture] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [editMode, setEditMode] = useState({
        type: null, // 'section', 'lecture', or 'assignment'
        index: null,
        sectionIndex: null
    });
    const [errors, setErrors] = useState({
        sections: '',
        lectures: '',
        assignments: ''
    });

    // Handle section changes
    const handleSectionChange = (index, field, value) => {
        const updatedSections = [...courseData.sections];
        updatedSections[index][field] = value;
        handleChange('sections', updatedSections);
    };

    // Add a new section
    const addSection = () => {
        const newSection = {
            name: `Section ${courseData.sections.length + 1}`,
            lectures: [],
            assignments: []
        };
        handleChange('sections', [...courseData.sections, newSection]);
        setActiveSection(courseData.sections.length);
    };

    // Remove a section
    const removeSection = (index) => {
        if (courseData.sections.length <= 1) return;
        const updatedSections = courseData.sections.filter((_, i) => i !== index);
        handleChange('sections', updatedSections);
        if (activeSection >= updatedSections.length) {
            setActiveSection(updatedSections.length - 1);
        }
    };

    // Add a new lecture to a section
    const addLecture = (sectionIndex) => {
        const updatedSections = [...courseData.sections];
        
        const newLecture = {
            name: `Lecture ${updatedSections[sectionIndex].lectures.length + 1}`,
            description: '',
            video: { url: '' },
            files: [],
            preview: false
        };
        updatedSections[sectionIndex].lectures.push(newLecture);
        handleChange('sections', updatedSections);
        setActiveLecture(updatedSections[sectionIndex].lectures.length - 1);
        setEditMode({
            type: 'lecture',
            index: updatedSections[sectionIndex].lectures.length - 1,
            sectionIndex
        });
    };

    // Remove a lecture from a section
    const removeLecture = (sectionIndex, lectureIndex) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].lectures = updatedSections[sectionIndex].lectures.filter((_, i) => i !== lectureIndex);
        handleChange('sections', updatedSections);
        if (editMode.type === 'lecture' && editMode.index === lectureIndex && editMode.sectionIndex === sectionIndex) {
            setEditMode({ type: null, index: null, sectionIndex: null });
        }
    };

    // Add a new assignment to a section
    const addAssignment = (sectionIndex) => {
        const updatedSections = [...courseData.sections];
        const newAssignment = {
            type: 'quiz',
            title: `Assignment ${updatedSections[sectionIndex].assignments.length + 1}`,
            description: '',
            questions: [{
                type: 'mcq',
                content: '',
                contentImage: null,
                options: [{ text: '', image: null }],
                correctAnswer: 0
            }],
            totalPoints: 10,
            isValid: false,
            validationErrors: []
        };
        updatedSections[sectionIndex].assignments.push(newAssignment);
        handleChange('sections', updatedSections);
        setActiveAssignment(updatedSections[sectionIndex].assignments.length - 1);
        setEditMode({
            type: 'assignment',
            index: updatedSections[sectionIndex].assignments.length - 1,
            sectionIndex
        });
    };

    // Remove an assignment from a section
    const removeAssignment = (sectionIndex, assignmentIndex) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].assignments = updatedSections[sectionIndex].assignments.filter((_, i) => i !== assignmentIndex);
        handleChange('sections', updatedSections);
        if (editMode.type === 'assignment' && editMode.index === assignmentIndex && editMode.sectionIndex === sectionIndex) {
            setEditMode({ type: null, index: null, sectionIndex: null });
        }
    };

    // Handle lecture field changes
    const handleLectureChange = (sectionIndex, lectureIndex, field, value) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].lectures[lectureIndex][field] = value;
        handleChange('sections', updatedSections);
    };

    // Handle assignment field changes
    const handleAssignmentChange = (sectionIndex, assignmentIndex, field, value) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].assignments[assignmentIndex][field] = value;
        
        const assignment = updatedSections[sectionIndex].assignments[assignmentIndex];
        let isValid = true;
        const validationErrors = [];
        
        if (!assignment.title || assignment.title.trim() === '') {
            isValid = false;
            validationErrors.push('Assignment title is required');
        }
        
        if (!assignment.questions || assignment.questions.length === 0) {
            isValid = false;
            validationErrors.push('At least one question is required');
        } else {
            for (const question of assignment.questions) {
                if ((!question.content || question.content.trim() === '') && !question.contentImage) {
                    isValid = false;
                    validationErrors.push('All questions must have text or image content');
                    break;
                }
                
                if (question.type === 'mcq') {
                    if (!question.options || question.options.length === 0) {
                        isValid = false;
                        validationErrors.push('MCQ questions must have at least one option');
                        break;
                    }
                    const emptyOptions = question.options.filter(option => 
                        (!option.text || option.text.trim() === '') && !option.image
                    ).length;
                    if (emptyOptions > 0) {
                        isValid = false;
                        validationErrors.push('All options in MCQ questions must have text or image');
                        break;
                    }
                }
                
                if (question.type === 'true-false' && question.correctAnswer === undefined) {
                    isValid = false;
                    validationErrors.push(t('instructor.courseCreation.trueFalseAnswerRequired', 'يجب اختيار الإجابة الصحيحة'));
                    break;
                }
            }
        }
        
        updatedSections[sectionIndex].assignments[assignmentIndex].isValid = isValid;
        updatedSections[sectionIndex].assignments[assignmentIndex].validationErrors = validationErrors;
        handleChange('sections', updatedSections);
    };

    // Handle question field changes
    const handleQuestionChange = (sectionIndex, assignmentIndex, questionIndex, field, value) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex][field] = value;
        
        const question = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex];
        let isValid = true;
        const validationErrors = [];
        
        if ((!question.content || question.content.trim() === '') && !question.contentImage) {
            isValid = false;
            validationErrors.push('Question must have text or image content');
        }
        
        if (question.type === 'mcq') {
            if (!question.options || question.options.length === 0) {
                isValid = false;
                validationErrors.push('MCQ questions must have at least one option');
            } else {
                const emptyOptions = question.options.filter(option => 
                    (!option.text || option.text.trim() === '') && !option.image
                ).length;
                if (emptyOptions > 0) {
                    isValid = false;
                    validationErrors.push('All options must have text or image');
                }
            }
        }
        
        if (question.type === 'true-false' && question.correctAnswer === undefined) {
            isValid = false;
            validationErrors.push(t('instructor.courseCreation.trueFalseAnswerRequired', 'يجب تحديد الإجابة الصحيحة'));
        }
        
        updatedSections[sectionIndex].assignments[assignmentIndex].isValid = isValid;
        updatedSections[sectionIndex].assignments[assignmentIndex].validationErrors = validationErrors;
        handleChange('sections', updatedSections);
    };

    // Handle video upload completion with FileUpload component
    const handleVideoUploadComplete = (sectionIndex, lectureIndex) => (uploadResult) => {
        let url = '';

        if (uploadResult) {
            if (typeof uploadResult === 'string') {
                url = uploadResult;
            } else if (typeof uploadResult === 'object') {
                if (uploadResult.url) {
                    url = uploadResult.url;
                } else if (uploadResult.result) {
                    if (typeof uploadResult.result === 'string') {
                        url = uploadResult.result;
                    } else if (uploadResult.result && typeof uploadResult.result === 'object') {
                        url = uploadResult.result.url || uploadResult.result;
                    }
                }
            }
        }
        
        url = url ? String(url).trim() : '';
        
        if (url && url !== '' && (url.startsWith('http://') || url.startsWith('https://'))) {
            const videoObject = {
                url: url,
                duration: courseData.sections[sectionIndex].lectures[lectureIndex]?.video?.duration
            };
            
            handleLectureChange(sectionIndex, lectureIndex, 'video', videoObject);
            
            setTimeout(() => {
                const updatedLecture = courseData.sections[sectionIndex]?.lectures[lectureIndex];
                if (updatedLecture?.video?.url === url) {
                    toast.success(t('instructor.courseCreation.videoUploaded', 'تم رفع الفيديو بنجاح'));
                } else {
                    const updatedSections = [...courseData.sections];
                    if (updatedSections[sectionIndex]?.lectures[lectureIndex]) {
                        updatedSections[sectionIndex].lectures[lectureIndex].video = videoObject;
                        handleChange('sections', updatedSections);
                    }
                }
            }, 100);
        } else {
            toast.error(t('instructor.courseCreation.videoUrlInvalid', 'رابط الفيديو غير صالح'));
        }
    };
    
    const handleVideoUploadError = (error) => {
        toast.error(t('instructor.courseCreation.videoFailed', 'فشل رفع الفيديو'));
        console.error('Video upload error:', error);
    };

    const handleAttachmentUploadComplete = (sectionIndex, lectureIndex) => (uploadData) => {
        if (!uploadData) {
            toast.error(t('instructor.courseCreation.uploadNoData', 'لا توجد بيانات مرفوعة'));
            return;
        }
        
        if (Array.isArray(uploadData)) {
            uploadData.forEach((fileData) => {
                processAttachmentFile(sectionIndex, lectureIndex, fileData);
            });
            return;
        }
        
        processAttachmentFile(sectionIndex, lectureIndex, uploadData);
    };
    
    const processAttachmentFile = (sectionIndex, lectureIndex, fileData) => {
        if (typeof fileData !== 'object') {
            toast.error(t('instructor.courseCreation.uploadInvalidFormat', 'صيغة الملف غير صحيحة'));
            return;
        }
        
        const { file, result, url: directUrl } = fileData;
        if (!file) {
            toast.error(t('instructor.courseCreation.uploadNoFileInfo', 'معلومات الملف مفقودة'));
            return;
        }
        
        const currentLecture = courseData.sections[sectionIndex].lectures[lectureIndex];
        const existingFiles = currentLecture.files || [];
        
        let url = directUrl;
        if (!url && result) {
            if (typeof result === 'string') {
                url = result;
            } else if (result && typeof result === 'object') {
                if (result.url) {
                    url = result.url;
                } else if (result.result) {
                    if (typeof result.result === 'string') {
                        url = result.result;
                    } else if (result.result && result.result.url) {
                        url = result.result.url;
                    }
                }
            }
        }
        
        if (url && typeof url === 'string' && url.trim() !== '') {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let fileType = 'document';
            
            if (['pdf'].includes(fileExtension)) {
                fileType = 'pdf';
            } else if (['doc', 'docx'].includes(fileExtension)) {
                fileType = 'document';
            } else if (['ppt', 'pptx'].includes(fileExtension)) {
                fileType = 'presentation';
            } else if (['zip', 'rar'].includes(fileExtension)) {
                fileType = 'archive';
            }
            
            const newFile = {
                url: url.trim(),
                name: file.name,
                type: fileType
            };
            
            const allFiles = [...existingFiles, newFile];
            handleLectureChange(sectionIndex, lectureIndex, 'files', allFiles);
            toast.success(`تم إرفاق الملف "${file.name}" بنجاح`);
        } else {
            toast.error(t('instructor.courseCreation.attachmentUrlFailed', 'تعذر استخراج رابط المرفق'));
        }
    };
    
    const handleAttachmentUploadError = (error) => {
        toast.error(t('instructor.courseCreation.attachmentUploadFailed', 'فشل رفع المرفق'));
        console.error('Attachment upload error:', error);
    };

    const addQuestion = (sectionIndex, assignmentIndex) => {
        const updatedSections = [...courseData.sections];
        const newQuestion = {
            type: 'mcq',
            content: '',
            contentImage: null,
            options: [{ text: '', image: null }],
            correctAnswer: 0
        };
        updatedSections[sectionIndex].assignments[assignmentIndex].questions.push(newQuestion);
        
        const assignment = updatedSections[sectionIndex].assignments[assignmentIndex];
        assignment.isValid = false;
        assignment.validationErrors = ['New question needs to be filled out'];
        handleChange('sections', updatedSections);
    };

    const removeQuestion = (sectionIndex, assignmentIndex, questionIndex) => {
        const updatedSections = [...courseData.sections];
        if (updatedSections[sectionIndex].assignments[assignmentIndex].questions.length <= 1) return;
        updatedSections[sectionIndex].assignments[assignmentIndex].questions = 
            updatedSections[sectionIndex].assignments[assignmentIndex].questions.filter((_, i) => i !== questionIndex);
        handleChange('sections', updatedSections);
    };

    const addOption = (sectionIndex, assignmentIndex, questionIndex) => {
        const updatedSections = [...courseData.sections];
        const question = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex];
        question.options.push({ text: '', image: null });
        handleChange('sections', updatedSections);
    };

    const removeOption = (sectionIndex, assignmentIndex, questionIndex, optionIndex) => {
        const updatedSections = [...courseData.sections];
        const question = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex];
        if (question.options.length <= 1) {
            toast.error(t('instructor.courseCreation.optionRequired', 'يجب توفر خيار واحد على الأقل'));
            return;
        }
        question.options = question.options.filter((_, i) => i !== optionIndex);
        if (question.correctAnswer >= question.options.length) {
            question.correctAnswer = question.options.length - 1;
        }
        handleChange('sections', updatedSections);
    };

    const handleOptionChange = (sectionIndex, assignmentIndex, questionIndex, optionIndex, field, value) => {
        const updatedSections = [...courseData.sections];
        const option = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex].options[optionIndex];
        if (field === 'text') {
            option.text = value;
        } else if (field === 'image') {
            option.image = value;
        }
        
        const question = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex];
        const assignment = updatedSections[sectionIndex].assignments[assignmentIndex];
        
        const emptyOptions = question.options.filter(opt => 
            (!opt.text || opt.text.trim() === '') && !opt.image
        ).length;
        let isValid = true;
        const validationErrors = [];
        
        if (emptyOptions > 0) {
            isValid = false;
            validationErrors.push('All options must have text or image');
        }
        
        assignment.isValid = isValid;
        assignment.validationErrors = validationErrors;
        handleChange('sections', updatedSections);
    };

    const handleQuestionImageUpload = (sectionIndex, assignmentIndex, questionIndex) => (uploadResult) => {
        const url = uploadResult.url || uploadResult.result || uploadResult;
        if (url && typeof url === 'string' && url.trim() !== '') {
            handleQuestionChange(sectionIndex, assignmentIndex, questionIndex, 'contentImage', url.trim());
            toast.success(t('instructor.courseCreation.questionImageUploaded', 'تم رفع صورة السؤال'));
        } else {
            toast.error(t('instructor.courseCreation.questionImageFailed', 'فشل رفع صورة السؤال'));
        }
    };

    const handleOptionImageUpload = (sectionIndex, assignmentIndex, questionIndex, optionIndex) => (uploadResult) => {
        const url = uploadResult.url || uploadResult.result || uploadResult;
        if (url && typeof url === 'string' && url.trim() !== '') {
            handleOptionChange(sectionIndex, assignmentIndex, questionIndex, optionIndex, 'image', url.trim());
            toast.success(t('instructor.courseCreation.optionImageUploaded', 'تم رفع صورة الخيار'));
        } else {
            toast.error(t('instructor.courseCreation.optionImageFailed', 'فشل رفع صورة الخيار'));
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleNextWithValidation = async () => {
        setIsSubmitting(false);
        setIsSubmitting(true);
        try {
            await onNext();
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('Error proceeding to next step:', error);
            const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ، يرجى المحاولة لاحقاً';
            toast.error(errorMessage);
            setIsSubmitting(false);
        } finally {
            setTimeout(() => {
                setIsSubmitting(false);
            }, 100);
        }
    };
    
    const handleCorrectAnswerChange = (sectionIndex, assignmentIndex, questionIndex, value) => {
        const updatedSections = [...courseData.sections];
        updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex].correctAnswer = value;
        
        const assignment = updatedSections[sectionIndex].assignments[assignmentIndex];
        const questions = assignment.questions;
        
        let isValid = true;
        const validationErrors = [];
        
        if (!assignment.title || assignment.title.trim() === '') {
            isValid = false;
            validationErrors.push('Assignment title is required');
        }
        
        if (!questions || questions.length === 0) {
            isValid = false;
            validationErrors.push('At least one question is required');
        } else {
            questions.forEach((question, idx) => {
                if ((!question.content || question.content.trim() === '') && !question.contentImage) {
                    isValid = false;
                    validationErrors.push(`Question ${idx + 1} must have text or image content`);
                }
                
                if (question.type === 'mcq') {
                    if (!question.options || question.options.length === 0) {
                        isValid = false;
                        validationErrors.push(`Question ${idx + 1} must have at least one option`);
                    } else {
                        const emptyOptions = question.options.filter(option => 
                            (!option.text || option.text.trim() === '') && !option.image
                        ).length;
                        if (emptyOptions > 0) {
                            isValid = false;
                            validationErrors.push(`All options in question ${idx + 1} must have text or image`);
                        }
                        
                        const optionIndex = question.correctAnswer;
                        if (optionIndex < 0 || optionIndex >= question.options.length) {
                            isValid = false;
                            validationErrors.push(`Valid correct answer must be selected for question ${idx + 1}`);
                        }
                    }
                }
                
                if (question.type === 'true-false' && question.correctAnswer === undefined) {
                    isValid = false;
                    validationErrors.push(`Question ${idx + 1} must have a correct answer selected`);
                }
            });
        }
        
        assignment.isValid = isValid;
        assignment.validationErrors = validationErrors;
        handleChange('sections', updatedSections);
    };

    // Render lecture editor
    const renderLectureEditor = (sectionIndex, lectureIndex) => {
        const lecture = courseData.sections[sectionIndex].lectures[lectureIndex];
        return (
            <div className="bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-blue-900/50 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Play className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                                {t('instructor.courseCreation.editLecture', 'تعديل المحاضرة')}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {courseData.sections[sectionIndex]?.name} • {lecture.name}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-5">
                    {/* Lecture Name */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.lectureTitle', 'عنوان المحاضرة')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={lecture.name}
                            onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100 transition-all"
                            placeholder={t('instructor.courseCreation.lectureTitlePlaceholder', 'مثال: مقدمة في بنية المشروع والمفاهيم الأساسية')}
                        />
                    </div>
                    
                    {/* Lecture Description */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.lectureDescription', 'وصف المحاضرة')}
                        </label>
                        <textarea
                            value={lecture.description || ''}
                            onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'description', e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100 transition-all"
                            placeholder={t('instructor.courseCreation.lectureDescPlaceholder', 'اكتب نبذة موجزة عما سيتم شرحه في هذا الفيديو')}
                        ></textarea>
                    </div>
                    
                    {/* Video Upload */}
                    <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.videoLabel', 'ملف الفيديو')} <span className="text-red-500">*</span>
                        </label>
                        <FileUpload
                            accept="video/*"
                            maxSize={500 * 1024 * 1024}
                            folder="courses/videos"
                            onUploadSuccess={handleVideoUploadComplete(sectionIndex, lectureIndex)}
                            onUploadError={handleVideoUploadError}
                            label={t('instructor.courseCreation.uploadVideo', 'رفع فيديو المحاضرة (حتى 500MB)')}
                            helperText={t('instructor.courseCreation.videoHelper', 'صيغ الفيديو المدعومة: MP4, WebM, MOV')}
                            showPreview={true}
                            previewType="video"
                            value={lecture.video ? lecture.video.url : null}
                        />
                    </div>
                    
                    {/* Preview Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer"
                         onClick={() => handleLectureChange(sectionIndex, lectureIndex, 'preview', !lecture.preview)}>
                        <input
                            id={`preview-toggle-${sectionIndex}-${lectureIndex}`}
                            type="checkbox"
                            checked={lecture.preview || false}
                            onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'preview', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                        />
                        <label htmlFor={`preview-toggle-${sectionIndex}-${lectureIndex}`} className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            <span>{t('instructor.courseCreation.freePreview', 'معاينة مجانية (يمكن للطالب مشاهدتها دون شراء)')}</span>
                        </label>
                    </div>
                    
                    {/* Attachments/Resources */}
                    <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                            {t('instructor.courseCreation.attachmentsResources', 'المرفقات وملفات المحاضرة')}
                        </label>
                        <FileUpload
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                            maxSize={50 * 1024 * 1024}
                            folder="courses/attachments"
                            onUploadSuccess={handleAttachmentUploadComplete(sectionIndex, lectureIndex)}
                            onUploadError={handleAttachmentUploadError}
                            label={t('instructor.courseCreation.uploadAttachments', 'إرفاق ملفات مساعدة (PDF, Word, PPT, ZIP)')}
                            helperText={t('instructor.courseCreation.attachmentsHelper', 'يمكنك رفع عدة ملفات للطلاب')}
                            multiple={true}
                        />
                        
                        {/* Display attached files */}
                        {lecture.files && lecture.files.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {t('instructor.courseCreation.attachedFiles', 'الملفات المرفقة حالياً')} ({lecture.files.length}):
                                </h4>
                                <div className="space-y-2">
                                    {lecture.files.map((file, fileIndex) => (
                                        <div key={fileIndex} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedFiles = lecture.files.filter((_, i) => i !== fileIndex);
                                                    handleLectureChange(sectionIndex, lectureIndex, 'files', updatedFiles);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('common.cancel', 'إلغاء')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all"
                        >
                            {t('instructor.courseCreation.saveLecture', 'حفظ المحاضرة')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render assignment editor
    const renderAssignmentEditor = (sectionIndex, assignmentIndex) => {
        const assignment = courseData.sections[sectionIndex].assignments[assignmentIndex];
        return (
            <div className="bg-white dark:bg-slate-800/90 border border-purple-200 dark:border-purple-900/50 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                                {t('instructor.courseCreation.editAssignment', 'تعديل التقييم أو الاختبار')}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {courseData.sections[sectionIndex]?.name} • {assignment.title}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Validation Errors */}
                {assignment.validationErrors && assignment.validationErrors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl">
                        <h4 className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{t('instructor.courseCreation.fixFollowingIssues', 'يرجى مراجعة الملاحظات التالية:')}</span>
                        </h4>
                        <ul className="list-disc ps-5 text-xs text-red-600/90 dark:text-red-400/90 space-y-1">
                            {assignment.validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Assignment Title */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.assignmentTitle', 'عنوان التقييم / الاختبار')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={assignment.title}
                            onChange={(e) => handleAssignmentChange(sectionIndex, assignmentIndex, 'title', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                            placeholder={t('instructor.courseCreation.assignmentTitlePlaceholder', 'مثال: اختبار نهاية الوحدة')}
                        />
                    </div>
                    
                    {/* Assignment Type */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.assignmentType', 'نوع التقييم')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={assignment.type}
                            onChange={(e) => handleAssignmentChange(sectionIndex, assignmentIndex, 'type', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                        >
                            <option value="quiz">{t('instructor.courseCreation.quiz', 'اختبار اختيار من متعدد')}</option>
                            <option value="essay">{t('instructor.courseCreation.essay', 'مقال / سؤال نصي')}</option>
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Assignment Description */}
                    <div className="sm:col-span-3">
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.description', 'تعليمات ووصف الاختبار')}
                        </label>
                        <textarea
                            value={assignment.description || ''}
                            onChange={(e) => handleAssignmentChange(sectionIndex, assignmentIndex, 'description', e.target.value)}
                            rows="2"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                            placeholder={t('instructor.courseCreation.assignmentDescPlaceholder', 'اكتب تعليمات للطلاب قبل البدء')}
                        ></textarea>
                    </div>
                    
                    {/* Total Points */}
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                            {t('instructor.courseCreation.totalPoints', 'مجموع الدرجات')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={assignment.totalPoints || 10}
                            onChange={(e) => handleAssignmentChange(sectionIndex, assignmentIndex, 'totalPoints', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>
                
                {/* Questions Section */}
                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                            {t('instructor.courseCreation.questions', 'أسئلة الاختبار')} ({assignment.questions.length})
                        </label>
                        <button
                            type="button"
                            onClick={() => addQuestion(sectionIndex, assignmentIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold rounded-xl transition-colors border border-purple-200 dark:border-purple-900/50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('instructor.courseCreation.addQuestion', 'إضافة سؤال')}</span>
                        </button>
                    </div>
                    
                    <div className="space-y-5">
                        {assignment.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="p-5 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 rounded-xl text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                                        {t('instructor.courseCreation.questionNum', { num: questionIndex + 1 })}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(sectionIndex, assignmentIndex, questionIndex)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={assignment.questions.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Question Type */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                                            {t('instructor.courseCreation.questionType', 'نوع السؤال')}
                                        </label>
                                        <select
                                            value={question.type}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                const updatedSections = [...courseData.sections];
                                                const currentQuestion = updatedSections[sectionIndex].assignments[assignmentIndex].questions[questionIndex];
                                                
                                                if (newType === 'mcq') {
                                                    if (!currentQuestion.options || currentQuestion.options.length === 0) {
                                                        currentQuestion.options = [{ text: '', image: null }];
                                                    }
                                                } else if (newType === 'true-false') {
                                                    currentQuestion.options = [
                                                        { text: 'صحيح (True)', image: null },
                                                        { text: 'خطأ (False)', image: null }
                                                    ];
                                                    if (currentQuestion.correctAnswer === undefined) {
                                                        currentQuestion.correctAnswer = 0;
                                                    }
                                                }
                                                
                                                handleQuestionChange(sectionIndex, assignmentIndex, questionIndex, 'type', newType);
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        >
                                            <option value="mcq">{t('instructor.courseCreation.mcq', 'اختيار من متعدد')}</option>
                                            <option value="true-false">{t('instructor.courseCreation.trueFalse', 'صح أو خطأ')}</option>
                                            <option value="essay">{t('instructor.courseCreation.essayAnswer', 'سؤال مقالي')}</option>
                                        </select>
                                    </div>

                                    {/* Question Text */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                                            {t('instructor.courseCreation.questionText', 'نص السؤال')}
                                        </label>
                                        <input
                                            type="text"
                                            value={question.content || ''}
                                            onChange={(e) => handleQuestionChange(sectionIndex, assignmentIndex, questionIndex, 'content', e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            placeholder={t('instructor.courseCreation.questionPlaceholder', 'اكتب نص السؤال هنا...')}
                                        />
                                    </div>
                                </div>
                                
                                {/* Options for MCQ or True-False */}
                                {(question.type === 'mcq' || question.type === 'true-false') && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {t('instructor.courseCreation.options', 'الخيارات (حدد الدائرة للإجابة الصحيحة)')}
                                            </label>
                                            {question.type === 'mcq' && (
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(sectionIndex, assignmentIndex, questionIndex)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>{t('instructor.courseCreation.addOption', 'إضافة خيار')}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2.5">
                                            {question.options && question.options.map((option, optionIndex) => (
                                                <div 
                                                    key={optionIndex} 
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                        question.correctAnswer === optionIndex
                                                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        id={`option-${sectionIndex}-${assignmentIndex}-${questionIndex}-${optionIndex}`}
                                                        name={`question-${sectionIndex}-${assignmentIndex}-${questionIndex}`}
                                                        checked={question.correctAnswer === optionIndex}
                                                        onChange={() => handleCorrectAnswerChange(sectionIndex, assignmentIndex, questionIndex, optionIndex)}
                                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                    />
                                                    
                                                    <input
                                                        type="text"
                                                        value={option.text || ''}
                                                        onChange={(e) => handleOptionChange(sectionIndex, assignmentIndex, questionIndex, optionIndex, 'text', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                        placeholder={`الخيار ${optionIndex + 1}`}
                                                        disabled={question.type === 'true-false'}
                                                    />

                                                    {question.correctAnswer === optionIndex && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded">
                                                            {t('instructor.courseCreation.correctAnswer', 'الإجابة الصحيحة')}
                                                        </span>
                                                    )}

                                                    {question.type === 'mcq' && question.options.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(sectionIndex, assignmentIndex, questionIndex, optionIndex)}
                                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Essay Model Answer */}
                                {question.type === 'essay' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {t('instructor.courseCreation.modelAnswer', 'الإجابة النموذجية (مرجع للتصحيح)')}
                                        </label>
                                        <textarea
                                            value={question.correctAnswer || ''}
                                            onChange={(e) => handleQuestionChange(sectionIndex, assignmentIndex, questionIndex, 'correctAnswer', e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                            placeholder={t('instructor.courseCreation.modelAnswerPlaceholder', 'اكتب معايير الإجابة الصحيحة لتسترشد بها أثناء تقييم إجابات الطلاب')}
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {t('common.cancel', 'إلغاء')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditMode({ type: null, index: null, sectionIndex: null })}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 transition-all"
                    >
                        {t('instructor.courseCreation.saveAssignment', 'حفظ التقييم')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                            {t('instructor.courseCreation.curriculumTitle', 'المنهج الدراسي ومحتوى الدورة')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('instructor.courseCreation.curriculumSubtitle', 'قسّم دورتك إلى فصول وأقسام، وأضف الدروس المرئية والمرفقات والاختبارات')}
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold self-start sm:self-center border border-blue-100 dark:border-blue-900/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('instructor.courseCreation.step3Badge', 'الخطوة 3 من 5')}</span>
                </div>
            </div>
            
            {/* Section Management Wrapper */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                            {t('instructor.courseCreation.courseSections', 'أقسام وفصول الدورة')}
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg">
                            {courseData.sections?.length || 0}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('instructor.courseCreation.addSection', 'إضافة قسم جديد')}</span>
                    </button>
                </div>
                
                {/* Section Tabs & Content Container */}
                <div className="border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                    {/* Tabs Header */}
                    <div className="flex items-center gap-1.5 p-2 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-hide">
                        {courseData.sections.map((section, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSection(index)}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 ${
                                    activeSection === index 
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-600 text-[11px] flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <span>{section.name || `Section ${index + 1}`}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Active Section Content */}
                    {courseData.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className={`p-5 sm:p-7 ${activeSection === sectionIndex ? 'block' : 'hidden'}`}>
                            {/* Section Name & Delete Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                                <div className="flex items-center gap-2.5 flex-1 max-w-lg">
                                    <span className="text-xs font-bold text-slate-500 shrink-0">
                                        {t('instructor.courseCreation.sectionName', 'اسم القسم:')}
                                    </span>
                                    <input
                                        type="text"
                                        value={section.name}
                                        onChange={(e) => handleSectionChange(sectionIndex, 'name', e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                                        placeholder={t('instructor.courseCreation.sectionNamePlaceholder', 'مثال: الوحدة الأولى: المفاهيم التأسيسية')}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeSection(sectionIndex)}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center"
                                    disabled={courseData.sections.length <= 1}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{t('instructor.courseCreation.removeSection', 'حذف القسم')}</span>
                                </button>
                            </div>
                            
                            {/* Inline Editors or Content Lists */}
                            {editMode.type === 'lecture' && editMode.sectionIndex === sectionIndex ? (
                                renderLectureEditor(sectionIndex, editMode.index)
                            ) : editMode.type === 'assignment' && editMode.sectionIndex === sectionIndex ? (
                                renderAssignmentEditor(sectionIndex, editMode.index)
                            ) : (
                                <div className="space-y-8">
                                    {/* Lectures Sub-Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                    <Play className="w-3.5 h-3.5" />
                                                </div>
                                                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                                                    {t('instructor.courseCreation.lectures', 'المحاضرات المرئية')} ({section.lectures.length})
                                                </h4>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addLecture(sectionIndex)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl text-xs font-bold transition-colors border border-blue-200 dark:border-blue-900/50"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{t('instructor.courseCreation.addLecture', 'إضافة محاضرة')}</span>
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {section.lectures.map((lecture, lectureIndex) => (
                                                <div 
                                                    key={lectureIndex} 
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                            <Play className="w-4 h-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                                                    {lecture.name}
                                                                </span>
                                                                {lecture.preview && (
                                                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                                                                        {t('instructor.courseCreation.previewBadge', 'معاينة مجانية')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                                {lecture.video?.url ? (
                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ تم رفع الفيديو</span>
                                                                ) : (
                                                                    <span className="text-amber-500 font-medium">⚠ بانتظار رفع الفيديو</span>
                                                                )}
                                                                {lecture.files?.length > 0 && (
                                                                    <span>• {lecture.files.length} مرفقات</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditMode({
                                                                    type: 'lecture',
                                                                    index: lectureIndex,
                                                                    sectionIndex
                                                                });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold transition-colors"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                            <span>{t('common.edit', 'تعديل')}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLecture(sectionIndex, lectureIndex)}
                                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                                            title={t('instructor.courseCreation.deleteLecture', 'حذف المحاضرة')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {section.lectures.length === 0 && (
                                                <div className="py-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20">
                                                    <Play className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                    <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        {t('instructor.courseCreation.noLecturesYet', 'لا توجد محاضرات مضافة في هذا القسم')}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => addLecture(sectionIndex)}
                                                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        + {t('instructor.courseCreation.addFirstLecture', 'إضافة أول محاضرة')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Assignments Sub-Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                </div>
                                                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                                                    {t('instructor.courseCreation.assignments', 'التقييمات والاختبارات')} ({section.assignments.length})
                                                </h4>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addAssignment(sectionIndex)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl text-xs font-bold transition-colors border border-purple-200 dark:border-purple-900/50"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{t('instructor.courseCreation.addAssignment', 'إضافة تقييم')}</span>
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {section.assignments.map((assignment, assignmentIndex) => (
                                                <div 
                                                    key={assignmentIndex} 
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                            <HelpCircle className="w-4 h-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                                                    {assignment.title}
                                                                </span>
                                                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-md">
                                                                    {assignment.type === 'quiz' ? 'Quiz' : 'Essay'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400">
                                                                {assignment.questions?.length || 0} أسئلة • {assignment.totalPoints || 10} درجات
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditMode({
                                                                    type: 'assignment',
                                                                    index: assignmentIndex,
                                                                    sectionIndex
                                                                });
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold transition-colors"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                            <span>{t('common.edit', 'تعديل')}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAssignment(sectionIndex, assignmentIndex)}
                                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                                            title={t('instructor.courseCreation.deleteAssignment', 'حذف التقييم')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {section.assignments.length === 0 && (
                                                <div className="py-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20">
                                                    <p className="text-xs font-medium text-slate-400">
                                                        {t('instructor.courseCreation.noAssignmentsYet', 'لا توجد تقييمات مضافة في هذا القسم (اختياري)')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Validation errors banner */}
            {(errors.sections || errors.lectures || errors.assignments) && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-700 dark:text-red-300 space-y-1">
                    <h3 className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{t('instructor.courseCreation.fixFollowingErrors', 'يرجى مراجعة الأخطاء التالية:')}</span>
                    </h3>
                    <ul className="list-disc ps-5 space-y-0.5">
                        {errors.sections && <li>{errors.sections}</li>}
                        {errors.lectures && <li>{errors.lectures}</li>}
                        {errors.assignments && <li>{errors.assignments}</li>}
                    </ul>
                </div>
            )}
            
            {/* Step Action Buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={handleNextWithValidation}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 transition-all text-xs sm:text-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('instructor.courseCreation.loading', 'جاري المتابعة...')}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('instructor.courseCreation.next', 'المتابعة للخطوة التالية')}</span>
                            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CurriculumStep;