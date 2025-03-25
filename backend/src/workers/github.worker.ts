import { Worker, Job, ConnectionOptions } from "bullmq";
import { getGitHubProfile } from "../services/github.service";
import { redisSet } from "../cache/redis";
import { GITHUB_QUEUE_NAME } from "../constants";
import { redisConnectionOptions } from "../config/redis.config";

interface JobData {
    username: string;
}

interface GithubData {
    profile: {
        name: string;
        bio: string;
        avatarUrl: string;
        followers: number;
        following: number;
        repositories: any;
    };
    contributions: any;
}

// GitHub Worker
const githubWorker = new Worker<JobData, GithubData>(
    GITHUB_QUEUE_NAME,
    async (job: Job<JobData>) => {
        console.log(`[Worker] Processing job ID: ${job.id} for username: ${job.data.username}`);
        const { username } = job.data;
        console.log(`[Worker] Received job for username: ${username}`);

        try {
            console.log(`[Worker] Fetching GitHub data for: ${username}`);
            const gitHubData = await getGitHubProfile(username);
            if (!gitHubData) throw new Error(`[Worker] GitHub user ${username} not found.`);

            console.log(`[Worker] Formatting GitHub data for: ${username}`);
            const formattedData: GithubData = {
                profile: {
                    name: gitHubData.name,
                    bio: gitHubData.bio,
                    avatarUrl: gitHubData.avatarUrl,
                    followers: gitHubData.followers,
                    following: gitHubData.following,
                    repositories: gitHubData.repositories,
                },
                contributions: gitHubData.contributions,
            };

            console.log(`[Worker] Caching GitHub data for: ${username}`);
            await redisSet(`github:${username}`, formattedData, 3600); // Cache for 1 hour

            console.log(`[Worker] Successfully processed job for: ${username}`);
            return formattedData;
        } catch (error) {
            console.error(`[Worker] Error processing job for ${username}:`, error);
            throw error;
        }
    },
    { connection: redisConnectionOptions }
);

console.log("[Worker] GitHub worker initialized and listening for jobs...");

export default githubWorker;
