// src/config/redis.config.ts
import dotenv from "dotenv";
dotenv.config();

export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

// For BullMQ (and other tools expecting ConnectionOptions)
export const redisConnectionOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};

// For redis client (using a URL)
export const redisURL = `redis://${REDIS_HOST}:${REDIS_PORT}`;
