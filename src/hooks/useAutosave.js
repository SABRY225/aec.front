import { useEffect, useRef, useState } from 'react';

export const useAutosave = (data, saveFunction, options = {}) => {
    const {
        delay = 2000, // 2 seconds delay after last change
        enabled = true,
        onSave = null,
        onError = null
    } = options;

    const [saveStatus, setSaveStatus] = useState({
        isSaving: false,
        isSaved: false,
        lastSaved: null,
        error: null
    });

    const timeoutRef = useRef(null);
    const previousDataRef = useRef(JSON.stringify(data));
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousDataRef.current = JSON.stringify(data);
            return;
        }

        if (!enabled || !saveFunction) return;

        // Check if data has changed
        const currentDataString = JSON.stringify(data);
        const dataChanged = currentDataString !== previousDataRef.current;
        
        if (!dataChanged) return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout for autosave
        timeoutRef.current = setTimeout(async () => {
            try {
                setSaveStatus({
                    isSaving: true,
                    isSaved: false,
                    lastSaved: null,
                    error: null
                });

                await saveFunction(data);
                
                previousDataRef.current = currentDataString;
                const now = new Date();
                
                setSaveStatus({
                    isSaving: false,
                    isSaved: true,
                    lastSaved: now,
                    error: null
                });

                if (onSave) onSave();
            } catch (error) {
                console.error('Autosave failed:', error);
                setSaveStatus({
                    isSaving: false,
                    isSaved: false,
                    lastSaved: null,
                    error: error.message || 'Failed to save'
                });
                
                if (onError) onError(error);
            }
        }, delay);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, saveFunction, delay, enabled, onSave, onError]);

    // Reset saved status after 3 seconds
    useEffect(() => {
        if (saveStatus.isSaved) {
            const timer = setTimeout(() => {
                setSaveStatus(prev => ({ ...prev, isSaved: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus.isSaved]);

    return saveStatus;
};

