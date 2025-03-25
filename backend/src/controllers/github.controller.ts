import { Request, Response } from "express";
import { createQueue } from "../queues/queue";
import { QueueEvents } from "bullmq"; // Import QueueEvents
import { redisGet } from "../cache/redis";
import { GITHUB_QUEUE_NAME } from "../constants";
import { asyncHandler } from "../utils/asyncHandler";

const githubQueue = createQueue(GITHUB_QUEUE_NAME);
const queueEvents = new QueueEvents(GITHUB_QUEUE_NAME); // Initialize QueueEvents

export const getGitHubData = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: "GitHub username is required." });
    }

    // Check cache first
    // const cachedData = await redisGet(`github:${username}`);
    // if (cachedData) {
    //     console.log(`[Cache] Returning cached GitHub data for ${username}`);
    //     return res.status(200).json(cachedData);
    // }


    // Add job to queue
    console.log(`[Controller] No cache found. Adding job to queue for ${username}...`);
    const job = await githubQueue.add("fetchGitHubProfile", { username });

    try {
        // Wait for the job to finish using QueueEvents
        const result = await new Promise((resolve, reject) => {
            queueEvents.on("completed", ({ jobId, returnvalue }) => {
                if (jobId === job.id) {
                    resolve(returnvalue);
                }
            });

            queueEvents.on("failed", ({ jobId, failedReason }) => {
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
        return res.status(500).json({ error: "Failed to fetch GitHub data." });
    }
});
