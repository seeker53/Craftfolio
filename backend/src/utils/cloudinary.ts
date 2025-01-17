import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { ApiError } from "./ApiError.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 * @param {string} localFilePath - The local file path to be uploaded.
 * @returns {Promise<object>} - The Cloudinary response object.
 */
const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) throw new ApiError(400, "Local file path is required");

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image", // Ensure we only upload images
            folder: "profile_images", // Organize uploads in a specific folder
        });

        if (!response) {
            throw new ApiError(504, "Failed to upload image to Cloudinary");
        }

        console.log("File successfully uploaded to Cloudinary:", response.url);

        // Clean up local file
        await fs.unlink(localFilePath);

        return response;
    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error.message);

        // Ensure local file is cleaned up
        await fs.unlink(localFilePath).catch(() => console.error("Failed to delete local file"));

        throw error; // Propagate the error
    }
};

/**
 * Delete a file from Cloudinary.
 * @param {string} publicId - The public ID of the file to delete.
 * @returns {Promise<object>} - The Cloudinary API response.
 */
const deleteFromCloudinary = async (publicId: string) => {
    try {
        if (!publicId) throw new ApiError(400, "Public ID is required");

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        console.log("Cloudinary Delete Result:", result);

        return result;
    } catch (error: any) {
        console.error("Cloudinary Deletion Error:", error.message);
        throw new ApiError(504, `Failed to delete image from Cloudinary: ${error.message}`);
    }
};

/**
 * Extract the public ID from a Cloudinary URL.
 * @param {string} url - The Cloudinary URL.
 * @returns {string} - The extracted public ID.
 */
const getPublicIdFromUrl = (url: string): string => {
    if (!url) return "";

    // Extract the public ID using regex
    const matches = url.match(/\/(?:[^/]+\/)+([^/.]+)\./);
    return matches ? matches[1] : "";
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
