import React from 'react';

const BunnyMedia = ({ url, type = 'image', width, height, alt, controls = true, className, ...props }) => {
    if (!url) return null;

    return type === 'video' ? (
        <BunnyVideoComponent 
            url={url} 
            width={width} 
            height={height} 
            controls={controls} 
            className={className}
            {...props} 
        />
    ) : (
        <BunnyImageComponent 
            url={url} 
            width={width} 
            height={height} 
            alt={alt} 
            className={className}
            {...props} 
        />
    );
};

const BunnyImageComponent = ({ url, width, height, alt, className, ...props }) => {
    const style = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <img 
            src={url} 
            alt={alt || 'Media'} 
            style={style}
            className={className}
            {...props}
        />
    );
};

const BunnyVideoComponent = ({ url, width, height, controls, className, ...props }) => {
    const style = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <video 
            src={url} 
            controls={controls}
            style={style}
            className={className}
            {...props}
        >
            Your browser does not support the video tag.
        </video>
    );
};

export default BunnyMedia;