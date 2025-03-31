import cron from 'node-cron';
import axios from 'axios';
import { Portfolio } from './models/portfolio.model'; // Adjust path if necessary

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

/**
 * Fetch the LeetCode rating for a given username using a minimal GraphQL query.
 */
const getLeetcodeRating = async (username: string): Promise<number | null> => {
    const query = `
    query getLeetcodeRating($username: String!) {
      userContestRanking(username: $username) {
        rating
      }
    }
  `;

    try {
        const response = await axios.post(LEETCODE_GRAPHQL_URL, {
            query,
            variables: { username }
        });

        if (response.data.errors) {
            console.error(`GraphQL errors for ${username}:`, response.data.errors);
            return null;
        }

        const contestData = response.data.data.userContestRanking;
        if (!contestData || contestData.rating === undefined) {
            console.error(`No rating found for ${username}`);
            return null;
        }

        return contestData.rating;
    } catch (error: any) {
        console.error(`Error fetching LeetCode rating for ${username}:`, error.response?.data || error.message);
        return null;
    }
};

// Schedule the cron job to run every 12 hours (00:00 and 12:00 IST)
cron.schedule('0 */12 * * *', async () => {
    console.log("Cron Job: Updating LeetCode ratings for all users...");
    try {
        // Find portfolios with a valid LeetCode username
        const portfolios = await Portfolio.find({
            "linkedPlatforms.leetcodeUsername": { $exists: true, $ne: "" }
        });

        for (const portfolio of portfolios) {
            const leetcodeUsername = portfolio.linkedPlatforms.leetcodeUsername;
            if (!leetcodeUsername) continue;

            console.log(`Fetching LeetCode rating for ${leetcodeUsername}...`);
            const rating = await getLeetcodeRating(leetcodeUsername);

            if (rating !== null) {
                portfolio.leetcodeRating = rating;
                await portfolio.save();
                console.log(`Updated ${leetcodeUsername}: LeetCode rating set to ${rating}`);
            } else {
                console.log(`No valid rating found for ${leetcodeUsername}`);
            }
        }
    } catch (error) {
        console.error("Error updating LeetCode ratings:", error);
    }
}, { timezone: 'Asia/Kolkata' });

console.log("Cron job scheduled to update LeetCode ratings every 12 hours.");
