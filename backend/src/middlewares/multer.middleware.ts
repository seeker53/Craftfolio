import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// Always write to <projectRoot>/public/uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename(_req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isImage = /jpeg|jpg|png|gif/.test(path.extname(file.originalname).toLowerCase())
        && /jpeg|jpg|png|gif/.test(file.mimetype);
    if (isImage) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only images are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
}).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
]);

export const uploadFiles = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
        if (err) {
            // Multer error or our ApiError
            return next(err);
        }

        // Cast req.files to an object mapping field names → arrays of files
        const files = req.files as Record<string, Express.Multer.File[]>;

        const hasProfile = Array.isArray(files.profileImage) && files.profileImage.length > 0;
        const hasCover = Array.isArray(files.coverImage) && files.coverImage.length > 0;

        console.log(`Profile Image Present: ${hasProfile}`);
        console.log(`Cover Image Present:   ${hasCover}`);

        next();
    });
};
