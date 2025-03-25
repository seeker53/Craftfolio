import axios from "axios";
require("dotenv").config();

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

export const getGitHubProfile = async (username: string) => {
  const query = `
    query($username: String!) {
        user(login: $username) {
            name
            bio
            avatarUrl
            followers {
                totalCount
            }
            following {
                totalCount
            }
            repositories(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                    name
                    description
                    url
                    stargazerCount
                    forkCount
                }
            }
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                        }
                    }
                }
            }
        }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_GRAPHQL_URL,
      { query, variables: { username } },
      { headers: { Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}` } }
    );

    if (response.data.errors) {
      console.error("GitHub GraphQL Error:", response.data.errors);
      return null;
    }

    const user = response.data.data.user;
    if (!user) {
      console.error(`GitHub user ${username} not found.`);
      return null;
    }

    return {
      name: user.name || "N/A",
      bio: user.bio || "No bio available",
      avatarUrl: user.avatarUrl || "",
      followers: user.followers.totalCount || 0,
      following: user.following.totalCount || 0,
      repositories: user.repositories.nodes.map((repo: any) => ({
        name: repo.name,
        description: repo.description || "No description",
        url: repo.url,
        stars: repo.stargazerCount || 0,
        forks: repo.forkCount || 0,
      })),
      contributions: {
        total: user.contributionsCollection?.contributionCalendar?.totalContributions || 0,
        weeklyData: user.contributionsCollection?.contributionCalendar?.weeks.map((week: any) =>
          week.contributionDays.map((day: any) => ({
            date: day.date,
            contributions: day.contributionCount || 0,
          }))
        ) || [],
      },
    };
  } catch (error: any) {
    console.error("GitHub GraphQL API Error:", error.response?.data || error.message);
    return null;
  }
};
