import { Router } from 'express';

import {
    registerUser
} from '../controllers/auth.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';

const authRouter = Router();

authRouter.route("/register").post(
    //adding middleware - 'jaate samay milke jana'
    upload.fields([
        {
            name: 'profileImage',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }]
    ),
    registerUser)


export default authRouter;