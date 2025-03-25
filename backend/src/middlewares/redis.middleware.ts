import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../cache/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

export const cacheMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `cache:${req.originalUrl}`; // Cache key based on the URL

    try {
        // Check Redis for cached data
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit for:', cacheKey);
            // Send the cached response
            return res.status(200).json(new ApiResponse(200, JSON.parse(cachedData)));
        }

        console.log('Cache miss for:', cacheKey);

        // Overwrite the `res.json` method to store the response in Redis
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            // Cache the response with a TTL of 10 minutes (600 seconds)
            redisClient.setEx(cacheKey, 600, JSON.stringify(data));
            return originalJson(data);
        };

        // Proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error("[Cache Middleware] Redis error:", error);
        next();
    }
});
