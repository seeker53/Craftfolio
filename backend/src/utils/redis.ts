import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis!');
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected.');
    } catch (error) {
        console.error('Could not connect to Redis:', error);
    }
};

// Helper functions
export const redisSet = async (key: string, value: string, expireTime?: number) => {
    if (expireTime) {
        await redisClient.set(key, value, { EX: expireTime }); // Set with expiry time
    } else {
        await redisClient.set(key, value); // Set without expiry time
    }
};

export const redisGet = async (key: string) => {
    return await redisClient.get(key);
};

export const redisDelete = async (key: string) => {
    await redisClient.del(key);
};

export default redisClient;
