import { Router } from 'express';

import {
    changeCurrentPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
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

authRouter.route("/login").post(loginUser);

authRouter.route("/logout").post(verifyJWT, logoutUser);

authRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken);

authRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default authRouter;