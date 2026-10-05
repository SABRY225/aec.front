import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileUpload } from '../../../hooks/useFileUpload';
import './FileUpload.css';

const FileUpload = ({
  accept,
  multiple = false,
  maxSize,
  folder = 'general',
  onUploadSuccess,
  onUploadError,
  label,
  dragDropLabel,
  helperText,
  disabled = false,
  className = '',
  showPreview = true,
  previewType = 'auto', // 'auto', 'image', 'video', 'document', 'none'
  selectedFiles = [],
  validateFileType,
  value, // URL of an existing file (image or video)
}) => {
  const { t } = useTranslation();
  const { uploadFile, uploading, uploadProgress, totalChunks, uploadedChunks } = useFileUpload();
  const displayLabel = label ?? t('fileUpload.defaultLabel');
  const displayDragLabel = dragDropLabel ?? t('fileUpload.dragDrop');
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  
  // Handle existing file from value prop
  useEffect(() => {
    if (value && showPreview) {
      // Clear existing previews first
      setPreviews([]);
      
      // Create a mock file object for the preview
      const fileType = previewType === 'auto' 
        ? (value.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video')
        : previewType;
      
      const mockFile = {
        name: value.split('/').pop(),
        type: fileType === 'image' ? 'image/jpeg' : 'video/mp4',
      };
      
      setPreviews([{ file: mockFile, preview: value }]);
    }
  }, [value, showPreview, previewType]);

  // Determine preview type based on file type
  const getPreviewType = (file) => {
    if (previewType !== 'auto') return previewType;
    
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  // Create file preview
  const createPreview = (file) => {
    if (!showPreview) return null;
    
    const previewType = getPreviewType(file);
    
    if (previewType === 'image') {
      return URL.createObjectURL(file);
    } else if (previewType === 'video') {
      return URL.createObjectURL(file);
    } else {
      return null; // No preview for documents
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;

    const filesToUpload = multiple ? Array.from(files) : [files[0]];
    const newPreviews = [];
    const uploadedFiles = [];
    let hasErrors = false;

    for (const file of filesToUpload) {
      // Validate file size
      if (maxSize && file.size > maxSize) {
        onUploadError?.(t('fileUpload.fileTooLarge', { name: file.name, size: formatFileSize(maxSize) }));
        continue;
      }

      // Validate file type if custom validation is provided
      if (validateFileType && !validateFileType(file)) {
        onUploadError?.(t('fileUpload.invalidType', { name: file.name }));
        continue;
      }

      try {
        console.log('Starting upload for file:', file.name);
        
        // Create preview
        const preview = createPreview(file);
        if (preview) newPreviews.push({ file, preview });

        // Upload file
        const result = await uploadFile(file, folder);
        console.log('Upload result for', file.name, ':', result);
        
        // Ensure we have a valid URL to pass back
        const fileUrl = typeof result === 'string' ? result : result?.url || result;
        console.log('Extracted file URL:', fileUrl);
        
        const uploadedFileData = {
          file,
          result,
          url: fileUrl // Ensure the URL is properly passed
        };
        
        console.log('Adding to uploadedFiles:', uploadedFileData);
        uploadedFiles.push(uploadedFileData);
      } catch (error) {
        console.error('Upload error for', file.name, ':', error);
        hasErrors = true;
        onUploadError?.(t('fileUpload.uploadFailed', { name: file.name, error: error.message }));
      }
    }

    // Update previews only if we have new ones
    if (newPreviews.length > 0) {
      setPreviews(newPreviews);
    }

    // Call success callback with uploaded files
    console.log('Upload process completed. uploadedFiles:', uploadedFiles, 'hasErrors:', hasErrors);
    if (uploadedFiles.length > 0 && !hasErrors) {
      const dataToPass = multiple ? uploadedFiles : uploadedFiles[0];
      console.log('Calling onUploadSuccess with:', dataToPass);
      onUploadSuccess?.(dataToPass);
    } else {
      console.log('No files were successfully uploaded or there were errors');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) handleFileChange(e);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [t('fileUpload.bytes'), t('fileUpload.kb'), t('fileUpload.mb'), t('fileUpload.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render file preview
  const renderPreview = (file, previewUrl) => {
    const type = getPreviewType(file);

    if (type === 'image') {
      return <img src={previewUrl} alt={file.name} className="file-preview-image" />;
    } else if (type === 'video') {
      return (
        <video controls className="file-preview-video">
          <source src={previewUrl} type={file.type} />
          {t('fileUpload.videoNotSupported')}
        </video>
      );
    } else {
      return (
        <div className="file-preview-document">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{file.name}</span>
        </div>
      );
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="file-upload-content">
          <svg
            className="file-upload-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="file-upload-text">
            <label
              htmlFor={`file-upload-input-${folder}`}
              className={`file-upload-label ${disabled || uploading ? 'disabled' : ''}`}
            >
              <span>
                {uploading ? t('fileUpload.uploading', { percent: uploadProgress }) : displayLabel}
              </span>
              <input
                id={`file-upload-input-${folder}`}
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                disabled={disabled || uploading}
              />
            </label>
            {!uploading && !disabled && <p className="file-upload-drag-text">{displayDragLabel}</p>}
          </div>

          {helperText && <p className="file-upload-helper-text">{helperText}</p>}

          {/* Progress bar for uploads */}
          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="upload-progress-text">
                <span className="upload-percentage">{uploadProgress}%</span>
                {totalChunks > 0 && (
                  <span className="upload-chunks-info">
                    {t('fileUpload.chunks', { uploaded: uploadedChunks, total: totalChunks })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File previews */}
      {showPreview && previews.length > 0 && (
        <div className="file-previews">
          {previews.map((item, index) => (
            <div key={index} className="file-preview-item">
              {renderPreview(item.file, item.preview)}
            </div>
          ))}
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4 className="selected-files-title">{t('fileUpload.selectedFiles')}</h4>
          <ul className="selected-files-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="selected-file-item">
                <span className="selected-file-name">{file.name}</span>
                {file.size && <span className="selected-file-size">{formatFileSize(file.size)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;