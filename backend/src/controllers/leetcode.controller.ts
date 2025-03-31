import { Request, Response } from "express";
import { createQueue } from "../queues/queue";
import { QueueEvents } from "bullmq"; // Import QueueEvents
import { LEETCODE_QUEUE_NAME } from "../constants";
import { asyncHandler } from "../utils/asyncHandler";
import { getLeetcodeRating } from "../services/leetcodeRating.service";

const leetcodeQueue = createQueue(LEETCODE_QUEUE_NAME);
const queueEvents = new QueueEvents(LEETCODE_QUEUE_NAME); // Initialize QueueEvents

export const getLeetcodeData = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: "Leetcode username is required." });
    }

    // Check cache first
    // const cachedData = await redisGet(`leetcode:${username}`);
    // if (cachedData) {
    //     console.log(`[Cache] Returning cached Leetcode data for ${username}`);
    //     return res.status(200).json(cachedData);
    // }


    // Add job to queue
    console.log(`[Controller] No cache found. Adding job to queue for ${username}...`);
    const job = await leetcodeQueue.add("fetchLeetcodeProfile", { username });

    try {
        // Wait for the job to finish using QueueEvents
        const result = await new Promise((resolve, reject) => {
            queueEvents.once("completed", ({ jobId, returnvalue }) => {
                if (jobId === job.id) {
                    resolve(returnvalue);
                }
            });

            queueEvents.once("failed", ({ jobId, failedReason }) => {
                if (jobId === job.id) {
                    reject(new Error(`Job failed: ${failedReason}`));
                }
            });

            // Set timeout to prevent infinite waiting
            setTimeout(() => reject(new Error("Job processing timeout")), 5000);
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("[Controller] Error waiting for job to finish:", error);
        return res.status(500).json({ error: "Failed to fetch Leetcode data." });
    }
});

export const verifyLeetcodeUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "LeetCode username is required." });
    }

    const ratingData = await getLeetcodeRating(username);

    if (!ratingData) {
        return res.status(404).json({ error: "LeetCode username not found or rating unavailable." });
    }

    return res.status(200).json(ratingData);
});