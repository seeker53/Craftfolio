import express from 'express';
import cors from 'cors';
import { connectRedis } from './utils/redis';

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

// Routes (import and use routers here)
// import userRouter from './routes/user.routes';
// app.use("/api/v1/users", userRouter);

// Redis Connection
connectRedis();

export { app };
