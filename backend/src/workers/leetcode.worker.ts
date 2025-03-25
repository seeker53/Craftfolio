import { Worker, Job } from "bullmq";
import { getLeetcodeProfile } from "../services/leetcode.service";
import { redisSet } from "../cache/redis";
import { LEETCODE_QUEUE_NAME } from "../constants";
import { redisConnectionOptions } from "../config/redis.config";

interface JobData {
    username: string;
}

interface LeetcodeData {
    username: string;
    realName: string;
    avatarUrl: string;
    ranking: string | number;
    aboutMe: string;
    badges: { id: string; name: string; icon: string }[];
    problemsSolved: { difficulty: string; count: number }[];
    submissionCalendar: Record<string, number>;
    contestStats: {
        attendedContests: number;
        rating: number;
        globalRanking: number;
        topPercentage: number;
    };
    participatedContests: {
        title: string;
        date: string;
        ranking: number;
        rating: number;
    }[];
}

const leetcodeWorker = new Worker<JobData, LeetcodeData>(
    LEETCODE_QUEUE_NAME,
    async (job: Job<JobData>) => {
        console.log(`[Worker] Processing job ID: ${job.id} for username: ${job.data.username}`);
        const { username } = job.data;

        try {
            console.log(`[Worker] Fetching Leetcode data for: ${username}`);
            const user = await getLeetcodeProfile(username);
            if (!user) throw new Error(`[Worker] Leetcode user ${username} not found.`);

            console.log(`[Worker] Formatting Leetcode data for: ${username}`);

            // Filter contests where the user participated (rating change occurred)
            const participatedContests = (user.contestHistory || []).filter(contest =>
                contest.ranking !== undefined && contest.rating !== undefined
            ).map(contest => ({
                title: contest.title,
                date: contest.date,
                ranking: contest.ranking,
                rating: contest.rating
            }));

            const formattedData: LeetcodeData = {
                username: user.username,
                realName: user.realName || "N/A",
                avatarUrl: user.avatarUrl || "",
                ranking: user.ranking || "N/A",
                aboutMe: user.aboutMe || "No bio available",
                badges: user.badges || [],
                problemsSolved: user.problemStats || [],
                submissionCalendar: user.submissionsCalendar || {},
                contestStats: user.contestStats || {
                    attendedContests: 0,
                    rating: 0,
                    globalRanking: 0,
                    topPercentage: 0
                },
                participatedContests
            };

            console.log(`[Worker] Caching Leetcode data for: ${username}`);
            await redisSet(`leetcode:${username}`, formattedData, 3600);

            console.log(`[Worker] Successfully processed job for: ${username}`);
            // console.log(`[Worker] Formatted data for ${username}:`, formattedData);
            return formattedData;
        } catch (error) {
            console.error(`[Worker] Error processing job for ${username}:`, error);
            throw error;
        }
    },
    { connection: redisConnectionOptions }
);

console.log("[Worker] Leetcode worker initialized and listening for jobs...");

export default leetcodeWorker;
