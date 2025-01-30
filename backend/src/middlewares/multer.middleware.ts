import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

// Debugging log to check if middleware is being initialized
console.log("Initializing multer middleware...");

// Ensure the uploads directory exists or create it
const uploadDir = path.resolve(__dirname, "..", "..", "public", "uploads"); // Adjust the path relative to current file
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    console.log("Uploads directory created at:", uploadDir);
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Saving file to ${uploadDir} - File: ${file.originalname}`);
        cb(null, uploadDir); // Save files to `/public/uploads`
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        console.log(`Generated filename: ${uniqueFilename}`);
        cb(null, uniqueFilename); // Unique filename
    },
});

// Allowed file types (only images)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    console.log(`File uploaded: ${file.originalname} | MIME: ${file.mimetype} | Extension Valid: ${extname} | MIME Valid: ${mimetype}`);

    if (mimetype && extname) {
        cb(null, true); // Accept file
    } else {
        console.error(`Invalid file type: ${file.originalname}`);
        cb(new ApiError(400, "Invalid file type. Only images are allowed."), false);
    }
};

// Multer instance with storage and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
    fileFilter: fileFilter
}).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]);

// Middleware function to handle file upload validation
export const uploadFiles = (req: Request, res: Response, next: NextFunction) => {
    console.log("uploadFiles middleware triggered.");

    upload(req, res, function (err) {
        console.log("Multer processing complete.");

        if (err instanceof multer.MulterError) {
            console.error(`Multer error: ${err.message}`);
            return next(new ApiError(400, err.message));
        } else if (err) {
            console.error(`Unexpected error: ${err.message}`);
            return next(err);
        }

        // Ensure only one file or both are uploaded (or neither)
        const hasProfileImage = req.files?.["profileImage"]?.length > 0;
        const hasCoverImage = req.files?.["coverImage"]?.length > 0;

        console.log(`Profile Image Present: ${hasProfileImage}`);
        console.log(`Cover Image Present: ${hasCoverImage}`);

        if (!hasProfileImage && !hasCoverImage) {
            console.log("No files uploaded. Continuing.");
            return next(); // No file uploaded, continue
        }

        if (hasProfileImage && hasCoverImage) {
            console.log("Both files uploaded. Continuing.");
            return next(); // Both uploaded, continue
        }

        if (hasProfileImage || hasCoverImage) {
            console.log("Only one file uploaded. Continuing.");
            return next(); // Only one uploaded, continue
        }

        console.error("Invalid file upload scenario encountered.");
        return next(new ApiError(400, "You can only upload one image or both, not more."));
    });
};
