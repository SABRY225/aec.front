import { useState } from 'react';
import axios from 'axios';
import { getCurrentToken } from '../services/new-api';

export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [chunkProgress, setChunkProgress] = useState({});
    const [totalChunks, setTotalChunks] = useState(0);
    const [uploadedChunks, setUploadedChunks] = useState(0);
    
    // Configuration for chunked uploads
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
    const MAX_PARALLEL_CHUNKS = 3; // Maximum number of chunks to upload in parallel
    
    // Helper function to create chunks from a file
    const createChunks = (file, chunkSize) => {
        const chunks = [];
        let start = 0;
        
        while (start < file.size) {
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            chunks.push(chunk);
            start = end;
        }
        
        return chunks;
    };
    
    const getApiBaseUrl = () => {
        const envUrl = import.meta.env?.VITE_API_BASE_URL;
        if (envUrl) {
            return envUrl.replace(/\/+$/, '');
        }
        return 'http://localhost:5002/api';
    };

    // Helper function to upload a single chunk
    const uploadChunk = async (chunk, chunkIndex, totalChunks, file, folder, fileId) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileId', fileId);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size);
        formData.append('folder', folder);
        
        try {
            const apiUrl = `${getApiBaseUrl()}/upload/chunk`;
            
            // Get current access token for authentication
            const token = getCurrentToken();
            const headers = {
                'Content-Type': 'multipart/form-data',
            };
            
            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.post(apiUrl, formData, {
                headers,
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    setChunkProgress(prev => ({
                        ...prev,
                        [chunkIndex]: Math.round(progress)
                    }));
                    
                    // Calculate overall progress based on all chunks and previously uploaded chunks
                    const chunkSize = file.size / totalChunks;
                    
                    // Calculate the size of all completely uploaded chunks
                    const completedChunksSize = uploadedChunks * chunkSize;
                    
                    // Add the progress of the current uploading chunk
                    const currentChunkProgress = progressEvent.loaded / progressEvent.total * chunkSize;
                    
                    // Calculate total uploaded size and progress percentage
                    const uploadedSize = completedChunksSize + currentChunkProgress;
                    const totalProgress = (uploadedSize / file.size) * 100;
                    
                    // Update the progress state with a more accurate value
                    setUploadProgress(Math.min(99, Math.round(totalProgress))); // Cap at 99% until fully complete
                },
            });
            
            setUploadedChunks(prev => prev + 1);
            return response.data;
        } catch (error) {
            console.error(`Error uploading chunk ${chunkIndex}:`, error);
            throw error;
        }
    };
    
    // Helper function to upload small files without chunking
    const uploadSmallFile = async (file, folder = 'general') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        try {
            const apiUrl = `${getApiBaseUrl()}/upload`;
            
            // Get current access token for authentication
            const token = getCurrentToken();
            const headers = {
                'Content-Type': 'multipart/form-data',
            };
            
            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.post(apiUrl, formData, {
                headers,
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    setUploadProgress(Math.round(progress));
                },
            });
            
            // Ensure progress shows 100% when complete
            setUploadProgress(100);
            
            // Ensure we return a consistent format with a url property
            const result = response.data;
            if (typeof result === 'string') {
                return { url: result, result: result };
            } else if (result && !result.url && result.result) {
                return { ...result, url: result.result };
            }
            return result;
        } catch (error) {
            console.error('Error uploading small file:', error);
            throw error;
        }
    };
    
    // Helper function to check chunk upload status and identify missing chunks
    const checkChunkStatus = async (fileId, totalChunks) => {
        try {
            const apiUrl = `${getApiBaseUrl()}/upload/chunk-status/`;
            
            // Get current access token for authentication
            const token = getCurrentToken();
            const headers = {};
            
            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.get(`${apiUrl}${fileId}`, {
                params: { totalChunks },
                headers
            });
            
            return response.data;
        } catch (error) {
            console.error('Error checking chunk status:', error);
            return { missingChunks: [], isComplete: false, progress: 0 };
        }
    };
    
    // Main upload function with chunking, parallel uploads, and retry mechanism
    const uploadFile = async (file, folder = 'general') => {
        setUploading(true);
        setUploadProgress(0);
        setChunkProgress({});
        setUploadedChunks(0);
        
        try {
            // For small files (< 1MB), use traditional upload instead of chunking
            if (file.size < 1 * 1024 * 1024) {
                return await uploadSmallFile(file, folder);
            }
            
            // Generate a unique file ID for this upload
            const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            
            // Create chunks from the file
            const chunks = createChunks(file, CHUNK_SIZE);
            setTotalChunks(chunks.length);
            
            // Upload chunks in parallel batches
            const MAX_RETRIES = 3;
            let uploadComplete = false;
            let result = null;
            
            // First attempt - upload all chunks
            for (let i = 0; i < chunks.length; i += MAX_PARALLEL_CHUNKS) {
                const chunkPromises = [];
                
                // Create a batch of chunk upload promises
                for (let j = 0; j < MAX_PARALLEL_CHUNKS && i + j < chunks.length; j++) {
                    const chunkIndex = i + j;
                    chunkPromises.push(
                        uploadChunk(chunks[chunkIndex], chunkIndex, chunks.length, file, folder, fileId)
                    );
                }
                
                // Wait for the current batch to complete
                await Promise.all(
                    chunkPromises.map(p => p.catch(e => {
                        console.error('Chunk upload error:', e);
                        return { error: e };
                    }))
                );
            }
            
            // After all chunks are uploaded, poll for completion
            console.log('All chunks uploaded, waiting for server processing...');
            
            // Calculate max attempts based on file size (larger files need more time to merge and upload)
            const fileSizeMB = file.size / (1024 * 1024);
            const baseAttempts = 60; // 60 attempts * 2s = 120s base
            const maxAttempts = Math.max(baseAttempts, Math.ceil(baseAttempts + (fileSizeMB * 2)));
            const delayBetweenChecks = fileSizeMB > 50 ? 2500 : 2000;
            
            console.log(`File size: ${fileSizeMB.toFixed(2)}MB, Max attempts: ${maxAttempts}, Delay: ${delayBetweenChecks}ms`);
            
            let processingCount = 0;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Wait before checking status
                await new Promise(resolve => setTimeout(resolve, delayBetweenChecks));
                
                const status = await checkChunkStatus(fileId, chunks.length);
                
                // Check if upload is completed
                if (status.completed && status.result && status.result.url) {
                    result = {
                        url: status.result.url,
                        message: status.result.message || 'Upload completed'
                    };
                    uploadComplete = true;
                    break;
                }
                
                // Check if there's an error
                if (status.error) {
                    throw new Error(status.message || 'Upload failed');
                }
                
                // If still processing, show progress and allow extra processing time
                if (status.processing) {
                    processingCount++;
                    const progress = status.progress || 0;
                    setUploadProgress(Math.min(99, progress)); // Cap at 99% until fully complete
                    console.log(`Processing... ${progress}% - ${status.message || 'Uploading'}`);
                    
                    // If the backend is actively reporting progress/processing, don't deplete attempts too quickly
                    if (attempt > maxAttempts - 10 && processingCount < 100) {
                        attempt -= 5;
                    }
                }
                
                // Handle missing chunks
                if (status.missingChunks && status.missingChunks.length > 0) {
                    console.log(`Retry attempt ${attempt + 1}: Uploading ${status.missingChunks.length} missing chunks`);
                    
                    // Upload missing chunks
                    const retryPromises = status.missingChunks.map(chunkIndex => 
                        uploadChunk(chunks[chunkIndex], chunkIndex, chunks.length, file, folder, fileId)
                    );
                    
                    await Promise.all(retryPromises.map(p => p.catch(e => {
                        console.error('Retry chunk upload error:', e);
                        return { error: e };
                    })));
                }
                
                console.log(`Upload attempt ${attempt + 1}/${maxAttempts}, progress: ${status.progress || 0}%`);
            }
            
            if (!uploadComplete) {
                throw new Error('Upload failed after multiple attempts');
            }
            
            return result;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        } finally {
            // Keep the progress at 100% for a moment before resetting
            setUploadProgress(100);
            
            // Delay resetting the states to allow users to see the completed progress
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                setChunkProgress({});
                setUploadedChunks(0);
                setTotalChunks(0);
            }, 1000); // 1 second delay
        }
    };

    return {
        uploadFile,
        uploading,
        uploadProgress,
        chunkProgress,
        totalChunks,
        uploadedChunks,
    };
};
