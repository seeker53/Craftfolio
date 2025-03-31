import express from 'express';
import { getGitHubData } from '../controllers/github.controller';
import { getLeetcodeData } from '../controllers/leetcode.controller';
import { cacheMiddleware } from '../middlewares/redis.middleware';
import { verifyLeetcodeUsername } from "../controllers/leetcode.controller";
import { verifyGitHubUsername } from "../controllers/github.controller";

const integrationRouter = express.Router();

integrationRouter.get("/github/verify", verifyGitHubUsername);
integrationRouter.post('/github/:username', cacheMiddleware, getGitHubData);
integrationRouter.get("/leetcode/verify", verifyLeetcodeUsername);
integrationRouter.post('/leetcode/:username', cacheMiddleware, getLeetcodeData);


export default integrationRouter;
