import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export const getLeetcodeProfile = async (username) => {
    const query = `
    query getUserStats($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                realName
                userAvatar
                ranking
                aboutMe
            }
            badges {
                id
                displayName
                icon
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
            submissionCalendar
        }
        userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
        }
        userContestRankingHistory(username: $username) {
            contest {
                title
                startTime
            }
            ranking
            rating
        }
    }`;

    try {
        const response = await axios.post(
            LEETCODE_GRAPHQL_URL,
            { query, variables: { username } }
        );

        if (response.data.errors) {
            console.error("Leetcode GraphQL Error:", response.data.errors);
            return null;
        }

        const data = response.data.data;
        const user = data.matchedUser;
        const contestStats = data.userContestRanking;
        const contestHistory = data.userContestRankingHistory || [];

        if (!user) {
            console.error(`Leetcode user ${username} not found.`);
            return null;
        }
        console.log("Contest History Before Filtering:", contestHistory);
        return {
            username: user.username,
            realName: user.profile?.realName || "N/A",
            avatarUrl: user.profile?.userAvatar || "",
            ranking: user.profile?.ranking || "N/A",
            aboutMe: user.profile?.aboutMe || "",
            badges: user.badges.map(badge => ({
                id: badge.id,
                name: badge.displayName,
                icon: badge.icon
            })),
            problemStats: user.submitStats?.acSubmissionNum.map(stat => ({
                difficulty: stat.difficulty,
                count: stat.count
            })) || [],
            submissionsCalendar: user.submissionCalendar,
            contestStats: {
                attendedContests: contestStats?.attendedContestsCount || 0,
                rating: contestStats?.rating || 0,
                globalRanking: contestStats?.globalRanking || 0,
                topPercentage: contestStats?.topPercentage || 0
            },
            contestHistory: contestHistory
                .filter(contest => typeof contest.ranking === "number" && contest.ranking > 0)
                .map(contest => ({
                    title: contest.contest.title,
                    date: new Date(contest.contest.startTime * 1000).toISOString(),
                    ranking: contest.ranking,
                    rating: contest.rating
                }))


        };
    } catch (error) {
        console.error("Leetcode GraphQL API Error:", error.response?.data || error.message);
        return null;
    }
};
