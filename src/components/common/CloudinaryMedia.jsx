import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, AdvancedVideo } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";

// Create a Cloudinary instance
const cld = new Cloudinary({
    cloud: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }
});

const CloudinaryMedia = ({ url, type = 'image', ...props }) => {
    if (!url) return null;

    // Extract the public ID from the URL
    const publicId = url.split('/').slice(-2).join('/').split('.')[0];

    return type === 'video' ? (
        <CloudinaryVideoComponent publicId={publicId} {...props} />
    ) : (
        <CloudinaryImageComponent publicId={publicId} {...props} />
    );
};

const CloudinaryImageComponent = ({ publicId, width, height, alt }) => {
    const myImage = cld.image(publicId);
    if (width && height) {
        myImage.resize(fill().width(width).height(height));
    }

    return (
        <AdvancedImage cldImg={myImage} alt={alt} />
    );
};

const CloudinaryVideoComponent = ({ publicId, width, height, controls = true }) => {
    const myVideo = cld.video(publicId);
    if (width && height) {
        myVideo.resize(fill().width(width).height(height));
    }

    return (
        <AdvancedVideo cldVid={myVideo} controls={controls} />
    );
};

export default CloudinaryMedia;