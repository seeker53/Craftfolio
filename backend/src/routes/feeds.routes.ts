import { Router } from "express";
import { getFeeds } from "../controllers/feeds.controller";

const feedsRouter = Router();

feedsRouter.get("/", getFeeds);

export default feedsRouter;