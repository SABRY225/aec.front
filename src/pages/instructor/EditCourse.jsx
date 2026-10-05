import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { instructorService } from '../../services/new-api';
import LoadingNew from '../../components/shared/LoadingNew/LoadingNew';
import { useAutosave } from '../../hooks/useAutosave';
import { 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    BookOpen, 
    Layers, 
    ListOrdered, 
    FileUp, 
    Send,
    Loader2,
    CheckCircle2
} from 'lucide-react';

// Step components
import BasicInfoStep from './course-creation/BasicInfoStep';
import AdvancedInfoStep from './course-creation/AdvancedInfoStep';
import CurriculumStep from './course-creation/CurriculumStep';
import AdditionalFilesStep from './course-creation/AdditionalFilesStep';
import PublishStep from './course-creation/PublishStep';

const EditCourse = () => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeStep, setActiveStep] = useState(0);
    const [courseId, setCourseId] = useState(id);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [stepLoading, setStepLoading] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState({ isSaving: false, isSaved: false });
    const pendingSaveRef = useRef(null);
    
    // Course data state
    const [courseData, setCourseData] = useState({
        // Basic Info (Step 1)
        title: '',
        description: '',
        category: '',
        subCategory: '',
        topic: '', // Keep for backward compatibility
        topics: [],
        brochure: null,
        language: '',
        subtitleLanguage: '',
        courseLevel: '',
        courseType: '',
        location: '',
        address: '',
        governorate: '',
        mapsUrl: '',
        maxCapacity: '',
        scheduleDays: [],
        sessionStartTime: '',
        sessionEndTime: '',
        additionalInstructions: '',
        onlinePlatform: '',
        meetingLink: '',
        meetingJoinInfo: '',
        startDate: '',
        endDate: '',
        duration: '',
        price: '',
        originalPrice: '',
        
        // Advanced Info (Step 2)
        thumbnail: null,
        trailer: null,
        whatYouWillLearn: [{ main: '', subPoints: [] }],
        
        // Curriculum (Step 3)
        sections: [{
            name: 'Section 1',
            lectures: [],
            assignments: []
        }],
        
        // Additional Files (Step 4)
        additionalFiles: []
    });

    // Steps configuration
    const steps = [
        { name: t('instructor.courseCreation.basicInfo'), icon: BookOpen, component: BasicInfoStep },
        { name: t('instructor.courseCreation.advancedInfo'), icon: Layers, component: AdvancedInfoStep },
        { name: t('instructor.courseCreation.curriculum'), icon: ListOrdered, component: CurriculumStep },
        { name: t('instructor.courseCreation.additionalFiles'), icon: FileUp, component: AdditionalFilesStep },
        { name: t('instructor.courseCreation.stepPublish'), icon: Send, component: PublishStep }
    ];

    // Load existing course data
    useEffect(() => {
        const loadCourseData = async () => {
            try {
                setInitialLoading(true);
                await fetchCourseData(id);
                setCourseId(id);
            } catch (error) {
                console.error('Error loading course:', error);
                toast.error(t('instructor.courseCreation.loadFailed'));
                navigate('/instructor/courses');
            } finally {
                setInitialLoading(false);
            }
        };

        if (id) {
            loadCourseData();
        }
    }, [id, navigate]);

    // Handle form field changes
    const handleChange = (field, value) => {
        setCourseData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Auto-save function for current step
    const autoSaveCurrentStep = async (data) => {
        if (!courseId) return;

        try {
            if (activeStep === 0) {
                // Update basic info
                await instructorService.updateCourseBasic(courseId, {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    subCategory: data.subCategory,
                    topic: data.topic,
                    topics: data.topics,
                    brochure: data.brochure,
                    language: data.language,
                    subtitleLanguage: data.subtitleLanguage,
                    courseLevel: data.courseLevel,
                    courseType: data.courseType,
                    location: data.location,
                    address: data.address,
                    governorate: data.governorate,
                    mapsUrl: data.mapsUrl,
                    maxCapacity: data.maxCapacity,
                    scheduleDays: data.scheduleDays,
                    sessionStartTime: data.sessionStartTime,
                    sessionEndTime: data.sessionEndTime,
                    additionalInstructions: data.additionalInstructions,
                    onlinePlatform: data.onlinePlatform,
                    meetingLink: data.meetingLink,
                    meetingJoinInfo: data.meetingJoinInfo,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    duration: data.duration,
                    price: data.price,
                    originalPrice: data.originalPrice || null
                });
            } else if (activeStep === 1) {
                // Update advanced info
                await instructorService.updateCourseAdvanced(courseId, {
                    thumbnail: data.thumbnail,
                    trailer: data.trailer,
                    whatYouWillLearn: data.whatYouWillLearn
                });
            } else if (activeStep === 2) {
                // Update curriculum
                await instructorService.updateCourseSections(courseId, {
                    sections: data.sections
                });
            } else if (activeStep === 3) {
                // Update additional files
                await instructorService.updateCourseAdditionalFiles(courseId, {
                    additionalFiles: data.additionalFiles || []
                });
            }
        } catch (error) {
            console.error('Autosave error:', error);
            throw error;
        }
    };

    // Use autosave hook - only enable if we have courseId
    const autosaveStatus = useAutosave(
        courseData,
        autoSaveCurrentStep,
        {
            enabled: courseId !== null && !initialLoading,
            delay: 2000, // 2 seconds after last change
            onSave: () => {
                setAutoSaveStatus({ isSaving: false, isSaved: true });
            },
            onError: (error) => {
                setAutoSaveStatus({ isSaving: false, isSaved: false });
            }
        }
    );

    // Update local autosave status from hook
    useEffect(() => {
        setAutoSaveStatus({
            isSaving: autosaveStatus.isSaving,
            isSaved: autosaveStatus.isSaved
        });
    }, [autosaveStatus.isSaving, autosaveStatus.isSaved]);

    // Save before navigation
    const saveBeforeNavigation = async () => {
        if (!courseId) return;
        
        try {
            pendingSaveRef.current = true;
            await autoSaveCurrentStep(courseData);
            pendingSaveRef.current = null;
        } catch (error) {
            console.error('Error saving before navigation:', error);
            pendingSaveRef.current = null;
        }
    };

    // Fetch course data from backend
    const fetchCourseData = async (id) => {
        try {
            const response = await instructorService.getCourseById(id);
            console.log('Fetched course data:', response);
            setCourseData({
                // Basic Info (Step 1) - ALL fields must be included
                title: response.title || '',
                description: response.description || '',
                category: response.category || '',
                subCategory: response.subCategory || '',
                topic: response.topic || '', // Keep for backward compatibility
                topics: response.topics || (response.topic ? [response.topic] : []),
                brochure: response.brochure || null,
                language: response.language || '',
                subtitleLanguage: response.subtitleLanguage || '',
                courseLevel: response.courseLevel || '',
                courseType: response.courseType || '',
                location: response.location || '',
                address: response.address || '',
                governorate: response.governorate || '',
                mapsUrl: response.mapsUrl || '',
                maxCapacity: response.maxCapacity || '',
                scheduleDays: Array.isArray(response.scheduleDays) ? response.scheduleDays : [],
                sessionStartTime: response.sessionStartTime || '',
                sessionEndTime: response.sessionEndTime || '',
                additionalInstructions: response.additionalInstructions || '',
                onlinePlatform: response.onlinePlatform || '',
                meetingLink: response.meetingLink || '',
                meetingJoinInfo: response.meetingJoinInfo || '',
                startDate: response.startDate ? response.startDate.split('T')[0] : '',
                endDate: response.endDate ? response.endDate.split('T')[0] : '',
                duration: response.duration || '',
                price: response.price !== undefined ? response.price : '',
                originalPrice: response.originalPrice || '',
                
                // Advanced Info (Step 2)
                thumbnail: response.thumbnail || null,
                trailer: response.trailer || null,
                whatYouWillLearn: response.whatYouWillLearn && response.whatYouWillLearn.length > 0 
                    ? (typeof response.whatYouWillLearn[0] === 'string' 
                        ? response.whatYouWillLearn.map(item => ({ main: item, subPoints: [] }))
                        : response.whatYouWillLearn)
                    : [{ main: '', subPoints: [] }],
                
                // Curriculum (Step 3)
                sections: response.sections && response.sections.length > 0 ? response.sections : [{
                    name: 'Section 1',
                    lectures: [],
                    assignments: []
                }],
                
                // Additional Files (Step 4) - Ensure it's always an array
                additionalFiles: Array.isArray(response.additionalFiles) ? response.additionalFiles : (response.additionalFiles ? [response.additionalFiles] : [])
            });
        } catch (error) {
            console.error('Error fetching course data:', error);
            toast.error(t('instructor.courseCreation.loadFailed'));
        }
    };

    // Handle step navigation and saving
    const handleNext = async () => {
        try {
            setLoading(true);
            
            // Save data based on current step
            if (activeStep === 0) {
                // Update course with basic info - ONLY send basic info fields
                await instructorService.updateCourseBasic(courseId, {
                    title: courseData.title,
                    description: courseData.description,
                    category: courseData.category,
                    subCategory: courseData.subCategory,
                    topic: courseData.topic,
                    topics: courseData.topics,
                    brochure: courseData.brochure,
                    language: courseData.language,
                    subtitleLanguage: courseData.subtitleLanguage,
                    courseLevel: courseData.courseLevel,
                    courseType: courseData.courseType,
                    location: courseData.location,
                    address: courseData.address,
                    governorate: courseData.governorate,
                    mapsUrl: courseData.mapsUrl,
                    maxCapacity: courseData.maxCapacity,
                    scheduleDays: courseData.scheduleDays,
                    sessionStartTime: courseData.sessionStartTime,
                    sessionEndTime: courseData.sessionEndTime,
                    additionalInstructions: courseData.additionalInstructions,
                    onlinePlatform: courseData.onlinePlatform,
                    meetingLink: courseData.meetingLink,
                    meetingJoinInfo: courseData.meetingJoinInfo,
                    startDate: courseData.startDate,
                    endDate: courseData.endDate,
                    duration: courseData.duration,
                    price: courseData.price,
                    originalPrice: courseData.originalPrice || null
                });
                toast.success(t('instructor.courseCreation.basicUpdated'));
                // Fetch updated course data
                await fetchCourseData(courseId);
            } else if (activeStep === 1) {
                // Update course with advanced info
                await instructorService.updateCourseAdvanced(courseId, {
                    thumbnail: courseData.thumbnail,
                    trailer: courseData.trailer,
                    whatYouWillLearn: courseData.whatYouWillLearn
                });
                toast.success(t('instructor.courseCreation.advancedSaved'));
                // Fetch updated course data
                await fetchCourseData(courseId);
            } else if (activeStep === 2) {
                // Update course sections
                await instructorService.updateCourseSections(courseId, {
                    sections: courseData.sections
                });
                toast.success(t('instructor.courseCreation.curriculumUpdated'));
                // Fetch updated course data
                await fetchCourseData(courseId);
            } else if (activeStep === 3) {
                // Save additional files (optional - no validation needed)
                await instructorService.updateCourseAdditionalFiles(courseId, {
                    additionalFiles: courseData.additionalFiles || []
                });
                toast.success(t('instructor.courseCreation.filesUpdated'));
                await fetchCourseData(courseId);
            } else if (activeStep === 4) {
                // Submit course for review
                await instructorService.submitCourseForReview(courseId);
                toast.success(t('instructor.courseCreation.updated'));
                navigate('/instructor/courses');
                return; // Don't proceed to next step after submission
            }
            
            // Move to next step (only if not at the last step)
            if (activeStep < steps.length - 1) {
                setActiveStep(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error saving course data:', error);
            toast.error(error.response?.data?.message || t('instructor.courseCreation.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = async () => {
        if (activeStep === 0) return;
        
        try {
            setStepLoading(true);
            
            // Save current step data before navigating away
            await saveBeforeNavigation();
            
            // Always refresh data from backend before changing step
            // This ensures we display the latest saved data and prevents data loss
            if (courseId) {
                await fetchCourseData(courseId);
            }
            
            // Then change the step
            setActiveStep(prev => prev - 1);
        } catch (error) {
            console.error('Error refreshing data on step back:', error);
            toast.error(t('instructor.courseCreation.loadFailed'));
        } finally {
            setStepLoading(false);
        }
    };

    // Show loading while fetching course data
    if (initialLoading) {
        return <LoadingNew words={["course", "loading", "please wait"]} />;
    }

    // Automatically scroll to top of main container when active step changes
    useEffect(() => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [activeStep]);

    // Render current step component
    const CurrentStepComponent = steps[activeStep]?.component;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6" dir={t('autoGenerated.ltr', `ltr`)}>
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                            {`الخطوة ${activeStep + 1} من ${steps.length} • ${steps[activeStep]?.name}`}
                        </span>
                        {courseData.title && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                                {courseData.title}
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                        {t('instructor.courseCreation.editTitle')}
                    </h1>
                </div>

                {/* Auto-save status indicator */}
                {courseId && !initialLoading && (
                    <div className="shrink-0">
                        {autoSaveStatus.isSaving && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t('instructor.courseCreation.autoSaveLoading')}</span>
                            </div>
                        )}
                        {autoSaveStatus.isSaved && !autoSaveStatus.isSaving && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t('instructor.courseCreation.autoSaveDone')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
                {stepLoading && (
                    <div className="mb-3 text-center">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {t('instructor.courseCreation.loadingStepData')}
                        </span>
                    </div>
                )}
                
                <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isDone = index < activeStep;
                        const isCurrent = index === activeStep;
                        
                        return (
                            <div key={index} className="flex flex-col items-center relative z-10 text-center">
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${
                                        isDone
                                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                            : isCurrent
                                            ? 'bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105 ring-4 ring-blue-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                                    ) : (
                                        Icon ? <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> : (index + 1)
                                    )}
                                </div>
                                <span className={`mt-2 text-[11px] sm:text-xs font-bold transition-colors ${
                                    isCurrent 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : isDone 
                                        ? 'text-slate-700 dark:text-slate-300' 
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                    <span className="hidden md:inline">{step.name}</span>
                                    <span className="md:hidden">{step.name.split(' ')[0]}</span>
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar line */}
                <div className="relative mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
                        style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-8">
                {CurrentStepComponent ? (
                    <CurrentStepComponent 
                        courseData={courseData} 
                        handleChange={handleChange} 
                        courseId={courseId}
                        activeStep={activeStep}
                        handleSubmitForReview={activeStep === 4 ? handleNext : undefined}
                        onNext={handleNext}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">{t('instructor.courseCreation.stepNotFound')}</p>
                    </div>
                )}
            </div>
            
            {/* Previous button */}
            {activeStep > 0 && (
                <div className="flex justify-start">
                    <button
                        onClick={handlePrevious}
                        disabled={loading || stepLoading}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                            loading || stepLoading 
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 active:scale-95'
                        }`}
                    >
                        {stepLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>{t('instructor.courseCreation.loading')}</span>
                            </>
                        ) : (
                            <>
                                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                <span>{t('instructor.courseCreation.previous')}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditCourse;