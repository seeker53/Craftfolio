import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { uploadFiles } from '../middlewares/multer.middleware'
import { getUserInfo, updateUserProfile } from '../controllers/user.controller';

const userRouter = Router();

userRouter.route("/current-user").get(verifyJWT, getUserInfo);

userRouter.route("/update-profile").patch(verifyJWT, uploadFiles, updateUserProfile);

export default userRouter;