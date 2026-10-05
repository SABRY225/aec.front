import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, error = false }) => {
    const { t } = useTranslation();
    const displayPlaceholder = placeholder ?? t('richText.placeholder');
    // Configure Quill modules and formats
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'direction',
        'align',
        'list', 'bullet',
        'blockquote', 'code-block',
        'link', 'image',
        'indent',
        'script'
    ];

    return (
        <div className={`rich-text-editor-wrapper ${error ? 'error' : ''}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={displayPlaceholder}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                }}
            />
        </div>
    );
};

export default RichTextEditor;

