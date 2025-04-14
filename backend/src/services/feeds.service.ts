import { Portfolio } from "../models/portfolio.model";

export const getFilteredFeeds = async (
    techFilters: string[],
    skillFilters: string[],
    expFilter: number | null,
    leetcodeFilter: number | null,
    sortOption: any
) => {
    const filterConditions: any = { visible: true };

    if (expFilter !== null) {
        filterConditions.yearsOfExperience = expFilter;
    }
    if (leetcodeFilter !== null) {
        filterConditions.leetcodeRating = { $gte: leetcodeFilter, $lt: leetcodeFilter + 100 };
    }

    // Ensure sortOption is an object
    const validSortFields = ["yearsOfExperience", "leetcodeRating", "matchingProjectFactor", "score"];
    if (!sortOption || typeof sortOption !== "object" || Object.keys(sortOption).length === 0) {
        sortOption = { yearsOfExperience: -1 }; // Default sorting
    }

    const pipeline: any[] = [
        { $match: filterConditions },

        // Count matching projects based on techStack
        {
            $addFields: {
                techMatchingProjects: techFilters.length > 0 ? {
                    $size: {
                        $filter: {
                            input: "$projects",
                            as: "proj",
                            cond: { $gt: [{ $size: { $setIntersection: ["$$proj.techStack", techFilters] } }, 0] }
                        }
                    }
                } : 0
            }
        },

        // Count matching projects based on skills
        {
            $addFields: {
                skillMatchingProjects: skillFilters.length > 0 ? {
                    $size: {
                        $filter: {
                            input: "$projects",
                            as: "proj",
                            cond: { $gt: [{ $size: { $setIntersection: ["$$proj.skills", skillFilters] } }, 0] }
                        }
                    }
                } : 0
            }
        },

        // Compute total matching projects
        {
            $addFields: {
                totalMatchingProjects: { $add: ["$techMatchingProjects", "$skillMatchingProjects"] },
                totalProjects: { $size: "$projects" }
            }
        },

        // Compute Matching Projects Factor
        {
            $addFields: {
                matchingProjectFactor: {
                    $cond: {
                        if: { $gt: ["$totalProjects", 0] },
                        then: { $divide: ["$totalMatchingProjects", "$totalProjects"] },
                        else: 0
                    }
                }
            }
        },

        // Add ranking score calculation
        {
            $addFields: {
                score: {
                    $add: [
                        { $multiply: ["$yearsOfExperience", 0.4] },
                        { $multiply: ["$leetcodeRating", 0.3] },
                        { $multiply: ["$matchingProjectFactor", 0.2] },
                        { $multiply: [{ $ifNull: ["$recentActivity", 0] }, 0.1] }
                    ]
                }
            }
        },

        { $sort: sortOption },

        {
            $project: {
                username: 1,
                "personalInfo.name": 1,
                "personalInfo.profilePicture": 1,  // ✅ Profile Picture
                "personalInfo.tagline": 1,         // ✅ Short Bio
                yearsOfExperience: 1,
                leetcodeRating: 1,
                matchingProjectFactor: 1,
                score: 1,
                techStack: 1,                      // ✅ Key Tech Stack
                topProjects: { $slice: ["$projects", 3] }  // ✅ Show only first 3 projects (Preview)
            }
        }

    ];

    return await Portfolio.aggregate(pipeline);
};
