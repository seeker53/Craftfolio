import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";
import { Portfolio, IPortfolio } from "../models/portfolio.model";

interface IRequest extends Request {
    user?: IUser;
    portfolio?: IPortfolio;
}

export const validatePortfolioOwnership = async (
    req: IRequest,
    _: Response,
    next: NextFunction
) => {
    try {
        const portfolioId = req.params.portfolioId;
        if (!portfolioId) {
            const error = new Error("Portfolio ID is required");
            return next(error); // Pass error to the next middleware
        }

        const userId = req.user?.id;
        if (!userId) {
            const error = new Error("Unauthorized: User ID missing");
            return next(error); // Pass error to the next middleware
        }

        // Find the portfolio
        const portfolio = await Portfolio.findById(portfolioId);
        if (!portfolio) {
            const error = new Error("Portfolio not found");
            return next(error); // Pass error to the next middleware
        }

        // Check ownership
        if (portfolio.userId.toString() !== userId) {
            const error = new Error("Unauthorized: Portfolio does not belong to the user");
            return next(error); // Pass error to the next middleware
        }

        // Attach the portfolio object to req
        req.portfolio = portfolio;

        next(); // ✅ Correctly call next() instead of returning a response
    } catch (error) {
        next(error); // Pass error to Express error handling middleware
    }
};
