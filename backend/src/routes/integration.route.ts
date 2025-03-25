import express from 'express';
import { getGitHubData } from '../controllers/github.controller';
import { getLeetcodeData } from '../controllers/leetcode.controller';
import { cacheMiddleware } from '../middlewares/redis.middleware';

const integrationRouter = express.Router();

integrationRouter.post('/github/:username', cacheMiddleware, getGitHubData);
integrationRouter.post('/leetcode/:username', cacheMiddleware, getLeetcodeData);

export default integrationRouter;
