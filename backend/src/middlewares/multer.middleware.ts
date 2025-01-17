import { ApiError } from "../utils/ApiError";
import path from "path";
import multer from "multer";

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original filename
    }
});

// Check file type for image validation
function checkFileType(file, cb) {
    // Allow only image types (jpeg, jpg, png, gif)
    const filetypes = /jpeg|jpg|png|gif/;

    // Check extension and MIME type
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // File is valid
    } else {
        throw new ApiError(404, "File type not supported. Only images are allowed.");
    }
}

// Multer upload configuration
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Limit file size to 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb); // Validate file type
    }
});
