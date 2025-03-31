import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

/**
 * Fetches the LeetCode rating for a given username.
 * Returns an object with rating and topPercentage if found, otherwise null.
 */
export const getLeetcodeRating = async (username: string): Promise<{ rating: number; topPercentage: number } | null> => {
    const query = `
    query getLeetcodeRating($username: String!) {
      userContestRanking(username: $username) {
        rating
        topPercentage
      }
    }
  `;

    try {
        const response = await axios.post(LEETCODE_GRAPHQL_URL, {
            query,
            variables: { username }
        });

        if (response.data.errors) {
            console.error("LeetCode GraphQL Error:", response.data.errors);
            return null;
        }

        const contestData = response.data.data.userContestRanking;
        if (!contestData || contestData.rating === undefined) {
            console.error(`No rating data found for ${username}`);
            return null;
        }

        return { rating: contestData.rating, topPercentage: contestData.topPercentage };
    } catch (error: any) {
        console.error("LeetCode API Error:", error.response?.data || error.message);
        return null;
    }
};
