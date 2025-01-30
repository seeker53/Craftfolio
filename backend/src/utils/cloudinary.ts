import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { ApiError } from './ApiError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log(`Attempting to upload file: ${localFilePath}`);

        if (!localFilePath) {
            console.log('No file path provided');
            return null;
        }

        const absolutePath = path.resolve(localFilePath);
        console.log(`Resolved path for upload: ${absolutePath}`);

        if (!fs.existsSync(absolutePath)) {
            console.log('File does not exist:', absolutePath);
            return null;
        }

        const response = await cloudinary.uploader.upload(absolutePath, {
            resource_type: "auto"
        });

        if (!response) {
            console.log('No response from Cloudinary');
            return null;
        }

        console.log('Upload successful:', response.url);

        await fs.promises.unlink(absolutePath);
        console.log('Deleted local file:', absolutePath);

        return response;
    } catch (error) {
        console.error('Error uploading file:', error.message);
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        console.log('Attempting to delete file from Cloudinary with public ID:', publicId);
        const result = await cloudinary.api.delete_resources([publicId], {
            type: 'upload',
            resource_type: 'image'
        });
        console.log('Cloudinary Delete Result:', result);
        return result;
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err.message);
        throw new ApiError(504, `Failed to delete old image from Cloudinary: ${err.message}`);
    }
};

const getPublicIdFromUrl = (url) => {
    if (!url) {
        console.log('No URL provided to extract public ID');
        return '';
    }
    // Extract the public ID from the URL using a regular expression
    const matches = url.match(/\/v\d+\/(.+)\./);
    if (matches) {
        console.log('Extracted public ID from URL:', matches[1]);
    } else {
        console.log('No public ID found in URL');
    }
    return matches ? matches[1] : '';
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
