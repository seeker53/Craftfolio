import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { Portfolio, IPortfolio } from "../models/portfolio.model";
import { uploadOnCloudinary, getPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";

interface IRequest extends Request {
    user?: IUser;
    portfolio?: IPortfolio;
}
// Get All Portfolios
export const getAllPortfolios = asyncHandler(async (req: IRequest, res: Response) => {
    // No ApiError thrown here since we're assuming user is already authenticated.
    const portfolios = await Portfolio.findByUserId(req.user?._id as string);
    console.log(portfolios);
    res.status(200).json(new ApiResponse(200, portfolios));
});

// Create Portfolio
export const createPortfolio = asyncHandler(async (req: IRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }
    // Check for portfolio cap before creating a new portfolio
    const portfolios = await Portfolio.findByUserId(userId);
    const portfolioCount = portfolios.length;
    const MAX_PORTFOLIOS = 3; // Maximum allowed portfolios

    if (portfolioCount >= MAX_PORTFOLIOS) {
        throw new ApiError(403, `Portfolio limit reached. You can only create up to ${MAX_PORTFOLIOS} portfolios.`);
    }
    const {
        personalInfo,
        skills,
        projects,
        experience,
        education,
        certifications,
        visible,
        contactFormEnabled
    } = req.body;

    // Basic validations for personalInfo
    if (!personalInfo || !personalInfo.name || !personalInfo.title || !personalInfo.email) {
        throw new ApiError(400, "Name, title and email section are required");
    }
    if (!/^\S+@\S+\.\S+$/.test(personalInfo.email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Validate skills array
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        throw new ApiError(400, "At least one skill is required");
    }
    for (const skill of skills) {
        if (!skill.name || !skill.category || !skill.proficiency) {
            throw new ApiError(400, "Each skill must have name, category, and proficiency");
        }
    }

    // Validate Projects (if provided)
    if (projects && projects.length > 0) {
        for (const project of projects) {
            if (!project.title || !project.description || !Array.isArray(project.techStack) || project.techStack.length === 0) {
                throw new ApiError(400, "Each project must have a title, description, and tech stack");
            }
        }
    }

    // Validate Experience (if provided)
    if (experience && experience.length > 0) {
        for (const exp of experience) {
            if (!exp.company || !exp.role || !exp.startDate || !Array.isArray(exp.responsibilities) || exp.responsibilities.length === 0) {
                throw new ApiError(400, "Each experience must have company, role, startDate, and at least one responsibility");
            }
        }
    }

    // Validate Education (if provided)
    if (education && education.length > 0) {
        for (const edu of education) {
            if (!edu.degree || !edu.institution || !edu.graduationYear) {
                throw new ApiError(400, "Each education entry must have degree, institution, and graduationYear");
            }
        }
    }

    // Validate Certifications (if provided)
    if (certifications && certifications.length > 0) {
        for (const cert of certifications) {
            if (!cert.name || !cert.link) {
                throw new ApiError(400, "Each certification must have a name and a valid link");
            }
        }
    }

    // Create Portfolio with userId from JWT
    const portfolio = new Portfolio({
        userId,
        personalInfo,
        skills,
        projects: projects || [],
        experience: experience || [],
        education: education || [],
        certifications: certifications || [],
        visible: visible ?? true,
        contactFormEnabled: contactFormEnabled ?? true,
    });

    const savedPortfolio = await portfolio.save();

    if (!savedPortfolio) {
        throw new ApiError(500, "Failed to create portfolio");
    }

    res.status(201).json(new ApiResponse(201, savedPortfolio));
});

// Toggle Portfolio Visibility
export const togglePortfolioVisibility = asyncHandler(async (req: IRequest, res: Response) => {
    // Since validatePortfolioOwnership middleware has already attached the portfolio,
    // req.portfolio should be available.
    const portfolio = req.portfolio;
    if (!portfolio) {
        throw new ApiError(500, "Portfolio not found in request");
    }

    // Toggle the visible property
    portfolio.visible = !portfolio.visible;
    const updatedPortfolio = await portfolio.save();

    if (!updatedPortfolio) {
        throw new ApiError(500, "Failed to update portfolio");
    }

    res.status(200).json(new ApiResponse(200, updatedPortfolio));
});

// Get Portfolio By Id
export const getPortfolioById = asyncHandler(async (req: IRequest, res: Response) => {
    // Portfolio ownership has been validated in middleware.
    const portfolio = req.portfolio;
    if (!portfolio) {
        throw new ApiError(404, "Portfolio not found");
    }

    res.status(200).json(new ApiResponse(200, portfolio));
});

// Update Portfolio
export const updatePortfolio = asyncHandler(async (req: IRequest, res: Response) => {
    // Since validatePortfolioOwnership middleware has already attached the portfolio,
    // we can use req.portfolio for updates.
    const portfolio = req.portfolio;
    if (!portfolio) {
        throw new ApiError(404, "Portfolio not found");
    }

    // Update only the fields provided in req.body
    const updateFields = req.body;
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] !== undefined) {
            (portfolio as any)[key] = updateFields[key];
        }
    });

    const updatedPortfolio = await portfolio.save();

    if (!updatedPortfolio) {
        throw new ApiError(500, "Failed to update portfolio");
    }

    res.status(200).json(new ApiResponse(200, updatedPortfolio));
});

// Delete Portfolio
export const deletePortfolio = asyncHandler(async (req: IRequest, res: Response) => {
    // Since validatePortfolioOwnership middleware has already attached the portfolio,
    // we can use req.portfolio for deletion.
    const portfolio = req.portfolio;
    if (!portfolio) {
        throw new ApiError(404, "Portfolio not found");
    }

    // Delete the portfolio. You can use remove() if working with a document instance.
    const deletedPortfolio = await Portfolio.deleteOne({ _id: portfolio._id }).exec();
    if (!deletedPortfolio) {
        throw new ApiError(500, "Failed to delete portfolio");
    }

    res.status(200).json(new ApiResponse(200, deletedPortfolio, "Portfolio deleted successfully"));
});

export const getPortfolioCapUsage = asyncHandler(async (req: IRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    // Retrieve all portfolios created by the user
    const portfolios = await Portfolio.findByUserId(userId);
    const portfolioCount = portfolios.length;
    const MAX_PORTFOLIOS = 3; // Set your maximum allowed portfolios here

    const usageData = {
        created: portfolioCount,
        max: MAX_PORTFOLIOS,
        remaining: Math.max(MAX_PORTFOLIOS - portfolioCount, 0)
    };

    res.status(200).json(new ApiResponse(200, usageData));
});