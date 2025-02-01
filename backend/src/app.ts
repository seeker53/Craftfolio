import express from 'express';
import cors from 'cors';
import { connectRedis } from './utils/redis';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

// Routes (import and use routers here)
import authRouter from './routes/auth.route';
app.use("/api/v1/auth", authRouter);

import userRouter from './routes/user.route';
app.use("/api/v1/users", userRouter);

import portfolioRouter from './routes/portfolio.route';
app.use("/api/v1/portfolios", portfolioRouter);

// Redis Connection
// connectRedis();

export { app };
