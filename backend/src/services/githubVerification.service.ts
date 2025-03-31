import axios from "axios";
require("dotenv").config();

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

export const checkGitHubUsername = async (username: string) => {
    const query = `
      query($username: String!) {
          user(login: $username) {
              login
          }
      }
    `;

    try {
        console.log(`Checking GitHub username: ${username}`);

        const response = await axios.post(
            GITHUB_GRAPHQL_URL,
            { query, variables: { username } },
            { headers: { Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}` } }
        );

        console.log("GitHub API Response:", JSON.stringify(response.data, null, 2));

        if (response.data.errors) {
            console.error("GitHub GraphQL Errors:", response.data.errors);
            return { exists: false, error: response.data.errors };
        }

        const userExists = !!response.data.data.user;
        console.log(`GitHub user ${username} exists: ${userExists}`);

        return { exists: userExists };
    } catch (error: any) {
        console.error("GitHub GraphQL API Error:", error.response?.data || error.message);
        return { exists: false, error: error.response?.data || error.message };
    }
};
