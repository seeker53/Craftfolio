import { Request, Response } from "express";
import { getFilteredFeeds } from "../services/feeds.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
export const getFeeds = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { techs, skills, yearsOfExperience, leetcodeRating, sortBy } = req.query;

        // Ensure query params are always arrays of strings
        const techFilters: string[] = Array.isArray(techs)
            ? techs.map(String)
            : techs ? [String(techs)]
                : [];

        const skillFilters: string[] = Array.isArray(skills)
            ? skills.map(String)
            : skills ? [String(skills)]
                : [];

        const expFilter = yearsOfExperience ? Number(yearsOfExperience) : null;
        const leetcodeFilter = leetcodeRating ? Number(leetcodeRating) : null;

        const sortMap: any = {
            yearsOfExperience: { yearsOfExperience: -1 },
            leetcodeRating: { leetcodeRating: -1 },
            matchingProjectFactor: { matchingProjectFactor: -1 },
            score: { score: -1 }
        };

        const sortOption = sortMap[sortBy as string] || { score: -1 };
        // const sortOption = validSortOptions.includes(String(sortBy)) ? String(sortBy) : "score"; // Default to ranking score

        // Call service function with the correct number of arguments
        const feeds = await getFilteredFeeds(techFilters, skillFilters, expFilter, leetcodeFilter, sortOption);

        res.status(200).json({ success: true, feeds });
    } catch (error) {
        console.error("Error fetching feeds:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
