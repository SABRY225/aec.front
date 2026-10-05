import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import { toast } from 'react-toastify';
import { useFileUpload } from '../../../hooks/useFileUpload';
import FileUpload from '../../../components/shared/FileUpload';
import { instructorService } from '../../../services/new-api';
import {
    FolderUp,
    FileText,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    FileVideo,
    FileImage,
    File,
    Download,
    ExternalLink,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    ArrowLeft,
    Loader2,
    FolderOpen
} from 'lucide-react';

const AdditionalFilesStep = ({ courseData, handleChange, courseId, onNext, activeStep }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { uploadFile, uploading, uploadProgress } = useFileUpload();
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const hasLoadedRef = useRef(false);

    // Reload data from backend when this step becomes active
    useEffect(() => {
        const reloadFiles = async () => {
            if (courseId && activeStep === 3) {
                try {
                    const response = await instructorService.getCourseById(courseId);
                    const filesFromBackend = Array.isArray(response.additionalFiles) 
                        ? response.additionalFiles 
                        : (response.additionalFiles ? [response.additionalFiles] : []);
                    
                    handleChange('additionalFiles', filesFromBackend);
                    hasLoadedRef.current = true;
                } catch (error) {
                    console.error('AdditionalFilesStep - Error reloading files:', error);
                }
            }
        };

        reloadFiles();
    }, [activeStep, courseId]);

    // Helper to determine icon & color by file type
    const getFileMeta = (type) => {
        switch (type) {
            case 'pdf':
                return {
                    icon: FileText,
                    bg: 'bg-red-50 dark:bg-red-950/40',
                    text: 'text-red-600 dark:text-red-400',
                    border: 'border-red-200 dark:border-red-900/50',
                    label: 'PDF'
                };
            case 'document':
                return {
                    icon: FileText,
                    bg: 'bg-blue-50 dark:bg-blue-950/40',
                    text: 'text-blue-600 dark:text-blue-400',
                    border: 'border-blue-200 dark:border-blue-900/50',
                    label: 'Word / Doc'
                };
            case 'presentation':
                return {
                    icon: FileSpreadsheet,
                    bg: 'bg-amber-50 dark:bg-amber-950/40',
                    text: 'text-amber-600 dark:text-amber-400',
                    border: 'border-amber-200 dark:border-amber-900/50',
                    label: 'Presentation'
                };
            case 'archive':
                return {
                    icon: FileArchive,
                    bg: 'bg-purple-50 dark:bg-purple-950/40',
                    text: 'text-purple-600 dark:text-purple-400',
                    border: 'border-purple-200 dark:border-purple-900/50',
                    label: 'Archive (ZIP/RAR)'
                };
            case 'image':
                return {
                    icon: FileImage,
                    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    border: 'border-emerald-200 dark:border-emerald-900/50',
                    label: 'Image'
                };
            case 'video':
                return {
                    icon: FileVideo,
                    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
                    text: 'text-indigo-600 dark:text-indigo-400',
                    border: 'border-indigo-200 dark:border-indigo-900/50',
                    label: 'Video'
                };
            default:
                return {
                    icon: File,
                    bg: 'bg-slate-100 dark:bg-slate-800',
                    text: 'text-slate-600 dark:text-slate-400',
                    border: 'border-slate-200 dark:border-slate-700',
                    label: 'Document'
                };
        }
    };

    // Process file data object
    const processFileData = async (fileData, existingFiles = []) => {
        if (typeof fileData !== 'object' || !fileData) {
            toast.error(t('instructor.courseCreation.uploadInvalidFormat', 'صيغة الملف غير مدعومة'));
            return null;
        }

        const { file, result, url: directUrl } = fileData;
        if (!file) {
            toast.error(t('instructor.courseCreation.uploadNoFileInfo', 'معلومات الملف مفقودة'));
            return null;
        }

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

        if (!url || typeof url !== 'string' || url.trim() === '') {
            toast.error(`فشل استخراج رابط الملف "${file.name}"`);
            return null;
        }

        const trimmedUrl = url.trim();
        const fileExists = existingFiles.some(f => f.url === trimmedUrl);
        if (fileExists) {
            toast.warning(`الملف "${file.name}" تم رفعه مسبقاً`);
            return null;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        let fileType = 'document';

        if (['pdf'].includes(fileExtension)) {
            fileType = 'pdf';
        } else if (['doc', 'docx'].includes(fileExtension)) {
            fileType = 'document';
        } else if (['ppt', 'pptx'].includes(fileExtension)) {
            fileType = 'presentation';
        } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
            fileType = 'archive';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
            fileType = 'image';
        } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension)) {
            fileType = 'video';
        }

        return {
            url: trimmedUrl,
            name: file.name,
            type: fileType,
            size: file.size || 0,
            uploadedAt: new Date().toISOString()
        };
    };

    // Handle file upload completion
    const handleFileUploadComplete = async (uploadData) => {
        if (!uploadData) {
            toast.error(t('instructor.courseCreation.uploadNoData', 'لا توجد بيانات مرفوعة'));
            return;
        }

        if (Array.isArray(uploadData)) {
            const newFiles = [];
            const existingFiles = courseData.additionalFiles || [];

            for (let i = 0; i < uploadData.length; i++) {
                const processedFile = await processFileData(uploadData[i], existingFiles);
                if (processedFile) {
                    newFiles.push(processedFile);
                }
            }

            if (newFiles.length > 0) {
                const allFiles = [...existingFiles, ...newFiles];
                handleChange('additionalFiles', allFiles);
                
                if (courseId) {
                    try {
                        setIsSaving(true);
                        const response = await instructorService.updateCourseAdditionalFiles(courseId, {
                            additionalFiles: allFiles
                        });
                        if (response.additionalFiles) {
                            handleChange('additionalFiles', response.additionalFiles);
                        }
                        toast.success(`تم رفع وحفظ ${newFiles.length} ملفات بنجاح`);
                    } catch (error) {
                        console.error('AdditionalFilesStep - Error saving files:', error);
                        toast.error('تم رفع الملفات ولكن فشل حفظها في الخادم');
                    } finally {
                        setIsSaving(false);
                    }
                } else {
                    toast.success(`تم إرفاق ${newFiles.length} ملفات بنجاح`);
                }
            }
            return;
        }

        // Single file
        const existingFiles = courseData.additionalFiles || [];
        const processedFile = await processFileData(uploadData, existingFiles);
        
        if (processedFile) {
            const allFiles = [...existingFiles, processedFile];
            handleChange('additionalFiles', allFiles);
            
            if (courseId) {
                try {
                    setIsSaving(true);
                    const response = await instructorService.updateCourseAdditionalFiles(courseId, {
                        additionalFiles: allFiles
                    });
                    if (response.additionalFiles) {
                        handleChange('additionalFiles', response.additionalFiles);
                    }
                    toast.success(`تم حفظ الملف "${processedFile.name}" بنجاح`);
                } catch (error) {
                    console.error('AdditionalFilesStep - Error saving file:', error);
                    toast.error(`تم رفع الملف ولكن تعذر الحفظ`);
                } finally {
                    setIsSaving(false);
                }
            } else {
                toast.success(`تم إرفاق "${processedFile.name}" بنجاح`);
            }
        }
    };

    // Remove file
    const removeFile = (index) => {
        const updatedFiles = courseData.additionalFiles.filter((_, i) => i !== index);
        handleChange('additionalFiles', updatedFiles);
        
        if (courseId) {
            instructorService.updateCourseAdditionalFiles(courseId, {
                additionalFiles: updatedFiles
            }).catch(err => console.error('Error removing file:', err));
        }
        
        toast.success(t('instructor.courseCreation.fileRemoved', 'تم حذف الملف'));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <FolderUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                            {t('instructor.courseCreation.additionalFilesTitle', 'الملفات والمراجع الإضافية')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {t('instructor.courseCreation.additionalFilesDesc', 'ارفع الكتب الإلكترونية، قوالب العمل، الأكواد البرمجية، والمراجع الداعمة للدورة')}
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold self-start sm:self-center border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('instructor.courseCreation.step4Badge', 'الخطوة 4 من 5')}</span>
                </div>
            </div>

            {/* File Upload Container */}
            <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                            {t('instructor.courseCreation.uploadFilesAreaTitle', 'منطقة رفع المراجع والمستندات')}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            يدعم: PDF, Word, PowerPoint, ZIP, RAR, الصور, والفيديوهات (حتى 100MB لكل ملف)
                        </p>
                    </div>

                    {isSaving && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الحفظ بالخادم...</span>
                        </span>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <FileUpload
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv"
                        maxSize={100 * 1024 * 1024} // 100MB
                        folder="courses/additional-files"
                        onUploadSuccess={handleFileUploadComplete}
                        onUploadError={() => toast.error(t('instructor.courseCreation.fileUploadFailed', 'فشل رفع الملف'))}
                        label={t('instructor.courseCreation.uploadFiles', 'اسحب وأفلت الملفات هنا، أو اضغط للتصفح')}
                        helperText={t('instructor.courseCreation.filesHelper', 'يمكنك اختيار عدة ملفات معاً لرفعها دفعة واحدة')}
                        multiple={true}
                    />
                </div>
            </div>

            {/* Uploaded Files Section */}
            {courseData.additionalFiles && courseData.additionalFiles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>{t('instructor.courseCreation.uploadedFilesCount', { count: courseData.additionalFiles.length })}</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">
                                {courseData.additionalFiles.length} ملفات
                            </span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {courseData.additionalFiles.map((file, index) => {
                            const meta = getFileMeta(file.type);
                            const IconComponent = meta.icon;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                        <div className={`w-11 h-11 rounded-2xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0 border ${meta.border} shadow-sm`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                <span className="font-semibold text-slate-500 dark:text-slate-400">{meta.label}</span>
                                                {file.size > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 ms-3 shrink-0">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                                            title={t('instructor.courseCreation.previewDownload', 'معاينة / تحميل')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                            title={t('instructor.courseCreation.removeFile', 'حذف الملف')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!courseData.additionalFiles || courseData.additionalFiles.length === 0) && (
                <div className="py-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                    <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {t('instructor.courseCreation.noFilesUploaded', 'لم تقم برفع أي ملفات إضافية حتى الآن')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {t('instructor.courseCreation.getStartedUpload', 'الملفات الإضافية اختيارية ولكنها تزيد من القيمة التعليمية لدورتك')}
                    </p>
                </div>
            )}

            {/* Information Notice */}
            <div className="p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl">
                <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                            {t('instructor.courseCreation.additionalFilesNoteStrong', 'ملاحظة للمدرب:')}
                        </h4>
                        <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
                            {t('instructor.courseCreation.additionalFilesNote', 'الملفات الإضافية تظهر في قسم الموارد بالدورة ويمكن لجميع الطلاب المسجلين تحميلها في أي وقت.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Action Buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 transition-all text-xs sm:text-sm active:scale-95"
                >
                    <span>{t('instructor.courseCreation.next', 'المتابعة للخطوة التالية')}</span>
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

export default AdditionalFilesStep;
