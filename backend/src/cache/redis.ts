import { createClient } from "redis";
import { redisURL } from "../config/redis.config";

const redisClient = createClient({
    url: redisURL,
});

redisClient.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Connected to Redis!");
    } catch (error) {
        console.error("❌ Redis connection failed:", error);
    }
})();

export { redisClient };

export const redisSet = async (key: string, value: any, expiration: number = 3600) => {
    try {
        console.log(`📝 Storing in Redis: ${key} =>`, value);
        await redisClient.set(key, JSON.stringify(value), {
            EX: expiration,
        });
        console.log(`✅ Cached: ${key}`);
    } catch (error) {
        console.error("❌ Redis SET error:", error);
    }
};


export const redisGet = async (key: string) => {
    try {
        const value = await redisClient.get(key);
        if (!value) return null;

        // Ensure parsing only if it's a valid JSON string
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch (error) {
        console.error("❌ Redis GET error:", error);
        return null;
    }
};



export const redisDelete = async (key: string) => {
    try {
        await redisClient.del(key);
        console.log(`✅ Deleted: ${key}`);
    } catch (error) {
        console.error("❌ Redis DEL error:", error);
    }
};
