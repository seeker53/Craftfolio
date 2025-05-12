import express from 'express';
import cors from 'cors';
// import { connectRedis } from './cache/redis';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

// Routes (import and use routers here)
import { authRouter, userRouter, portfolioRouter, integrationRouter, feedsRouter, blogRouter } from './routes/index';

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/portfolios", portfolioRouter);

app.use("/api/v1/integrations", integrationRouter);

app.use("/api/v1/feeds", feedsRouter);

app.use("/api/v1/blog", blogRouter);

export { app };
