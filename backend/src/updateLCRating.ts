import cron from "node-cron";
import { Portfolio } from "./models/portfolio.model"; // Adjust path if necessary
import { getLeetcodeRating } from "./services/leetcodeRating.service"; // Import the service

// Schedule the cron job to run every 12 hours (00:00 and 12:00 IST)
cron.schedule(
    "0 */12 * * *",
    async () => {
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
                const ratingData = await getLeetcodeRating(leetcodeUsername);

                if (ratingData !== null && ratingData.rating !== undefined) {
                    portfolio.leetcodeRating = ratingData.rating;
                    await portfolio.save();
                    console.log(`Updated ${leetcodeUsername}: LeetCode rating set to ${ratingData.rating}`);
                } else {
                    console.log(`No valid rating found for ${leetcodeUsername}`);
                }
            }
        } catch (error) {
            console.error("Error updating LeetCode ratings:", error);
        }
    },
    { timezone: "Asia/Kolkata" }
);

console.log("Cron job scheduled to update LeetCode ratings every 12 hours.");
